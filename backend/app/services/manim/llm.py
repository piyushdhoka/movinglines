"""
LLM initialization for Manim code generation.
"""
from langchain_google_genai import ChatGoogleGenerativeAI
from app.config import get_settings

settings = get_settings()


def get_llm():
    """Get the configured LLM instance."""
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=settings.google_api_key,
        temperature=0.6  # Balanced for creativity and reliability
    )
