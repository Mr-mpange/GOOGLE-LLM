# API Key Authentication Guide

## Overview

LLM Guardian uses API keys for authentication and rate limiting. Each API key:
- Starts with `llmg_` prefix
- Is 64 characters long (hex encoded)
- Has a rate limit (default: 1000 requests/hour)
- Tracks usage statistics
- Can be revoked at any time

## How to Use API Keys

### 1. Generate an API Key

**Via UI:**
1. Go to the API Keys panel in the dashboard
2. Click "Generate" button
3. Copy the key immediately (you won't see it again)

**Via API:**
```bash
curl -X POST http://localhost:8081/api/keys/generate \
  -H "Content-Type: application/json" \
  -d '{"userId": "your-user-id", "userName": "Your Name"}'
```

Response:
```json
{
  "success": true,
  "apiKey": "llmg_585cc15eff450513367ea18222c9df2e9ac265174d001aadfbd7a5c8aa754a69",
  "userId": "your-user-id",
  "userName": "Your Name",
  "createdAt": "2024-12-07T10:30:00.000Z",
  "rateLimit": 1000
}
```

### 2. Use the API Key

**Method 1: X-API-Key Header (Recommended)**
```bash
curl -X POST http://localhost:8081/api/prompt \
  -H "X-API-Key: llmg_585cc15eff450513367ea18222c9df2e9ac265174d001aadfbd7a5c8aa754a69" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain quantum computing",
    "userId": "demo-user"
  }'
```

**Method 2: Authorization Header**
```bash
curl -X POST http://localhost:8081/api/prompt \
  -H "Authorization: Bearer llmg_585cc15eff450513367ea18222c9df2e9ac265174d001aadfbd7a5c8aa754a69" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain quantum computing",
    "userId": "demo-user"
  }'
```

### 3. Check API Key Stats

```bash
curl http://localhost:8081/api/keys/stats/llmg_585cc15eff450513367ea18222c9df2e9ac265174d001aadfbd7a5c8aa754a69
```

Response:
```json
{
  "userId": "demo-user",
  "userName": "Demo User",
  "requestCount": 42,
  "hourlyUsage": 15,
  "rateLimit": 1000,
  "remaining": 985,
  "resetAt": "2024-12-07T11:30:00.000Z",
  "active": true
}
```

### 4. List Your API Keys

```bash
curl http://localhost:8081/api/keys/demo-user
```

Response:
```json
{
  "keys": [
    {
      "key": "llmg_585cc15eff4505...",
      "fullKey": "llmg_585cc15eff450513367ea18222c9df2e9ac265174d001aadfbd7a5c8aa754a69",
      "createdAt": "2024-12-07T10:30:00.000Z",
      "lastUsed": "2024-12-07T10:45:00.000Z",
      "requestCount": 42,
      "active": true
    }
  ]
}
```

### 5. Revoke an API Key

```bash
curl -X DELETE http://localhost:8081/api/keys/llmg_585cc15eff450513367ea18222c9df2e9ac265174d001aadfbd7a5c8aa754a69
```

Response:
```json
{
  "success": true,
  "message": "API key revoked"
}
```

## Rate Limiting

Each API key has a rate limit (default: 1000 requests/hour).

**When rate limit is exceeded:**
```json
{
  "error": "Invalid API key",
  "message": "Rate limit exceeded"
}
```

The rate limit resets every hour.

## Error Responses

### Missing API Key
```json
{
  "error": "API key required",
  "message": "Please provide an API key in the X-API-Key header or Authorization header"
}
```

### Invalid API Key
```json
{
  "error": "Invalid API key",
  "message": "API key not found"
}
```

### Inactive API Key
```json
{
  "error": "Invalid API key",
  "message": "API key is inactive"
}
```

## Security Best Practices

1. **Never commit API keys to version control**
   - Add `.env` to `.gitignore`
   - Use environment variables

2. **Rotate keys regularly**
   - Generate new keys periodically
   - Revoke old keys

3. **Use different keys for different environments**
   - Development key
   - Staging key
   - Production key

4. **Monitor key usage**
   - Check request counts
   - Watch for unusual activity
   - Set up alerts for high usage

5. **Revoke compromised keys immediately**
   - If a key is exposed, revoke it
   - Generate a new key
   - Update your applications

## Integration Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

const API_KEY = 'llmg_585cc15eff450513367ea18222c9df2e9ac265174d001aadfbd7a5c8aa754a69';
const API_URL = 'http://localhost:8081';

async function generateText(prompt) {
  const response = await axios.post(`${API_URL}/api/prompt`, {
    prompt,
    userId: 'demo-user'
  }, {
    headers: {
      'X-API-Key': API_KEY
    }
  });
  
  return response.data;
}

generateText('Explain AI').then(console.log);
```

### Python
```python
import requests

API_KEY = 'llmg_585cc15eff450513367ea18222c9df2e9ac265174d001aadfbd7a5c8aa754a69'
API_URL = 'http://localhost:8081'

def generate_text(prompt):
    response = requests.post(
        f'{API_URL}/api/prompt',
        json={'prompt': prompt, 'userId': 'demo-user'},
        headers={'X-API-Key': API_KEY}
    )
    return response.json()

result = generate_text('Explain AI')
print(result)
```

### cURL
```bash
#!/bin/bash

API_KEY="llmg_585cc15eff450513367ea18222c9df2e9ac265174d001aadfbd7a5c8aa754a69"
API_URL="http://localhost:8081"

curl -X POST "$API_URL/api/prompt" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain AI",
    "userId": "demo-user"
  }'
```

## Default Demo Key

For testing purposes, a demo key is automatically generated on server start:

**User ID**: `demo-user`
**User Name**: `Demo User`

You can find this key in the server logs or by listing keys for `demo-user`.

## Production Considerations

For production deployments:

1. **Use a database** instead of in-memory storage
   - PostgreSQL
   - MongoDB
   - Redis

2. **Implement key encryption**
   - Hash keys before storing
   - Use bcrypt or similar

3. **Add more granular permissions**
   - Read-only keys
   - Write-only keys
   - Admin keys

4. **Implement IP whitelisting**
   - Restrict keys to specific IPs
   - Add CIDR range support

5. **Add webhook notifications**
   - Alert on key creation
   - Alert on key revocation
   - Alert on rate limit exceeded

6. **Implement key expiration**
   - Auto-expire after X days
   - Require renewal

7. **Add audit logging**
   - Log all key operations
   - Track who created/revoked keys
   - Monitor suspicious activity

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/keys/generate` | Generate new API key |
| GET | `/api/keys/:userId` | List keys for user |
| GET | `/api/keys/stats/:apiKey` | Get key statistics |
| DELETE | `/api/keys/:apiKey` | Revoke API key |
| POST | `/api/prompt` | Use API (requires key) |

## Support

For issues or questions:
- Check server logs for errors
- Verify API key format (starts with `llmg_`)
- Ensure rate limit not exceeded
- Check key is active (not revoked)
