# Crop Yield Conversational AI Agent

This monorepo contains the backend infrastructure for a voice-to-voice conversational AI agent that provides real-time crop yield predictions.

## Architecture

This project consists of two primary microservices:

1.  **Prediction Service (`/services/prediction_service`):** A high-performance FastAPI service that runs a pre-trained XGBoost model on a GPU-accelerated Cloud Run instance. It handles geocoding, data fetching from Google Earth Engine, and machine learning inference.

2.  **Agent Service (`/services/agent_service`):** A multi-agent system built with the Google Agent Development Kit (ADK). It manages the user conversation, understands intent, and communicates with the Prediction Service to fulfill user requests.

## Deployment

Refer to the deployment scripts or instructions for deploying both services to Google Cloud Run. The Prediction Service must be deployed first to obtain its public URL, which is then passed as an environment variable to the Agent Service.