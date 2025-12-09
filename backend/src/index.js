// Load configuration first (this loads .env)
import { config } from './config.js';

import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { generateContent, calculateCost, setModel, getCurrentModel } from './vertexai.js';
import { sendLog, sendMetric, sendSecuritySignal } from './datadog.js';
import { detectPromptInjection, calculateSafetyScore } from './security.js';
import { formatResponse, toHTML, toMarkdown } from './responseFormatter.js';
import metricsStore from './metricsStore.js';
import alertsStore, { getTimeAgo } from './alertsStore.js';
import selfHealingSystem from './selfHealing.js';
import apiKeyManager from './apiKeyManager.js';
import { optionalApiKey } from './authMiddleware.js';
import apiKeyManager from './apiKeyManager.js';
import userManager from './userManager.js';
import userRiskScoring from './userRiskScoring.js';

const app = express();
const PORT = config.port;

// Middleware
app.use(cors());
app.use(express.json());

// Request tracking middleware
app.use((req, res, next) => {
  req.requestId = uuidv4();
  req.startTime = Date.now();
  next();
});

// API Key validation middleware
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  
  // Skip validation for health check and public endpoints
  if (req.path === '/health' || req.path.startsWith('/api/keys')) {
    return next();
  }
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  const validation = apiKeyManager.validateKey(apiKey);
  
  if (!validation.valid) {
    return res.status(403).json({ error: validation.error });
  }

  req.apiKey = apiKey;
  req.keyData = validation.keyData;
  req.keyUsage = validation.usage;
  
  next();
};

// Apply API key validation to protected routes
app.use('/api/prompt', validateApiKey);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Main LLM endpoint (with optional API key)
app.post('/api/prompt', optionalApiKey, async (req, res) => {
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
      
      // Record user risk
      userRiskScoring.recordActivity(userId, {
        type: 'injection_attempt',
        details: { patterns: injectionDetected.patterns }
      });
      
      // Add security alert
      alertsStore.addAlert({
        severity: 'high',
        title: 'Prompt Injection Blocked',
        message: `User ${userId} attempted prompt injection`,
        metadata: {
          patterns: injectionDetected.patterns,
          userId,
          requestId,
          riskScore: userRiskScoring.getUserRisk(userId)?.riskScore
        }
      });
      
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

    // Check if user is blocked
    if (userRiskScoring.isUserBlocked(userId)) {
      return res.status(403).json({
        error: 'User blocked due to high risk score',
        reason: 'user_blocked',
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
      model: getCurrentModel(),
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
      alertsStore.addAlert({
        severity: 'high',
        title: 'High Latency Detected',
        message: `Response time exceeded 5s threshold (${latency}ms)`,
        metadata: { latency, threshold: 5000, requestId }
      });
      
      await sendLog('llm.alert.high_latency', {
        message: 'High latency detected',
        latency,
        threshold: 5000,
        requestId
      }, ['alert:high-latency']);
    }

    // Check for low safety score
    if (safetyScore < 0.7) {
      userRiskScoring.recordActivity(userId, {
        type: 'unsafe_prompt',
        details: { safetyScore }
      });
      
      alertsStore.addAlert({
        severity: 'medium',
        title: 'Low Safety Score',
        message: `User ${userId} generated unsafe content (${(safetyScore * 100).toFixed(0)}%)`,
        metadata: { safetyScore, requestId, userId }
      });
    } else {
      // Record normal activity (reduces risk score)
      userRiskScoring.recordActivity(userId, {
        type: 'normal',
        details: { safetyScore, cost }
      });
    }

    // Check for high cost
    if (cost > 0.01) {
      userRiskScoring.recordActivity(userId, {
        type: 'high_cost',
        cost,
        details: { tokensOut }
      });
    }

    // Record API key usage
    if (req.apiKey) {
      apiKeyManager.recordUsage(req.apiKey, totalTokens, cost);
    }

    // Record metrics
    metricsStore.recordRequest({
      status: 'success',
      latency,
      tokensIn,
      tokensOut,
      cost,
      safetyScore
    });

    // Self-healing analysis
    const healingResult = await selfHealingSystem.analyzeAndHeal({
      latency,
      tokensIn,
      tokensOut,
      cost,
      safetyScore
    });

    // Apply model switch if healing triggered it
    if (healingResult.actions && healingResult.actions.length > 0) {
      for (const action of healingResult.actions) {
        if (action.action === 'switch_model' && action.to) {
          setModel(action.to);
        }
      }
    }

    // Format response with structure
    const structuredResponse = formatResponse(aiResponse.text);
    const htmlResponse = toHTML(structuredResponse);
    const markdownResponse = toMarkdown(structuredResponse);

    // Return response
    res.json({
      requestId,
      text: aiResponse.text,
      formatted: {
        html: htmlResponse,
        markdown: markdownResponse,
        structured: structuredResponse
      },
      metadata: {
        tokensIn,
        tokensOut,
        totalTokens,
        latency,
        cost,
        safetyScore,
        model: getCurrentModel()
      }
    });

  } catch (error) {
    const latency = Date.now() - startTime;
    
    console.error('\n❌ ERROR processing prompt:');
    console.error('Message:', error.message);
    console.error('Type:', error.name);
    console.error('Stack:', error.stack);
    console.error('');

    // Record error in metrics
    metricsStore.recordRequest({
      status: 'error',
      latency,
      tokensIn: 0,
      tokensOut: 0,
      cost: 0,
      safetyScore: 0
    });

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
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get recent metrics endpoint
app.get('/api/metrics', async (req, res) => {
  try {
    const metrics = metricsStore.getMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Get alerts endpoint
app.get('/api/alerts', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const alerts = alertsStore.getAlerts(limit).map(alert => ({
      ...alert,
      timeAgo: getTimeAgo(alert.timestamp)
    }));
    
    const stats = alertsStore.getAlertStats();
    
    res.json({
      alerts,
      stats
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Update alert status endpoint
app.patch('/api/alerts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['active', 'investigating', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const alert = alertsStore.updateAlertStatus(parseInt(id), status);
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

// Get self-healing status
app.get('/api/self-healing', async (req, res) => {
  try {
    const history = selfHealingSystem.getHealingHistory(20);
    const currentModel = getCurrentModel(); // Get from vertexai.js
    
    res.json({
      currentModel,
      history,
      enabled: true
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch self-healing status' });
  }
});

// Get user risk scores
app.get('/api/users/risk', async (req, res) => {
  try {
    const highRiskUsers = userRiskScoring.getHighRiskUsers(20);
    const stats = userRiskScoring.getStats();
    
    res.json({
      users: highRiskUsers.map(user => ({
        ...user,
        riskLevel: userRiskScoring.getRiskLevel(user.riskScore)
      })),
      stats
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user risk data' });
  }
});

// Get specific user risk
app.get('/api/users/:userId/risk', async (req, res) => {
  try {
    const { userId } = req.params;
    const userRisk = userRiskScoring.getUserRisk(userId);
    
    if (!userRisk) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      ...userRisk,
      riskLevel: userRiskScoring.getRiskLevel(userRisk.riskScore)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user risk' });
  }
});

// API Key Management Endpoints

// Create new API key
app.post('/api/keys/create', async (req, res) => {
  try {
    const { userId, name, permissions, limits } = req.body;
    
    if (!userId || !name) {
      return res.status(400).json({ error: 'userId and name are required' });
    }

    const keyData = apiKeyManager.createKey(userId, name, {
      ...permissions,
      ...limits
    });

    res.json({
      success: true,
      key: keyData.key,
      maskedKey: apiKeyManager.maskKey(keyData.key),
      keyData: {
        ...keyData,
        key: undefined // Don't send full key in response after creation
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create API key' });
  }
});

// List all API keys
app.get('/api/keys', async (req, res) => {
  try {
    const keys = apiKeyManager.getAllKeys();
    res.json({ keys });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch API keys' });
  }
});

// Get API key details
app.get('/api/keys/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const keyDetails = apiKeyManager.getKeyDetails(key);
    
    if (!keyDetails) {
      return res.status(404).json({ error: 'API key not found' });
    }
    
    res.json(keyDetails);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch API key details' });
  }
});

// Revoke API key
app.post('/api/keys/:key/revoke', async (req, res) => {
  try {
    const { key } = req.params;
    const success = apiKeyManager.revokeKey(key);
    
    if (!success) {
      return res.status(404).json({ error: 'API key not found' });
    }
    
    res.json({ success: true, message: 'API key revoked' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to revoke API key' });
  }
});

// Delete API key
app.delete('/api/keys/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const success = apiKeyManager.deleteKey(key);
    
    if (!success) {
      return res.status(404).json({ error: 'API key not found' });
    }
    
    res.json({ success: true, message: 'API key deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete API key' });
  }
});

// Update API key limits
app.patch('/api/keys/:key/limits', async (req, res) => {
  try {
    const { key } = req.params;
    const { limits } = req.body;
    
    const success = apiKeyManager.updateLimits(key, limits);
    
    if (!success) {
      return res.status(404).json({ error: 'API key not found' });
    }
    
    res.json({ success: true, message: 'Limits updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update limits' });
  }
});

// Get usage statistics
app.get('/api/keys/stats/usage', async (req, res) => {
  try {
    const stats = apiKeyManager.getUsageStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch usage stats' });
  }
});

// User Management Endpoints

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = userManager.login(email, password);
    
    if (!result.success) {
      return res.status(401).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout
app.post('/api/auth/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      userManager.logout(token);
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Get current user
app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const validation = userManager.validateSession(token);
    
    if (!validation.valid) {
      return res.status(401).json({ error: validation.error });
    }

    res.json({ user: validation.user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Create user
app.post('/api/users', async (req, res) => {
  try {
    const { email, password, name, role, company, department } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name required' });
    }

    // Check if user exists
    if (userManager.getUserByEmail(email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = userManager.createUser({
      email,
      password,
      name,
      role: role || 'user',
      company,
      department
    });

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = userManager.getAllUsers();
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = userManager.getUserById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user
app.patch('/api/users/:id', async (req, res) => {
  try {
    const user = userManager.updateUser(req.params.id, req.body);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const success = userManager.deleteUser(req.params.id);
    
    if (!success) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Suspend user
app.post('/api/users/:id/suspend', async (req, res) => {
  try {
    const success = userManager.suspendUser(req.params.id);
    
    if (!success) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to suspend user' });
  }
});

// Activate user
app.post('/api/users/:id/activate', async (req, res) => {
  try {
    const success = userManager.activateUser(req.params.id);
    
    if (!success) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to activate user' });
  }
});

// Change password
app.post('/api/users/:id/password', async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Old and new password required' });
    }

    const result = userManager.changePassword(req.params.id, oldPassword, newPassword);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Get user statistics
app.get('/api/users/stats/overview', async (req, res) => {
  try {
    const stats = userManager.getUserStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

// Get active sessions
app.get('/api/users/sessions/active', async (req, res) => {
  try {
    const sessions = userManager.getActiveSessions();
    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Generate API key
app.post('/api/keys/generate', async (req, res) => {
  try {
    const { userId, userName } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const keyData = apiKeyManager.generateKey(userId, userName || userId);
    
    res.json({
      success: true,
      apiKey: keyData.key,
      userId: keyData.userId,
      userName: keyData.userName,
      createdAt: keyData.createdAt,
      rateLimit: keyData.rateLimit
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate API key' });
  }
});

// List API keys for user
app.get('/api/keys/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const keys = apiKeyManager.listKeys(userId);
    
    res.json({ keys });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch API keys' });
  }
});

// Get API key stats
app.get('/api/keys/stats/:apiKey', async (req, res) => {
  try {
    const { apiKey } = req.params;
    const stats = apiKeyManager.getKeyStats(apiKey);
    
    if (!stats) {
      return res.status(404).json({ error: 'API key not found' });
    }
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch key stats' });
  }
});

// Revoke API key
app.delete('/api/keys/:apiKey', async (req, res) => {
  try {
    const { apiKey } = req.params;
    const success = apiKeyManager.revokeKey(apiKey);
    
    if (!success) {
      return res.status(404).json({ error: 'API key not found' });
    }
    
    res.json({ success: true, message: 'API key revoked' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to revoke API key' });
  }
});

// Manual model switch
app.post('/api/model/switch', async (req, res) => {
  try {
    const { model } = req.body;
    
    const validModels = ['gemini-2.0-flash-exp', 'gemini-1.5-flash', 'gemini-1.5-pro'];
    if (!validModels.includes(model)) {
      return res.status(400).json({ error: 'Invalid model' });
    }
    
    const previousModel = getCurrentModel();
    
    // Actually switch the model
    setModel(model);
    
    // Update self-healing system
    const modelConfig = selfHealingSystem.models.find(m => m.name === model);
    if (modelConfig) {
      selfHealingSystem.currentModel = modelConfig;
    }
    
    // Create alert
    alertsStore.addAlert({
      severity: 'low',
      title: 'Model Switched Manually',
      message: `Switched from ${previousModel} to ${model}`,
      metadata: { from: previousModel, to: model, action: 'manual_switch' }
    });
    
    res.json({ success: true, model, previousModel });
  } catch (error) {
    res.status(500).json({ error: 'Failed to switch model' });
  }
});

// Helper function to estimate tokens
function estimateTokens(text) {
  // Rough estimation: ~4 characters per token
  return Math.ceil(text.length / 4);
}

// Start server with error handling
const server = app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('🛡️  LLM Guardian API');
  console.log('========================================');
  console.log(`✓ Server running on: http://localhost:${PORT}`);
  console.log(`✓ Health check: http://localhost:${PORT}/health`);
  console.log(`✓ Datadog integration: ${config.datadog.apiKey ? 'enabled' : 'disabled'}`);
  console.log(`✓ Vertex AI project: ${config.googleCloud.project}`);
  console.log('========================================\n');
  console.log('Press Ctrl+C to stop the server\n');
});

// Handle port already in use error
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error('\n❌ ERROR: Port 8080 is already in use!\n');
    console.error('Solutions:');
    console.error('  1. Run STOP_ALL.bat to stop all servers');
    console.error('  2. Or change PORT in backend/.env to a different port (e.g., 8081)');
    console.error('  3. Or manually kill the process using port 8080:\n');
    console.error('     netstat -ano | findstr :8080');
    console.error('     taskkill /F /PID <PID>\n');
    process.exit(1);
  } else {
    console.error('Server error:', error);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nShutting down gracefully...');
  server.close(() => {
    console.log('✓ Server closed');
    process.exit(0);
  });
});

export default app;
