# agents/pungde_agent/sub_agents/grow_anyways_agent/grow_anyways_agent.py

import logging
import os

from google.adk.agents import LlmAgent
from google.adk.tools import google_search  # Already a built-in ADK Tool
from . import prompt

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# -----------------------------------------------------------------------------
# MODEL CONFIG (sub-agents = reasoning only → no Live required)
# -----------------------------------------------------------------------------
GEMINI_MODEL_SUB_AGENT = os.getenv(
    "GEMINI_MODEL_SUB_AGENT",
    "gemini-2.5-flash"   # Optimal: fast, low-cost, strong reasoning
)

DESCRIPTION = (
    "Grow-anywhere strategist that provides practical methods such as protective "
    "structures, soil improvement, microclimate control, irrigation strategies, "
    "and environmental adaptation to grow crops even in challenging conditions."
)

# -----------------------------------------------------------------------------
# LLM SUB-AGENT
# -----------------------------------------------------------------------------
grow_anyways_agent = None

try:
    grow_anyways_agent = LlmAgent(
        name="grow_anyways_agent",
        model=GEMINI_MODEL_SUB_AGENT,
        description=DESCRIPTION,
        instruction=prompt.GROW_ANYWHERE_PROMPT,

        # The model output will be placed under this result key for the parent agent:
        output_key="grow_anywhere_recommendations",

        # ✅ google_search is already a tool, no wrapping required
        tools=[google_search],
    )

    logger.info(
        f"✅ Sub-agent '{grow_anyways_agent.name}' initialized using model '{GEMINI_MODEL_SUB_AGENT}'."
    )

except Exception as e:
    logger.error(
        f"❌ Failed to initialize grow_anyways_agent ({GEMINI_MODEL_SUB_AGENT}). Error: {e}"
    )
