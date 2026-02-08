import os
import uuid
import subprocess
import tempfile
import shutil
import sys
import re
from concurrent.futures import ThreadPoolExecutor

QUALITY_FLAGS = {
    "l": "-ql",   # 420p15
    "m": "-qm",   # 720p30
    "h": "-qh",   # 1080p60
    "k": "-qk",   # 4K60
}

executor = ThreadPoolExecutor(max_workers=2)

def _run_manim_sync(cmd: str, work_dir: str) -> tuple:
    """Run manim command synchronously."""
    result = subprocess.run(
        cmd,
        shell=True,
        cwd=work_dir,
        capture_output=True,
        text=True
    )
    return result.returncode, result.stdout, result.stderr

async def render_animation(script: str, quality: str = "m") -> str:
    """
    Render a Manim script and return the path to the output video.
    """
    import asyncio
    
    # Use a proper temp directory
    work_dir = tempfile.mkdtemp(prefix="manim_")
    script_id = str(uuid.uuid4())[:8]
    script_path = os.path.join(work_dir, f"scene_{script_id}.py")
    
    print(f"[Manim] Work dir: {work_dir}")
    print(f"[Manim] Script path: {script_path}")
    
    try:
        # Sanitize common LLM mistakes to match Manim CE 0.18 API
        script = sanitize_manim_script(script)
        # Normalize indentation
        import ast, textwrap
        script_norm = script.replace("\t", "    ")

        # Write the script to a file
        with open(script_path, "w", encoding="utf-8") as f:
            f.write(script_norm)
        
        print(f"[Manim] Script written, content:\n{script_norm[:500]}...")
        
        # Extract the scene class name from the script
        scene_name = extract_scene_name(script_norm)
        print(f"[Manim] Scene name: {scene_name}")
        
        quality_flag = QUALITY_FLAGS.get(quality, "-qm")
        
        # Run manim command - use python -m manim for better compatibility
        if sys.platform == "win32":
            cmd = f'python -m manim {quality_flag} "{script_path}" {scene_name}'
        else:
            cmd = f'manim {quality_flag} "{script_path}" {scene_name}'
        
        print(f"[Manim] Running command: {cmd}")
        
        # Run in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        returncode, stdout_str, stderr_str = await loop.run_in_executor(
            executor, _run_manim_sync, cmd, work_dir
        )
        
        print(f"[Manim] stdout: {stdout_str}")
        print(f"[Manim] stderr: {stderr_str}")
        print(f"[Manim] Return code: {returncode}")
        
        if returncode != 0:
            raise RuntimeError(f"Manim rendering failed: {stderr_str or stdout_str}")
        
        # Find the output video
        video_path = find_output_video(work_dir, scene_name, quality)
        
        if not video_path:
            # List all files for debugging
            print(f"[Manim] Could not find video, listing work_dir contents:")
            for root, dirs, files in os.walk(work_dir):
                for f in files:
                    print(f"  {os.path.join(root, f)}")
            raise RuntimeError("Could not find rendered video")
        
        print(f"[Manim] Found video at: {video_path}")
        
        # Move to a storage location outside the project root to avoid uvicorn --reload loops
        storage_dir = os.path.join(tempfile.gettempdir(), "movinglines_renders")
        os.makedirs(storage_dir, exist_ok=True)
        final_path = os.path.join(storage_dir, f"{script_id}_{scene_name}.mp4")
        shutil.copy2(video_path, final_path)
        
        print(f"[Manim] Saved for upload at: {final_path}")
        
        return final_path
        
    except Exception as e:
        print(f"[Manim] Error: {e}")
        raise
    finally:
        # Cleanup temp directory
        shutil.rmtree(work_dir, ignore_errors=True)

def extract_scene_name(script: str) -> str:
    """Extract the Scene class name from the script."""
    import re
    # Match any class that inherits from Scene or a Scene subclass
    match = re.search(r'class\s+(\w+)\s*\([^)]*Scene[^)]*\)', script)
    if match:
        return match.group(1)
    # Default fallback
    return "GeneratedScene"

def find_output_video(work_dir: str, scene_name: str, quality: str) -> str | None:
    """Find the output video file in Manim's media directory."""
    quality_dirs = {
        "l": "480p15",
        "m": "720p30", 
        "h": "1080p60",
        "k": "2160p60"
    }
    
    quality_dir = quality_dirs.get(quality, "720p30")
    
    # Search recursively for any .mp4 file (most reliable)
    media_dir = os.path.join(work_dir, "media")
    if os.path.exists(media_dir):
        for root, dirs, files in os.walk(media_dir):
            for file in files:
                if file.endswith(".mp4"):
                    return os.path.join(root, file)
    
    return None


# -----------------------
# Script Sanitizer (Manim)
# -----------------------
def sanitize_manim_script(script: str) -> str:
    """Apply safe, deterministic fixes for common LLM-generated Manim issues.

    Rules:
    - Ensure required imports exist
    - Replace deprecated/unknown APIs with CE 0.18 equivalents
    - Fix invalid keyword args on known classes
    - Remove unsafe patterns like self.play(self.move_camera(...))
    """

    s = script or ""

    # Ensure manim import is present at top
    if "from manim import" not in s:
        s = "from manim import *\n" + s

    # If numpy is referenced, ensure it's imported
    if "np." in s and "import numpy as np" not in s:
        # Insert just after the manim import if present
        lines = s.splitlines()
        inserted = False
        for i, line in enumerate(lines[:5]):
            if line.strip().startswith("from manim import"):
                lines.insert(i + 1, "import numpy as np")
                inserted = True
                break
        if not inserted:
            lines.insert(0, "import numpy as np")
        s = "\n".join(lines)

    # Hallucination fix: map common hallucinated methods to valid CE equivalents
    s = s.replace(".height_to(", ".set_height(")
    s = s.replace(".set_height_to(", ".set_height(")
    s = s.replace(".set_width_to(", ".set_width(")
    s = s.replace(".width_to(", ".set_width(")
    s = s.replace(".move_to_point(", ".move_to(")
    s = s.replace(".scale_to(", ".scale(")
    s = s.replace(".set_stroke_width(", ".set_stroke(width=")
    
    # Square/Cube length fix
    s = re.sub(r"Square\s*\(\s*length\s*=", "Square(side_length=", s)
    s = re.sub(r"Cube\s*\(\s*length\s*=", "Cube(side_length=", s)
    # Generic length -> side_length for Square and Cube if strictly matched

    # Replace old/unknown API names
    # ParametricSurface is Surface in 0.18
    s = re.sub(r"\bParametricSurface\b", "Surface", s)
    # Rectangle3D is not a valid class; map to Cube first, then we normalize Cube args below
    s = re.sub(r"\bRectangle3D\b", "Cube", s)

    # Arrow3D had 'tube_radius' -> 'thickness' in CE
    s = re.sub(r"(Arrow3D\s*\([^\)]*?)\btube_radius\s*=", r"\1thickness=", s, flags=re.DOTALL)

    # self.play(self.move_camera(...)) -> self.move_camera(...); self.wait(0.5)
    def _fix_move_camera(m: re.Match) -> str:
        indent = m.group(1)
        args = m.group(2)
        return f"{indent}self.move_camera({args})\n{indent}self.wait(0.5)"

    s = re.sub(r"(^[ \t]*)self\.play\(\s*self\.move_camera\((.*?)\)\s*\)\s*",
               _fix_move_camera, s, flags=re.MULTILINE | re.DOTALL)

    # Remove .set_stroke(...) from ImageMobject instances (unsupported)
    # Be conservative: only match if the variable was explicitly assigned as ImageMobject
    image_vars = re.findall(r"(\w+)\s*=\s*ImageMobject\(", s)
    for var in image_vars:
        # Match var.set_stroke(...) and remove it
        s = re.sub(rf"\b{var}\.set_stroke\(.*?\)", "", s)
    
    # Simple direct removal for any immediate calls
    s = re.sub(r"(ImageMobject\(.*?\))\.set_stroke\(.*?\)", r"\1", s)

    # LOOPHOLE FIX: All submobjects in VGroup must be VMobjects.
    # ImageMobject is NOT a VMobject. If we find an ImageMobject inside a VGroup, 
    # we must change VGroup to Group.
    if image_vars:
        def _fix_groups(m):
            indent = m.group(1)
            content = m.group(2)
            # Only change if an image variable is actually in the content
            for var in image_vars:
                if re.search(rf"\b{var}\b", content):
                    return f"{indent}Group({content})"
            return m.group(0)
        
        # Only match VGroup calls preceded by whitespace (code, not comments or signatures)
        s = re.sub(r"(^[ \t]+)VGroup\((.*?)\)", _fix_groups, s, flags=re.MULTILINE | re.DOTALL)

    # Normalize Cube calls that incorrectly pass x_length/y_length/z_length.
    s = _normalize_cube_dimensions(s)

    return s


def _normalize_cube_dimensions(code: str) -> str:
    """Replace Cube(x_length=..., y_length=..., z_length=..., ...) with
    Cube(side_length=max(...)) while preserving other kwargs.

    Handles multiple Cube(...) occurrences and keeps expressions intact.
    """

    src = code
    out = []
    i = 0
    while True:
        j = src.find("Cube(", i)
        if j == -1:
            out.append(src[i:])
            break
        # Copy text before Cube(
        out.append(src[i:j])
        # Find balanced closing paren
        k = j + len("Cube(")
        depth = 1
        while k < len(src) and depth > 0:
            if src[k] == '(':
                depth += 1
            elif src[k] == ')':
                depth -= 1
            k += 1
        # Arguments between j+5 and k-1
        args_str = src[j + len("Cube("): k - 1]
        replaced = _rewrite_cube_args(args_str)
        out.append(f"Cube({replaced})")
        i = k
    return "".join(out)


def _rewrite_cube_args(args_str: str) -> str:
    # Extract potential x/y/z_length expressions
    x = re.search(r"x_length\s*=\s*([^,\)]*)", args_str)
    y = re.search(r"y_length\s*=\s*([^,\)]*)", args_str)
    z = re.search(r"z_length\s*=\s*([^,\)]*)", args_str)

    if not (x or y or z):
        return args_str  # nothing to fix

    x_expr = (x.group(1).strip() if x else None) or "0"
    y_expr = (y.group(1).strip() if y else None) or "0"
    z_expr = (z.group(1).strip() if z else None) or "0"

    # Remove the x/y/z_length kwargs from the original args
    # Split top-level commas only
    parts = _split_top_level_commas(args_str)
    kept = [p for p in parts if not re.search(r"\b[xyz]_length\s*=", p.strip())]

    # Prepend side_length using max of provided dimensions
    side = f"side_length=max({x_expr}, {y_expr}, {z_expr})"
    new_parts = [side] + [p.strip() for p in kept if p.strip()]
    return ", ".join(new_parts)


def _split_top_level_commas(s: str) -> list[str]:
    parts = []
    buf = []
    depth = 0
    in_str: str | None = None
    i = 0
    while i < len(s):
        ch = s[i]
        if in_str:
            buf.append(ch)
            if ch == in_str and s[i-1] != '\\':
                in_str = None
        else:
            if ch in ('"', "'"):
                in_str = ch
                buf.append(ch)
            elif ch == '(':
                depth += 1
                buf.append(ch)
            elif ch == ')':
                depth = max(0, depth - 1)
                buf.append(ch)
            elif ch == ',' and depth == 0:
                parts.append(''.join(buf).strip())
                buf = []
            else:
                buf.append(ch)
        i += 1
    if buf:
        parts.append(''.join(buf).strip())
    return parts
