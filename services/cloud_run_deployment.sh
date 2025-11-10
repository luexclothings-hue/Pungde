adk deploy cloud_run \
  --project=pungde-477205 \
  --region=us-central1 \
  --service_name=pungde-ai \
  --app_name=pungde_agent \
  --with_ui \
  --allow_origins=https://luex.shop \
  .

gcloud builds submit --tag gcr.io/pungde-477205/pungda-predict-service 

gcloud run deploy pungda-predict-service   --image gcr.io/pungde-477205/pungda-predict-service   --platform managed   --region us-central1   --allow-unauthenticated

gcloud builds submit --tag gcr.io/pungde-477205/pungda-predict-service 

gcloud run deploy pungda-predict-service   --image gcr.io/pungde-477205/pungda-predict-service   --platform managed   --region us-central1   --allow-unauthenticated