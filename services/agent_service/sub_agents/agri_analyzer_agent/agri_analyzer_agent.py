# agents/pungde_agent/sub_agents/agri_analyzer_agent/agri_analyzer_agent.py

import logging
import os
import requests

from google.adk.agents import LlmAgent
from google.adk.tools.agent_tool import AgentTool

from . import prompt

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# -----------------------------------------------------------------------------
# Model selection
# Use a **cheaper Flash model** here because this agent does NOT need Live/audio.
# Will be overridden by environment if provided.
# -----------------------------------------------------------------------------
GEMINI_MODEL_SUB_AGENT = os.getenv(
    "GEMINI_MODEL_SUB_AGENT",
    "gemini-2.5-flash"     # Recommended default for sub-agents
)

DESCRIPTION = (
    "Agricultural analysis sub-agent that retrieves yield predictions, "
    "soil/crop requirements, and location-specific growing conditions."
)

# -----------------------------------------------------------------------------
# TOOL IMPLEMENTATION
# -----------------------------------------------------------------------------
def get_crop_yield_prediction(crop_name: str, location_name: str) -> dict:
    """
    Call the prediction microservice to fetch crop yield + requirements.
    The PREDICTION_SERVICE_URL is configurable via environment.
    """
    url = os.getenv("PREDICTION_SERVICE_URL", "http://127.0.0.1:8001/predict")
    payload = {"crop_name": crop_name, "location_name": location_name}

    try:
        resp = requests.post(url, json=payload, timeout=30)
        resp.raise_for_status()
        return resp.json()  # expected keys already structured by your service

    except requests.exceptions.HTTPError as e:
        return {"status": "error", "error_message": f"HTTP error: {resp.text}"}

    except requests.exceptions.ConnectionError:
        return {"status": "error", "error_message": f"Prediction service unavailable at {url}"}

    except requests.exceptions.Timeout:
        return {"status": "error", "error_message": "Prediction request timed out."}

    except Exception as e:
        return {"status": "error", "error_message": str(e)}

# -----------------------------------------------------------------------------
# AGENT DEFINITION
# -----------------------------------------------------------------------------
agri_analyzer_agent = None

try:
    agri_analyzer_agent = LlmAgent(
        name="agri_analyzer_agent",
        model=GEMINI_MODEL_SUB_AGENT,
        description=DESCRIPTION,
        instruction=prompt.AGRI_ANALYZER_PROMPT,
        output_key="agri_analysis",

        # IMPORTANT: Wrap the function as a callable tool for the agent
        tools=[AgentTool(get_crop_yield_prediction)],
    )

    logger.info(
        f"✅ Sub-agent '{agri_analyzer_agent.name}' initialized "
        f"using model '{GEMINI_MODEL_SUB_AGENT}'."
    )

except Exception as e:
    logger.error(
        f"❌ Failed to initialize agri_analyzer_agent: {GEMINI_MODEL_SUB_AGENT} | {e}"
    )
