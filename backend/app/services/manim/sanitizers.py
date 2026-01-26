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
    Aggressively normalize indentation to multiples of 4 spaces.
    Handle mixed tabs and spaces, odd indentation levels.
    """
    # First pass: convert all tabs to 4 spaces
    code = code.expandtabs(4)
    lines = code.split('\n')
    normalized = []
    
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
            indent_level = actual_indent // 4
            normalized.append(' ' * (indent_level * 4) + stripped)
            continue
        
        # Dedent/indent analysis
        if actual_indent == 0:
            indent_level = 0
        elif actual_indent % 4 == 0:
            indent_level = actual_indent // 4
        else:
            indent_level = max(1, (actual_indent + 1) // 4)
        
        normalized.append(' ' * (indent_level * 4) + stripped)
    
    result = '\n'.join(normalized)
    
    # Try to compile multiple times with dedent fallbacks
    for attempt in range(3):
        try:
            compile(result, '<string>', 'exec')
            return result
        except IndentationError:
            if attempt == 0:
                result = textwrap.dedent(result)
            elif attempt == 1:
                result = textwrap.dedent(textwrap.dedent(result))
            else:
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
    
    return code
