from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import Optional, List, Dict
from enum import Enum
from datetime import datetime
import json
import asyncio

from app.services.code_generator import generate_manim_script, generate_improved_code
from app.services.video_renderer import render_animation
from app.services.database_service import upload_video, get_user_videos, get_current_user, get_supabase, create_chat_in_db, get_user_chats_from_db, delete_chat_from_db, get_chat_tasks_from_db

import logging
logger = logging.getLogger(__name__)

# Task cancellation tracking (uses DB for cross-worker persistence)

def is_task_cancelled(task_id: str) -> bool:
    """Check if task is marked as cancelled in DB"""
    task = get_task_from_db(task_id)
    return task and task.get("status") == "cancelled"

class ConnectionManager:
    def __init__(self):
        # user_id -> list[WebSocket]
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        print(f"[WS] User {user_id} connected. Connection count for user: {len(self.active_connections[user_id])}")

    def disconnect(self, user_id: str, websocket: WebSocket):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        print(f"[WS] User {user_id} disconnected.")

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        try:
            await websocket.send_json(message)
        except Exception as e:
            print(f"[WS] Error sending message: {e}")

    async def broadcast_status(self, user_id: str, task_id: str, status: str, progress: int, video_url: str = None, chat_id: str = None, error: str = None):
        message = {
            "task_id": task_id,
            "status": status,
            "progress": progress,
            "video_url": video_url,
            "chat_id": chat_id,
            "error": error
        }
        
        if user_id in self.active_connections:
            print(f"[WS] Broadcasting to user {user_id}: {status} ({progress}%)")
            # We iterate over a copy of the list to avoid issues if a connection is removed during iteration
            for websocket in list(self.active_connections[user_id]):
                try:
                    await websocket.send_json(message)
                except Exception as e:
                    print(f"[WS] Failed to send to a connection for user {user_id}: {e}")
                    # Potentially disconnect if it failed
                    self.disconnect(user_id, websocket)

manager = ConnectionManager()

router = APIRouter()

@router.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str, token: Optional[str] = None):
    # Verify token
    if not token:
        await websocket.accept() # Must accept before sending close code or messages in some environments
        await websocket.close(code=4001, reason="No token provided")
        return

    try:
        user_id = get_current_user(token)
    except Exception as e:
        await websocket.accept()
        await websocket.close(code=4002, reason="Invalid token")
        return

    # In our current setup, client_id might just be user_id from frontend, 
    # but we'll use user_id from token for actual mapping
    await manager.connect(user_id, websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)

@router.post("/cancel/{task_id}")
async def cancel_animation(task_id: str, user_id: str = Depends(get_current_user)):
    """Cancel a running animation task"""
    task = get_task_from_db(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this task")
    
    if task["status"] in ["completed", "failed", "cancelled"]:
        return {"status": "error", "message": f"Task is already {task['status']}"}
    
    update_task_in_db(task_id, {"status": "cancelled"})
    print(f"[CANCEL] Task {task_id} marked as cancelled by user {user_id}")
    
    # Broadcast cancellation
    await manager.broadcast_status(user_id, task_id, "cancelled", task.get("progress", 0))
    
    return {"status": "ok", "message": "Cancellation request received"}

class Quality(str, Enum):
    LOW = "l"      # 420p
    MEDIUM = "m"   # 720p
    HIGH = "h"     # 1080p
    FOURK = "k"    # 4K

class AnimationRequest(BaseModel):
    prompt: str
    quality: Quality = Quality.MEDIUM
    duration: int = 15
    chat_id: Optional[str] = None

class AnimationResponse(BaseModel):
    task_id: str
    chat_id: str
    status: str
    message: str

def get_task_from_db(task_id: str):
    """Get task from database"""
    client = get_supabase()
    result = client.table("tasks").select("*").eq("id", task_id).execute()
    return result.data[0] if result.data else None

def update_task_in_db(task_id: str, updates: dict):
    """Update task in database"""
    client = get_supabase()
    updates["updated_at"] = datetime.utcnow().isoformat()
    client.table("tasks").update(updates).eq("id", task_id).execute()

def create_task_in_db(task_id: str, user_id: str, prompt: str, quality: str, chat_id: str):
    """Create task in database"""
    client = get_supabase()
    client.table("tasks").insert({
        "id": task_id,
        "user_id": user_id,
        "chat_id": chat_id,
        "prompt": prompt,
        "quality": quality,
        "status": "processing",
        "progress": 0,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }).execute()

@router.get("/chats")
async def get_chats(user_id: str = Depends(get_current_user)):
    """Get all chats for the current user"""
    return get_user_chats_from_db(user_id)

@router.delete("/chats/{chat_id}")
async def delete_chat(chat_id: str, user_id: str = Depends(get_current_user)):
    """Delete a chat session"""
    return delete_chat_from_db(chat_id, user_id)

@router.get("/chats/{chat_id}/history")
async def get_chat_history(chat_id: str, user_id: str = Depends(get_current_user)):
    """Get history (tasks) for a specific chat"""
    return get_chat_tasks_from_db(chat_id, user_id)

@router.post("/generate", response_model=AnimationResponse)
async def generate_animation(
    request: AnimationRequest,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user)
):
    import uuid
    task_id = str(uuid.uuid4())
    
    # Determine Chat ID
    chat_id = request.chat_id
    if not chat_id:
        # Create new chat with title from prompt (truncated)
        title = request.prompt[:50] + "..." if len(request.prompt) > 50 else request.prompt
        chat_id = create_chat_in_db(user_id, title)

    # Create task in database
    create_task_in_db(task_id, user_id, request.prompt, request.quality.value, chat_id)
    
    background_tasks.add_task(
        process_animation,
        task_id,
        request.prompt,
        request.quality.value,
        request.duration,
        user_id
    )
    
    return AnimationResponse(
        task_id=task_id,
        chat_id=chat_id,
        status="processing",
        message="Animation generation started"
    )

async def process_animation(task_id: str, prompt: str, quality: str, duration: int, user_id: str):
    import traceback
    from app.services.video_renderer import sanitize_manim_script
    try:
        if is_task_cancelled(task_id):
            print(f"[{task_id}] Process stopped: task was cancelled before starting.")
            return

        print(f"[{task_id}] Starting animation generation flow...")
        
        update_task_in_db(task_id, {"status": "generating_script", "progress": 20})
        await manager.broadcast_status(user_id, task_id, "generating_script", 20)
        
        if is_task_cancelled(task_id):
            print(f"[{task_id}] Process stopped: task was cancelled.")
            return

        print(f"[{task_id}] Generating Manim script (duration: {duration}s)...")
        script = await generate_manim_script(prompt, duration)
        print(f"[{task_id}] Script generated:\n{script[:200]}...")
        
        if is_task_cancelled(task_id):
            logger.info(f"[{task_id}] Process stopped: task was cancelled after script generation.")
            return

        # Sanitize script for Manim CE 0.18 compatibility and persist what will actually render
        script_sanitized = sanitize_manim_script(script)
        update_task_in_db(task_id, {
            "status": "rendering",
            "progress": 50,
            "generated_script": script_sanitized
        })
        await manager.broadcast_status(user_id, task_id, "rendering", 50)
        
        if is_task_cancelled(task_id):
            logger.info(f"[{task_id}] Process stopped: task was cancelled before starting render.")
            return

        print(f"[{task_id}] Rendering animation...")
        
        try:
            video_path = await render_animation(script_sanitized, quality)
            print(f"[{task_id}] Video rendered at: {video_path}")
        except RuntimeError as render_error:
            if is_task_cancelled(task_id):
                logger.info(f"[{task_id}] Process stopped: task was cancelled during initial rendering attempt.")
                return
            
            error_str = str(render_error)
            logger.warning(f"[{task_id}] First attempt failed: {error_str[:200]}")
            
            # Always attempt self-healing for any rendering error
            print(f"[{task_id}] Attempting self-healing...")
            
            error_context = {
                'prompt': prompt,
                'code': script,
                'error': error_str
            }
            
            script = await generate_improved_code(error_context)
            if is_task_cancelled(task_id):
                logger.info(f"[{task_id}] Process stopped: task was cancelled during self-healing generation.")
                return

            # Sanitize again and persist
            script_sanitized = sanitize_manim_script(script)
            update_task_in_db(task_id, {"generated_script": script_sanitized})
            await manager.broadcast_status(user_id, task_id, "rendering", 55) # Slight progress bump for retry
            
            print(f"[{task_id}] Retrying with improved code...")
            video_path = await render_animation(script_sanitized, quality)
            print(f"[{task_id}] Retry successful: {video_path}")
        
        if is_task_cancelled(task_id):
            logger.info(f"[{task_id}] Process stopped: task was cancelled after rendering completion.")
            return

        update_task_in_db(task_id, {"status": "uploading", "progress": 80})
        await manager.broadcast_status(user_id, task_id, "uploading", 80)
        
        print(f"[{task_id}] Uploading to Supabase...")
        video_url = await upload_video(video_path, user_id, prompt)
        print(f"[{task_id}] Upload complete: {video_url}")
        
        if is_task_cancelled(task_id):
            logger.info(f"[{task_id}] Process stopped: task was cancelled after upload.")
            return

        update_task_in_db(task_id, {
            "status": "completed",
            "progress": 100,
            "video_url": video_url
        })
        await manager.broadcast_status(user_id, task_id, "completed", 100, video_url=video_url)
        
    except Exception as e:
        if task_id in cancelled_tasks:
            print(f"[{task_id}] Task was cancelled, ignoring error: {e}")
            return

        error_msg = f"{str(e)}\n{traceback.format_exc()}"
        print(f"[{task_id}] ERROR: {error_msg}")
        
        # Better error messages for common issues
        user_message = str(e)
        if "ConnectError" in error_msg or "ReadError" in error_msg:
            user_message = "Network error: Unable to reach AI service. This may be a temporary connectivity issue. Please try again."
        elif "TimeoutError" in error_msg:
            user_message = "Request timed out. The AI service took too long to respond. Please try again."
        
        update_task_in_db(task_id, {
            "status": "failed",
            "error_message": user_message
        })
        await manager.broadcast_status(user_id, task_id, "failed", 0, error=user_message)
    finally:
        # Cleanup
        print(f"[{task_id}] Processing complete")

@router.get("/status/{task_id}")
async def get_task_status(task_id: str):
    task = get_task_from_db(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.get("/videos")
async def list_videos(user_id: str = Depends(get_current_user)):
    try:
        return await get_user_videos(user_id)
    except Exception as e:
        return []
