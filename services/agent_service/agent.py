# agents/pungde_agent/agent.py
import os
import logging
from typing import List

from google.adk.agents import LlmAgent
from google.adk.tools.agent_tool import AgentTool

# Runner + runtime config for live (audio+text) streaming
from google.adk.runners import Runner
from google.adk.agents.run_config import RunConfig, StreamingMode
from google.adk.sessions.in_memory_session_service import InMemorySessionService
from google.adk.artifacts.in_memory_artifact_service import InMemoryArtifactService

# --- Your local imports ---
from . import prompt
from .sub_agents.agri_analyzer_agent.agri_analyzer_agent import agri_analyzer_agent
from .sub_agents.crop_suitability_agent.crop_suitability_agent import crop_suitability_agent
from .sub_agents.grow_anyways_agent.grow_anyways_agent import grow_anyways_agent
from .sub_agents.yield_improvement_agent.yield_improvement_agent import yield_improvement_agent

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# ---- Model / description ----
# Prefer native-audio Live model; allow override via env for Vertex vs. Gemini API differences.
GEMINI_MODEL = os.getenv(
    "GEMINI_MODEL_ROOT",
    # If you're on Google AI for Developers (non-Vertex), prefer this ID:
    # "gemini-2.5-flash-native-audio-preview-09-2025"
    # If you're on Vertex and already using the "live" alias, keep your existing:
    "gemini-live-2.5-flash-preview-native-audio-09-2025",
)

DESCRIPTION = (
    "Friendly farming assistant that helps farmers with crop cultivation decisions by "
    "collecting crop and location information, validating supported crops, and delegating "
    "to agricultural analysis tools."
)

def _toolize(sub_agents: List[LlmAgent]):
    """Wrap sub-agents as tools so the director can delegate."""
    return [AgentTool(a) for a in sub_agents if a is not None]

# --- Director Agent (root agent) ---
_subs = [
    agri_analyzer_agent,
    crop_suitability_agent,
    grow_anyways_agent,
    yield_improvement_agent,
]

if all(_subs):
    root_agent = LlmAgent(
        name="Pungde",
        model=GEMINI_MODEL,
        description=DESCRIPTION,
        instruction=prompt.PUNGDE_AGENT_PROMPT,
        tools=_toolize(_subs),  # AgentTool wrappers around your sub-agents
    )
    logger.info("✅ Agent '%s' created using model '%s'.", root_agent.name, GEMINI_MODEL)
else:
    root_agent = None
    logger.error("❌ Cannot create root agent because one or more sub-agents failed to initialize or a tool is missing.")

# --- Optional: helper to build a Runner ready for Live (audio + text) ---
def build_runner(app_name: str = "pungde_agent") -> Runner:
    """
    Returns a Runner configured for Live (Bidi) streaming with audio + text output.
    Use:
        runner = build_runner()
        async for event in runner.run_live(user_id="farmer", session_id="demo"):
            ...  # stream text via event.delta.text and audio via event.delta.audio
    """
    if root_agent is None:
        raise RuntimeError("Root agent was not initialized.")

    run_config = RunConfig(
        streaming_mode=StreamingMode.BIDI,       # Bi-directional (Live) streaming
        response_modalities=["AUDIO", "TEXT"],   # Speak AND show text
        # You can add speech/VAD/limits/etc here as needed.
        # e.g., speech_config={"voice": "default"}  # depends on ADK/Live API support
    )

    session_service = InMemorySessionService()
    artifact_service = InMemoryArtifactService()

    runner = Runner(
        agent=root_agent,
        app_name=app_name,
        run_config=run_config,
        session_service=session_service,
        artifact_service=artifact_service,
    )
    return runner

# --- Handy local smoke test ---
if __name__ == "__main__":
    import asyncio

    async def demo():
        r = build_runner()
        # Minimal single-turn text (non-live) run to verify wiring
        events = await r.run_async(
            user_id="local",
            session_id="smoke",
            # Send a simple text message; Live/Bidi is done with run_live() in your server/UI
            input_text="Briefly introduce yourself.",
        )
        # Print the final assistant message if present
        for e in events:
            if getattr(e, "delta", None) and getattr(e.delta, "text", None):
                print(e.delta.text, end="", flush=True)

    asyncio.run(demo())
