from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from app.routers import animations, auth

from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware

import socketio

fastapi_app = FastAPI(title="Manim Animation Generator", version="1.0.0")

# Socket.IO setup
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins="*", # Managed by ASGI application middleware or specific for SIO
    ping_timeout=60,
    ping_interval=25,
    logger=True, # Enable logging for debugging connectivity
    engineio_logger=False
)
app = socketio.ASGIApp(sio, fastapi_app)

# Standardize Origins
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://movinglines.vercel.app",
    "https://movinglines.co.in",
    "https://www.movinglines.co.in",
]

# Global exception handler to ensure CORS headers are present even on 500 errors
@fastapi_app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    print(f"[ERROR] Global Exception: {exc}")
    origin = request.headers.get("origin")
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
        headers={
            "Access-Control-Allow-Origin": origin if origin and origin in ALLOWED_ORIGINS else ALLOWED_ORIGINS[0],
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Export sio for use in other modules
fastapi_app.state.sio = sio

# Setup Socket.IO handlers for animations
from app.routers.animations import setup_socket_handlers as setup_animations_handlers
setup_animations_handlers(sio)

fastapi_app.include_router(animations.router, prefix="/api/animations", tags=["animations"])
fastapi_app.include_router(auth.router, prefix="/api/auth", tags=["auth"])

@fastapi_app.get("/")
async def root_health():
    return {"status": "ok"}

@fastapi_app.get("/health")
async def health_check():
    return {"status": "healthy"}
