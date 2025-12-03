# LLM Guardian - Architecture Documentation

## System Overview

LLM Guardian is a full-stack observability and security monitoring platform designed for LLM applications running on Google Cloud. It provides real-time telemetry, threat detection, and automated incident response.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LAYER                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React Frontend (Vite + TailwindCSS)                      │  │
│  │  - Prompt Testing Interface                               │  │
│  │  - Real-time Metrics Display                              │  │
│  │  - Alert Dashboard                                        │  │
│  │  - Performance Charts                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Cloud Run API (Node.js + Express)                        │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Request Handler                                    │  │  │
│  │  │  - Input validation                                 │  │  │
│  │  │  - Security checks                                  │  │  │
│  │  │  - Prompt injection detection                       │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Telemetry Logger                                   │  │  │
│  │  │  - Structured logging                               │  │  │
│  │  │  - Metric collection                                │  │  │
│  │  │  - Trace generation                                 │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                    │                        │
                    │                        │
        ┌───────────┘                        └──────────┐
        │                                                │
        ▼                                                ▼
┌──────────────────────┐                  ┌──────────────────────┐
│   AI LAYER           │                  │  OBSERVABILITY       │
│                      │                  │  LAYER               │
│  Vertex AI           │                  │                      │
│  ┌────────────────┐  │                  │  Datadog Platform    │
│  │ Gemini Pro     │  │                  │  ┌────────────────┐  │
│  │ - Generation   │  │                  │  │ Log Intake     │  │
│  │ - Safety       │  │                  │  │ API            │  │
│  │   Filters      │  │                  │  └────────────────┘  │
│  └────────────────┘  │                  │  ┌────────────────┐  │
│                      │                  │  │ Metrics API    │  │
└──────────────────────┘                  │  └────────────────┘  │
                                          │  ┌────────────────┐  │
                                          │  │ APM Traces     │  │
                                          │  └────────────────┘  │
                                          │  ┌────────────────┐  │
                                          │  │ Security       │  │
                                          │  │ Monitoring     │  │
                                          │  └────────────────┘  │
                                          └──────────────────────┘
                                                    │
                                                    ▼
                                          ┌──────────────────────┐
                                          │  DETECTION &         │
                                          │  ALERTING            │
                                          │  ┌────────────────┐  │
                                          │  │ Detection      │  │
                                          │  │ Rules          │  │
                                          │  └────────────────┘  │
                                          │  ┌────────────────┐  │
                                          │  │ Incident       │  │
                                          │  │ Management     │  │
                                          │  └────────────────┘  │
                                          │  ┌────────────────┐  │
                                          │  │ Notifications  │  │
                                          │  │ (Slack/Email)  │  │
                                          │  └────────────────┘  │
                                          └──────────────────────┘
```

## Component Details

### 1. Frontend Layer

**Technology Stack:**
- React 18
- Vite (build tool)
- TailwindCSS (styling)
- Recharts (data visualization)
- Lucide React (icons)

**Key Features:**
- Real-time prompt testing interface
- Live metrics dashboard
- Security alerts panel
- Performance charts (latency, tokens, costs)
- Dark/Light mode support

**Components:**
- `PromptTester`: Main interface for testing LLM prompts
- `MetricsPanel`: Displays live telemetry metrics
- `AlertsPanel`: Shows recent security and performance alerts
- `ChartsPanel`: Visualizes trends over time

### 2. Backend API Layer

**Technology Stack:**
- Node.js 18+
- Express.js
- Google Cloud Vertex AI SDK
- Axios (HTTP client)

**Key Modules:**

#### `index.js` - Main API Server
- Express server setup
- Request routing
- Middleware configuration
- Error handling

#### `vertexai.js` - AI Integration
- Vertex AI Gemini API client
- Content generation
- Safety filter configuration
- Cost calculation

#### `datadog.js` - Observability Integration
- Log streaming to Datadog
- Metric submission
- Security signal generation
- APM trace creation

#### `security.js` - Security Module
- Prompt injection detection
- Safety score calculation
- Anomaly detection
- Policy violation checks

**API Endpoints:**

```
POST /api/prompt
- Accepts user prompts
- Returns AI-generated responses
- Streams telemetry to Datadog

GET /api/metrics
- Returns aggregated metrics
- Used by frontend dashboard

GET /health
- Health check endpoint
- Used by Cloud Run
```

### 3. AI Layer (Vertex AI)

**Model:** Gemini Pro

**Configuration:**
- Max output tokens: 2048
- Temperature: 0.7
- Top-p: 0.8
- Top-k: 40

**Safety Settings:**
- Hate speech: BLOCK_MEDIUM_AND_ABOVE
- Dangerous content: BLOCK_MEDIUM_AND_ABOVE
- Sexually explicit: BLOCK_MEDIUM_AND_ABOVE
- Harassment: BLOCK_MEDIUM_AND_ABOVE

### 4. Observability Layer (Datadog)

**Data Types:**

#### Logs
- Structured JSON logs
- Request/response data
- Error logs
- Security events

**Log Schema:**
```json
{
  "requestId": "uuid",
  "userId": "string",
  "sessionId": "string",
  "prompt": "string",
  "response": "string",
  "tokensIn": "number",
  "tokensOut": "number",
  "latency": "number",
  "cost": "number",
  "safetyScore": "number",
  "timestamp": "ISO8601"
}
```

#### Metrics
- `llm.request.count`: Total requests
- `llm.request.latency`: Response time
- `llm.tokens.input`: Input tokens
- `llm.tokens.output`: Output tokens
- `llm.tokens.total`: Total tokens
- `llm.cost`: Cost per request
- `llm.safety.score`: Safety rating
- `llm.error.count`: Error count
- `llm.security.injection_blocked`: Blocked attempts

#### APM Traces
- End-to-end request tracing
- Service dependencies
- Performance bottlenecks

#### Security Signals
- Prompt injection attempts
- Unsafe content generation
- Anomalous behavior
- Policy violations

### 5. Detection & Alerting Layer

**Detection Rules:**

1. **Prompt Injection Detection**
   - Type: Log detection
   - Trigger: Pattern match on security tags
   - Severity: High
   - Action: Block request, create incident

2. **High Latency Alert**
   - Type: Metric alert
   - Trigger: avg(latency) > 5000ms
   - Severity: Critical
   - Action: Page on-call engineer

3. **Token Usage Spike**
   - Type: Metric alert
   - Trigger: 50% increase in 15 minutes
   - Severity: High
   - Action: Notify cost team

4. **Unsafe Content Detection**
   - Type: Log detection
   - Trigger: safety_score < 0.5
   - Severity: High
   - Action: Create security incident

5. **Error Rate Increase**
   - Type: Metric alert
   - Trigger: error_rate > 10/min
   - Severity: Critical
   - Action: Page on-call, create incident

**Incident Workflow:**
1. Detection rule triggers
2. Incident created in Datadog
3. Relevant logs/metrics attached
4. AI-powered root cause analysis
5. Notifications sent (Slack/Email/PagerDuty)
6. Runbook linked for resolution

## Data Flow

### Normal Request Flow

```
1. User submits prompt via frontend
2. Frontend sends POST to /api/prompt
3. Backend validates input
4. Security module checks for injection
5. Request sent to Vertex AI Gemini
6. Response received from Gemini
7. Telemetry calculated (tokens, cost, latency)
8. Data logged to Datadog
9. Metrics sent to Datadog
10. Response returned to frontend
11. Frontend displays result and metrics
```

### Security Incident Flow

```
1. User submits malicious prompt
2. Backend detects injection pattern
3. Request blocked immediately
4. Security signal sent to Datadog
5. Detection rule triggers
6. Incident created with context
7. Alert sent to security team
8. Error response returned to user
9. User activity logged for review
```

## Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────┐
│  Google Cloud Platform                   │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  Cloud Run                          │ │
│  │  - Auto-scaling (0-100 instances)   │ │
│  │  - CPU: 1 vCPU                      │ │
│  │  - Memory: 512 MB                   │ │
│  │  - Concurrency: 80                  │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  Secret Manager                     │ │
│  │  - DATADOG_API_KEY                  │ │
│  │  - VERTEX_AI_CREDENTIALS            │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  Cloud Logging                      │ │
│  │  - Application logs                 │ │
│  │  - Audit logs                       │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Vercel / Firebase Hosting               │
│  - Frontend static assets                │
│  - CDN distribution                      │
│  - SSL/TLS termination                   │
└─────────────────────────────────────────┘
```

## Security Considerations

### Authentication & Authorization
- API key authentication for backend
- User session management
- Rate limiting per user/IP

### Data Privacy
- PII detection and masking
- Prompt/response truncation in logs
- Secure secret management

### Network Security
- HTTPS only
- CORS configuration
- Cloud Run IAM policies

### Monitoring Security
- Failed authentication attempts
- Unusual access patterns
- API abuse detection

## Scalability

### Horizontal Scaling
- Cloud Run auto-scales based on load
- Supports 0-100+ instances
- Handles traffic spikes automatically

### Performance Optimization
- Response caching (future)
- Batch metric submission
- Async logging
- Connection pooling

### Cost Optimization
- Pay-per-use pricing
- Scale to zero when idle
- Token usage monitoring
- Cost alerts and budgets

## Monitoring & Observability

### Key Metrics to Monitor
- Request throughput (req/min)
- Response latency (p50, p95, p99)
- Error rate (%)
- Token usage (tokens/min)
- Cost per request ($)
- Safety score distribution
- Security incidents (count)

### SLIs (Service Level Indicators)
- Availability: 99.9%
- Latency p95: < 3000ms
- Error rate: < 1%
- Safety score: > 0.9

### Dashboards
1. **Telemetry Dashboard**: LLM-specific metrics
2. **Performance Dashboard**: System health
3. **Security Dashboard**: Threat monitoring

## Future Enhancements

### Planned Features
- Multi-model support (GPT-4, Claude, etc.)
- Advanced anomaly detection with ML
- Custom detection rule builder
- Cost optimization recommendations
- A/B testing framework
- Prompt template library
- User feedback collection
- Automated incident remediation

### Integration Roadmap
- Slack bot for prompt testing
- GitHub Actions for CI/CD
- Terraform for infrastructure
- Grafana for additional visualization
- Prometheus for metrics
- OpenTelemetry for tracing

## Troubleshooting

### Common Issues

**High Latency**
- Check Vertex AI status
- Review prompt complexity
- Monitor network latency
- Scale Cloud Run instances

**Authentication Errors**
- Verify API keys
- Check IAM permissions
- Review secret configuration

**Cost Spikes**
- Review token usage patterns
- Check for automated requests
- Implement rate limiting
- Optimize prompts

**Security Alerts**
- Review blocked prompts
- Investigate user patterns
- Update detection rules
- Adjust safety thresholds

## References

- [Google Cloud Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Datadog API Documentation](https://docs.datadoghq.com/api/)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Gemini API Reference](https://ai.google.dev/docs)
