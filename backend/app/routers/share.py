from fastapi import APIRouter, HTTPException
from app.services.database_service import (
    get_public_video,
    get_public_chat,
    get_public_chat_tasks,
    increment_video_views,
    increment_chat_views
)

router = APIRouter()


@router.get("/video/{video_id}")
async def get_shared_video(video_id: str):
    """Get public video details (no authentication required)."""
    try:
        video = await get_public_video(video_id)
        
        # Increment view count in background
        await increment_video_views(video_id)
        
        return video
    except HTTPException:
        raise
    except Exception as e:
        print(f"[Share] Error fetching video: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch video")


@router.get("/chat/{chat_id}")
async def get_shared_chat(chat_id: str):
    """Get public chat details with all tasks (no authentication required)."""
    try:
        # Get chat metadata
        chat = await get_public_chat(chat_id)
        
        # Get all tasks/videos in the chat
        tasks = await get_public_chat_tasks(chat_id)
        
        # Increment view count in background
        await increment_chat_views(chat_id)
        
        return {
            "chat": chat,
            "tasks": tasks
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"[Share] Error fetching chat: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch chat")
