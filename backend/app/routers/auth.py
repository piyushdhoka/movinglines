from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from app.services.supabase_service import get_supabase

router = APIRouter()

class AuthRequest(BaseModel):
    email: str
    password: str

@router.post("/signup")
async def signup(request: AuthRequest):
    try:
        client = get_supabase()
        response = client.auth.sign_up({
            "email": request.email,
            "password": request.password
        })
        return {"message": "User created successfully", "user": response.user}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
async def login(request: AuthRequest):
    try:
        client = get_supabase()
        response = client.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })
        return {
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "user": response.user
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@router.post("/logout")
async def logout(authorization: str = Header(...)):
    try:
        client = get_supabase()
        client.auth.sign_out()
        return {"message": "Logged out successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
