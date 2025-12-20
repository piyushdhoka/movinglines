from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from pydantic import BaseModel
from typing import Optional
from enum import Enum
from datetime import datetime
from app.services.langchain_service import generate_manim_script
from app.services.manim_service import render_animation
from app.services.supabase_service import upload_video, get_user_videos, get_current_user, get_supabase

router = APIRouter()

class Quality(str, Enum):
    LOW = "l"      # 480p
    MEDIUM = "m"   # 720p
    HIGH = "h"     # 1080p
    FOURK = "k"    # 4K

class AnimationRequest(BaseModel):
    prompt: str
    quality: Quality = Quality.MEDIUM

class AnimationResponse(BaseModel):
    task_id: str
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

def create_task_in_db(task_id: str, user_id: str, prompt: str, quality: str):
    """Create task in database"""
    client = get_supabase()
    client.table("tasks").insert({
        "id": task_id,
        "user_id": user_id,
        "prompt": prompt,
        "quality": quality,
        "status": "processing",
        "progress": 0,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }).execute()

@router.post("/generate", response_model=AnimationResponse)
async def generate_animation(
    request: AnimationRequest,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user)
):
    import uuid
    task_id = str(uuid.uuid4())
    
    # Create task in database
    create_task_in_db(task_id, user_id, request.prompt, request.quality.value)
    
    background_tasks.add_task(
        process_animation,
        task_id,
        request.prompt,
        request.quality.value,
        user_id
    )
    
    return AnimationResponse(
        task_id=task_id,
        status="processing",
        message="Animation generation started"
    )

async def process_animation(task_id: str, prompt: str, quality: str, user_id: str):
    import traceback
    try:
        print(f"[{task_id}] Starting animation generation for prompt: {prompt[:50]}...")
        
        update_task_in_db(task_id, {"status": "generating_script", "progress": 20})
        
        print(f"[{task_id}] Generating Manim script...")
        script = await generate_manim_script(prompt)
        print(f"[{task_id}] Script generated:\n{script[:200]}...")
        
        update_task_in_db(task_id, {
            "status": "rendering",
            "progress": 50,
            "generated_script": script
        })
        
        print(f"[{task_id}] Rendering animation...")
        video_path = await render_animation(script, quality)
        print(f"[{task_id}] Video rendered at: {video_path}")
        
        update_task_in_db(task_id, {"status": "uploading", "progress": 80})
        
        print(f"[{task_id}] Uploading to Supabase...")
        video_url = await upload_video(video_path, user_id, prompt)
        print(f"[{task_id}] Upload complete: {video_url}")
        
        update_task_in_db(task_id, {
            "status": "completed",
            "progress": 100,
            "video_url": video_url
        })
        
    except Exception as e:
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
