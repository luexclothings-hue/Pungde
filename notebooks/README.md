# Pungda ML Training Notebooks

This directory contains Jupyter notebooks for preparing agricultural data and training the crop yield prediction model.

## Notebooks

### 1. Pungda_Data_Preparation.ipynb
Prepares training dataset by combining SPAM 2020 crop data, Kaggle crop requirements, and Google Earth Engine satellite embeddings.

**Data Sources**:
- SPAM 2020: Global crop yield and harvested area GeoTIFFs
- Kaggle: Crop nutrient requirements (N, P, K, temperature, humidity, pH, rainfall)
- Google Earth Engine: 64-dimensional satellite embeddings (2023-2024)

**Output**: training_dataset_final.csv with 71 features per location

### 2. Pungda_Model_Training.ipynb
Trains XGBoost regression model for crop yield prediction.

**Model**: XGBoost with 71 input features (7 crop requirements + 64 environmental embeddings)
**Output**: xgboost_yield_model.json, scalers.joblib, crop_requirement_vectors.csv

## Running the Notebooks

1. Open in Google Colab
2. Configure Kaggle API secrets (KAGGLE_USERNAME, KAGGLE_KEY)
3. Run Data Preparation notebook (downloads data, processes, creates dataset)
4. Run Model Training notebook (trains model, evaluates, saves artifacts)
5. Deploy artifacts to services/prediction_service/assets/

## Dataset Statistics
- ~50,000 location samples (5,000 per crop × 10 crops)
- 10 crops: rice, wheat, maize, cotton, coffee, banana, coconut, chickpea, kidneybeans, lentil, pigeonpeas
- Global coverage from major production regions
