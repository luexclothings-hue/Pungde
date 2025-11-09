import logging
import os

from google.adk.agents import LlmAgent
from google.adk.tools import google_search
from . import prompt

# Set logging
logger = logging.getLogger(__name__)

# Configuration constants
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
DESCRIPTION = "Grow anyway strategist that provides practical techniques and methods (polyhouse, irrigation, soil amendments, protective structures) to help farmers grow crops in unsuitable or challenging conditions"

# --- Screenplay Agent ---
grow_anyways_agent = None
try:
    grow_anyways_agent = LlmAgent(
        # Using a potentially different/cheaper model for a simple task
        model=GEMINI_MODEL,
        name="grow_anyways_agent",
        description=(DESCRIPTION),
        instruction=prompt.GROW_ANYWHERE_PROMPT,
        output_key="agrianalysis",
        tools=[
            google_search
        ]
    )
    logger.info(f"✅ Agent '{grow_anyways_agent.name}' created using model '{GEMINI_MODEL}'.")
except Exception as e:
    logger.error(
        f"❌ Could not create Agri analyzer agent. Check API Key ({GEMINI_MODEL}). Error: {e}"
    )