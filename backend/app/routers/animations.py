from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends, Query
from pydantic import BaseModel
from typing import Optional, List, Dict
from enum import Enum
from datetime import datetime
import json
import asyncio

from app.services.manim import generate_manim_script, generate_improved_code
from app.services.video_renderer import render_animation
from app.services.database_service import upload_video, get_user_videos, get_current_user, get_supabase, create_chat_in_db, get_user_chats_from_db, delete_chat_from_db, get_chat_tasks_from_db, ensure_user_exists, get_user_credits, deduct_credit

import logging
logger = logging.getLogger(__name__)

# Task management

# Task management
class ConnectionManager:
    def __init__(self):
        self.sio = None
    
    def set_sio(self, sio):
        self.sio = sio

    async def broadcast_status(self, user_id: str, task_id: str, status: str, progress: int, video_url: str = None, chat_id: str = None, generated_script: str = None, error: str = None):
        if not self.sio:
            return
            
        message = {
            "task_id": task_id,
            "status": status,
            "progress": progress,
            "video_url": video_url,
            "chat_id": chat_id,
            "generated_script": generated_script,
            "error": error
        }
        
        # In Socket.IO, we use rooms. Every authenticated user is in a room named after their user_id.
        await self.sio.emit('status_update', message, room=user_id)

manager = ConnectionManager()

def setup_socket_handlers(sio):
    manager.set_sio(sio)

    @sio.event
    async def connect(sid, environ):
        pass

    @sio.event
    async def authenticate(sid, data):
        token = data.get('token')
        if not token:
            await sio.emit('error', {'message': 'No token provided'}, room=sid)
            return

        try:
            user_id, email = await get_current_user(token)
            # Add this client to a room specifically for this user
            await sio.enter_room(sid, user_id)
            await sio.emit('authenticated', {'user_id': user_id}, room=sid)
        except Exception as e:
            await sio.emit('error', {'message': f"Authentication failed: {str(e)}"}, room=sid)

    @sio.event
    async def disconnect(sid):
        pass

router = APIRouter()



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
    use_image: bool = False

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
async def get_chats(user_identity: tuple[str, str] = Depends(get_current_user)):
    """Get all chats for the current user"""
    user_id, _ = user_identity
    return get_user_chats_from_db(user_id)

@router.delete("/chats/{chat_id}")
async def delete_chat(chat_id: str, user_identity: tuple[str, str] = Depends(get_current_user)):
    """Delete a chat session"""
    user_id, _ = user_identity
    return delete_chat_from_db(chat_id, user_id)

@router.get("/chats/{chat_id}/history")
async def get_chat_history(chat_id: str, user_identity: tuple[str, str] = Depends(get_current_user)):
    """Get history (tasks) for a specific chat"""
    user_id, _ = user_identity
    return get_chat_tasks_from_db(chat_id, user_id)

@router.get("/credits")
async def get_credits(user_identity: tuple[str, str] = Depends(get_current_user)):
    """Get current credit balance for the user"""
    user_id, _ = user_identity
    credits = get_user_credits(user_id)
    return {"credits": credits}

@router.post("/generate", response_model=AnimationResponse)
async def generate_animation(
    request: AnimationRequest,
    background_tasks: BackgroundTasks,
    user_identity: tuple[str, str] = Depends(get_current_user)
):
    user_id, email = user_identity
    import uuid
    
    # CRITICAL: Ensure user exists in DB before creating related records (chats/tasks)
    success = await ensure_user_exists(user_id, email)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to synchronize user record. Please contact support.")
    
    # Check if user has credits
    credits = get_user_credits(user_id)
    if credits <= 0:
        raise HTTPException(status_code=402, detail="No credits remaining. Please upgrade your plan to continue generating animations.")
    
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
        user_id,
        request.use_image
    )
    
    return AnimationResponse(
        task_id=task_id,
        chat_id=chat_id,
        status="processing",
        message="Animation generation started"
    )

async def _apply_hybrid_images(task_id: str, script: str) -> str:
    """Helper to find placeholders and generate them in parallel."""
    import re
    import asyncio
    from app.services.image_generator import generate_image, get_fallback_image
    
    # Use set to avoid redundant requests for identical prompts
    image_prompts = list(set(re.findall(r"{{IMAGE:(.*?)}}", script)))
    
    if image_prompts:
        print(f"[{task_id}] Generating {len(image_prompts)} unique images in parallel...")
        
        # Launch all tasks
        tasks = [generate_image(p) for p in image_prompts]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for img_prompt, result in zip(image_prompts, results):
            if isinstance(result, Exception):
                logger.warning(f"[{task_id}] Failed to generate image for '{img_prompt}': {result}")
                img_path = get_fallback_image()
            else:
                img_path = result
            
            img_path_escaped = img_path.replace("\\", "/")
            # Use regex to replace ALL occurrences of this specific placeholder
            # Escaping the prompt for regex safety
            placeholder = f"{{{{IMAGE:{re.escape(img_prompt)}}}}}"
            script = re.sub(placeholder, img_path_escaped, script)
            
    return script

async def process_animation(task_id: str, prompt: str, quality: str, duration: int, user_id: str, use_image: bool = False):
    import traceback
    from app.services.video_renderer import sanitize_manim_script
    try:
        print(f"[{task_id}] Starting animation generation flow...")
        
        update_task_in_db(task_id, {"status": "generating_script", "progress": 20})
        await manager.broadcast_status(user_id, task_id, "generating_script", 20)
        
        print(f"[{task_id}] Generating Manim script (duration: {duration}s, use_image: {use_image})...")
        script = await generate_manim_script(prompt, duration, force_image=use_image)
        print(f"[{task_id}] Script generated:\n{script[:200]}...")
        
        # --- HYBRID IMAGE INTEGRATION ---
        script = await _apply_hybrid_images(task_id, script)

        # Sanitize script for Manim CE 0.18 compatibility and persist what will actually render
        script_sanitized = sanitize_manim_script(script)
        update_task_in_db(task_id, {
            "status": "rendering",
            "progress": 50,
            "generated_script": script_sanitized
        })
        await manager.broadcast_status(user_id, task_id, "rendering", 50, generated_script=script_sanitized)
        
        print(f"[{task_id}] Rendering animation...")
        
        try:
            video_path = await render_animation(script_sanitized, quality)
            print(f"[{task_id}] Video rendered at: {video_path}")
        except RuntimeError as render_error:
            error_str = str(render_error)
            logger.warning(f"[{task_id}] First attempt failed: {error_str[:200]}")
            
            # Always attempt self-healing for any rendering error
            print(f"[{task_id}] Attempting self-healing...")
            
            error_context = {
                'prompt': prompt,
                'code': script,
                'error': error_str,
                'use_image': use_image
            }
            
            script = await generate_improved_code(error_context)
            # Re-apply hybrid images for the new script
            script = await _apply_hybrid_images(task_id, script)
            # Sanitize again and persist
            script_sanitized = sanitize_manim_script(script)
            update_task_in_db(task_id, {"generated_script": script_sanitized})
            await manager.broadcast_status(user_id, task_id, "rendering", 55, generated_script=script_sanitized) # Slight progress bump for retry
            
            print(f"[{task_id}] Retrying with improved code...")
            video_path = await render_animation(script_sanitized, quality)
            print(f"[{task_id}] Retry successful: {video_path}")
        
        update_task_in_db(task_id, {"status": "uploading", "progress": 80})
        await manager.broadcast_status(user_id, task_id, "uploading", 80)
        
        print(f"[{task_id}] Uploading to Supabase...")
        video_url = await upload_video(video_path, user_id, prompt)
        print(f"[{task_id}] Upload complete: {video_url}")
        
        # Deduct credit after successful generation
        deduct_credit(user_id)
        print(f"[{task_id}] Credit deducted for user {user_id}")
        
        update_task_in_db(task_id, {
            "status": "completed",
            "progress": 100,
            "video_url": video_url
        })
        await manager.broadcast_status(user_id, task_id, "completed", 100, video_url=video_url, generated_script=script_sanitized)
        
    except Exception as e:
        error_msg = f"{str(e)}\n{traceback.format_exc()}"
        print(f"[{task_id}] ERROR: {error_msg}")
        
        # UI-friendly error message
        friendly_error = "Animation failed to render. Please try refining your prompt or try again."
        
        # Adjust message for connectivity issues
        if "ConnectError" in error_msg or "ReadError" in error_msg or "TimeoutError" in error_msg:
            friendly_error = "Service connection issue. Please try again in a few moments."
        
        update_task_in_db(task_id, {
            "status": "failed",
            "error_message": friendly_error
        })
        await manager.broadcast_status(user_id, task_id, "failed", 0, error=friendly_error)
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
async def list_videos(user_identity: tuple[str, str] = Depends(get_current_user)):
    user_id, _ = user_identity
    try:
        return await get_user_videos(user_id)
    except Exception as e:
        return []
