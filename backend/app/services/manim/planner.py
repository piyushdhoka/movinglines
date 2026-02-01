"""
Storyboard planner for Manim animations following 3b1b principles.
"""
from langchain_core.messages import SystemMessage, HumanMessage
from app.services.manim.llm import get_llm
import logging

logger = logging.getLogger(__name__)

PLANNER_SYSTEM_PROMPT = """You are a mathematical storyboarder and narrative designer for 3Blue1Brown-quality educational videos.
Your goal is to extract the "Aha!" moment and design a narrative arc that builds intuition before showing formal math.

FOLLOW THESE STAGES:
1. CONCEPT RESEARCH: Identify the core "mystery" or starting question.
2. THE AHA MOMENT: What is the specific visual or logical insight that makes the topic click?
3. PROGRESSIVE REVELATION: Plan to show simple components first, then reveal complexity.
4. NARRATIVE ARC: From confusion/curiosity to resolution.

Your output must be a YAML-like structure (but just text) describing:
- Video Goal: What question does this answer?
- Narrative Hook: Why should they care?
- The Aha! Moment: The key visual insight.
- Scene Sequence: 
    - Step 1: Initialization & Hook (Slow)
    - Step 2: Progressive Build-up (Steady)
    - Step 3: THE AHA MOMENT (Very Slow, 2s wait)
    - Step 4: Resolution & Cleanup (Steady)

PACING RULES:
- Explicitly note when a "Clean Canvas" fade-out should happen.
- Aim for a total predicted durations that match the target (~15s).
- Ensure each scene has "Breathing Room".
"""

async def plan_video_narrative(user_prompt: str) -> str:
    """
    Generate a high-level plan/storyboard for the animation.
    """
    llm = get_llm()
    
    messages = [
        SystemMessage(content=PLANNER_SYSTEM_PROMPT),
        HumanMessage(content=f"Design a 3b1b-style narrative for this topic: {user_prompt}")
    ]
    
    logger.info("[Planner] Brainstorming narrative arc...")
    response = await llm.ainvoke(messages)
    return response.content
