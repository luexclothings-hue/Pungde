# Agent Service Architecture

Detailed architecture of the multi-agent AI system powering Pungda's intelligent farming guidance.

## Multi-Agent System Design

### Hierarchical Agent Pattern

Pungda uses a **hierarchical multi-agent architecture** where a root orchestrator agent delegates specialized tasks to domain-expert sub-agents.

```
                    ┌─────────────────────┐
                    │   Root Agent        │
                    │   (Pungda)          │
                    │                     │
                    │ - Intent analysis   │
                    │ - Delegation        │
                    │ - Orchestration     │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐      ┌───────────────┐     ┌───────────────┐
│ Data Agents   │      │ Analysis      │     │ Generation    │
│               │      │ Agents        │     │ Agents        │
├───────────────┤      ├───────────────┤     ├───────────────┤
│• Agri         │      │• Crop         │     │• Image        │
│  Analyzer     │      │  Suitability  │     │  Generator    │
│               │      │• Grow Anyways │     │               │
│               │      │• Yield        │     │               │
│               │      │  Improvement  │     │               │
│               │      │• Seed         │     │               │
│               │      │  Identifier   │     │               │
└───────────────┘      └───────────────┘     └───────────────┘
```

## Agent Roles & Responsibilities

### Root Agent: Pungda

**Type**: Orchestrator Agent
**Model**: Gemini 2.5 Flash
**Primary Functions**:

1. **Conversation Management**
   - Greets users warmly
   - Maintains conversation context
   - Handles multi-turn dialogues
   - Manages session state

2. **Information Collection**
   - Extracts crop name from user query
   - Extracts location from user query
   - Asks clarifying questions when needed
   - Validates completeness of information

3. **Crop Validation**
   - Checks against 10 supported crops
   - Handles spelling variations
   - Suggests alternatives for unsupported crops
   - Provides clear error messages

4. **Intent Classification**
   - Identifies question type:
     * Suitability: "Can I grow X?"
     * Techniques: "How to grow X anyway?"
     * Optimization: "How to increase yield?"
     * Seeds: "Which seeds to buy?"
   - Routes to appropriate sub-agent

5. **Sub-Agent Orchestration**
   - Always calls Agri Analyzer first
   - Passes complete context to sub-agents
   - Waits for sub-agent responses
   - Handles sub-agent errors gracefully

6. **Image Processing**
   - Scans responses for [IMAGE_REQUEST: ...] placeholders
   - Extracts image descriptions
   - Calls Image Generator for each placeholder
   - Replaces placeholders with actual images

7. **Response Formatting**
   - Combines data from multiple agents
   - Organizes information logically
   - Ensures readability
   - Maintains consistent style

**Tools Available**:
- AgentTool(agri_analyzer_agent)
- AgentTool(crop_suitability_agent)
- AgentTool(grow_anyways_agent)
- AgentTool(yield_improvement_agent)
- AgentTool(seed_identifier_agent)
- AgentTool(image_generator_agent)

### Sub-Agent 1: Agri Analyzer

**Type**: Data Fetcher Agent
**Model**: Gemini 2.5 Flash
**Purpose**: Retrieve foundational agricultural data

**Workflow**:
```
Input: crop_name, location_name
    │
    ▼
Call get_crop_yield_prediction()
    │
    ├─→ Prediction Service API
    │   ├─→ Geocoding
    │   ├─→ Earth Engine data
    │   └─→ ML inference
    │
    ▼
Output:
    - predicted_yield_tons_per_hectare
    - latitude, longitude
    - location_details
    - crop_requirements (N, P, K, temp, humidity, pH, rainfall)
    - status, notes
```

**Tool**: `get_crop_yield_prediction(crop_name: str, location_name: str) -> dict`

**Error Handling**:
- Connection errors to Prediction Service
- Unsupported crop names
- Invalid locations
- Earth Engine timeouts

### Sub-Agent 2: Crop Suitability

**Type**: Climate Analysis Agent
**Model**: Gemini 2.5 Flash
**Purpose**: Determine if crop can grow in location

**Workflow**:
```
Input: crop, location, lat, lon, crop_requirements
    │
    ▼
Call get_agroclimate_overview(lat, lon)
    │
    ├─→ Fetches 12 months of climate data
    │   ├─→ Temperature (monthly averages)
    │   ├─→ Rainfall (monthly totals)
    │   ├─→ Humidity (monthly averages)
    │   ├─→ Wind speed
    │   └─→ Solar radiation
    │
    ▼
Analysis:
    - Compare location climate vs crop requirements
    - Calculate averages and totals
    - Identify matches and mismatches
    - Determine verdict (SUITABLE/PARTIALLY/NOT SUITABLE)
    │
    ▼
Output:
    - Suitability verdict
    - Climate comparison with numbers
    - Monthly climate summary
    - Key reasons (3-5 specific points)
    - [IMAGE_REQUEST: crop visualization]
```

**Tool**: `get_agroclimate_overview(lat: float, lon: float) -> dict`

**Analysis Logic**:
- Temperature match: ±10-15% tolerance
- Rainfall match: ±20% tolerance
- Humidity match: ±15% tolerance
- Considers seasonal patterns
- Identifies warmest/coolest/wettest/driest months

### Sub-Agent 3: Grow Anyways

**Type**: Technique Advisor Agent
**Model**: Gemini 2.5 Flash
**Purpose**: Provide methods for challenging conditions

**Workflow**:
```
Input: crop, location, crop_requirements, challenges
    │
    ▼
Research using google_search:
    - "[crop] greenhouse cultivation techniques"
    - "[crop] drip irrigation methods"
    - "[crop] soil amendment for [condition]"
    - "[crop] protected cultivation [location]"
    │
    ▼
Analysis:
    - Identify main challenges (temp/water/soil)
    - Find proven techniques
    - Estimate costs and feasibility
    - Assess success factors
    │
    ▼
Output:
    - Specific techniques (3-5 methods)
    - Implementation steps
    - Cost estimates
    - Success factors and risks
    - [IMAGE_REQUEST: technique demonstration]
```

**Tool**: `google_search(query: str) -> str`

**Technique Categories**:
- Protected cultivation (greenhouse, polyhouse, shade nets)
- Irrigation systems (drip, sprinkler, micro-irrigation)
- Soil management (pH adjustment, amendments, raised beds)
- Climate control (cooling, heating, humidity management)
- Mulching and water conservation

### Sub-Agent 4: Yield Improvement

**Type**: Optimization Expert Agent
**Model**: Gemini 2.5 Flash
**Purpose**: Suggest strategies to increase production

**Workflow**:
```
Input: crop, location, current_yield, crop_requirements
    │
    ▼
Research using google_search:
    - "[crop] best fertilization schedule"
    - "[crop] pest management practices"
    - "[crop] optimal planting density"
    - "[crop] yield improvement techniques [location]"
    │
    ▼
Analysis:
    - Identify yield gaps
    - Find scientifically-proven practices
    - Prioritize by impact and feasibility
    - Calculate expected improvements
    │
    ▼
Output:
    - Improvement strategies (5-7 methods)
    - Implementation timeline
    - Expected yield increase (%)
    - Cost-benefit analysis
    - [IMAGE_REQUEST: best practice demonstration]
```

**Tool**: `google_search(query: str) -> str`

**Strategy Categories**:
- Nutrient management (NPK timing, micronutrients)
- Pest and disease control (IPM, resistant varieties)
- Water management (irrigation scheduling, drainage)
- Planting optimization (spacing, timing, depth)
- Variety selection (high-yielding, adapted)
- Soil health (organic matter, pH, structure)
- Harvest timing (maturity indicators, post-harvest)

### Sub-Agent 5: Seed Identifier

**Type**: Seed Recommendation Agent
**Model**: Gemini 2.5 Flash
**Purpose**: Recommend seeds with buying options

**Workflow**:
```
Input: crop, location, lat, lon, crop_requirements, climate_data
    │
    ▼
Identify country/region context:
    - Extract country from location
    - Determine local currency
    - Identify measurement units
    │
    ▼
Research using google_search:
    - "[crop] best seed varieties [country] 2024"
    - "[crop] high yielding certified varieties [country]"
    - "[crop] seeds buy online [country]"
    - "[crop] seed suppliers [country]"
    │
    ▼
Analysis:
    - Match varieties to climate
    - Find real online stores
    - Verify prices and availability
    - Check certifications
    │
    ▼
Output:
    - Top 3 seed varieties
    - Seed properties (heat-tolerant, disease-resistant)
    - Real buying links with prices
    - Quality check guidelines
    - Cost analysis per hectare
    - [IMAGE_REQUEST: seed appearance, packaging, mature plant]
```

**Tool**: `google_search(query: str) -> str`

**Recommendation Criteria**:
- Climate adaptation (temperature, rainfall tolerance)
- Yield potential (tons/hectare)
- Disease resistance (local pests/diseases)
- Maturity period (days to harvest)
- Market demand (local preferences)
- Certification (government-approved)
- Availability (online stores, local suppliers)
- Price (cost per kg, ROI)

**Output Format**:
- Beautiful markdown cards
- Clickable buying links
- Price comparisons
- Quality checklists
- Visual guides

### Sub-Agent 6: Image Generator

**Type**: Visual Creation Agent
**Model**: Gemini 2.5 Flash + Vertex AI Imagen
**Purpose**: Generate agricultural images

**Workflow**:
```
Input: image_description (from [IMAGE_REQUEST: ...])
    │
    ▼
Craft detailed prompt:
    - Add agricultural context
    - Specify realistic style
    - Include key visual elements
    - Ensure educational value
    │
    ▼
Call generate_image(prompt)
    │
    ├─→ Vertex AI Imagen 2
    │   ├─→ Text-to-image generation
    │   └─→ Upload to Cloud Storage
    │
    ▼
Output:
    - Public image URL
    - Markdown format: ![description](url)
    - Brief explanation
```

**Tool**: `generate_image(prompt: str) -> dict`

**Image Types**:
- Crop visualization (mature plants, growth stages)
- Farming techniques (irrigation, planting, harvesting)
- Pest/disease identification (symptoms, damage)
- Equipment (tools, machinery, infrastructure)
- Seed appearance (close-ups, packaging)
- Comparison images (healthy vs unhealthy)

**Prompt Engineering**:
- Realistic agricultural context
- Clear, well-lit, detailed
- Educational and practical
- Universally appropriate
- Professional photography style

## Agent Communication Protocol

### Data Passing

**Root → Sub-Agent**:
```python
{
    "crop_name": "rice",
    "location_name": "Mumbai, India",
    "latitude": 19.0760,
    "longitude": 72.8777,
    "predicted_yield": 4.52,
    "crop_requirements": {
        "N": 80,
        "P": 40,
        "K": 40,
        "temperature": 25.5,
        "humidity": 80.0,
        "ph": 6.5,
        "rainfall": 1500
    }
}
```

**Sub-Agent → Root**:
```python
{
    "status": "success",
    "analysis": "Detailed analysis text...",
    "verdict": "SUITABLE",
    "reasons": ["Reason 1", "Reason 2", "Reason 3"],
    "image_requests": [
        "[IMAGE_REQUEST: Mature rice plant in farm field]"
    ]
}
```

### Image Placeholder System

**Sub-Agent Output**:
```
Here's the analysis...

[IMAGE_REQUEST: Mature rice plant in Indian farm field with golden grains]

Additional information...
```

**Root Agent Processing**:
1. Scan response for `[IMAGE_REQUEST: ...]` pattern
2. Extract description: "Mature rice plant in Indian farm field with golden grains"
3. Call Image Generator with description
4. Receive: `![Rice plant](https://storage.googleapis.com/.../image.png)`
5. Replace placeholder with image markdown

**Final Output**:
```
Here's the analysis...

📸 Visual Guide:

![Rice plant](https://storage.googleapis.com/.../image.png)

*This image shows a healthy, mature rice crop at harvest stage.*

Additional information...
```

## Prompt Engineering Strategy

### Prompt Structure

Each agent prompt contains:

1. **Role Definition**
   - Who the agent is
   - Area of expertise
   - Personality traits

2. **Tool Description**
   - Available tools
   - When to use each tool
   - Expected outputs

3. **Input Specification**
   - Data received from root agent
   - Format and structure
   - Required vs optional fields

4. **Instructions**
   - Step-by-step workflow
   - Decision logic
   - Error handling

5. **Output Format**
   - Response structure
   - Markdown formatting
   - Image placeholder syntax

6. **Communication Style**
   - Tone and language
   - Farmer-friendly terms
   - Supportive and encouraging

7. **Examples**
   - Sample inputs and outputs
   - Edge cases
   - Error scenarios

### Prompt Optimization Techniques

1. **Few-Shot Learning**: Examples in prompts
2. **Chain-of-Thought**: Step-by-step reasoning
3. **Role-Playing**: Expert persona
4. **Constraints**: Clear boundaries and limitations
5. **Format Specification**: Exact output structure

## Error Handling & Resilience

### Agent-Level Errors

**Agri Analyzer**:
- Prediction Service down → Inform user, suggest retry
- Invalid crop → List supported crops
- Invalid location → Ask for clarification

**Crop Suitability**:
- Climate data unavailable → Use crop requirements only
- Incomplete data → Partial analysis with disclaimer

**Grow Anyways**:
- Search fails → Provide general techniques
- No results → Suggest consulting local experts

**Yield Improvement**:
- Search fails → Provide standard best practices
- Location-specific data missing → General recommendations

**Seed Identifier**:
- No buying links found → Provide variety info only
- Country not recognized → Use generic recommendations

**Image Generator**:
- Generation fails → Skip image, continue with text
- Timeout → Show placeholder, retry async

### System-Level Resilience

1. **Graceful Degradation**: Continue without failed components
2. **Retry Logic**: Automatic retries for transient failures
3. **Fallback Responses**: Generic answers when specific data unavailable
4. **User Communication**: Clear error messages, no technical jargon
5. **Logging**: Detailed error logs for debugging

## Performance Optimization

### Response Time Breakdown

```
Total Response Time: ~8-12 seconds

├─ Root Agent Processing: 1-2s
│  ├─ Intent classification: 0.5s
│  └─ Information extraction: 0.5s
│
├─ Agri Analyzer: 3-5s
│  ├─ Prediction Service call: 2-4s
│  └─ Response processing: 0.5s
│
├─ Specialist Agent: 2-4s
│  ├─ Tool calls (search/climate): 1-2s
│  └─ Analysis & formatting: 1-2s
│
└─ Image Generation: 5-8s (parallel)
   ├─ Prompt crafting: 0.5s
   ├─ Imagen generation: 4-6s
   └─ URL retrieval: 0.5s
```

### Optimization Strategies

1. **Parallel Processing**: Image generation while presenting text
2. **Streaming**: Stream text responses before images
3. **Caching**: Cache common queries and images
4. **Prompt Optimization**: Shorter, more efficient prompts
5. **Model Selection**: Use faster models where appropriate

## Monitoring & Analytics

### Agent Metrics

- **Success Rate**: % of successful agent completions
- **Response Time**: p50, p95, p99 latencies
- **Tool Usage**: Frequency of each tool call
- **Error Rate**: % of failed agent calls
- **User Satisfaction**: Implicit feedback from interactions

### Quality Metrics

- **Intent Classification Accuracy**: Correct sub-agent selection
- **Information Extraction**: Crop/location extraction accuracy
- **Response Completeness**: All required fields present
- **Image Relevance**: Generated images match requests
- **Buying Link Validity**: % of working purchase links

## Future Enhancements

1. **Agent Memory**: Remember user preferences and history
2. **Multi-Turn Refinement**: Iterative improvement of recommendations
3. **Proactive Suggestions**: Anticipate user needs
4. **Personalization**: Adapt to user's farming experience level
5. **Collaborative Agents**: Multiple agents working together
6. **Learning from Feedback**: Improve based on user interactions
7. **Multilingual Support**: Agents in local languages
8. **Voice Interface**: Speech-to-text integration
9. **Real-Time Alerts**: Weather, pest, market updates
10. **Community Knowledge**: Learn from farmer experiences

---

This multi-agent architecture provides specialized expertise while maintaining coherent, farmer-friendly conversations through intelligent orchestration.
