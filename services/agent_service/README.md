# Agent Service - Multi-Agent AI System

Intelligent multi-agent system built with Google ADK that provides comprehensive farming guidance through conversational AI.

## What It Does

Orchestrates six specialized AI agents to help farmers with:
- Crop yield predictions
- Climate suitability analysis
- Growing techniques for challenging conditions
- Yield improvement strategies
- Seed recommendations with buying links
- Visual guides and educational images

## Architecture

### Root Agent: Pungda
Main orchestrator that:
- Greets farmers and understands questions
- Collects crop name and location
- Validates supported crops
- Delegates to appropriate specialist agents
- Converts image placeholders to actual images
- Presents comprehensive responses

### Sub-Agents

#### 1. Agri Analyzer Agent
**Purpose**: Data fetcher and yield predictor
**Tool**: get_crop_yield_prediction(crop_name, location_name)
**Returns**: Predicted yield, lat/long, crop requirements, location details

#### 2. Crop Suitability Agent
**Purpose**: Analyzes if crop can grow in location
**Tool**: get_agroclimate_overview(lat, lon)
**Returns**: Climate comparison, suitability verdict, detailed reasons

#### 3. Grow Anyways Agent
**Purpose**: Provides techniques for unsuitable conditions
**Tool**: google_search
**Returns**: Greenhouse methods, irrigation techniques, soil amendments

#### 4. Yield Improvement Agent
**Purpose**: Suggests strategies to increase production
**Tool**: google_search
**Returns**: Best practices, fertilization, pest management, timing

#### 5. Seed Identifier Agent
**Purpose**: Recommends seeds with buying options
**Tool**: google_search
**Returns**: Seed varieties, real buying links, prices, quality checks

#### 6. Image Generator Agent
**Purpose**: Creates visual guides
**Tool**: generate_image(prompt)
**Returns**: Agricultural images with public URLs

## Technology Stack

- **Google ADK**: Agent Development Kit for multi-agent orchestration
- **Gemini 2.5 Flash**: Large language model
- **Vertex AI**: Image generation
- **Python 3.10+**: Core language
- **Requests**: HTTP client for prediction service

## Setup

### Prerequisites
- Python 3.10+
- Google Cloud Project with Vertex AI enabled
- Prediction Service deployed and accessible
- Google ADK installed

### Installation

```bash
cd services/agent_service
pip install -r requirements.txt
```

### Environment Variables

Create `.env` file:
```
GEMINI_MODEL=gemini-2.5-flash
PREDICTION_SERVICE_URL=https://your-prediction-service-url
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
```

### Project Structure

```
agent_service/
├── agent.py                    # Root agent definition
├── prompt.py                   # Root agent instructions
├── requirements.txt
└── sub_agents/
    ├── agri_analyzer_agent/
    │   ├── agri_analyzer_agent.py
    │   └── prompt.py
    ├── crop_suitability_agent/
    │   ├── crop_suitability_agent.py
    │   └── prompt.py
    ├── grow_anyways_agent/
    │   ├── grow_anyways_agent.py
    │   └── prompt.py
    ├── yield_improvement_agent/
    │   ├── yield_improvement_agent.py
    │   └── prompt.py
    ├── seed_identifier_agent/
    │   ├── seed_identifier_agent.py
    │   └── prompt.py
    └── image_generator_agent/
        ├── image_generator_agent.py
        └── prompt.py
```

## Conversation Flow

### Example 1: Suitability Question
```
User: "Can I grow rice in Mumbai?"

Root Agent:
1. Collects: crop="rice", location="Mumbai"
2. Calls agri_analyzer_agent → gets yield, lat/long, requirements
3. Delegates to crop_suitability_agent → gets climate analysis
4. Converts image placeholders to actual images
5. Presents: yield data + suitability analysis + visual guide
```

### Example 2: Seed Buying Question
```
User: "Which rice seeds should I buy for Mumbai?"

Root Agent:
1. Collects: crop="rice", location="Mumbai"
2. Calls agri_analyzer_agent → gets all data
3. Delegates to seed_identifier_agent → gets seed recommendations
4. Converts image placeholders to actual images
5. Presents: seed varieties + buying links + prices + visual guides
```

## Deployment

### Using Google ADK CLI

```bash
# Deploy root agent
adk deploy agent.py

# Get deployment URL
adk list
```

### Environment Configuration

Ensure all environment variables are set in deployment:
- GEMINI_MODEL
- PREDICTION_SERVICE_URL
- GOOGLE_CLOUD_PROJECT

## Supported Crops

- coffee
- banana
- kidneybeans
- chickpea
- coconut
- cotton
- lentil
- maize
- pigeonpeas
- rice

## Agent Communication

Agents communicate through:
1. **Tool Calls**: Root agent calls sub-agent tools
2. **Data Passing**: Root agent provides context to sub-agents
3. **Response Formatting**: Sub-agents return structured responses
4. **Image Placeholders**: Sub-agents use [IMAGE_REQUEST: ...] format

## Customization

### Adding New Sub-Agent

1. Create directory in `sub_agents/`
2. Create `agent_name_agent.py` with LlmAgent definition
3. Create `prompt.py` with agent instructions
4. Import in `agent.py`
5. Add to root agent's tools list

### Modifying Agent Behavior

Edit prompt files to change:
- Response format
- Analysis depth
- Communication style
- Tool usage patterns

## Monitoring

Check logs for:
- Agent initialization errors
- Tool call failures
- Prediction service connectivity
- Image generation issues
- Response formatting problems

## Best Practices

1. **Always call agri_analyzer_agent first** to get base data
2. **Pass complete context** to sub-agents
3. **Convert all image placeholders** before responding
4. **Handle errors gracefully** with farmer-friendly messages
5. **Keep responses organized** and easy to read

## Future Improvements

- Add more specialized agents (pest identification, market prices)
- Implement agent memory for conversation context
- Add multilingual support
- Include voice interface
- Add real-time weather alerts
