import logging
import os

from google.adk.agents import LlmAgent
from google.adk.tools import google_search
from . import prompt

# Configuration constants
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
DESCRIPTION = "Yield improvement expert that provides comprehensive strategies to maximize crop production including seed selection, spacing, fertilizer schedules, irrigation, and pest management"

# Set logging
logger = logging.getLogger(__name__)

# --- Screenplay Agent ---
yield_improvement_agent = None
try:
    yield_improvement_agent = LlmAgent(
        # Using a potentially different/cheaper model for a simple task
        model=GEMINI_MODEL,
        name="yield_improvement_agent",
        description=(DESCRIPTION),
        instruction=prompt.YIELD_IMPROVEMENT_PROMPT,
        output_key="agrianalysis",
        tools=[
            google_search
        ]
    )
    logger.info(f"✅ Agent '{yield_improvement_agent.name}' created using model '{GEMINI_MODEL}'.")
except Exception as e:
    logger.error(
        f"❌ Could not create Agri analyzer agent. Check API Key ({GEMINI_MODEL}). Error: {e}"
    )