# Prediction Service - Crop Yield ML API

FastAPI service that predicts crop yields using XGBoost ML model and real-time Google Earth Engine satellite data.

## What It Does

Accepts crop name and location, returns predicted yield in tons per hectare along with:
- Location coordinates (latitude, longitude)
- Crop nutrient requirements (N, P, K, temperature, humidity, pH, rainfall)
- Location details from geocoding

## Technology Stack

- **FastAPI**: High-performance async API framework
- **XGBoost**: Trained ML model for yield prediction
- **Google Earth Engine**: Real-time satellite data (64-dimensional embeddings)
- **Google Geocoding API**: Location to coordinates conversion
- **Scikit-learn**: Feature scaling
- **Pandas/NumPy**: Data processing

## API Endpoint

### POST /predict

**Request**:
```json
{
  "crop_name": "rice",
  "location_name": "Mumbai, India"
}
```

**Response**:
```json
{
  "status": "success",
  "predicted_yield_tons_per_hectare": 4.52,
  "location_details": "Mumbai, Maharashtra, India",
  "latitude": 19.0760,
  "longitude": 72.8777,
  "crop_name": "rice",
  "crop_requirements": {
    "N": 80,
    "P": 40,
    "K": 40,
    "temperature": 25.5,
    "humidity": 80.0,
    "ph": 6.5,
    "rainfall": 1500
  },
  "notes": "Prediction based on 2023-2024 environmental data."
}
```

## How It Works

1. **Geocoding**: Converts location name to lat/long using Google Geocoding API
2. **Crop Lookup**: Retrieves crop requirements from crop_requirement_vectors.csv
3. **Satellite Data**: Fetches 64-dimensional environmental embedding from Google Earth Engine
4. **Feature Scaling**: Scales crop requirements and environmental data using pre-fitted scalers
5. **ML Inference**: XGBoost model predicts yield from 71-dimensional feature vector
6. **Response**: Returns prediction with all relevant data

## Setup

### Prerequisites
- Python 3.10+
- Google Cloud Project with Earth Engine API enabled
- Google Geocoding API key
- Trained model artifacts in assets/ directory

### Installation

```bash
cd services/prediction_service
pip install -r requirements.txt
```

### Environment Variables

Create `.env` file:
```
EE_PROJECT=your-gcp-project-id
GOOGLE_GEOCODING_API_KEY=your-geocoding-api-key
```

### Required Assets

Place in `assets/` directory:
- `xgboost_yield_model.json`: Trained XGBoost model
- `scalers.joblib`: Fitted StandardScalers (req, emb, yield)
- `crop_requirement_vectors.csv`: Crop nutrient requirements

### Run Locally

```bash
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

API available at: http://localhost:8001
Docs available at: http://localhost:8001/docs

## Deployment

### Docker Build
```bash
docker build -t prediction-service .
docker run -p 8001:8001 --env-file .env prediction-service
```

### Google Cloud Run
```bash
gcloud run deploy prediction-service \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars EE_PROJECT=your-project,GOOGLE_GEOCODING_API_KEY=your-key
```

## Supported Crops

- rice
- wheat (if in training data)
- maize
- cotton
- coffee
- banana
- coconut
- chickpea
- kidneybeans
- lentil
- pigeonpeas

## Error Handling

- **404**: Location not found or crop not supported
- **500**: Earth Engine data unavailable or internal error
- **Timeout**: Earth Engine query timeout (30s limit)

## Performance

- Average response time: 2-5 seconds
- Bottleneck: Google Earth Engine data fetching
- Scalable: Stateless, can handle concurrent requests
- Caching: Consider adding Redis for repeated locations

## Monitoring

Check logs for:
- Geocoding failures
- Earth Engine timeouts
- Model prediction errors
- Missing environmental data

## Future Improvements

- Add caching layer for Earth Engine data
- Support batch predictions
- Add confidence intervals
- Include historical yield trends
- Support more crops
