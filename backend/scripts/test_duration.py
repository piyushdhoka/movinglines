import asyncio
import aiohttp
import os
import sys

# Add backend directory to path (parent of scripts dir)
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

API_URL = "http://localhost:8000"

async def test_duration_generation():
    print("Testing animation generation with duration control...")
    
    try:
        from app.services.code_generator import generate_manim_script
        
        prompt = "Create a simple circle animation"
        duration = 30
        
        print(f"Generating script for duration: {duration}s")
        script = await generate_manim_script(prompt, duration)
        
        print("\nGenerated Script Snippet:")
        print(script[:500])
        
        if "GeneratedScene" in script and "from manim import *" in script:
            print("\nSUCCESS: Script generated with basic structure.")
        else:
            print("\nFAILURE: Script missing basic structure.")
            
    except Exception as e:
        print(f"\nERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_duration_generation())
