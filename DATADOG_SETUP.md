# Datadog Integration Setup Guide

This guide will help you set up Datadog integration for LLM Guardian to enable advanced monitoring and observability.

## Prerequisites

- A Datadog account (sign up at https://www.datadoghq.com/)
- Access to your Datadog API keys

## Step 1: Get Your Datadog API Key

1. Log in to your Datadog account at https://app.datadoghq.com/
2. Navigate to **Organization Settings** → **API Keys**
3. Click **New Key** or copy an existing API key
4. Save this key securely

## Step 2: Configure Your Application

1. Open `backend/.env` file
2. Uncomment and update the `DATADOG_API_KEY` line:

```env
DATADOG_API_KEY=your-actual-datadog-api-key-here
```

3. Verify the `DATADOG_SITE` matches your Datadog region:
   - US1: `datadoghq.com` (default)
   - US3: `us3.datadoghq.com`
   - US5: `us5.datadoghq.com`
   - EU: `datadoghq.eu`
   - AP1: `ap1.datadoghq.com`

## Step 3: Restart Your Application

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm start
```

You should see:
```
✓ Datadog integration: enabled
```

## Step 4: Verify Data in Datadog

### Logs
1. Go to **Logs** → **Explorer** in Datadog
2. Filter by `service:llm-guardian`
3. You should see logs from your application

### Metrics
1. Go to **Metrics** → **Explorer**
2. Search for metrics starting with `llm.`
   - `llm.request.count` - Total requests
   - `llm.request.latency` - Response latency
   - `llm.tokens.input` - Input tokens
   - `llm.tokens.output` - Output tokens
   - `llm.cost` - API costs
   - `llm.safety.score` - Safety scores

### Security Signals
1. Go to **Security** → **Signals**
2. Filter by `service:llm-guardian`
3. View security events like prompt injection attempts

## Step 5: Create Dashboards (Optional)

1. Go to **Dashboards** → **New Dashboard**
2. Add widgets for:
   - Request rate (timeseries of `llm.request.count`)
   - Average latency (timeseries of `llm.request.latency`)
   - Token usage (timeseries of `llm.tokens.total`)
   - Cost tracking (timeseries of `llm.cost`)
   - Safety scores (timeseries of `llm.safety.score`)

## Step 6: Set Up Alerts (Optional)

### High Latency Alert
1. Go to **Monitors** → **New Monitor**
2. Select **Metric**
3. Configure:
   - Metric: `llm.request.latency`
   - Alert threshold: `> 5000` (5 seconds)
   - Warning threshold: `> 3000` (3 seconds)

### High Error Rate Alert
1. Create a new monitor
2. Configure:
   - Metric: `llm.request.count` with tag `status:error`
   - Alert when error rate exceeds 5%

### Cost Alert
1. Create a new monitor
2. Configure:
   - Metric: `llm.cost`
   - Alert when daily cost exceeds your budget

## Troubleshooting

### "403 Forbidden" Error
- Your API key is invalid or doesn't have the correct permissions
- Verify the API key in Datadog settings
- Make sure you're using an API key, not an Application key

### "400 Bad Request" Error
- Check that your `DATADOG_SITE` matches your account region
- Verify the metric/log format is correct

### No Data Appearing
- Wait 1-2 minutes for data to appear
- Check that the API key is correctly set in `.env`
- Verify the application restarted after updating `.env`
- Check application logs for any Datadog-related errors

## Running Without Datadog

The application works perfectly fine without Datadog integration:
- Metrics are tracked locally in memory
- Alerts are stored in the application
- All features work normally

To disable Datadog, simply comment out or remove the `DATADOG_API_KEY` in your `.env` file.

## Benefits of Datadog Integration

✅ **Centralized Logging** - All logs in one place
✅ **Real-time Metrics** - Live dashboards and monitoring
✅ **Alerting** - Get notified of issues immediately
✅ **Security Monitoring** - Track security events
✅ **Cost Tracking** - Monitor API costs over time
✅ **Performance Analysis** - Identify bottlenecks
✅ **Historical Data** - Long-term trend analysis

## Support

For more information:
- Datadog Documentation: https://docs.datadoghq.com/
- Datadog API Reference: https://docs.datadoghq.com/api/
- LLM Guardian Issues: https://github.com/your-repo/issues
