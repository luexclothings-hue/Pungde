import logging
import os

from google.adk.agents import LlmAgent
from google.adk.tools import google_search
from . import prompt

# Configuration constants
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
DESCRIPTION = "Seed selection expert that identifies ideal seed properties for specific locations and provides trusted buying recommendations with quality assurance guidance"

# Set logging
logger = logging.getLogger(__name__)

# --- Seed Identifier Agent ---
seed_identifier_agent = None
try:
    seed_identifier_agent = LlmAgent(
        model=GEMINI_MODEL,
        name="seed_identifier_agent",
        description=(DESCRIPTION),
        instruction=prompt.SEED_IDENTIFIER_PROMPT,
        output_key="agrianalysis",
        tools=[
            google_search
        ]
    )
    logger.info(f"✅ Agent '{seed_identifier_agent.name}' created using model '{GEMINI_MODEL}'.")
except Exception as e:
    logger.error(
        f"❌ Could not create Seed Identifier agent. Check API Key ({GEMINI_MODEL}). Error: {e}"
    )
