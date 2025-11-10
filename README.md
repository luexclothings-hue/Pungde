# Pungda - AI-Powered Farming Assistant 🌾

Pungda is an intelligent agricultural platform that helps farmers worldwide make informed crop cultivation decisions using AI, machine learning, and real-time environmental data. The system combines crop yield prediction, climate analysis, and expert agricultural guidance through a conversational interface.

## 🎯 What is Pungda?

Pungda (meaning "farming" in some Indian languages) is a comprehensive farming assistant that:

- **Predicts crop yields** for any location using machine learning and satellite data
- **Analyzes crop suitability** based on local climate conditions
- **Recommends optimal seeds** with real buying links and prices
- **Provides farming techniques** for challenging growing conditions
- **Generates visual guides** to help farmers understand crops and techniques
- **Offers yield improvement strategies** based on scientific research

## 🏗️ Project Structure

```
Pungda/
├── notebooks/                    # ML model training and data preparation
│   ├── Pungda_Data_Preparation.ipynb
│   └── Pungda_Model_Training.ipynb
├── services/
│   ├── agent_service/           # Multi-agent AI system (Google ADK)
│   │   ├── sub_agents/          # Specialized agricultural agents
│   │   ├── agent.py             # Root agent orchestrator
│   │   └── prompt.py            # Agent instructions
│   ├── prediction_service/      # ML yield prediction API
│   │   ├── main.py              # FastAPI service
│   │   └── assets/              # Trained models and data
│   └── pungde_web/              # Next.js web interface
│       ├── app/                 # Pages and layouts
│       ├── components/          # React components
│       └── lib/                 # API clients and utilities
└── README.md                    # This file
```

## 🚀 Key Features

### 1. Crop Yield Prediction
- Uses XGBoost ML model trained on global agricultural data
- Integrates Google Earth Engine satellite imagery (64-dimensional embeddings)
- Provides location-specific yield predictions in tons per hectare
- Supports 10 major crops: rice, wheat, maize, cotton, coffee, banana, coconut, chickpea, kidneybeans, lentil, pigeonpeas

### 2. Multi-Agent AI System
Six specialized AI agents work together to provide comprehensive farming guidance:
- **Agri Analyzer**: Fetches yield predictions and crop requirements
- **Crop Suitability Agent**: Analyzes if crops can grow in specific locations
- **Grow Anyways Agent**: Provides techniques for challenging conditions
- **Yield Improvement Agent**: Suggests strategies to increase production
- **Seed Identifier Agent**: Recommends seeds with buying links
- **Image Generator Agent**: Creates visual guides for farmers

### 3. Real-Time Environmental Data
- Google Earth Engine satellite data (temperature, rainfall, vegetation indices)
- Google Geocoding API for location coordinates
- 12-month climate history analysis
- Soil and atmospheric condition monitoring

### 4. Beautiful Web Interface
- Modern, responsive design with dark/light/farmer themes
- Real-time chat with markdown support
- Save and export conversations to PDF
- Mobile-friendly interface
- Visual crop and technique guides

## 🛠️ Technology Stack

### Machine Learning & Data
- **XGBoost**: Crop yield prediction model
- **Google Earth Engine**: Satellite imagery and environmental data
- **Scikit-learn**: Data preprocessing and scaling
- **Pandas/NumPy**: Data manipulation
- **SPAM 2020 Dataset**: Global crop production data
- **Kaggle Crop Dataset**: Crop requirement parameters

### Backend Services
- **FastAPI**: High-performance prediction API
- **Google ADK (Agent Development Kit)**: Multi-agent orchestration
- **Gemini 2.5 Flash**: Large language model for agents
- **Vertex AI**: Image generation
- **Python 3.10+**: Core backend language

### Frontend
- **Next.js 16**: React framework
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Styling
- **React Markdown**: Rich text rendering
- **jsPDF**: PDF export functionality

### Infrastructure
- **Google Cloud Run**: Serverless deployment
- **Docker**: Containerization
- **Google Cloud Storage**: Asset storage
- **Environment Variables**: Configuration management

## 📊 How It Works

### Data Flow

1. **User Query** → Web interface sends message to Agent Service
2. **Agent Orchestration** → Root agent analyzes intent and collects crop/location info
3. **Yield Prediction** → Agri Analyzer calls Prediction Service
4. **Environmental Data** → Prediction Service fetches Google Earth Engine data
5. **ML Inference** → XGBoost model predicts yield
6. **Specialist Analysis** → Appropriate sub-agent provides detailed guidance
7. **Visual Enhancement** → Image Generator creates helpful visuals
8. **Response** → Formatted answer with data, analysis, and images

### Agent Architecture

```
Root Agent (Pungda)
├── Agri Analyzer Agent (Data Fetcher)
├── Crop Suitability Agent (Climate Analysis)
├── Grow Anyways Agent (Technique Advisor)
├── Yield Improvement Agent (Optimization Expert)
├── Seed Identifier Agent (Seed Recommendations)
└── Image Generator Agent (Visual Creator)
```

## 🚦 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Google Cloud Project with enabled APIs:
  - Earth Engine API
  - Geocoding API
  - Vertex AI API
  - Cloud Run API
- API Keys and credentials

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd Pungda
```

2. **Set up Prediction Service**
```bash
cd services/prediction_service
pip install -r requirements.txt
# Configure .env with API keys
uvicorn main:app --host 0.0.0.0 --port 8001
```

3. **Set up Agent Service**
```bash
cd services/agent_service
pip install -r requirements.txt
# Configure .env with API keys and PREDICTION_SERVICE_URL
# Deploy using Google ADK
```

4. **Set up Web Interface**
```bash
cd services/pungde_web
npm install
npm run dev
```

Visit `http://localhost:3000` to access the web interface.

## 📖 Documentation

- [Notebooks README](./notebooks/README.md) - ML model training and data preparation
- [Agent Service README](./services/agent_service/README.md) - Multi-agent system details
- [Prediction Service README](./services/prediction_service/README.md) - ML API documentation
- [Web Service README](./services/pungde_web/README.md) - Frontend application guide
- [Architecture Documentation](./ARCHITECTURE.md) - System design and data flow
- [Agent Architecture](./services/agent_service/ARCHITECTURE.md) - Agent system design

## 🌍 Supported Regions

Pungda works globally! The system:
- Supports any location with Google Earth Engine coverage
- Adapts currency and units to local context
- Provides region-specific seed recommendations
- Uses local agricultural research and suppliers

## 🔒 Environment Variables

### Prediction Service
```
EE_PROJECT=your-gcp-project-id
GOOGLE_GEOCODING_API_KEY=your-geocoding-key
```

### Agent Service
```
GEMINI_MODEL=gemini-2.5-flash
PREDICTION_SERVICE_URL=https://your-prediction-service-url
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
```

## 🤝 Contributing

Contributions are welcome! This project is designed to help farmers worldwide make better agricultural decisions.

## 📄 License

[Add your license information here]

## 🙏 Acknowledgments

- **SPAM 2020**: Global crop production data
- **Kaggle**: Crop recommendation dataset
- **Google Earth Engine**: Satellite imagery and environmental data
- **Google Cloud**: Infrastructure and AI services
- Farmers worldwide who inspire this work

## 📧 Contact

For questions, suggestions, or collaboration opportunities, please reach out through the repository issues.

---

**Built with ❤️ for farmers worldwide** 🌾
