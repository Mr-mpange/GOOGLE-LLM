# 📚 LLM Guardian - Complete Documentation Index

Welcome to LLM Guardian! This index will help you navigate all project documentation.

## 🚀 Getting Started

Start here if you're new to LLM Guardian:

1. **[README.md](README.md)** - Project overview and features
2. **[QUICKSTART.md](QUICKSTART.md)** - Get running in 15 minutes
3. **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Complete project summary

## 📖 Core Documentation

### User Guides
- **[QUICKSTART.md](QUICKSTART.md)** - Quick setup guide
- **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Production deployment guide
- **[docs/API_REFERENCE.md](docs/API_REFERENCE.md)** - API documentation

### Technical Documentation
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture deep-dive
- **[docs/DIAGRAMS.md](docs/DIAGRAMS.md)** - Visual architecture diagrams
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines

### Hackathon Materials
- **[docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md)** - 3-minute demo video script
- **[docs/DEVPOST_SUBMISSION.md](docs/DEVPOST_SUBMISSION.md)** - Hackathon submission

## 🏗️ Project Structure

```
llm-guardian/
├── README.md                    # Project overview
├── QUICKSTART.md               # Quick start guide
├── PROJECT_SUMMARY.md          # Complete summary
├── INDEX.md                    # This file
├── LICENSE                     # MIT license
├── CONTRIBUTING.md             # Contribution guide
├── .gitignore                  # Git ignore rules
│
├── backend/                    # Backend API
│   ├── src/
│   │   ├── index.js           # Main API server
│   │   ├── vertexai.js        # Vertex AI integration
│   │   ├── datadog.js         # Datadog integration
│   │   └── security.js        # Security module
│   ├── tests/
│   │   └── api.test.js        # Test suite
│   ├── package.json           # Dependencies
│   ├── Dockerfile             # Container config
│   ├── .env.example           # Environment template
│   └── .dockerignore          # Docker ignore
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── main.jsx           # Entry point
│   │   ├── App.jsx            # Main component
│   │   ├── index.css          # Global styles
│   │   └── components/
│   │       ├── PromptTester.jsx
│   │       ├── MetricsPanel.jsx
│   │       ├── AlertsPanel.jsx
│   │       └── ChartsPanel.jsx
│   ├── package.json           # Dependencies
│   ├── vite.config.js         # Vite config
│   ├── tailwind.config.js     # Tailwind config
│   ├── postcss.config.js      # PostCSS config
│   ├── index.html             # HTML template
│   └── .env.example           # Environment template
│
├── dashboards/                 # Datadog dashboards
│   ├── llm-telemetry.json     # LLM metrics dashboard
│   ├── performance.json       # Performance dashboard
│   └── security.json          # Security dashboard
│
├── detection-rules/            # Datadog detection rules
│   ├── prompt-injection.json  # Injection detection
│   ├── high-latency.json      # Latency alerts
│   ├── token-spike.json       # Token usage alerts
│   ├── unsafe-content.json    # Content safety
│   └── error-rate-increase.json # Error monitoring
│
├── docs/                       # Documentation
│   ├── ARCHITECTURE.md        # Architecture guide
│   ├── DEPLOYMENT.md          # Deployment guide
│   ├── API_REFERENCE.md       # API documentation
│   ├── DEMO_SCRIPT.md         # Demo video script
│   ├── DEVPOST_SUBMISSION.md  # Hackathon submission
│   └── DIAGRAMS.md            # Architecture diagrams
│
└── scripts/                    # Utility scripts
    ├── setup-datadog.sh       # Datadog setup
    └── deploy-backend.sh      # Backend deployment
```

## 📋 Documentation by Topic

### Installation & Setup
- [Quick Start Guide](QUICKSTART.md)
- [Backend Setup](backend/.env.example)
- [Frontend Setup](frontend/.env.example)
- [Datadog Configuration](scripts/setup-datadog.sh)

### Development
- [Contributing Guidelines](CONTRIBUTING.md)
- [API Reference](docs/API_REFERENCE.md)
- [Testing Guide](backend/tests/api.test.js)
- [Code Structure](PROJECT_SUMMARY.md#project-structure)

### Deployment
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Cloud Run Deployment](scripts/deploy-backend.sh)
- [Environment Variables](docs/DEPLOYMENT.md#environment-variables-reference)
- [Production Hardening](docs/DEPLOYMENT.md#production-hardening)

### Architecture
- [System Architecture](docs/ARCHITECTURE.md)
- [Architecture Diagrams](docs/DIAGRAMS.md)
- [Data Flow](docs/DIAGRAMS.md#data-flow-diagram)
- [Security Flow](docs/DIAGRAMS.md#security-flow-diagram)

### Monitoring & Observability
- [Datadog Dashboards](dashboards/)
- [Detection Rules](detection-rules/)
- [Metrics Reference](docs/API_REFERENCE.md#telemetry)
- [Security Monitoring](docs/ARCHITECTURE.md#security-considerations)

### Hackathon
- [Demo Script](docs/DEMO_SCRIPT.md)
- [Devpost Submission](docs/DEVPOST_SUBMISSION.md)
- [Project Summary](PROJECT_SUMMARY.md)

## 🎯 Quick Links by Role

### For Users
1. Start: [QUICKSTART.md](QUICKSTART.md)
2. Deploy: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
3. Use API: [docs/API_REFERENCE.md](docs/API_REFERENCE.md)

### For Developers
1. Architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
2. Contributing: [CONTRIBUTING.md](CONTRIBUTING.md)
3. Code: [backend/src/](backend/src/) and [frontend/src/](frontend/src/)

### For DevOps
1. Deployment: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
2. Scripts: [scripts/](scripts/)
3. Monitoring: [dashboards/](dashboards/) and [detection-rules/](detection-rules/)

### For Hackathon Judges
1. Overview: [README.md](README.md)
2. Demo: [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md)
3. Submission: [docs/DEVPOST_SUBMISSION.md](docs/DEVPOST_SUBMISSION.md)
4. Summary: [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

## 📊 Key Features Documentation

### Security Features
- [Prompt Injection Detection](backend/src/security.js)
- [PII Detection](backend/src/security.js)
- [Safety Scoring](backend/src/security.js)
- [Security Dashboard](dashboards/security.json)

### Observability Features
- [Logging](backend/src/datadog.js)
- [Metrics](backend/src/datadog.js)
- [Dashboards](dashboards/)
- [Detection Rules](detection-rules/)

### AI Integration
- [Vertex AI Integration](backend/src/vertexai.js)
- [Cost Calculation](backend/src/vertexai.js)
- [Token Estimation](backend/src/index.js)

### Frontend Features
- [Prompt Tester](frontend/src/components/PromptTester.jsx)
- [Metrics Display](frontend/src/components/MetricsPanel.jsx)
- [Alerts Panel](frontend/src/components/AlertsPanel.jsx)
- [Charts](frontend/src/components/ChartsPanel.jsx)

## 🔧 Configuration Files

### Backend Configuration
- [package.json](backend/package.json) - Dependencies
- [.env.example](backend/.env.example) - Environment variables
- [Dockerfile](backend/Dockerfile) - Container config

### Frontend Configuration
- [package.json](frontend/package.json) - Dependencies
- [vite.config.js](frontend/vite.config.js) - Build config
- [tailwind.config.js](frontend/tailwind.config.js) - Styling config
- [.env.example](frontend/.env.example) - Environment variables

### Datadog Configuration
- [Telemetry Dashboard](dashboards/llm-telemetry.json)
- [Performance Dashboard](dashboards/performance.json)
- [Security Dashboard](dashboards/security.json)
- [Detection Rules](detection-rules/)

## 🧪 Testing

### Backend Tests
- [API Tests](backend/tests/api.test.js)
- Run: `cd backend && npm test`

### Test Coverage
- Security functions
- Cost calculations
- Safety scoring
- Policy violations
- API endpoints

## 📝 Examples

### API Usage Examples
See [docs/API_REFERENCE.md](docs/API_REFERENCE.md) for:
- cURL examples
- JavaScript examples
- Request/response formats
- Error handling

### Configuration Examples
- [Backend .env](backend/.env.example)
- [Frontend .env](frontend/.env.example)
- [Dashboard JSON](dashboards/)
- [Detection Rules](detection-rules/)

## 🆘 Troubleshooting

### Common Issues
- [Quick Start Troubleshooting](QUICKSTART.md#troubleshooting)
- [Deployment Issues](docs/DEPLOYMENT.md#troubleshooting)
- [Architecture FAQ](docs/ARCHITECTURE.md#troubleshooting)

### Support Resources
- **GitHub Issues**: https://github.com/yourusername/llm-guardian/issues
- **Documentation**: This index
- **Email**: support@llmguardian.com

## 🎓 Learning Path

### Beginner
1. Read [README.md](README.md)
2. Follow [QUICKSTART.md](QUICKSTART.md)
3. Explore the UI
4. Test some prompts

### Intermediate
1. Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
2. Review [docs/API_REFERENCE.md](docs/API_REFERENCE.md)
3. Explore the code
4. Customize dashboards

### Advanced
1. Study [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
2. Review [CONTRIBUTING.md](CONTRIBUTING.md)
3. Extend functionality
4. Deploy to production

## 📦 Releases

### v1.0.0 (Current)
- Initial release
- Core features complete
- Production-ready
- Full documentation

See [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) for complete feature list.

## 🗺️ Roadmap

See [docs/DEVPOST_SUBMISSION.md](docs/DEVPOST_SUBMISSION.md#whats-next-for-llm-guardian) for:
- Short-term plans (3 months)
- Medium-term plans (3-6 months)
- Long-term vision (6-12 months)

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

## 🙏 Acknowledgments

- Google Cloud team
- Datadog team
- Open-source community
- Hackathon organizers

## 📞 Contact

- **GitHub**: https://github.com/yourusername/llm-guardian
- **Issues**: https://github.com/yourusername/llm-guardian/issues
- **Email**: support@llmguardian.com
- **Website**: https://llmguardian.com

---

**Need help?** Start with [QUICKSTART.md](QUICKSTART.md) or open an issue on GitHub.

**Want to contribute?** Read [CONTRIBUTING.md](CONTRIBUTING.md) and submit a PR.

**Hackathon judge?** Check out [docs/DEVPOST_SUBMISSION.md](docs/DEVPOST_SUBMISSION.md).

---

*Last updated: December 3, 2024*
