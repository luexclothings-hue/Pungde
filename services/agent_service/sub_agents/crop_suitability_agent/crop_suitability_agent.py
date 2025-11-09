# agents/pungde_agent/sub_agents/crop_suitability_agent/crop_suitability_agent.py

import logging
import os
import requests

from google.adk.agents import LlmAgent
from google.adk.tools.agent_tool import AgentTool

from . import prompt

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# -----------------------------------------------------------------------------
# Model selection (sub-agent = cheaper Flash model, no audio needed)
# -----------------------------------------------------------------------------
GEMINI_MODEL_SUB_AGENT = os.getenv(
    "GEMINI_MODEL_SUB_AGENT",
    "gemini-2.5-flash"  # Fast + cheap, recommended for reasoning-only sub-agents
)

DESCRIPTION = (
    "Crop suitability expert that analyzes whether a crop can grow successfully in a "
    "specific location based on long-term climate factors (temp, humidity, rainfall, etc.)."
)

# -----------------------------------------------------------------------------
# TOOL FUNCTION
# -----------------------------------------------------------------------------
def get_agroclimate_overview(lat: float, lon: float) -> dict:
    """
    Retrieve long-term monthly climatology averages for temperature, humidity,
    rainfall, wind speed, and solar radiation using NASA POWER.
    """

    url = (
        f"https://power.larc.nasa.gov/api/temporal/climatology/point?"
        f"parameters=T2M,PRECTOTCORR,RH2M,WS2M,ALLSKY_SFC_SW_DWN"
        f"&community=AG&latitude={lat}&longitude={lon}&format=JSON"
    )

    try:
        resp = requests.get(url, timeout=25)
        resp.raise_for_status()

        data = resp.json()
        param = data["properties"]["parameter"]

        agro_data = {
            "temperature_C": param.get("T2M", {}),
            "rainfall_mm": param.get("PRECTOTCORR", {}),
            "humidity_percent": param.get("RH2M", {}),
            "wind_speed_mps": param.get("WS2M", {}),
            "solar_radiation_kWh_m2_day": param.get("ALLSKY_SFC_SW_DWN", {}),
        }

        return {
            "status": "success",
            "location_details": {"latitude": lat, "longitude": lon},
            "agro_climate": agro_data,
            "notes": (
                "These values represent long-term monthly climatology averages for "
                "sustainable agriculture planning."
            ),
        }

    except requests.exceptions.Timeout:
        return {"status": "error", "error_message": "NASA API request timed out."}

    except requests.exceptions.ConnectionError:
        return {"status": "error", "error_message": "Network connection to NASA API failed."}

    except Exception as e:
        return {"status": "error", "error_message": f"Unexpected error: {str(e)}"}

# -----------------------------------------------------------------------------
# AGENT DEFINITION
# -----------------------------------------------------------------------------
crop_suitability_agent = None

try:
    crop_suitability_agent = LlmAgent(
        name="crop_suitability_agent",
        model=GEMINI_MODEL_SUB_AGENT,
        description=DESCRIPTION,
        instruction=prompt.CROP_SUITABILITY_PROMPT,
        output_key="crop_suitability_analysis",

        tools=[AgentTool(get_agroclimate_overview)],
    )

    logger.info(
        f"✅ Sub-agent '{crop_suitability_agent.name}' loaded with model '{GEMINI_MODEL_SUB_AGENT}'."
    )

except Exception as e:
    logger.error(
        f"❌ Failed to initialize crop_suitability_agent "
        f"({GEMINI_MODEL_SUB_AGENT}). Error: {e}"
    )
