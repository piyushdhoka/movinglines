"""
Manim script generation with RAG context from Pinecone.
"""
import re
import logging
from langchain_core.messages import SystemMessage, HumanMessage

from app.prompts.manim_prompt import MANIM_SYSTEM_PROMPT, MANIM_USER_PROMPT
from app.services.manim.llm import get_llm
from app.services.vector_store import get_relevant_examples, format_examples_for_context
from app.services.video_renderer import sanitize_manim_script
from app.services.manim.extractor import extract_code, strip_markdown_fences
from app.services.manim.sanitizers import (
    normalize_indentation,
    sanitize_updaters,
    sanitize_3d_camera,
    apply_anticrash_rules,
)
from app.services.manim.self_healer import generate_improved_code

logger = logging.getLogger(__name__)


async def generate_manim_script(user_prompt: str, duration: int = 15, force_image: bool = False) -> str:
    """
    Generate Manim script from user prompt using RAG.
    
    Pipeline:
    1. [DISABLED] Enhance the raw prompt into a structured animation spec
    2. Retrieve relevant examples from Pinecone
    3. Generate code using LLM
    4. Apply sanitizers and anti-crash rules
    5. Validate syntax, attempt self-healing if needed
    """
    # Step 0: Enhancement DISABLED for quality improvement
    # user_prompt = await enhance_user_prompt(user_prompt)
    # Using raw user prompt directly for simplicity and reliability
    
    logger.info(f"[LLM] Generating script for: {user_prompt[:100]}... (force_image={force_image})")
    
    # Step 1: Research & Storyboarding (The "3b1b" Phase)
    from app.services.manim.planner import plan_video_narrative
    storyboard = await plan_video_narrative(user_prompt)
    
    # Log only the summary to keep logs clean
    story_preview = storyboard.split('\n')[0][:100] + "..." if '\n' in storyboard else storyboard[:100]
    logger.info(f"[Planner] Storyboard designed: {story_preview}")
    print(f"[Planner] Storyboard designed: {story_preview}")

    # Step 2: Retrieve relevant examples from Pinecone
    logger.info("[LLM] Querying Pinecone for relevant examples...")
    print("[LLM] Querying Pinecone for relevant examples...")
    examples = await get_relevant_examples(user_prompt, top_k=5)
    context = format_examples_for_context(examples)
    
    if examples:
        print(f"[LLM] RAG Success: Retrieved {len(examples)} examples (Top Score: {examples[0].get('score', 0):.2f})")
    else:
        print("[LLM] RAG: No relevant examples found in Pinecone. Proceeding with base knowledge.")
    
    # Step 3: Build the prompt with Storyboard + RAG Context
    llm = get_llm()
    
    # Fill in both storyboard and RAG context
    system_prompt_with_context = MANIM_SYSTEM_PROMPT.replace("{storyboard}", storyboard).replace("{context}", context)
    
    # Calculate duration constraints
    min_dur = max(5, duration - 2)
    max_dur = duration + 2
    
    user_prompt_formatted = MANIM_USER_PROMPT.format(
        user_prompt=user_prompt,
        max_duration=max_dur
    )
    
    if force_image:
        image_instruction = """

========================================
🚨 CRITICAL IMAGE REQUIREMENT 🚨
========================================

YOU **MUST** INCLUDE AN ImageMobject IN YOUR CODE!

CORRECT SYNTAX (copy this pattern exactly):
```python
my_image = ImageMobject("{{IMAGE:detailed description of what to generate}}")
my_image.scale_to_fit_height(4)  # Scale to fit
my_image.move_to(ORIGIN)  # Center it
self.play(FadeIn(my_image))
```

EXAMPLE for plant anatomy:
```python
plant_img = ImageMobject("{{IMAGE:detailed anatomical diagram of a plant showing roots, stem, leaves, and flower with clear labels}}")
plant_img.scale_to_fit_height(5)
plant_img.move_to(ORIGIN)
self.play(FadeIn(plant_img))
```

DO NOT:
- Create an invisible Dot as a placeholder
- Use fill_opacity=0
- Skip the ImageMobject entirely

The {{IMAGE:...}} placeholder will be auto-replaced with an AI-generated image.
This is a VALIDATION REQUIREMENT. Code without ImageMobject will be REJECTED.
========================================
"""
        user_prompt_formatted += image_instruction
    
    # Step 3: Create messages
    messages = [
        SystemMessage(content=system_prompt_with_context),
        HumanMessage(content=user_prompt_formatted)
    ]
    
    # Step 4: Generate the script
    logger.info("[LLM] Calling Gemini...")
    result = await llm.ainvoke(messages)

    code = extract_code(result.content)
    code = strip_markdown_fences(code)

    # Sanitize API compatibility
    code = sanitize_manim_script(code)

    # Normalize indentation
    code = normalize_indentation(code)
    
    # Sanitize updaters
    code = sanitize_updaters(code)
    
    # Sanitize 3D camera
    code = sanitize_3d_camera(code)
    
    # Master anti-crash engine
    code = apply_anticrash_rules(code)

    # HALLUCINATION FALLBACKS
    # Gear is not a built-in Manim CE class
    code = re.sub(r"\bGear\b", "Circle", code)
    
    # IMAGE VALIDATION & AUTO-INJECTION
    if force_image and 'ImageMobject' not in code:
        logger.warning("[LLM] Image required but ImageMobject not found in generated code. Auto-injecting...")
        print("[LLM] ⚠️  Auto-injecting ImageMobject placeholder")
        
        # Insert ImageMobject after title creation
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
                    inject_index = i + 2  # Skip def and likely a background line
                    break
        
        if inject_index:
            # Detect existing indentation level of the anchor line (or the line above it)
            anchor_line = lines[inject_index - 1]
            base_indent = len(anchor_line) - len(anchor_line.lstrip())
            indent_prefix = ' ' * base_indent
            
            # Auto-inject ImageMobject with smart prompt extraction and correct indentation
            prompt_snippet = user_prompt[:60] if len(user_prompt) < 60 else user_prompt[:57] + "..."
            
            image_code_lines = [
                f"{indent_prefix}# Auto-injected ImageMobject",
                f"{indent_prefix}main_img = ImageMobject(\"{{{{IMAGE:{prompt_snippet}}}}}\")",
                f"{indent_prefix}main_img.scale_to_fit_height(5)",
                f"{indent_prefix}main_img.move_to(ORIGIN)",
                f"{indent_prefix}self.play(FadeIn(main_img, run_time=1))",
                f"{indent_prefix}self.wait(1)"
            ]
            
            # Insert lines in reverse to maintain correct insertion point
            for line in reversed(image_code_lines):
                lines.insert(inject_index, line)
                
            code = '\n'.join(lines)
            logger.info("[LLM] ImageMobject successfully auto-injected with context-aware indentation")

    # Pre-render syntax validation
    try:
        compile(code, "<string>", "exec")
        logger.info(f"[LLM] Generated {len(code)} characters of valid code")
    except SyntaxError as e:
        logger.warning(f"[LLM] Initial generation produced invalid syntax: {e}. Triggering early self-healing...")
        error_context = {
            'prompt': user_prompt,
            'code': code,
            'error': f"Syntax Error during pre-validation: {str(e)}",
            'use_image': force_image
        }
        code = await generate_improved_code(error_context)
        logger.info(f"[LLM] Healed code generated ({len(code)} chars)")

    return code
