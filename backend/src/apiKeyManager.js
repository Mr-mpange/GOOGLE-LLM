/**
 * API Key Management System
 * Generates and validates API keys for LLM Guardian
 */

import crypto from 'crypto';

class APIKeyManager {
  constructor() {
    // In-memory store (in production, use database)
    this.apiKeys = new Map();
    this.keyUsage = new Map();
    
    // Generate a default key for demo
    this.generateKey('demo-user', 'Demo User');
  }

  /**
   * Generate a new API key
   */
  generateKey(userId, userName = 'Unknown') {
    // Generate random key
    const randomBytes = crypto.randomBytes(32);
    const apiKey = 'llmg_' + randomBytes.toString('hex');
    
    const keyData = {
      key: apiKey,
      userId,
      userName,
      createdAt: new Date().toISOString(),
      lastUsed: null,
      requestCount: 0,
      active: true,
      rateLimit: 1000, // requests per hour
      permissions: ['read', 'write']
    };
    
    this.apiKeys.set(apiKey, keyData);
    
    console.log(`✓ Generated API key for ${userName}: ${apiKey.substring(0, 20)}...`);
    
    return keyData;
  }

  /**
   * Validate API key
   */
  validateKey(apiKey) {
    if (!apiKey || !apiKey.startsWith('llmg_')) {
      return { valid: false, error: 'Invalid API key format' };
    }

    const keyData = this.apiKeys.get(apiKey);
    
    if (!keyData) {
      return { valid: false, error: 'API key not found' };
    }

    if (!keyData.active) {
      return { valid: false, error: 'API key is inactive' };
    }

    // Check rate limit
    const usage = this.keyUsage.get(apiKey) || { count: 0, resetAt: Date.now() + 3600000 };
    
    if (Date.now() > usage.resetAt) {
      // Reset counter
      usage.count = 0;
      usage.resetAt = Date.now() + 3600000;
    }

    if (usage.count >= keyData.rateLimit) {
      return { valid: false, error: 'Rate limit exceeded' };
    }

    // Update usage
    usage.count++;
    this.keyUsage.set(apiKey, usage);
    
    // Update last used
    keyData.lastUsed = new Date().toISOString();
    keyData.requestCount++;

    return { 
      valid: true, 
      userId: keyData.userId,
      userName: keyData.userName,
      remaining: keyData.rateLimit - usage.count
    };
  }

  /**
   * Revoke API key
   */
  revokeKey(apiKey) {
    const keyData = this.apiKeys.get(apiKey);
    if (keyData) {
      keyData.active = false;
      return true;
    }
    return false;
  }

  /**
   * List all API keys for a user
   */
  listKeys(userId) {
    const keys = [];
    for (const [key, data] of this.apiKeys.entries()) {
      if (data.userId === userId) {
        keys.push({
          key: key.substring(0, 20) + '...',
          fullKey: key,
          createdAt: data.createdAt,
          lastUsed: data.lastUsed,
          requestCount: data.requestCount,
          active: data.active
        });
      }
    }
    return keys;
  }

  /**
   * Get key statistics
   */
  getKeyStats(apiKey) {
    const keyData = this.apiKeys.get(apiKey);
    if (!keyData) return null;

    const usage = this.keyUsage.get(apiKey) || { count: 0, resetAt: Date.now() + 3600000 };

    return {
      userId: keyData.userId,
      userName: keyData.userName,
      requestCount: keyData.requestCount,
      hourlyUsage: usage.count,
      rateLimit: keyData.rateLimit,
      remaining: keyData.rateLimit - usage.count,
      resetAt: new Date(usage.resetAt).toISOString(),
      active: keyData.active
    };
  }

  /**
   * Get all keys (admin only)
   */
  getAllKeys() {
    const keys = [];
    for (const [key, data] of this.apiKeys.entries()) {
      keys.push({
        key: key.substring(0, 20) + '...',
        userId: data.userId,
        userName: data.userName,
        createdAt: data.createdAt,
        lastUsed: data.lastUsed,
        requestCount: data.requestCount,
        active: data.active
      });
    }
    return keys;
  }
}

// Singleton instance
const apiKeyManager = new APIKeyManager();

export default apiKeyManager;
