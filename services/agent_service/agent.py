# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import requests
from google.adk.agents import Agent
from google.adk.tools import google_search, FunctionTool

# --- Prediction Service Tool ---
def get_crop_yield_prediction(crop_name: str, location_name: str) -> dict:
    """
    Retrieves crop yield prediction for a specified crop and location.
    
    Args:
        crop_name (str): Name of the crop (e.g., 'rice', 'wheat', 'banana')
        location_name (str): Location name (e.g., 'Majothi, Chamoli, Uttarakhand')
    
    Returns:
        dict: A dictionary containing the prediction result with 'status' key 
              ('success' or 'error') and prediction details if successful, 
              or an 'error_message' if an error occurred.
    """
    try:
        # Prediction service endpoint
        url = "http://127.0.0.1:8001/predict"
        
        # Prepare the request payload
        payload = {
            "crop_name": crop_name,
            "location_name": location_name
        }
        
        # Make the API request
        response = requests.post(url, json=payload, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            return {
                "status": "success",
                "predicted_yield_tons_per_hectare": data.get("predicted_yield_tons_per_hectare"),
                "location_details": data.get("location_details"),
                "crop_name": data.get("crop_name"),
                "notes": data.get("notes", "")
            }
        else:
            error_detail = response.json().get("detail", "Unknown error") if response.content else "Service unavailable"
            return {
                "status": "error",
                "error_message": f"Prediction service error: {error_detail}"
            }
            
    except requests.exceptions.ConnectionError:
        return {
            "status": "error",
            "error_message": "Could not connect to prediction service. The service may not be running on port 8001."
        }
    except requests.exceptions.Timeout:
        return {
            "status": "error",
            "error_message": "Prediction service request timed out. Please try again."
        }
    except Exception as e:
        return {
            "status": "error",
            "error_message": f"Unexpected error: {str(e)}"
        }

# Create the prediction tool
prediction_tool = FunctionTool(func=get_crop_yield_prediction)

# --- Main Agent: Farmer Assistant (User-Facing) ---
root_agent = Agent(
    name="farmer_assistant",
    model="gemini-2.5-flash",
    description="AI farming assistant that provides crop yield predictions and farming advice",
    instruction="""You are Terra, a helpful farming assistant. 

For crop yield questions, use the get_crop_yield_prediction tool with crop name and location.
Provide farming advice based on your knowledge and tool results.
Be conversational and helpful.""",
    tools=[prediction_tool]
)