# Pungda System Architecture

Comprehensive technical architecture of the Pungda AI-powered farming assistant platform.

## System Overview

Pungda is a distributed microservices architecture combining machine learning, multi-agent AI, real-time satellite data, and modern web technologies to provide intelligent farming guidance.

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                    (Next.js Web Application)                    │
│  - Chat interface with markdown rendering                       │
│  - Theme system (dark/light/farmer)                            │
│  - PDF export, chat history, session management                │
└────────────────────┬────────────────────────────────────────────┘
                     │ HTTPS/REST
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AGENT SERVICE                              │
│              (Multi-Agent AI Orchestration)                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Root Agent (Pungda) - Gemini 2.5 Flash                 │  │
│  │  - Intent understanding & conversation management        │  │
│  │  - Crop/location collection & validation                 │  │
│  │  - Sub-agent delegation & response orchestration         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                      │
│  ┌────────────────────────┴──────────────────────────────────┐ │
│  │              Specialized Sub-Agents                        │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │ • Agri Analyzer: Data fetching & yield prediction         │ │
│  │ • Crop Suitability: Climate analysis & suitability        │ │
│  │ • Grow Anyways: Techniques for challenging conditions     │ │
│  │ • Yield Improvement: Optimization strategies              │ │
│  │ • Seed Identifier: Seed recommendations & buying links    │ │
│  │ • Image Generator: Visual guides creation                 │ │
│  └────────────────────────────────────────────────────────────┘ │
└────────────────────┬────────────────────────────────────────────┘
                     │ HTTP/REST
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PREDICTION SERVICE                            │
│              (ML Inference & Data Integration)                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  FastAPI Application                                     │  │
│  │  - Request validation & error handling                   │  │
│  │  - Feature engineering & scaling                         │  │
│  │  - ML model inference                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                      │
│  ┌────────────────────────┴──────────────────────────────────┐ │
│  │  XGBoost Model (71-dimensional input)                     │ │
│  │  - 7 crop requirement features                            │ │
│  │  - 64 environmental embedding features                    │ │
│  │  - Trained on 50K+ global locations                       │ │
│  └────────────────────────────────────────────────────────────┘ │
└────────────────────┬────────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
┌──────────────────┐    ┌──────────────────────┐
│  Google Earth    │    │  Google Geocoding    │
│  Engine API      │    │  API                 │
│                  │    │                      │
│ - Satellite data │    │ - Location to        │
│ - 64D embeddings │    │   coordinates        │
│ - 2023-2024 data │    │ - Address details    │
└──────────────────┘    └──────────────────────┘
```

## Component Architecture

### 1. Web Interface (Frontend)

**Technology**: Next.js 16, React 19, TypeScript, Tailwind CSS

**Structure**:
```
pungde_web/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Main chat interface
│   └── globals.css         # Global styles
├── components/
│   ├── Sidebar.tsx         # Chat history & navigation
│   ├── SaveChatModal.tsx   # Save conversation dialog
│   └── ThemeToggle.tsx     # Theme switcher
├── context/
│   ├── SessionContext.tsx  # Session management
│   └── ThemeContext.tsx    # Theme state
├── lib/
│   ├── pungdeApi.ts        # Agent service client
│   ├── chatStorage.ts      # Local storage for chats
│   └── pdfExport.ts        # PDF generation
└── styles/
    ├── themes.css          # Theme variables
    ├── chat.css            # Chat UI styles
    ├── messages.css        # Message bubbles
    └── sidebar.css         # Sidebar styles
```

**Key Features**:
- Server-side rendering with Next.js App Router
- Real-time streaming responses from agent service
- Client-side session management with localStorage
- PDF export using jsPDF and html2canvas
- Responsive design with mobile support
- Three theme variants (dark, light, farmer)

**Data Flow**:
1. User sends message → SessionContext manages session
2. pungdeApi.ts sends to agent service
3. Streams response chunks back to UI
4. ReactMarkdown renders formatted response
5. Images display inline from public URLs

### 2. Agent Service (Multi-Agent AI)

**Technology**: Google ADK, Gemini 2.5 Flash, Python 3.10+

**Architecture Pattern**: Hierarchical Multi-Agent System

**Root Agent (Pungda)**:
- **Role**: Orchestrator and conversation manager
- **Model**: Gemini 2.5 Flash
- **Responsibilities**:
  - Natural language understanding
  - Crop and location extraction
  - Crop validation (10 supported crops)
  - Sub-agent delegation based on question type
  - Image placeholder conversion
  - Response formatting and presentation

**Sub-Agent Communication**:
```
Root Agent
    │
    ├─→ Agri Analyzer (always called first)
    │   └─→ Returns: yield, lat/long, requirements
    │
    ├─→ Crop Suitability (for "Can I grow X?" questions)
    │   ├─→ Input: crop, location, lat/long, requirements
    │   └─→ Returns: suitability analysis + [IMAGE_REQUEST]
    │
    ├─→ Grow Anyways (for "How to grow anyway?" questions)
    │   ├─→ Input: crop, location, requirements, challenges
    │   └─→ Returns: techniques + [IMAGE_REQUEST]
    │
    ├─→ Yield Improvement (for "How to increase yield?" questions)
    │   ├─→ Input: crop, location, current yield, requirements
    │   └─→ Returns: strategies + [IMAGE_REQUEST]
    │
    ├─→ Seed Identifier (for "Which seeds?" questions)
    │   ├─→ Input: crop, location, lat/long, requirements, climate
    │   └─→ Returns: seed recommendations + buying links + [IMAGE_REQUEST]
    │
    └─→ Image Generator (converts placeholders)
        ├─→ Input: image description from [IMAGE_REQUEST: ...]
        └─→ Returns: markdown image with public URL
```

**Agent Tools**:
- `get_crop_yield_prediction`: Calls Prediction Service
- `get_agroclimate_overview`: Fetches climate data
- `google_search`: Web search for research
- `generate_image`: Vertex AI image generation

**Prompt Engineering**:
Each agent has detailed prompts defining:
- Role and expertise
- Available tools and their usage
- Input/output format
- Communication style
- Error handling

### 3. Prediction Service (ML Inference)

**Technology**: FastAPI, XGBoost, Google Earth Engine, Scikit-learn

**Request Processing Pipeline**:
```
POST /predict
    │
    ├─→ 1. Geocoding
    │   └─→ Google Geocoding API
    │       └─→ location_name → (lat, lon, address)
    │
    ├─→ 2. Crop Lookup
    │   └─→ crop_requirement_vectors.csv
    │       └─→ crop_name → (N, P, K, temp, humidity, pH, rainfall)
    │
    ├─→ 3. Environmental Data
    │   └─→ Google Earth Engine
    │       └─→ (lat, lon) → 64D satellite embedding
    │
    ├─→ 4. Feature Engineering
    │   ├─→ Scale crop requirements (StandardScaler)
    │   ├─→ Scale environmental data (StandardScaler)
    │   └─→ Concatenate → 71D feature vector
    │
    ├─→ 5. ML Inference
    │   └─→ XGBoost Model
    │       └─→ 71D features → predicted yield
    │
    └─→ 6. Response
        └─→ JSON with yield, location, requirements
```

**Model Details**:
- **Algorithm**: XGBoost Regression
- **Input**: 71 features (7 crop + 64 environmental)
- **Output**: Yield in tons per hectare
- **Training Data**: 50,000+ global locations
- **Validation**: MAE, RMSE, R² metrics

**Data Sources**:
1. **Crop Requirements** (7 features):
   - N, P, K (nutrient requirements)
   - Temperature, humidity, pH, rainfall (climate requirements)
   - Source: Kaggle Crop Recommendation Dataset

2. **Environmental Embeddings** (64 features):
   - Satellite-derived environmental vectors
   - Captures temperature, vegetation, moisture, terrain
   - Source: Google Earth Engine Annual Embeddings (2023-2024)
   - Resolution: 10 meters

**Scalers**:
- `req_scaler`: StandardScaler for crop requirements
- `emb_scaler`: StandardScaler for environmental embeddings
- `yield_scaler`: StandardScaler for target yield (inverse transform)

### 4. External Services Integration

#### Google Earth Engine
- **Purpose**: Real-time satellite environmental data
- **Data**: 64-dimensional annual embeddings
- **Coverage**: Global, 10m resolution
- **Update**: Annual (2023-2024 data)
- **API**: Earth Engine Python API

#### Google Geocoding API
- **Purpose**: Location name to coordinates conversion
- **Input**: City, village, district names
- **Output**: Latitude, longitude, formatted address
- **Fallback**: Handles ambiguous locations

#### Vertex AI (Imagen)
- **Purpose**: Agricultural image generation
- **Model**: Imagen 2
- **Input**: Detailed text prompts
- **Output**: Public URLs to generated images
- **Use Cases**: Crop visualization, technique demonstration

#### Google Search API
- **Purpose**: Research for seed recommendations and techniques
- **Usage**: Seed varieties, suppliers, prices, best practices
- **Verification**: Real URLs and current information

## Data Flow Diagrams

### Complete User Query Flow

```
User: "Can I grow rice in Mumbai?"
    │
    ▼
┌─────────────────────────────────────────┐
│ Web Interface                           │
│ - Validates input                       │
│ - Creates/retrieves session             │
│ - Sends to agent service                │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ Root Agent (Pungda)                     │
│ - Understands intent: suitability       │
│ - Extracts: crop="rice", location="Mumbai" │
│ - Validates crop is supported           │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ Agri Analyzer Agent                     │
│ - Calls Prediction Service              │
│ - Gets yield, lat/long, requirements    │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ Prediction Service                      │
│ 1. Geocode "Mumbai" → (19.07, 72.87)   │
│ 2. Lookup rice requirements             │
│ 3. Fetch Earth Engine data              │
│ 4. Scale features                       │
│ 5. XGBoost inference                    │
│ 6. Return prediction                    │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ Crop Suitability Agent                  │
│ - Receives yield & requirements         │
│ - Fetches 12-month climate data         │
│ - Compares climate vs requirements      │
│ - Determines verdict                    │
│ - Adds [IMAGE_REQUEST: rice plant]     │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ Root Agent (Pungda)                     │
│ - Finds [IMAGE_REQUEST] placeholder     │
│ - Calls Image Generator Agent           │
│ - Replaces placeholder with image       │
│ - Formats final response                │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ Web Interface                           │
│ - Streams response to user              │
│ - Renders markdown                      │
│ - Displays images inline                │
│ - Saves to chat history                 │
└─────────────────────────────────────────┘
```

## Deployment Architecture

### Google Cloud Run Services

```
┌──────────────────────────────────────────────────────────┐
│                    Google Cloud Platform                  │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Cloud Run - Web Service                           │  │
│  │  - Next.js SSR application                         │  │
│  │  - Auto-scaling: 0-100 instances                   │  │
│  │  - Memory: 512MB                                   │  │
│  │  - Public access                                   │  │
│  └────────────────────────────────────────────────────┘  │
│                           │                               │
│                           ▼                               │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Cloud Run - Agent Service                         │  │
│  │  - Google ADK multi-agent system                   │  │
│  │  - Auto-scaling: 0-50 instances                    │  │
│  │  - Memory: 1GB                                     │  │
│  │  - Authenticated access                            │  │
│  └────────────────────────────────────────────────────┘  │
│                           │                               │
│                           ▼                               │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Cloud Run - Prediction Service                    │  │
│  │  - FastAPI ML inference                            │  │
│  │  - Auto-scaling: 1-20 instances                    │  │
│  │  - Memory: 2GB                                     │  │
│  │  - CPU: 2 vCPU                                     │  │
│  │  - Authenticated access                            │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Cloud Storage                                     │  │
│  │  - Generated images                                │  │
│  │  - Model artifacts                                 │  │
│  │  - Public read access for images                  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Vertex AI                                         │  │
│  │  - Gemini 2.5 Flash (agent LLM)                   │  │
│  │  - Imagen 2 (image generation)                    │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### Scaling Strategy

**Web Service**:
- Min instances: 0 (cost optimization)
- Max instances: 100
- Scale trigger: HTTP requests
- Cold start: ~2-3 seconds

**Agent Service**:
- Min instances: 0
- Max instances: 50
- Scale trigger: Agent requests
- Cold start: ~3-5 seconds

**Prediction Service**:
- Min instances: 1 (avoid cold starts for critical path)
- Max instances: 20
- Scale trigger: Prediction requests
- Response time: 2-5 seconds

## Security Architecture

### Authentication & Authorization
- Web service: Public access
- Agent service: Service account authentication
- Prediction service: Service account authentication
- API keys: Stored in Secret Manager

### Data Privacy
- No PII storage
- Session data: Client-side only
- Chat history: Local storage (user's browser)
- Logs: Sanitized, no sensitive data

### API Security
- HTTPS only
- CORS configuration
- Rate limiting
- Input validation
- Error message sanitization

## Performance Optimization

### Caching Strategy
- **Browser**: Static assets cached (images, CSS, JS)
- **CDN**: Next.js static pages
- **Future**: Redis for Earth Engine data caching

### Response Time Targets
- Web page load: <2 seconds
- Agent response: <10 seconds
- Prediction API: <5 seconds
- Image generation: <8 seconds

### Bottlenecks & Solutions
1. **Earth Engine queries**: Slowest component (2-4s)
   - Solution: Implement caching layer
   - Future: Pre-compute common locations

2. **Image generation**: Variable (5-10s)
   - Solution: Async generation, show placeholder
   - Future: Pre-generate common images

3. **Agent reasoning**: LLM latency (1-3s)
   - Solution: Streaming responses
   - Optimization: Prompt engineering

## Monitoring & Observability

### Metrics
- Request latency (p50, p95, p99)
- Error rates by service
- Agent success rates
- Prediction accuracy
- Image generation success rate

### Logging
- Structured JSON logs
- Request/response tracing
- Error stack traces
- Performance metrics

### Alerting
- Service downtime
- High error rates
- Slow response times
- API quota exhaustion

## Future Architecture Enhancements

1. **Caching Layer**: Redis for Earth Engine data
2. **Message Queue**: Async image generation
3. **Database**: PostgreSQL for user data and analytics
4. **CDN**: CloudFlare for global distribution
5. **Mobile Apps**: Native iOS/Android clients
6. **Voice Interface**: Speech-to-text integration
7. **Offline Mode**: PWA with service workers
8. **Analytics**: User behavior and crop trends
9. **A/B Testing**: Agent prompt optimization
10. **Multi-language**: i18n support

---

This architecture is designed for scalability, reliability, and global accessibility while maintaining cost efficiency through serverless deployment.
