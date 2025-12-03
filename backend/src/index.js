import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { generateContent, calculateCost } from './vertexai.js';
import { sendLog, sendMetric, sendSecuritySignal } from './datadog.js';
import { detectPromptInjection, calculateSafetyScore } from './security.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Request tracking middleware
app.use((req, res, next) => {
  req.requestId = uuidv4();
  req.startTime = Date.now();
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Main LLM endpoint
app.post('/api/prompt', async (req, res) => {
  const { prompt, userId = 'anonymous', sessionId = uuidv4() } = req.body;
  const requestId = req.requestId;
  const startTime = Date.now();

  try {
    // Validate input
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Invalid prompt' });
    }

    // Security check - detect prompt injection
    const injectionDetected = detectPromptInjection(prompt);
    if (injectionDetected.isInjection) {
      const latency = Date.now() - startTime;
      
      // Log security event
      await sendSecuritySignal({
        title: 'Prompt Injection Detected',
        message: `Potential prompt injection attempt detected`,
        tags: ['security:prompt-injection', `user:${userId}`, `session:${sessionId}`],
        severity: 'high',
        metadata: {
          prompt: prompt.substring(0, 200),
          patterns: injectionDetected.patterns,
          userId,
          sessionId,
          requestId
        }
      });

      await sendMetric('llm.security.injection_blocked', 1, ['status:blocked']);
      
      return res.status(403).json({
        error: 'Prompt rejected due to security policy',
        reason: 'potential_injection',
        requestId
      });
    }

    // Call Vertex AI
    const aiResponse = await generateContent(prompt);
    const latency = Date.now() - startTime;

    // Calculate metrics
    const tokensIn = estimateTokens(prompt);
    const tokensOut = estimateTokens(aiResponse.text);
    const totalTokens = tokensIn + tokensOut;
    const cost = calculateCost(tokensIn, tokensOut);
    const safetyScore = calculateSafetyScore(aiResponse);

    // Check for unsafe content
    if (safetyScore < 0.5) {
      await sendSecuritySignal({
        title: 'Unsafe Content Generated',
        message: `Model generated content with low safety score: ${safetyScore}`,
        tags: ['security:unsafe-content', `user:${userId}`],
        severity: 'medium',
        metadata: {
          safetyScore,
          prompt: prompt.substring(0, 200),
          response: aiResponse.text.substring(0, 200),
          requestId
        }
      });
    }

    // Send telemetry to Datadog
    const logData = {
      requestId,
      userId,
      sessionId,
      prompt: prompt.substring(0, 500),
      response: aiResponse.text.substring(0, 500),
      tokensIn,
      tokensOut,
      totalTokens,
      latency,
      cost,
      safetyScore,
      model: 'gemini-pro',
      timestamp: new Date().toISOString(),
      status: 'success'
    };

    await sendLog('llm.request', logData, ['env:production', `user:${userId}`]);

    // Send metrics
    await sendMetric('llm.request.count', 1, ['status:success']);
    await sendMetric('llm.request.latency', latency, ['model:gemini-pro']);
    await sendMetric('llm.tokens.input', tokensIn, ['model:gemini-pro']);
    await sendMetric('llm.tokens.output', tokensOut, ['model:gemini-pro']);
    await sendMetric('llm.tokens.total', totalTokens, ['model:gemini-pro']);
    await sendMetric('llm.cost', cost, ['model:gemini-pro']);
    await sendMetric('llm.safety.score', safetyScore, ['model:gemini-pro']);

    // Check for high latency
    if (latency > 5000) {
      await sendLog('llm.alert.high_latency', {
        message: 'High latency detected',
        latency,
        threshold: 5000,
        requestId
      }, ['alert:high-latency']);
    }

    // Return response
    res.json({
      requestId,
      text: aiResponse.text,
      metadata: {
        tokensIn,
        tokensOut,
        totalTokens,
        latency,
        cost,
        safetyScore,
        model: 'gemini-pro'
      }
    });

  } catch (error) {
    const latency = Date.now() - startTime;
    
    console.error('Error processing prompt:', error);

    // Log error to Datadog
    await sendLog('llm.error', {
      requestId,
      userId,
      sessionId,
      error: error.message,
      stack: error.stack,
      latency,
      timestamp: new Date().toISOString()
    }, ['env:production', 'status:error']);

    await sendMetric('llm.request.count', 1, ['status:error']);
    await sendMetric('llm.error.count', 1, ['error_type:' + error.name]);

    res.status(500).json({
      error: 'Failed to process prompt',
      requestId,
      message: error.message
    });
  }
});

// Get recent metrics endpoint
app.get('/api/metrics', async (req, res) => {
  try {
    // This would query Datadog API for recent metrics
    // For demo purposes, returning mock data
    res.json({
      totalRequests: 1247,
      avgLatency: 1834,
      totalTokens: 458392,
      totalCost: 12.47,
      errorRate: 0.02,
      avgSafetyScore: 0.94
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Helper function to estimate tokens
function estimateTokens(text) {
  // Rough estimation: ~4 characters per token
  return Math.ceil(text.length / 4);
}

// Start server
app.listen(PORT, () => {
  console.log(`🛡️  LLM Guardian API running on port ${PORT}`);
  console.log(`📊 Datadog integration: ${process.env.DATADOG_API_KEY ? 'enabled' : 'disabled'}`);
  console.log(`🤖 Vertex AI project: ${process.env.GOOGLE_CLOUD_PROJECT}`);
});

export default app;
