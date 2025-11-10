# Image Generator Agent

Visual creator that generates agricultural images to help farmers understand crops and techniques.

## Purpose
Creates realistic, educational images that enhance understanding of crops, farming practices, and agricultural concepts.

## Tool
- `generate_image(prompt)`: Uses Vertex AI to generate images from detailed text prompts

## Image Types
- Crop visualization (mature plants, growth stages)
- Farming techniques (irrigation, planting, harvesting)
- Pest/disease identification
- Equipment and infrastructure
- Seed appearance and packaging
- Comparison images (healthy vs unhealthy)

## Image Quality
- Realistic agricultural context
- Clear and detailed
- Educational value
- Universally appropriate
- Professional photography style

## Returns
- Public image URL
- Markdown format for inline display
- Brief description of image content
- Explanation of how it helps farmers

## Usage
Converts [IMAGE_REQUEST: description] placeholders from other agents into actual displayable images.

## Example
Input: `[IMAGE_REQUEST: Mature rice plant in farm field with golden grains]`
Output: `![Rice plant](url)` with description
