# Dockerfile

# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container at /app
COPY ./requirements.txt /app/requirements.txt

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

# Copy the assets and application code into the container
COPY ./assets /app/assets
COPY ./main.py /app

# Expose port 8080 to the outside world
EXPOSE 8080

# Command to run the application using uvicorn
# Cloud Run will use this command to start the server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]