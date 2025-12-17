from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from pydantic import BaseModel
from typing import Optional
from enum import Enum
from app.services.langchain_service import generate_manim_script
from app.services.manim_service import render_animation
from app.services.supabase_service import upload_video, get_user_videos, get_current_user

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

# In-memory task storage (use Redis in production)
tasks = {}

@router.post("/generate", response_model=AnimationResponse)
async def generate_animation(
    request: AnimationRequest,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user)
):
    import uuid
    task_id = str(uuid.uuid4())
    tasks[task_id] = {"status": "processing", "progress": 0}
    
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
        
        tasks[task_id]["status"] = "generating_script"
        tasks[task_id]["progress"] = 20
        
        print(f"[{task_id}] Generating Manim script...")
        script = await generate_manim_script(prompt)
        print(f"[{task_id}] Script generated:\n{script[:200]}...")
        tasks[task_id]["script"] = script
        
        tasks[task_id]["status"] = "rendering"
        tasks[task_id]["progress"] = 50
        
        print(f"[{task_id}] Rendering animation...")
        video_path = await render_animation(script, quality)
        print(f"[{task_id}] Video rendered at: {video_path}")
        
        tasks[task_id]["status"] = "uploading"
        tasks[task_id]["progress"] = 80
        
        print(f"[{task_id}] Uploading to Supabase...")
        video_url = await upload_video(video_path, user_id, prompt)
        print(f"[{task_id}] Upload complete: {video_url}")
        
        tasks[task_id]["status"] = "completed"
        tasks[task_id]["progress"] = 100
        tasks[task_id]["video_url"] = video_url
        
    except Exception as e:
        error_msg = f"{str(e)}\n{traceback.format_exc()}"
        print(f"[{task_id}] ERROR: {error_msg}")
        tasks[task_id]["status"] = "failed"
        tasks[task_id]["error"] = str(e)

@router.get("/status/{task_id}")
async def get_task_status(task_id: str):
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    return tasks[task_id]

@router.get("/videos")
async def list_videos(user_id: str = Depends(get_current_user)):
    try:
        return await get_user_videos(user_id)
    except Exception as e:
        return []
