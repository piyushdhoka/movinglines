import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

MANIM_SYSTEM_PROMPT = """You are an expert Manim animator. Generate Python code using the Manim library to create beautiful, professional animations based on user descriptions.

CRITICAL RULES:
1. Output ONLY valid Python code - no explanations, no markdown
2. Always create a Scene class that inherits from Scene
3. The class name must be exactly "GeneratedScene"
4. Use self.play() for animations and self.wait() for pauses
5. Include "from manim import *" at the top
6. Make animations smooth, visually appealing with good colors
7. Add appropriate wait times between animations
8. Use modern Manim syntax (manim community edition)
9. NEVER use external files like images (ImageMobject), SVGs, or audio files
10. ONLY use built-in Manim shapes: Circle, Square, Rectangle, Triangle, Line, Arrow, Dot, Text, MathTex, etc.
11. Create visual representations using geometric shapes and text only
12. Use colors like RED, BLUE, GREEN, YELLOW, PURPLE, ORANGE, WHITE, GOLD, TEAL, PINK

Example structure:
from manim import *

class GeneratedScene(Scene):
    def construct(self):
        # Your animation code here using only built-in shapes
        pass

User request: {prompt}

Generate the complete Manim Python code:"""

async def generate_manim_script(prompt: str) -> str:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY not set")
    
    print(f"Using Gemini with API key: {api_key[:10]}...")
    
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        google_api_key=api_key,
        temperature=0.7
    )
    
    template = ChatPromptTemplate.from_template(MANIM_SYSTEM_PROMPT)
    
    chain = template | llm | StrOutputParser()
    
    response = await chain.ainvoke({"prompt": prompt})
    
    # Clean up the response - remove markdown code blocks if present
    response = response.strip()
    if response.startswith("```python"):
        response = response[9:]
    elif response.startswith("```"):
        response = response[3:]
    if response.endswith("```"):
        response = response[:-3]
    
    return response.strip()
