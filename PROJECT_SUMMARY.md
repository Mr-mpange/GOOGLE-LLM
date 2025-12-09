# LLM Guardian - Project Summary

## ✅ What's Implemented

### Core Features
- ✅ AI Self-Healing (automatic model switching based on latency/cost)
- ✅ Real-time monitoring dashboard
- ✅ Prompt injection detection
- ✅ User risk scoring system
- ✅ API key management with rate limiting
- ✅ Cost optimization tracking
- ✅ Live charts (latency, tokens, costs)
- ✅ Alert system
- ✅ Multi-model support (Gemini 2.0 Flash, 1.5 Flash, 1.5 Pro)

### Tech Stack
**Backend:**
- Node.js + Express
- Google Vertex AI (Gemini)
- In-memory data storage

**Frontend:**
- React + Vite
- Tailwind CSS
- Recharts for visualization

## 📂 Project Structure

```
llm-guardian/
├── backend/
│   ├── src/
│   │   ├── index.js              # Main API server
│   │   ├── vertexai.js           # Gemini integration
│   │   ├── security.js           # Security checks
│   │   ├── selfHealing.js        # Auto-healing logic
│   │   ├── metricsStore.js       # Metrics storage
│   │   ├── alertsStore.js        # Alert management
│   │   ├── apiKeyManager.js      # API key auth
│   │   └── responseFormatter.js  # Response formatting
│   ├── .env                      # Config (create from .env.example)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── components/
│   │       ├── PromptTester.jsx
│   │       ├── ChartsPanel.jsx
│   │       ├── MetricsPanel.jsx
│   │       ├── SelfHealingPanel.jsx
│   │       ├── CostOptimizationPanel.jsx
│   │       ├── UserRiskPanel.jsx
│   │       ├── AlertsPanel.jsx
│   │       └── APIKeyManagement.jsx
│   └── package.json
├── START_ALL.bat                 # Start both services
├── STOP_ALL.bat                  # Stop both services
└── README.md                     # Main documentation
```

## 🚀 Quick Start

1. **Setup Backend:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your Google Cloud project ID
   npm start
   ```

2. **Setup Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Or use batch files (Windows):**
   ```bash
   START_ALL.bat
   ```

## 🔑 Environment Variables

Create `backend/.env`:
```env
PORT=8081
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
NODE_ENV=development
```

## 📊 API Endpoints

- `POST /api/prompt` - Send prompts (requires API key)
- `GET /api/metrics` - Get system metrics
- `GET /api/alerts` - Get recent alerts
- `GET /api/self-healing` - Get healing status
- `POST /api/model/switch` - Switch AI model
- `POST /api/keys/create` - Create API key
- `GET /api/keys` - List API keys
- `POST /api/keys/:key/revoke` - Revoke key
- `DELETE /api/keys/:key` - Delete key

## 🎯 Key Differentiators

1. **AI Self-Healing** - Unique feature that automatically fixes issues
2. **Production-Ready** - API key management, rate limiting, security
3. **Real-Time Everything** - Live metrics, charts, and alerts
4. **Cost Optimization** - Automatic model switching to reduce costs
5. **Security First** - Prompt injection detection, user risk scoring

## 📝 Notes

- All data stored in-memory (resets on restart)
- For production, add database (PostgreSQL/Redis)
- Datadog integration removed (was optional)
- No tests included (removed for simplicity)
