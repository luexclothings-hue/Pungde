# Crop Suitability Agent

Climate analysis expert that determines if a crop can grow successfully in a specific location.

## Purpose
Analyzes location climate data against crop requirements to provide suitability verdict with detailed reasoning.

## Tool
- `get_agroclimate_overview(lat, lon)`: Fetches 12 months of climate data (temperature, rainfall, humidity, wind, solar radiation)

## Analysis
Compares location's actual climate with crop's required conditions:
- Temperature match
- Rainfall adequacy
- Humidity levels
- Seasonal patterns

## Returns
- Suitability verdict (SUITABLE / PARTIALLY SUITABLE / NOT SUITABLE)
- Climate comparison with specific numbers
- Monthly climate summary
- Key reasons with data
- Visual reference image

## Usage
Answers questions like "Can I grow rice in Mumbai?" or "Is this crop suitable for my location?"
