import os
import logging
from google.adk.agents import LlmAgent
from google.adk.tools.agent_tool import AgentTool

from vertexai import init
from vertexai.preview.vision_models import ImageGenerationModel
from google.cloud import storage

from . import prompt

logger = logging.getLogger(__name__)

GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GCP_PROJECT = os.getenv("GOOGLE_CLOUD_PROJECT", "pungde-477205")
GOOGLE_CLOUD_BUCKET = os.getenv("GOOGLE_CLOUD_BUCKET", "pungde-images")

# Initialize Vertex
if GCP_PROJECT:
    init(project=GCP_PROJECT, location="us-central1")
else:
    logger.warning("⚠️ No GCP_PROJECT set. Image generation will fail.")


def generate_image(prompt: str) -> dict:
    """
    Generates an image and returns a public URL.
    Returns: {
        "status": "success",
        "image_url": "<public accessible URL>",
    }
    """
    try:
        # 1. Generate the image
        model = ImageGenerationModel.from_pretrained("imagen-4.0-generate-001")
        result = model.generate_images(prompt=prompt, number_of_images=1, aspect_ratio="1:1")
        image_bytes = result[0]._image_bytes

        # 2. Store in GCS
        filename = f"generated_images/{hash(prompt)}.png"
        storage_client = storage.Client()
        bucket = storage_client.bucket(GOOGLE_CLOUD_BUCKET)
        blob = bucket.blob(filename)
        blob.upload_from_string(image_bytes, content_type="image/png")

        # 3. Make the image public
        blob.make_public()
        image_url = blob.public_url

        return {"status": "success", "image_url": image_url}

    except Exception as e:
        logger.error(f"❌ Image generation failed: {e}", exc_info=True)
        return {"status": "error", "error_message": str(e)}


# TOOL-Agent wrapper
image_generator_agent = None
try:
    image_generator_agent = LlmAgent(
        model=GEMINI_MODEL,
        name="image_generator_agent",
        description="Generates images based on prompts and returns image URL",
        instruction=prompt.IMAGE_GENERATOR_PROMPT,
        tools=[generate_image],
        output_key="image_url"
    )

    logger.info("✅ Image Generator Agent initialized!")

except Exception as e:
    logger.error(f"❌ Failed to initialize image_generator_agent: {e}")
