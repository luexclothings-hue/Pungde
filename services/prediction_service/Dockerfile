FROM python:3.11-slim

# System deps
RUN apt-get update && apt-get install -y \
    gcc g++ git curl && \
    rm -rf /var/lib/apt/lists/*

# Copy app
WORKDIR /app
COPY . /app

# Install Python deps
RUN pip install --no-cache-dir -r requirements.txt

# Earth Engine needs authentication using service account in Cloud Run, so no local auth required.

# Expose port
EXPOSE 8080

# Start FastAPI app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
