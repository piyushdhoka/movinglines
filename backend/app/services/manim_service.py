import os
import uuid
import subprocess
import tempfile
import shutil
import sys
from concurrent.futures import ThreadPoolExecutor

QUALITY_FLAGS = {
    "l": "-ql",   # 480p15
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
        # Write the script to a file
        with open(script_path, "w", encoding="utf-8") as f:
            f.write(script)
        
        print(f"[Manim] Script written, content:\n{script[:500]}...")
        
        # Extract the scene class name from the script
        scene_name = extract_scene_name(script)
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
        
        # Move to persistent location
        output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "media", "videos")
        os.makedirs(output_dir, exist_ok=True)
        final_path = os.path.join(output_dir, f"{script_id}_{scene_name}.mp4")
        shutil.copy2(video_path, final_path)
        
        print(f"[Manim] Copied to: {final_path}")
        
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
