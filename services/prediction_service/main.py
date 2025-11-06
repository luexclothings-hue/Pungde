# main.py

import os
import numpy as np
import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import xgboost as xgb
import joblib
import ee
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --- Application Setup ---
app = FastAPI(
    title="Crop Yield Prediction Service",
    description="A service that predicts crop yield using a pre-trained XGBoost model and live Google Earth Engine data.",
    version="1.0.0"
)

# --- Define the precise column order from training ---
# This is critical for ensuring consistency between training and inference.
REQUIREMENT_COLS = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
EMBEDDING_COLS = [f'A{i:02d}' for i in range(64)]
FEATURE_COLS = REQUIREMENT_COLS + EMBEDDING_COLS

# --- Load Artifacts at Startup ---
try:
    # Load the trained XGBoost model
    model = xgb.Booster()
    model.load_model('assets/xgboost_yield_model.json')

    # Load the pre-fitted scalers
    scalers = joblib.load('assets/scalers.joblib')
    req_scaler = scalers['req']
    emb_scaler = scalers['emb']
    yield_scaler = scalers['yield']

    # Load crop requirement vectors
    crop_vectors_df = pd.read_csv('assets/crop_requirement_vectors.csv').set_index('canonical_name')

    # Initialize Earth Engine
    EE_PROJECT = os.getenv("EE_PROJECT", "pungde-477205")
    ee.Initialize(project=EE_PROJECT)

except FileNotFoundError as e:
    raise RuntimeError(f"FATAL: A required model asset was not found. Ensure 'assets' folder is correct. {e}")
except Exception as e:
    raise RuntimeError(f"FATAL: An error occurred during initialization. {e}")

# --- API Data Models ---
class PredictionRequest(BaseModel):
    crop_name: str
    location_name: str

class PredictionResponse(BaseModel):
    status: str
    predicted_yield_tons_per_hectare: float
    location_details: str
    crop_name: str
    notes: str



# --- API Endpoint ---
def geocode_location(location_name: str):
    """
    Google Geocoding API using direct REST API calls
    """
    api_key = os.getenv("GOOGLE_GEOCODING_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500, 
            detail="Google Geocoding API key not configured. Please set GOOGLE_GEOCODING_API_KEY environment variable."
        )
    
    # Google Geocoding API endpoint
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        "address": location_name,
        "key": api_key
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        
        if data["status"] == "OK" and data["results"]:
            result = data["results"][0]
            lat = result["geometry"]["location"]["lat"]
            lng = result["geometry"]["location"]["lng"]
            address = result["formatted_address"]
            
            # Create a simple object to match the expected interface
            class LocationResult:
                def __init__(self, lat, lng, address):
                    self.latitude = lat
                    self.longitude = lng
                    self.address = address
            
            return LocationResult(lat, lng, address)
        
        return None
        
    except requests.RequestException as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Geocoding request failed: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Geocoding error: {str(e)}"
        )

@app.post("/predict", response_model=PredictionResponse)
async def predict_yield(request: PredictionRequest):
    """
    Accepts a crop and location, fetches live environmental data, and returns a predicted crop yield.
    """
    try:
        # Step 1: Enhanced Geocoding
        location = geocode_location(request.location_name)
        if not location:
            raise HTTPException(
                status_code=404, 
                detail=f"Location '{request.location_name}' could not be found. Try simpler formats like 'City, State' or 'City, Country'."
            )
        
        lat, lon = location.latitude, location.longitude

        # Step 2: Crop Vector Lookup
        crop_name_lower = request.crop_name.lower()
        if crop_name_lower not in crop_vectors_df.index:
            available_crops = ", ".join(crop_vectors_df.index.tolist())
            raise HTTPException(
                status_code=404, 
                detail=f"Data for crop '{request.crop_name}' is not available. Available crops: {available_crops}"
            )
        
        requirement_vector = crop_vectors_df.loc[[crop_name_lower]][REQUIREMENT_COLS]

        # Step 3: Earth Engine Environmental Data
        point = ee.Geometry.Point(lon, lat)
        image = ee.ImageCollection('GOOGLE/SATELLITE_EMBEDDING/V1/ANNUAL') \
                  .filterDate('2020-01-01', '2021-01-01') \
                  .select(EMBEDDING_COLS) \
                  .filterBounds(point) \
                  .first()

        if not image:
            raise HTTPException(
                status_code=404, 
                detail="No environmental data found for the specified location. This area may be remote or over a large body of water."
            )
        
        embedding_dict = image.sample(point, 10).first().toDictionary().getInfo()
        environmental_vector_list = [embedding_dict.get(band) for band in EMBEDDING_COLS]
        
        if None in environmental_vector_list:
            raise HTTPException(
                status_code=500, 
                detail="Failed to retrieve complete environmental vector from Earth Engine."
            )

        embedding_vector = pd.DataFrame([environmental_vector_list], columns=EMBEDDING_COLS)

        # Step 4: Feature Scaling and Assembly
        scaled_req_features = req_scaler.transform(requirement_vector)
        scaled_emb_features = emb_scaler.transform(embedding_vector)
        
        full_feature_vector = pd.DataFrame(
            data=np.concatenate([scaled_req_features, scaled_emb_features], axis=1),
            columns=FEATURE_COLS
        )
        
        # Step 5: Prediction
        dmatrix = xgb.DMatrix(full_feature_vector)
        prediction = model.predict(dmatrix)
        final_yield = float(prediction[0])

        return PredictionResponse(
            status="success",
            predicted_yield_tons_per_hectare=round(final_yield, 2),
            location_details=location.address,
            crop_name=request.crop_name,
            notes="Prediction based on 2020 environmental data, matching the model's training period."
        )

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An internal server error occurred: {str(e)}")

