# LLM Guardian API Reference

Complete API documentation for the LLM Guardian backend.

## Base URL

```
Production: https://llm-guardian-api-xxxxx.run.app
Development: http://localhost:8080
```

## Authentication

Currently, the API is open for testing. Production deployments should implement authentication.

## Endpoints

### Health Check

Check if the API is running and healthy.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-12-03T10:30:00.000Z"
}
```

**Status Codes:**
- `200 OK`: Service is healthy

---

### Submit Prompt

Send a prompt to the LLM and receive a response with telemetry.

**Endpoint:** `POST /api/prompt`

**Request Body:**
```json
{
  "prompt": "Explain quantum computing in simple terms",
  "userId": "user-123",
  "sessionId": "session-abc"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| prompt | string | Yes | The prompt to send to the LLM |
| userId | string | No | User identifier (default: "anonymous") |
| sessionId | string | No | Session identifier (auto-generated if not provided) |

**Success Response (200 OK):**
```json
{
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "text": "Quantum computing is a type of computing that uses quantum mechanics...",
  "metadata": {
    "tokensIn": 125,
    "tokensOut": 450,
    "totalTokens": 575,
    "latency": 1834,
    "cost": 0.000256,
    "safetyScore": 0.98,
    "model": "gemini-pro"
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| requestId | string | Unique identifier for this request |
| text | string | Generated response from the LLM |
| metadata.tokensIn | number | Number of input tokens |
| metadata.tokensOut | number | Number of output tokens |
| metadata.totalTokens | number | Total tokens used |
| metadata.latency | number | Response time in milliseconds |
| metadata.cost | number | Cost in USD |
| metadata.safetyScore | number | Safety rating (0-1, higher is safer) |
| metadata.model | string | Model used for generation |

**Error Response (403 Forbidden):**
```json
{
  "error": "Prompt rejected due to security policy",
  "reason": "potential_injection",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Invalid prompt"
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "error": "Failed to process prompt",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Vertex AI API error"
}
```

**Status Codes:**
- `200 OK`: Prompt processed successfully
- `400 Bad Request`: Invalid request parameters
- `403 Forbidden`: Prompt blocked by security policy
- `500 Internal Server Error`: Server error

**Example cURL:**
```bash
curl -X POST https://llm-guardian-api.run.app/api/prompt \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain quantum computing",
    "userId": "demo-user"
  }'
```

**Example JavaScript:**
```javascript
const response = await fetch('https://llm-guardian-api.run.app/api/prompt', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: 'Explain quantum computing',
    userId: 'demo-user'
  })
});

const data = await response.json();
console.log(data.text);
```

---

### Get Metrics

Retrieve aggregated metrics for the application.

**Endpoint:** `GET /api/metrics`

**Response:**
```json
{
  "totalRequests": 1247,
  "avgLatency": 1834,
  "totalTokens": 458392,
  "totalCost": 12.47,
  "errorRate": 0.02,
  "avgSafetyScore": 0.94
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| totalRequests | number | Total number of requests processed |
| avgLatency | number | Average response time in milliseconds |
| totalTokens | number | Total tokens consumed |
| totalCost | number | Total cost in USD |
| errorRate | number | Error rate (0-1) |
| avgSafetyScore | number | Average safety score (0-1) |

**Status Codes:**
- `200 OK`: Metrics retrieved successfully
- `500 Internal Server Error`: Failed to fetch metrics

**Example cURL:**
```bash
curl https://llm-guardian-api.run.app/api/metrics
```

---

## Rate Limiting

Currently no rate limiting is enforced. Production deployments should implement rate limiting:

- Recommended: 100 requests per 15 minutes per IP
- Burst: 10 requests per second

## Error Handling

All errors follow this format:

```json
{
  "error": "Human-readable error message",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Technical error details"
}
```

## Security

### Prompt Injection Detection

The API automatically detects and blocks prompt injection attempts. Blocked prompts return a 403 status code.

**Detected Patterns:**
- "Ignore all previous instructions"
- "Disregard previous prompts"
- "You are now a..."
- System prompt manipulation
- Role-playing attacks
- And 10+ more patterns

### Content Safety

All responses are evaluated for safety across multiple categories:
- Hate speech
- Dangerous content
- Sexually explicit content
- Harassment

Responses with low safety scores trigger security alerts in Datadog.

## Telemetry

Every request generates telemetry data sent to Datadog:

**Logs:**
- Request/response details
- Token usage
- Latency
- Cost
- Safety scores
- User information

**Metrics:**
- `llm.request.count`
- `llm.request.latency`
- `llm.tokens.input`
- `llm.tokens.output`
- `llm.tokens.total`
- `llm.cost`
- `llm.safety.score`
- `llm.error.count`

**Security Signals:**
- Prompt injection attempts
- Unsafe content generation
- Policy violations

## Webhooks (Future)

Planned webhook support for:
- Request completion
- Security incidents
- Cost thresholds
- Error alerts

## SDK Support (Future)

Planned SDK support for:
- JavaScript/TypeScript
- Python
- Go
- Java

## Changelog

### v1.0.0 (2024-12-03)
- Initial release
- Prompt submission endpoint
- Metrics endpoint
- Health check endpoint
- Prompt injection detection
- Datadog integration

## Support

For API support:
- GitHub Issues: https://github.com/yourusername/llm-guardian/issues
- Email: api-support@llmguardian.com
- Documentation: https://docs.llmguardian.com
