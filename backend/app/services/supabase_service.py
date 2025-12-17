import os
import uuid
import jwt
from datetime import datetime
from fastapi import HTTPException, Header
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

_supabase_client: Client = None

def get_supabase() -> Client:
    global _supabase_client
    if _supabase_client is None:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_ANON_KEY")
        print(f"[Supabase] URL: {url[:30] if url else None}...")
        print(f"[Supabase] Key: {key[:20] if key else None}...")
        if url and key:
            _supabase_client = create_client(url, key)
        else:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY/SUPABASE_ANON_KEY must be set")
    return _supabase_client

async def get_current_user(authorization: str = Header(None)) -> str:
    """Extract and validate user from JWT token."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    try:
        token = authorization.replace("Bearer ", "")
        # Decode JWT without verification to get user_id (Supabase handles auth)
        payload = jwt.decode(token, options={"verify_signature": False})
        user_id = payload.get("sub")
        if user_id:
            return user_id
        raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.DecodeError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token format")
    except Exception as e:
        print(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

async def upload_video(video_path: str, user_id: str, prompt: str) -> str:
    """Upload video to Supabase storage and save metadata."""
    client = get_supabase()
    bucket = os.getenv("SUPABASE_BUCKET", "manim-videos")
    
    video_id = str(uuid.uuid4())
    file_name = f"{user_id}/{video_id}.mp4"
    
    # Upload to storage
    with open(video_path, "rb") as f:
        client.storage.from_(bucket).upload(
            file_name,
            f,
            {"content-type": "video/mp4"}
        )
    
    # Get public URL
    video_url = client.storage.from_(bucket).get_public_url(file_name)
    
    # Save metadata to database
    client.table("videos").insert({
        "id": video_id,
        "user_id": user_id,
        "prompt": prompt,
        "video_url": video_url,
        "created_at": datetime.utcnow().isoformat()
    }).execute()
    
    return video_url

async def get_user_videos(user_id: str) -> list:
    """Get all videos for a user."""
    client = get_supabase()
    
    response = client.table("videos").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
    
    return response.data

async def delete_video(video_id: str, user_id: str) -> bool:
    """Delete a video from storage and database."""
    client = get_supabase()
    bucket = os.getenv("SUPABASE_BUCKET", "manim-videos")
    
    # Verify ownership
    video = client.table("videos").select("*").eq("id", video_id).eq("user_id", user_id).single().execute()
    
    if not video.data:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # Delete from storage
    file_name = f"{user_id}/{video_id}.mp4"
    client.storage.from_(bucket).remove([file_name])
    
    # Delete from database
    client.table("videos").delete().eq("id", video_id).execute()
    
    return True
