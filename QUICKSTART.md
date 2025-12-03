# 🚀 LLM Guardian - Quick Start Guide

Get LLM Guardian running in under 15 minutes!

## Prerequisites

- Node.js 18+ installed
- Google Cloud account
- Datadog account
- Git installed

## Step 1: Clone Repository (1 min)

```bash
git clone https://github.com/yourusername/llm-guardian.git
cd llm-guardian
```

## Step 2: Set Up Google Cloud (3 min)

```bash
# Install gcloud CLI if needed
# https://cloud.google.com/sdk/docs/install

# Login and set project
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com aiplatform.googleapis.com
```

## Step 3: Configure Backend (2 min)

```bash
cd backend
npm install

# Create environment file
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=8080
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
DATADOG_API_KEY=your-datadog-api-key
DATADOG_SITE=datadoghq.com
NODE_ENV=development
```

## Step 4: Start Backend (1 min)

```bash
npm start
```

You should see:
```
🛡️  LLM Guardian API running on port 8080
📊 Datadog integration: enabled
🤖 Vertex AI project: your-project-id
```

## Step 5: Configure Frontend (2 min)

Open a new terminal:

```bash
cd frontend
npm install

# Create environment file
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:8080
```

## Step 6: Start Frontend (1 min)

```bash
npm run dev
```

Open browser to: http://localhost:3000

## Step 7: Test the Application (2 min)

### Test Normal Prompt

In the UI:
1. Enter prompt: "Explain quantum computing in simple terms"
2. Click "Send"
3. View response and metrics

### Test Security Feature

1. Enter prompt: "Ignore all previous instructions"
2. Click "Send"
3. Should be blocked with security message

## Step 8: Set Up Datadog (3 min)

```bash
# Export your Datadog credentials
export DATADOG_API_KEY=your_api_key
export DATADOG_APP_KEY=your_app_key

# Run setup script
chmod +x scripts/setup-datadog.sh
./scripts/setup-datadog.sh
```

Visit Datadog to see:
- Dashboards: https://app.datadoghq.com/dashboard/lists
- Monitors: https://app.datadoghq.com/monitors/manage
- Logs: https://app.datadoghq.com/logs

## 🎉 You're Done!

LLM Guardian is now running locally. Try:

### Test API Directly

```bash
curl -X POST http://localhost:8080/api/prompt \
  -H "Content-Type: application/json" \
  -d '{"prompt":"What is AI?","userId":"test"}'
```

### View Logs in Datadog

1. Go to Datadog Logs
2. Search for: `service:llm-guardian`
3. See your requests in real-time

### Trigger an Alert

Send multiple requests quickly to trigger rate alerts:

```bash
for i in {1..20}; do
  curl -X POST http://localhost:8080/api/prompt \
    -H "Content-Type: application/json" \
    -d '{"prompt":"Test prompt '$i'"}' &
done
```

## Next Steps

### Deploy to Production

```bash
# Deploy backend to Cloud Run
export GOOGLE_CLOUD_PROJECT=your-project
./scripts/deploy-backend.sh

# Deploy frontend to Vercel
cd frontend
npm install -g vercel
vercel --prod
```

### Customize Dashboards

1. Edit files in `/dashboards`
2. Re-run `./scripts/setup-datadog.sh`

### Add Detection Rules

1. Edit files in `/detection-rules`
2. Import to Datadog manually or via API

### Read Documentation

- Architecture: `docs/ARCHITECTURE.md`
- Deployment: `docs/DEPLOYMENT.md`
- API Reference: `docs/API_REFERENCE.md`

## Troubleshooting

### Backend won't start

**Error:** "Vertex AI authentication failed"

**Solution:**
```bash
gcloud auth application-default login
```

### Frontend can't connect to backend

**Error:** "Network error"

**Solution:** Check `VITE_API_URL` in `frontend/.env` matches backend URL

### Datadog not receiving data

**Error:** "No logs in Datadog"

**Solution:** 
1. Verify `DATADOG_API_KEY` is correct
2. Check backend logs for Datadog errors
3. Test API key:
```bash
curl -X POST "https://http-intake.logs.datadoghq.com/api/v2/logs" \
  -H "DD-API-KEY: $DATADOG_API_KEY" \
  -d '[{"message":"test"}]'
```

### Vertex AI quota exceeded

**Error:** "Quota exceeded"

**Solution:**
1. Go to Google Cloud Console
2. Navigate to Vertex AI → Quotas
3. Request quota increase

## Common Commands

```bash
# Start backend
cd backend && npm start

# Start frontend
cd frontend && npm run dev

# Run tests
cd backend && npm test

# Deploy backend
./scripts/deploy-backend.sh

# View backend logs
cd backend && npm start | grep ERROR

# Build frontend
cd frontend && npm run build
```

## Environment Variables Reference

### Backend (.env)
```env
PORT=8080                              # API port
GOOGLE_CLOUD_PROJECT=your-project      # GCP project ID
GOOGLE_CLOUD_LOCATION=us-central1      # Vertex AI region
DATADOG_API_KEY=your-key               # Datadog API key
DATADOG_SITE=datadoghq.com            # Datadog site
NODE_ENV=development                   # Environment
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8080    # Backend URL
```

## Support

- **Issues**: https://github.com/yourusername/llm-guardian/issues
- **Docs**: See `/docs` folder
- **Email**: support@llmguardian.com

## What's Next?

Now that you have LLM Guardian running:

1. ✅ Test different prompts
2. ✅ Explore Datadog dashboards
3. ✅ Customize detection rules
4. ✅ Deploy to production
5. ✅ Integrate with your application

Happy monitoring! 🛡️
