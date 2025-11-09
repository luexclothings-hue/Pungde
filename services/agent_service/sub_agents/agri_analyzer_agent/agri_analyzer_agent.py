import logging

from google.adk.agents import LlmAgent
from . import prompt
import requests

import os
# Set logging
logger = logging.getLogger(__name__)

# Configuration constants
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
DESCRIPTION = "Agricultural analysis tool that retrieves crop yield predictions, location coordinates, and crop requirements for a given crop and location"

def get_crop_yield_prediction(crop_name: str, location_name: str) -> dict:
    """
    Calls the prediction service and returns yield prediction along with crop requirements.
    
    Returns:
        dict with keys: status, predicted_yield_tons_per_hectare, location_details, 
        crop_name, crop_requirements (N, P, K, temperature, humidity, ph, rainfall), notes
    """
    url = os.getenv("PREDICTION_SERVICE_URL", "http://127.0.0.1:8001/predict")
    try:
        resp = requests.post(url, json={"crop_name": crop_name, "location_name": location_name}, timeout=30)
        if resp.status_code == 200:
            data = resp.json()
            # The response now includes crop_requirements automatically
            return data
        else:
            error_detail = resp.json().get("detail", "Unknown error") if resp.content else "Service unavailable"
            return {"status": "error", "error_message": f"Prediction service error: {error_detail}"}
    except requests.exceptions.ConnectionError:
        return {"status": "error", "error_message": "Could not connect to prediction service on port 8001."}
    except requests.exceptions.Timeout:
        return {"status": "error", "error_message": "Prediction request timed out."}
    except Exception as e:
        return {"status": "error", "error_message": str(e)}

# --- Screenplay Agent ---
agri_analyzer_agent = None
try:
    agri_analyzer_agent = LlmAgent(
        # Using a potentially different/cheaper model for a simple task
        model=GEMINI_MODEL,
        name="agri_analyzer_agent",
        description=(DESCRIPTION),
        instruction=prompt.AGRI_ANALYZER_PROMPT,
        output_key="agrianalysis",
        tools=[
            get_crop_yield_prediction
        ]
    )
    logger.info(f"✅ Agent '{agri_analyzer_agent.name}' created using model '{GEMINI_MODEL}'.")
except Exception as e:
    logger.error(
        f"❌ Could not create Agri analyzer agent. Check API Key ({GEMINI_MODEL}). Error: {e}"
    )