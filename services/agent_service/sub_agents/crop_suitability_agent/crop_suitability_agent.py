import logging
import os

import requests
from datetime import datetime, timedelta
from google.adk.agents import LlmAgent
from . import prompt

# Set logging
logger = logging.getLogger(__name__)

# Configuration constants
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
DESCRIPTION = "Crop suitability expert that analyzes and explains whether a crop can grow successfully in a specific location based on climate data (temperature, rainfall, humidity)"

def get_agroclimate_overview(lat: float, lon: float) -> dict:
    """
    Retrieves agro-climatic conditions for the past 12 months for the given location.

    Args:
        lat (float): Latitude of the location.
        lon (float): Longitude of the location.

    Returns:
        dict: {
            status: "success" or "failed",
            location_details: {
                latitude,
                longitude,
                start_month,
                end_month
            },
            agro_climate: {
                temperature_C (dict YYYYMM -> value),
                rainfall_mm (dict YYYYMM -> value),
                humidity_percent (dict YYYYMM -> value),
                wind_speed_mps (dict YYYYMM -> value),
                solar_radiation_kWh_m2_day (dict YYYYMM -> value)
            },
            notes: str (interpretation or instructions)
        }
    """

    try:
        # NASA POWER API - using climatology endpoint for monthly averages
        # This endpoint provides long-term monthly climatology data
        url = (
            f"https://power.larc.nasa.gov/api/temporal/climatology/point?"
            f"parameters=T2M,PRECTOTCORR,RH2M,WS2M,ALLSKY_SFC_SW_DWN"
            f"&community=AG"
            f"&latitude={lat}&longitude={lon}"
            f"&format=JSON"
        )

        response = requests.get(url).json()

        params = response["properties"]["parameter"]

        agro_data = {
            "temperature_C": params["T2M"],
            "rainfall_mm": params["PRECTOTCORR"],
            "humidity_percent": params["RH2M"],
            "wind_speed_mps": params["WS2M"],
            "solar_radiation_kWh_m2_day": params["ALLSKY_SFC_SW_DWN"],
        }

        return {
            "status": "success",
            "location_details": {
                "latitude": lat,
                "longitude": lon
            },
            "agro_climate": agro_data,
            "notes": "Values represent long-term monthly climatology averages for this location."
        }

    except Exception as e:
        return {
            "status": "failed",
            "error": str(e),
            "notes": "Check latitude, longitude, or network connectivity."
        }

# --- Screenplay Agent ---
crop_suitability_agent = None
try:
    crop_suitability_agent = LlmAgent(
        # Using a potentially different/cheaper model for a simple task
        model=GEMINI_MODEL,
        name="crop_suitability_agent",
        description=(DESCRIPTION),
        instruction=prompt.CROP_SUITABILITY_PROMPT,
        output_key="agrianalysis",
        tools=[
            get_agroclimate_overview
        ]
    )
    logger.info(f"✅ Agent '{crop_suitability_agent.name}' created using model '{GEMINI_MODEL}'.")
except Exception as e:
    logger.error(
        f"❌ Could not create Agri analyzer agent. Check API Key ({GEMINI_MODEL}). Error: {e}"
    )