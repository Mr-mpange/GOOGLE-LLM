/**
 * Authentication Middleware
 * Validates API keys for protected routes
 */

import apiKeyManager from './apiKeyManager.js';

/**
 * Middleware to validate API key
 */
export function requireApiKey(req, res, next) {
  // Get API key from header
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');

  if (!apiKey) {
    return res.status(401).json({
      error: 'API key required',
      message: 'Please provide an API key in the X-API-Key header or Authorization header'
    });
  }

  // Validate key
  const validation = apiKeyManager.validateKey(apiKey);

  if (!validation.valid) {
    return res.status(403).json({
      error: 'Invalid API key',
      message: validation.error
    });
  }

  // Attach user info to request
  req.apiKey = apiKey;
  req.userId = validation.userId;
  req.userName = validation.userName;
  req.rateLimitRemaining = validation.remaining;

  next();
}

/**
 * Optional API key (doesn't block if missing)
 */
export function optionalApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');

  if (apiKey) {
    const validation = apiKeyManager.validateKey(apiKey);
    if (validation.valid) {
      req.apiKey = apiKey;
      req.userId = validation.userId;
      req.userName = validation.userName;
      req.rateLimitRemaining = validation.remaining;
    }
  }

  next();
}

export default { requireApiKey, optionalApiKey };
