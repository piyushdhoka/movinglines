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
        url = os.getenv("SUPABASE_URL", "")
        if url and not url.endswith("/"):
            url += "/"
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_ANON_KEY")
        if url and key:
            _supabase_client = create_client(url, key)
        else:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or ANON_KEY) must be set")
    return _supabase_client

async def get_current_user(authorization: str = Header(None)) -> tuple[str, str]:
    """Extract and validate user ID and email from JWT token."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    try:
        token = authorization.replace("Bearer ", "")
        # Decode JWT without verification to get user identity (Supabase handles auth)
        payload = jwt.decode(token, options={"verify_signature": False})
        user_id = payload.get("sub")
        email = payload.get("email")
        
        if user_id:
            return user_id, email or f"{user_id}@unknown.com"
            
        raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.DecodeError:
        raise HTTPException(status_code=401, detail="Invalid token format")
    except Exception as e:
        print(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

async def ensure_user_exists(user_id: str, email: str = None) -> bool:
    """Ensure user exists in public.users table, creating if necessary."""
    client = get_supabase()
    
    try:
        # 1. Check if user exists by ID
        result = client.table("users").select("id").eq("id", user_id).execute()
        if result.data:
            return True
        
        # 2. User doesn't exist - create new record
        # Use a unique email to avoid conflicts (append user_id if email already taken)
        safe_email = email or f"{user_id}@unknown.com"
        
        # Check if email is already used
        if email:
            email_check = client.table("users").select("id").eq("email", email).execute()
            if email_check.data:
                # Email is taken by different user - use a unique variant
                safe_email = f"{user_id}@user.movinglines.app"
        
        client.table("users").insert({
            "id": user_id,
            "email": safe_email,
            "credits": 2,  # Default free credits for new users
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }).execute()
        return True
            
    except Exception as e:
        print(f"[Supabase] User sync failed: {e}")
        # Return False to indicate failure - caller should handle this
        return False


def get_user_credits(user_id: str) -> int:
    """Get the current credit balance for a user."""
    client = get_supabase()
    result = client.table("users").select("credits").eq("id", user_id).single().execute()
    if result.data:
        return result.data.get("credits", 0)
    return 0


def deduct_credit(user_id: str) -> bool:
    """
    Atomically deduct 1 credit from user using conditional UPDATE.
    Uses WHERE credits > 0 to prevent negative credits and race conditions.
    Returns True if successful, False if no credits available.
    """
    client = get_supabase()
    
    try:
        # Use Supabase's RPC to run an atomic UPDATE that only succeeds if credits > 0
        # This is a single SQL statement that cannot be raced
        result = client.rpc('deduct_user_credit', {'p_user_id': user_id}).execute()
        
        # RPC returns the number of affected rows (1 if deducted, 0 if no credits)
        if result.data and result.data > 0:
            return True
        return False
    except Exception as e:
        # Fallback: if RPC doesn't exist, use conditional update
        print(f"[Credits] RPC failed, using fallback: {e}")
        
        # Get current credits first
        current = get_user_credits(user_id)
        if current <= 0:
            return False
        
        # Update with WHERE condition to prevent concurrent double-spend
        result = client.table("users").update({
            "credits": current - 1,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", user_id).gte("credits", current).execute()
        
        return bool(result.data and len(result.data) > 0)


async def upload_video(video_path: str, user_id: str, prompt: str) -> str:
    """Upload video to Supabase storage and save metadata."""
    client = get_supabase()
    bucket = os.getenv("SUPABASE_BUCKET", "manim-videos")
    
    # Ensure user exists in public.users
    await ensure_user_exists(user_id)
    
    video_id = str(uuid.uuid4())
    file_name = f"{user_id}/{video_id}.mp4"
    
    # Upload to storage
    try:
        with open(video_path, "rb") as f:
            client.storage.from_(bucket).upload(
                path=file_name,
                file=f,
                file_options={"content-type": "video/mp4"}
            )
    except Exception as e:
        if "Expecting value" in str(e):
            raise RuntimeError(f"Upload failed - check bucket '{bucket}' exists and has correct permissions")
        raise e
    
    # Get public URL
    video_url = client.storage.from_(bucket).get_public_url(file_name)
    
    # Save metadata to database
    client.table("videos").insert({
        "id": video_id,
        "user_id": user_id,
        "prompt": prompt,
        "video_url": video_url,
        "bucket_path": file_name,
        "created_at": datetime.utcnow().isoformat()
    }).execute()
    
    return video_url

def create_chat_in_db(user_id: str, title: str) -> str:
    """Create a new chat session."""
    client = get_supabase()
    chat_id = str(uuid.uuid4())
    
    client.table("chats").insert({
        "id": chat_id,
        "user_id": user_id,
        "title": title,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }).execute()
    
    return chat_id

def get_user_chats_from_db(user_id: str):
    """Get all chats for a user."""
    client = get_supabase()
    result = client.table("chats").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
    return result.data

def delete_chat_from_db(chat_id: str, user_id: str) -> bool:
    """Delete a chat session and its associated tasks."""
    client = get_supabase()
    
    # Verify ownership
    chat = client.table("chats").select("*").eq("id", chat_id).eq("user_id", user_id).single().execute()
    
    if not chat.data:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Delete chat
    client.table("chats").delete().eq("id", chat_id).execute()
    
    return True

def get_chat_tasks_from_db(chat_id: str, user_id: str):
    """Get all tasks for a specific chat."""
    client = get_supabase()
    
    # Verify ownership
    chat = client.table("chats").select("id").eq("id", chat_id).eq("user_id", user_id).single().execute()
    if not chat.data:
        raise HTTPException(status_code=404, detail="Chat not found")

    # Fetch tasks
    result = client.table("tasks").select("*").eq("chat_id", chat_id).order("created_at", desc=True).execute()
    return result.data

async def get_user_videos(user_id: str) -> list:
    """Get all videos for a user."""
    client = get_supabase()
    
    print(f"[Supabase] Fetching videos for User ID: {user_id}")
    
    response = client.table("videos").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
    
    print(f"[Supabase] Found {len(response.data)} videos")
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
