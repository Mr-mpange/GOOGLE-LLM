#!/bin/bash

# LLM Guardian - Datadog Setup Script
# This script configures Datadog dashboards and detection rules

set -e

echo "🛡️  LLM Guardian - Datadog Setup"
echo "================================"
echo ""

# Check for required environment variables
if [ -z "$DATADOG_API_KEY" ]; then
    echo "❌ Error: DATADOG_API_KEY environment variable not set"
    exit 1
fi

if [ -z "$DATADOG_APP_KEY" ]; then
    echo "❌ Error: DATADOG_APP_KEY environment variable not set"
    exit 1
fi

DATADOG_SITE="${DATADOG_SITE:-datadoghq.com}"
API_URL="https://api.${DATADOG_SITE}/api/v1"

echo "📊 Datadog Site: $DATADOG_SITE"
echo ""

# Function to create dashboard
create_dashboard() {
    local dashboard_file=$1
    local dashboard_name=$(basename "$dashboard_file" .json)
    
    echo "📈 Creating dashboard: $dashboard_name"
    
    response=$(curl -s -X POST "$API_URL/dashboard" \
        -H "Content-Type: application/json" \
        -H "DD-API-KEY: $DATADOG_API_KEY" \
        -H "DD-APPLICATION-KEY: $DATADOG_APP_KEY" \
        -d @"$dashboard_file")
    
    if echo "$response" | grep -q "id"; then
        echo "✅ Dashboard created successfully"
        dashboard_id=$(echo "$response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
        echo "   Dashboard ID: $dashboard_id"
        echo "   URL: https://app.${DATADOG_SITE}/dashboard/$dashboard_id"
    else
        echo "❌ Failed to create dashboard"
        echo "   Response: $response"
    fi
    echo ""
}

# Function to create monitor (detection rule)
create_monitor() {
    local monitor_file=$1
    local monitor_name=$(basename "$monitor_file" .json)
    
    echo "🚨 Creating monitor: $monitor_name"
    
    response=$(curl -s -X POST "$API_URL/monitor" \
        -H "Content-Type: application/json" \
        -H "DD-API-KEY: $DATADOG_API_KEY" \
        -H "DD-APPLICATION-KEY: $DATADOG_APP_KEY" \
        -d @"$monitor_file")
    
    if echo "$response" | grep -q "id"; then
        echo "✅ Monitor created successfully"
        monitor_id=$(echo "$response" | grep -o '"id":[0-9]*' | cut -d':' -f2)
        echo "   Monitor ID: $monitor_id"
    else
        echo "❌ Failed to create monitor"
        echo "   Response: $response"
    fi
    echo ""
}

# Create dashboards
echo "📊 Creating Dashboards"
echo "====================="
echo ""

if [ -d "dashboards" ]; then
    for dashboard in dashboards/*.json; do
        if [ -f "$dashboard" ]; then
            create_dashboard "$dashboard"
        fi
    done
else
    echo "⚠️  Warning: dashboards directory not found"
fi

# Create monitors (detection rules)
echo "🚨 Creating Detection Rules"
echo "==========================="
echo ""

if [ -d "detection-rules" ]; then
    for monitor in detection-rules/*.json; do
        if [ -f "$monitor" ]; then
            create_monitor "$monitor"
        fi
    done
else
    echo "⚠️  Warning: detection-rules directory not found"
fi

echo "✅ Datadog setup complete!"
echo ""
echo "Next steps:"
echo "1. Visit https://app.${DATADOG_SITE}/dashboard/lists to view your dashboards"
echo "2. Visit https://app.${DATADOG_SITE}/monitors/manage to view your monitors"
echo "3. Configure notification channels (Slack, Email, PagerDuty)"
echo "4. Test the detection rules by triggering sample events"
echo ""
