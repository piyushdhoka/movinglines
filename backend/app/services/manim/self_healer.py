"""
Self-healing code generator.
Attempts to fix broken Manim code based on error messages.
"""
import logging
from langchain_core.messages import SystemMessage, HumanMessage

from app.services.manim.llm import get_llm
from app.services.manim.extractor import extract_code, strip_markdown_fences
from app.services.manim.sanitizers import (
    normalize_indentation,
    sanitize_updaters,
    sanitize_3d_camera,
)
from app.services.video_renderer import sanitize_manim_script
from app.services.vector_store import get_relevant_examples, format_examples_for_context

logger = logging.getLogger(__name__)


async def generate_improved_code(error_context: dict) -> str:
    """
    Generate improved Manim code based on error feedback.
    This is the self-healing mechanism that runs when initial generation fails.
    """
    prompt = error_context.get('prompt', '')
    previous_code = error_context.get('code', '')
    error_message = error_context.get('error', '')
    use_image = error_context.get('use_image', False)
    
    logger.info(f"[LLM] Generating improved code (use_image={use_image})...")
    print(f"[LLM] Attempting self-healing for: {error_message[:100]}...")
    
    examples = await get_relevant_examples(prompt, top_k=5)
    context = format_examples_for_context(examples)
    
    image_instruction = ""
    if use_image:
        image_instruction = "\n7. CRITICAL: You MUST include at least one `ImageMobject` using the `{{IMAGE:vivid description}}` syntax."

    system_template = f"""You are a Manim debugging expert. Fix the broken code.
    
Original request: {prompt}

Previous code that failed:
```python
{previous_code}
```

Error encountered:
{error_message}

Rules:
1. Import from manim
2. Class name: GeneratedScene
3. Inherit from Scene or ThreeDScene
4. ThreeDScene: use move_camera(), NOT self.camera.frame or self.camera.animate
5. Fix the specific error mentioned
6. Return ONLY code, no explanations or comments{image_instruction}
7. DO NOT include any comments inside the Python code (# comments).
9. **NO F-STRINGS IN LATEX**: NEVER use f-strings for MathTex or Tex.
10. Formatting and syntax must be perfect.

Relevant examples:
{context}

Generate corrected code:"""
    
    user_msg = "Generate fixed Manim code addressing the error."
    
    messages = [
        SystemMessage(content=system_template),
        HumanMessage(content=user_msg)
    ]
    
    llm = get_llm()
    result = await llm.ainvoke(messages)
    
    code = extract_code(result.content)
    code = strip_markdown_fences(code)
    code = sanitize_manim_script(code)
    code = normalize_indentation(code)
    code = sanitize_updaters(code)
    code = sanitize_3d_camera(code)
    
    # IMAGE VALIDATION & AUTO-INJECTION (same as main generator)
    if use_image and 'ImageMobject' not in code:
        logger.warning("[Self-Healer] Image required but ImageMobject not found. Auto-injecting...")
        print("[Self-Healer] ⚠️  Auto-injecting ImageMobject placeholder")
        
        lines = code.split('\n')
        inject_index = None
        
        # Find where to inject (after first self.play or after color definitions)
        for i, line in enumerate(lines):
            if 'self.play(Write(title' in line or 'self.play(FadeIn(title' in line:
                inject_index = i + 1
                break
        
        # Fallback: inject after construct def
        if inject_index is None:
            for i, line in enumerate(lines):
                if 'def construct(self):' in line:
                    inject_index = i + 2
                    break
        
        if inject_index:
            # Auto-inject ImageMobject with smart prompt extraction
            prompt_snippet = prompt[:60] if len(prompt) < 60 else prompt[:57] + "..."
            image_code = f'''
        # Auto-injected ImageMobject (self-healer)
        main_img = ImageMobject("{{{{IMAGE:{prompt_snippet}}}}}")
        main_img.scale_to_fit_height(5)
        main_img.move_to(ORIGIN)
        self.play(FadeIn(main_img, run_time=1))
        self.wait(1)
'''
            lines.insert(inject_index, image_code)
            code = '\n'.join(lines)
            logger.info("[Self-Healer] ImageMobject successfully auto-injected")
    
    logger.info(f"[LLM] Improved code generated ({len(code)} chars)")
    
    return code
