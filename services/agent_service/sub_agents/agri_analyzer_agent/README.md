# Agri Analyzer Agent

Data fetcher agent that retrieves crop yield predictions and requirements from the Prediction Service.

## Purpose
Provides foundational agricultural data needed by all other agents including predicted yield, location coordinates, and crop nutrient requirements.

## Tool
- `get_crop_yield_prediction(crop_name, location_name)`: Calls Prediction Service API

## Returns
- Predicted yield (tons/hectare)
- Location details and coordinates (lat/long)
- Crop requirements (N, P, K, temperature, humidity, pH, rainfall)
- Status and notes

## Usage
Called first by root agent to gather base data before delegating to specialist agents.
