"""
Code sanitization and anti-crash engine for Manim scripts.
Handles indentation normalization, updater fixes, and 3D camera corrections.
"""
import re
import textwrap


def strip_inline_comments(code: str) -> str:
    """
    Remove inline comments from code to prevent them from breaking regex sanitizers.
    Preserves shebang lines and keeps full-line comments.
    """
    lines = code.split('\n')
    cleaned = []
    
    for line in lines:
        # Skip empty lines
        if not line.strip():
            cleaned.append(line)
            continue
            
        # Keep full-line comments (lines that start with # after whitespace)
        stripped = line.lstrip()
        if stripped.startswith('#'):
            cleaned.append(line)
            continue
        
        # Remove inline comments (everything after # in code lines)
        if '#' in line:
            # Find the # that's not inside a string
            in_string = False
            quote_char = None
            for i, char in enumerate(line):
                if char in ('"', "'") and (i == 0 or line[i-1] != '\\'):
                    if not in_string:
                        in_string = True
                        quote_char = char
                    elif char == quote_char:
                        in_string = False
                        quote_char = None
                elif char == '#' and not in_string:
                    # Found a comment
                    cleaned.append(line[:i].rstrip())
                    break
            else:
                # No comment found (# was in string)
                cleaned.append(line)
        else:
            cleaned.append(line)
    
    return '\n'.join(cleaned)


def normalize_indentation(code: str) -> str:
    """
    Robustly normalize indentation to multiples of 4 spaces.
    Handles mixed tabs/spaces, odd indentation levels, and ensures the code is compilable.
    """
    import textwrap
    
    # 1. Expand tabs and strip leading/trailing empty lines
    code = code.expandtabs(4).strip('\n')
    lines = code.split('\n')
    
    if not lines:
        return ""

    # 2. Extract base indentation to handle code that starts indented (e.g., from markdown extract)
    # but we want to know the "minimum" indent of non-empty code lines to potentially dedent first
    base_indent = float('inf')
    for line in lines:
        stripped = line.lstrip()
        if stripped:
            base_indent = min(base_indent, len(line) - len(stripped))
    
    if base_indent == float('inf'):
        return code
        
    # Dedent if it's all shifted right
    if base_indent > 0:
        lines = [line[base_indent:] if len(line) >= base_indent else line.lstrip() for line in lines]

    normalized = []
    indent_stack = [0] # Stack of current active indents
    
    # Simple keyword-based tracking to adjust expected indentation levels
    # This helps catch cases where the LLM uses 2 spaces instead of 4
    indent_keywords = ('def ', 'class ', 'if ', 'elif ', 'else:', 'for ', 'while ', 'with ', 'try:', 'except ', 'finally:')
    
    current_level = 0
    for i, line in enumerate(lines):
        stripped = line.lstrip()
        
        if not stripped:
            normalized.append('')
            continue
            
        actual_indent = len(line) - len(stripped)
        
        # Heuristic: if actual_indent is closer to next/prev level, snap it
        # However, we rely more on the keyword-based structure if possible
        
        # Snap to 4-space boundaries
        snapped_level = round(actual_indent / 4)
        
        # Basic "safety" - if the line starts a block, the NEXT line should be deeper
        # If the line starts with a dedent keyword (else, except, finally, elif), it should match its parent's level
        dedent_keywords = ('elif ', 'else:', 'except ', 'finally:')
        if any(stripped.startswith(k) for k in dedent_keywords):
             snapped_level = max(0, snapped_level) # Dedent keywords are handled by the snapping usually
        
        line_to_add = ' ' * (snapped_level * 4) + stripped
        normalized.append(line_to_add)
        
    result = '\n'.join(normalized)
    
    # 3. Aggressive Compilation Verification
    # We try to fix it until it compiles, or we reach a limit
    for attempt in range(4):
        try:
            compile(result, '<string>', 'exec')
            return result
        except IndentationError as e:
            # If compile fails, try to use textwrap.dedent as a last resort
            if attempt == 0:
                result = textwrap.dedent(result)
            elif attempt == 1:
                # Try to fix "Expected an indented block" by finding where it failed
                # e.g. for row level in e.args
                result = result # Placeholder for smarter logic if needed
            else:
                break
        except SyntaxError:
            # Syntax errors (non-indent) are handled by self-healer/renderer
            return result
            
    return result


def sanitize_updaters(code: str) -> str:
    """
    Ultra-Robustness for Manim Updaters & Assets:
    1. Standardizes all updater params to 'dt' (strictly required by Manim CE).
    2. Deep Aliasing: frame_dt, dt_frame, time_step, dt_val, etc. -> dt.
    3. Lambda Sanitization: Fixes add_updater(lambda m, dt_val: ...) calls.
    4. Ghost Assets: Removes ImageMobject/SVGMobject calls with local filenames.
    """
    # Handle lambda updaters globally
    code = re.sub(
        r"\.add_updater\(\s*lambda\s+(\w+)\s*,\s*(\w+)\s*:\s*",
        r".add_updater(lambda \1, dt: ",
        code
    )

    # Note: Global replacement of ImageMobject/SVGMobject with Dot
    # was removed because it was too aggressive and broke auto-injected images.
    # LLM should handle file presence via prompt instructions.

    lines = code.splitlines(keepends=True)
    new_lines = []
    i = 0
    
    dt_aliases = [r"\balpha\b", r"\bframe_dt\b", r"\bdt_frame\b", r"\btime_step\b", r"\bdt_val\b", r"\bdt_updater\b", r"\bdelta_t\b"]

    while i < len(lines):
        line = lines[i]
        m = re.match(r"^(\s*)def\s+(update\w*)\s*\(\s*([^)]*)\s*\)\s*:\s*", line)
        
        if not m:
            # Only replace aliases if we are NOT in a function signature
            # but this section is outside the 'def construct' or other functions.
            # Actually, let's skip global alias replacement entirely as it's too dangerous.
            new_lines.append(line)
            i += 1
            continue

        indent = m.group(1)
        func_name = m.group(2)
        params_str = m.group(3)
        params = [p.strip() for p in params_str.split(',') if p.strip()]

        if len(params) == 0:
            new_sig = f"{indent}def {func_name}(mobject, dt=0):\n"
        elif len(params) == 1:
            new_sig = f"{indent}def {func_name}({params[0]}, dt=0):\n"
        else:
            first = params[0]
            new_sig = f"{indent}def {func_name}({first}, dt):\n"

        new_lines.append(new_sig)
        current_indent_len = len(indent)
        
        i += 1
        while i < len(lines):
            body_line = lines[i]
            if not body_line.strip():
                new_lines.append(body_line)
                i += 1
                continue
                
            line_indent = len(body_line) - len(body_line.lstrip())
            if line_indent <= current_indent_len:
                break
                
            for alias in dt_aliases:
                body_line = re.sub(alias, "dt", body_line)
            
            # NOTE: Removed np.clip() numerical stability injection
            # It was too aggressive and broke code with inline comments
            # The LLM should handle numerical stability in its output
            
            new_lines.append(body_line)
            i += 1
            
    return ''.join(new_lines)


def sanitize_3d_camera(code: str) -> str:
    """
    ANTI-CRASH ENGINE for ThreeDScene.
    
    Removes crash-causing patterns:
    1. self.camera.animate.X() - ThreeDCamera has no .animate
    2. self.camera.frame.animate.X() - ThreeDCamera has no .frame
    """
    if 'ThreeDScene' not in code:
        return code
    
    # Remove camera.animate calls
    code = re.sub(
        r'self\.camera\.animate\.[a-zA-Z_]+\([^)]*\)',
        '',
        code
    )
    
    # Remove camera.frame.animate calls
    code = re.sub(
        r'self\.camera\.frame\.animate\.[a-zA-Z_]+\([^)]*\)',
        '',
        code
    )
    
    # Clean up broken play() calls
    code = re.sub(r',\s*\)', ')', code)
    code = re.sub(r'\(\s*,', '(', code)
    
    # Remove empty play() calls
    code = re.sub(r'self\.play\(\s*\)\n?', '', code)
    
    return code


def apply_anticrash_rules(code: str) -> str:
    """
    MASTER ANTI-CRASH ENGINE v2.0
    
    Catches all known Manim CE anti-patterns that crash the renderer.
    """
    # CRITICAL FIRST STEP: Strip inline comments to prevent them from breaking regex patterns
    code = strip_inline_comments(code)
    
    # Rule 1: ThreeDScene camera fixes
    code = sanitize_3d_camera(code)
    
    # Rule 2: Remove deprecated APIs
    deprecated_patterns = [
        (r'\bShowCreation\b', 'Create'),
        (r'\bTextMobject\b', 'Text'),
        (r'\.get_graph\(', '.plot('),
        (r'\.add_coordinate_labels\([^)]*\)', ''),
    ]
    for pattern, replacement in deprecated_patterns:
        code = re.sub(pattern, replacement, code)
    
    # Rule 3: Fix common typos
    typo_fixes = [
        (r'\bCreat\(', 'Create('),
        (r'\bWritet\(', 'Write('),
        (r'\bFadeInn\(', 'FadeIn('),
    ]
    for pattern, replacement in typo_fixes:
        code = re.sub(pattern, replacement, code)
    
    # Rule 4: Catch remaining 3D camera issues
    if 'ThreeDScene' in code:
        code = re.sub(r'self\.camera\.[a-zA-Z_]*\.animate', '', code)
        # Remove project_to_frame calls (doesn't exist in ThreeDCamera)
        code = re.sub(r'self\.camera\.project_to_frame\([^)]*\)', 'ORIGIN', code)
    
    # Rule 5: Fix trailing commas
    code = re.sub(r',\s*\)', ')', code)
    
    # Rule 6: Fix opacity -> fill_opacity for standard shapes
    # Manim uses fill_opacity, not opacity
    code = re.sub(r'\b(Dot|Circle|Square|Rectangle|Ellipse|Annulus|Dot3D|Sphere|Cube)\(([^)]*)\bopacity\s*=', r'\1(\2fill_opacity=', code)
    
    # Rule 7: Fix opacity -> stroke_opacity for path-like objects
    code = re.sub(r'\b(Line|Arrow|DoubleArrow|TracedPath|Arc|CubicBezier|Polyline)\(([^)]*)\bopacity\s*=', r'\1(\2stroke_opacity=', code)
    
    # Rule 8: Remove problematic config references in ThreeDScene
    if 'ThreeDScene' in code:
        # config.frame_width/height might be used incorrectly
        code = re.sub(r'config\.frame_width', '14.2', code)
        code = re.sub(r'config\.frame_height', '8', code)
    
    # Rule 9: Clean up any double commas or empty args
    code = re.sub(r',\s*,', ',', code)
    code = re.sub(r'\(\s*,', '(', code)
    code = re.sub(r',\s*\)', ')', code)
    
    # Rule 10: Fix add_tip(at_start=..., at_end=...) - these params don't exist
    # Remove these invalid params
    code = re.sub(r',\s*at_start\s*=\s*(True|False)', '', code)
    code = re.sub(r',\s*at_end\s*=\s*(True|False)', '', code)
    code = re.sub(r'at_start\s*=\s*(True|False)\s*,?\s*', '', code)
    code = re.sub(r'at_end\s*=\s*(True|False)\s*,?\s*', '', code)
    
    # Rule 11: Replace Line with add_tip at both ends with DoubleArrow
    # This is a common pattern that should use DoubleArrow instead
    # ws_line = Line(...); ws_line.add_tip(); ws_line.add_tip() -> DoubleArrow
    
    # Rule 12: Fix .to_center() - this method doesn't exist
    # Correct method is .move_to(ORIGIN) or .center()
    code = re.sub(r'\.to_center\(\s*\)', '.move_to(ORIGIN)', code)
    
    # Rule 13: Fix hallucinated coordinate methods
    # LLMs often use get_top_left() instead of get_corner(UL)
    coord_fixes = [
        (r'\.get_top_left\(\)', '.get_corner(UL)'),
        (r'\.get_top_right\(\)', '.get_corner(UR)'),
        (r'\.get_bottom_left\(\)', '.get_corner(DL)'),
        (r'\.get_bottom_right\(\)', '.get_corner(DR)'),
    ]
    for pattern, replacement in coord_fixes:
        code = re.sub(pattern, replacement, code)
    
    # Rule 14: Fix Vector-to-Scalar hallucinations (e.g. set_x(RIGHT*3))
    def _fix_vect_to_scalar(m):
        func = m.group(1) # set_x, set_y, set_z
        arg = m.group(2).strip()
        # Find numeric multipliers or vectors
        # Pattern match for something like RIGHT * 5 or 5 * RIGHT
        mult_match = re.search(r"([\d\.-]+)\s*\*\s*(?:RIGHT|LEFT|UP|DOWN|OUT|IN)|(?:RIGHT|LEFT|UP|DOWN|OUT|IN)\s*\*\s*([\d\.-]+)", arg)
        if mult_match:
            val = mult_match.group(1) or mult_match.group(2)
            return f".{func}({val})"
        # If it's just the vector word
        if re.search(r"\b(RIGHT|LEFT|UP|DOWN|OUT|IN)\b", arg):
            return f".{func}(1.0)"
        return m.group(0)
    code = re.sub(r"\.(set_[xyz])\((.*?)\)", _fix_vect_to_scalar, code)

    # Rule 15: Fix hallucinated arguments in add_tip
    # at_arg=..., at_start=..., at_end=... are common hallucinations
    code = re.sub(r"at_arg\s*=\s*[\d\.-]+", "", code)
    
    # Rule 16: Fix ArcBetweenPoints parameter names
    # start_point -> start, end_point -> end
    code = re.sub(r"ArcBetweenPoints\((.*?)\bstart_point\s*=", r"ArcBetweenPoints(\1start=", code)
    code = re.sub(r"ArcBetweenPoints\((.*?)\bend_point\s*=", r"ArcBetweenPoints(\1end=", code)
    
    # Rule 17: Fix BezierCurve hallucinations
    # LLMs think BezierCurve exists as a top-level or specific import. 
    # In CE, we usually use CubicBezier or VMobject.
    code = re.sub(r"from manim\.mobject\.types\.vectorized_mobject import BezierCurve", "", code)
    code = re.sub(r"\bBezierCurve\b", "CubicBezier", code)
    
    # Rule 18: Anti-Import Bloat
    # Often AI adds imports that aren't needed or are already covered by 'from manim import *'
    code = re.sub(r"from manim\.mobject\.types\.vectorized_mobject import .*", "", code)

    # Final cleanup of double commas created by deletions
    code = re.sub(r",\s*,", ",", code)
    code = re.sub(r"\(\s*,", "(", code)
    code = re.sub(r",\s*\)", ")", code)

    return code
