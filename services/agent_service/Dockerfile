# Stage 1: Use a slim Python base image
FROM python:3.10-slim

# Set metadata labels
LABEL maintainer="Your Name"
LABEL description="Google ADK Multi-Agent service for the Crop Yield Agent."

# Set the working directory inside the container
WORKDIR /app

# Copy only the requirements file to leverage Docker layer caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application source code
COPY main.py .

# Expose the port the ADK app will run on (default is 8080)
EXPOSE 8080

# Command to run the application using the ADK CLI
# The host and port are configured for Cloud Run compatibility
CMD ["adk", "run", "--host", "0.0.0.0", "--port", "8080"]