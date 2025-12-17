from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    google_api_key: str
    pinecone_api_key: str
    pinecone_index: str = "manim-examples"
    supabase_url: str
    supabase_key: str
    supabase_bucket: str = "videos"
    redis_url: str = "redis://redis:6379"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()

