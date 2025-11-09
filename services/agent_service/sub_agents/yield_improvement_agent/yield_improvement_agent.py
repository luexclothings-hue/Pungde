# agents/pungde_agent/sub_agents/yield_improvement_agent/yield_improvement_agent.py

import logging
import os

from google.adk.agents import LlmAgent
from google.adk.tools import google_search  # Built-in ADK tool
from . import prompt

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# -----------------------------------------------------------------------------
# Model selection for sub-agent (reasoning only → no Live audio required)
# -----------------------------------------------------------------------------
GEMINI_MODEL_SUB_AGENT = os.getenv(
    "GEMINI_MODEL_SUB_AGENT",
    "gemini-2.5-flash"  # Optimal default
)

DESCRIPTION = (
    "Yield improvement expert that provides strategies to maximize crop production "
    "including seed selection, planting density, fertilizer planning, irrigation "
    "schedules, pest management, and harvesting techniques."
)

# -----------------------------------------------------------------------------
# LLM Sub-Agent
# -----------------------------------------------------------------------------
yield_improvement_agent = None

try:
    yield_improvement_agent = LlmAgent(
        name="yield_improvement_agent",
        model=GEMINI_MODEL_SUB_AGENT,
        description=DESCRIPTION,
        instruction=prompt.YIELD_IMPROVEMENT_PROMPT,

        # Unique output key for clean aggregation in the parent agent
        output_key="yield_improvement_recommendations",

        # google_search is already structured correctly for ADK
        tools=[google_search],
    )

    logger.info(
        f"✅ Sub-agent '{yield_improvement_agent.name}' initialized using model '{GEMINI_MODEL_SUB_AGENT}'."
    )

except Exception as e:
    logger.error(
        f"❌ Failed to initialize yield_improvement_agent ({GEMINI_MODEL_SUB_AGENT}). Error: {e}"
    )
