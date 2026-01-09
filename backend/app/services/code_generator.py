from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
import re
import logging
from app.services.video_renderer import sanitize_manim_script

from app.config import get_settings
from app.prompts.manim_prompt import MANIM_SYSTEM_PROMPT
from app.services.vector_store import get_relevant_examples, format_examples_for_context

logger = logging.getLogger(__name__)
settings = get_settings()

MANIM_USER_PROMPT = """Create a Manim animation for: {user_prompt}

REQUIREMENTS:
1. Output ONLY Python code - no markdown, no explanations
2. Class must be named `GeneratedScene`
3. Title at TOP, content BELOW (no overlaps!)
4. Use modern Manim CE syntax (no deprecated functions)
5. Keep animation between {min_duration} and {max_duration} seconds total
6. Choose correct Scene type: Scene (2D), ThreeDScene (3D), MovingCameraScene (camera control)

Begin with `from manim import *` immediately:"""



def get_llm():
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=settings.google_api_key,
        temperature=0.7
    )


def extract_code(text: str) -> str:
    """Extract Python code from LLM response."""
    # Try to find Python code blocks first
    code_match = re.search(r'```python\n(.*?)```', text, re.DOTALL)
    if code_match:
        return code_match.group(1).strip()
    
    # Try generic code blocks
    code_match = re.search(r'```\n(.*?)```', text, re.DOTALL)
    if code_match:
        return code_match.group(1).strip()
    
    # If no code blocks found, try to extract the code section
    lines = text.split('\n')
    code_lines = []
    in_code = False
    
    for line in lines:
        if line.strip().startswith('from ') or line.strip().startswith('class GeneratedScene'):
            in_code = True
        if in_code:
            code_lines.append(line)
    
    if code_lines:
        return '\n'.join(code_lines).strip()
    
    # Fallback to entire text
    return text.strip()


def _strip_markdown_fences(code: str) -> str:
    """Remove any lingering markdown code fences or language hints."""
    if not code:
        return code
    # Remove triple backtick blocks and any language spec after ```
    code = re.sub(r"```+\w*", "", code)
    code = code.replace("```", "")
    return code.strip()


async def generate_manim_script(user_prompt: str, duration: int = 15) -> str:
    """Generate Manim script from user prompt using RAG."""
    logger.info(f"[LLM] Generating script for: {user_prompt[:100]}...")
    
    # Step 1: Retrieve relevant examples from Pinecone
    logger.info("[LLM] Querying Pinecone for relevant examples...")
    print("[LLM] Querying Pinecone for relevant examples...")  # Explicit print
    examples = await get_relevant_examples(user_prompt, top_k=5)
    context = format_examples_for_context(examples)
    logger.info(f"[LLM] Retrieved {len(examples)} examples for context")
    print(f"[LLM] Retrieved {len(examples)} examples for context")  # Explicit print
    if examples:
        logger.info(f"[LLM] Using Pinecone context. First example score={examples[0].get('score',0):.2f}")
        print(f"[LLM] Using Pinecone context. First example score={examples[0].get('score',0):.2f}")
    else:
        logger.info("[LLM] No Pinecone examples found. Proceeding without external context.")
        print("[LLM] No Pinecone examples found. Proceeding without external context.")
    
    # Step 2: Build the prompt with context (use replace to avoid format issues with braces)
    llm = get_llm()
    
    system_prompt_with_context = MANIM_SYSTEM_PROMPT.replace("{context}", context)
    
    # Calculate duration constraints
    min_dur = max(5, duration - 2)
    max_dur = duration + 2
    
    user_prompt_formatted = MANIM_USER_PROMPT.replace("{user_prompt}", user_prompt).replace("{min_duration}", str(min_dur)).replace("{max_duration}", str(max_dur))
    
    # Step 3: Create messages directly (avoid ChatPromptTemplate parsing braces)
    messages = [
        SystemMessage(content=system_prompt_with_context),
        HumanMessage(content=user_prompt_formatted)
    ]
    
    # Step 4: Generate the script
    logger.info("[LLM] Calling Gemini...")
    result = await llm.ainvoke(messages)

    code = extract_code(result.content)
    code = _strip_markdown_fences(code)

    # Sanitize API compatibility before indentation fixes
    code = sanitize_manim_script(code)

    # Normalize indentation first
    code = _normalize_indentation(code)
    
    # Sanitize updater function signatures to be Manim-compatible
    code = _sanitize_updaters(code)
    
    # Sanitize 3D camera controls (ThreeDScene doesn't have camera.frame)
    code = _sanitize_3d_camera(code)

    logger.info(f"[LLM] Generated {len(code)} characters of code")

    return code

def _normalize_indentation(code: str) -> str:
    """
    Aggressively normalize indentation to multiples of 4 spaces.
    Handle mixed tabs and spaces, odd indentation levels.
    """
    import textwrap
    
    # First pass: convert all tabs to 4 spaces
    code = code.expandtabs(4)
    lines = code.split('\n')
    normalized = []
    
    # Track expected indentation
    prev_indent = 0
    
    for i, line in enumerate(lines):
        stripped = line.lstrip()
        
        # Keep empty lines empty
        if not stripped:
            normalized.append('')
            continue
        
        # Count actual spaces
        actual_indent = len(line) - len(stripped)
        
        # Handle comments and special lines - preserve their level
        if stripped.startswith('#'):
            # Comments should keep whatever indent they have, but quantized to 4
            indent_level = actual_indent // 4
            normalized.append(' ' * (indent_level * 4) + stripped)
            continue
        
        # Dedent/indent analysis
        if stripped.startswith(('def ', 'class ', 'if ', 'for ', 'while ', 'with ', 'try:', 'except', 'else:', 'elif ', 'finally:')):
            # These typically dedent or stay same level
            if actual_indent % 4 != 0:
                # Quantize to nearest multiple of 4
                indent_level = max(0, (actual_indent + 2) // 4)  # Round up
            else:
                indent_level = actual_indent // 4
        else:
            # Regular statement - quantize strictly
            indent_level = actual_indent // 4 if actual_indent % 4 == 0 else (actual_indent + 2) // 4
        
        normalized.append(' ' * (indent_level * 4) + stripped)
    
    result = '\n'.join(normalized)
    
    # Try to compile multiple times with dedent fallbacks
    for attempt in range(3):
        try:
            compile(result, '<string>', 'exec')
            return result
        except IndentationError as e:
            if attempt == 0:
                # Try dedent
                result = textwrap.dedent(result)
            elif attempt == 1:
                # Try aggressive dedent
                result = textwrap.dedent(textwrap.dedent(result))
            else:
                # Last resort: return as-is
                return result
    
    return result

def _sanitize_updaters(code: str) -> str:
    """
    Normalize updater function signatures so Manim calls them correctly.

    Rules:
    - Updaters must be `def updater(mobject)` or `def updater(mobject, dt)`.
    - If a second parameter named `alpha` is present, rename it to `dt`.
    - If only one parameter is present, add optional `dt=0` to the signature.
    - Replace references to `alpha` inside the updater definition body with `dt`.
    """

    # Match function definitions like: def update_dot(mobj, alpha): or def update_dot(mobj):
    func_pattern = re.compile(r"(def\s+(update\w*)\s*\(\s*([^)]*)\s*\)\s*:\s*)", re.MULTILINE)

    # To safely replace body occurrences of 'alpha' with 'dt', we need to process block by block.
    lines = code.splitlines(keepends=True)
    new_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        m = re.match(r"\s*def\s+(update\w*)\s*\(\s*([^)]*)\s*\)\s*:\s*", line)
        if not m:
            new_lines.append(line)
            i += 1
            continue

        func_name = m.group(1)
        params_str = m.group(2)

        # Parse parameters
        params = [p.strip() for p in params_str.split(',') if p.strip()]

        # Ensure second parameter is dt, add it if missing
        if len(params) == 0:
            # Unlikely, but fallback
            new_sig = f"def {func_name}(mobject, dt=0):\n"
        elif len(params) == 1:
            new_sig = f"def {func_name}({params[0]}, dt=0):\n"
        else:
            # Rename second param to dt if not already dt
            first = params[0]
            second = params[1]
            if second != 'dt':
                second = 'dt'
            new_sig = f"def {func_name}({first}, {second}):\n"

        # Write the new signature line
        new_lines.append(new_sig)

        # Now copy the function body until we hit a non-indented line (simple heuristic)
        i += 1
        while i < len(lines):
            body_line = lines[i]
            # Stop when indentation ends (function body ends)
            if re.match(r"^[^\s]", body_line):
                break
            # Replace 'alpha' with 'dt' in the body
            body_line = body_line.replace('alpha', 'dt')
            new_lines.append(body_line)
            i += 1
        # Don't increment i here; the outer loop will continue from current i (which is at first non-indented line)
    
    return ''.join(new_lines)

def _sanitize_3d_camera(code: str) -> str:
    import re
    
    if 'ThreeDScene' not in code:
        return code
    
    code = re.sub(
        r'self\.play\(self\.camera\.frame\.animate\.[^)]+\)\s*,\s*run_time\s*=\s*[0-9.]+\)',
        '',
        code
    )
    code = re.sub(
        r'self\.play\(self\.camera\.frame\.animate\.[^)]+\)',
        '',
        code
    )
    
    return code


async def generate_improved_code(error_context: dict) -> str:
    prompt = error_context.get('prompt', '')
    previous_code = error_context.get('code', '')
    error_message = error_context.get('error', '')
    
    logger.info("[LLM] Generating improved code from error context...")
    print("[LLM] Attempting self-healing code generation...")
    
    examples = await get_relevant_examples(prompt, top_k=5)
    context = format_examples_for_context(examples)
    
    print(f"[LLM] Using {len(examples)} examples for retry")
    
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
4. ThreeDScene: use move_camera(), NOT self.camera.frame
5. Fix the specific error mentioned
6. Return ONLY code, no explanations

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
    code = _strip_markdown_fences(code)
    code = sanitize_manim_script(code)
    code = _normalize_indentation(code)
    code = _sanitize_updaters(code)
    code = _sanitize_3d_camera(code)
    
    logger.info(f"[LLM] Improved code generated ({len(code)} chars)")
    
    return code

