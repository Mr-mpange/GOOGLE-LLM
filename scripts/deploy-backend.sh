#!/bin/bash

# LLM Guardian - Backend Deployment Script
# Deploys the backend API to Google Cloud Run

set -e

echo "🚀 LLM Guardian - Backend Deployment"
echo "===================================="
echo ""

# Configuration
PROJECT_ID="${GOOGLE_CLOUD_PROJECT}"
REGION="${GOOGLE_CLOUD_REGION:-us-central1}"
SERVICE_NAME="llm-guardian-api"

# Check for required tools
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI not found. Please install it first."
    exit 1
fi

# Check for project ID
if [ -z "$PROJECT_ID" ]; then
    echo "❌ Error: GOOGLE_CLOUD_PROJECT environment variable not set"
    echo "   Set it with: export GOOGLE_CLOUD_PROJECT=your-project-id"
    exit 1
fi

echo "📋 Configuration:"
echo "   Project ID: $PROJECT_ID"
echo "   Region: $REGION"
echo "   Service Name: $SERVICE_NAME"
echo ""

# Confirm deployment
read -p "Deploy to production? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 0
fi

# Navigate to backend directory
cd backend

echo "🔧 Building and deploying to Cloud Run..."
echo ""

# Deploy to Cloud Run
gcloud run deploy $SERVICE_NAME \
    --source . \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --memory 512Mi \
    --cpu 1 \
    --timeout 60 \
    --concurrency 80 \
    --min-instances 0 \
    --max-instances 100 \
    --set-env-vars "GOOGLE_CLOUD_PROJECT=$PROJECT_ID,GOOGLE_CLOUD_LOCATION=$REGION,NODE_ENV=production" \
    --set-secrets "DATADOG_API_KEY=datadog-api-key:latest" \
    --project $PROJECT_ID

echo ""
echo "✅ Deployment complete!"
echo ""

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
    --platform managed \
    --region $REGION \
    --project $PROJECT_ID \
    --format 'value(status.url)')

echo "🌐 Service URL: $SERVICE_URL"
echo ""
echo "Test the API:"
echo "  curl $SERVICE_URL/health"
echo ""
echo "Next steps:"
echo "1. Update frontend VITE_API_URL to: $SERVICE_URL"
echo "2. Test the /api/prompt endpoint"
echo "3. Monitor logs: gcloud run logs tail $SERVICE_NAME --project $PROJECT_ID"
echo "4. View metrics in Datadog"
echo ""
