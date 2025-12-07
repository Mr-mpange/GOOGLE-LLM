/**
 * API Key Management System
 * Allows admins to create, manage, and revoke API keys for external users
 */

import crypto from 'crypto';

class APIKeyManager {
  constructor() {
    this.apiKeys = new Map();
    this.usage = new Map();
    
    // Create a default admin key
    this.createKey('admin', 'Admin User', { admin: true, unlimited: true });
  }

  /**
   * Generate a new API key
   */
  generateKey() {
    return 'llmg_' + crypto.randomBytes(32).toString('hex');
  }

  /**
   * Create a new API key
   */
  createKey(userId, name, options = {}) {
    const key = this.generateKey();
    const keyData = {
      key,
      userId,
      name,
      createdAt: new Date().toISOString(),
      lastUsed: null,
      status: 'active',
      permissions: {
        admin: options.admin || false,
        canPrompt: options.canPrompt !== false,
        canViewMetrics: options.canViewMetrics !== false,
        canManageKeys: options.canManageKeys || false
      },
      limits: {
        requestsPerDay: options.requestsPerDay || 1000,
        requestsPerMonth: options.requestsPerMonth || 30000,
        maxTokensPerRequest: options.maxTokensPerRequest || 5000,
        unlimited: options.unlimited || false
      },
      metadata: options.metadata || {}
    };

    this.apiKeys.set(key, keyData);
    this.usage.set(key, {
      requestsToday: 0,
      requestsThisMonth: 0,
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      lastReset: new Date().toISOString()
    });

    return keyData;
  }

  /**
   * Validate API key
   */
  validateKey(key) {
    const keyData = this.apiKeys.get(key);
    
    if (!keyData) {
      return { valid: false, error: 'Invalid API key' };
    }

    if (keyData.status !== 'active') {
      return { valid: false, error: 'API key is inactive' };
    }

    const usage = this.usage.get(key);
    
    // Check rate limits
    if (!keyData.limits.unlimited) {
      if (usage.requestsToday >= keyData.limits.requestsPerDay) {
        return { valid: false, error: 'Daily request limit exceeded' };
      }
      if (usage.requestsThisMonth >= keyData.limits.requestsPerMonth) {
        return { valid: false, error: 'Monthly request limit exceeded' };
      }
    }

    return { valid: true, keyData, usage };
  }

  /**
   * Record API key usage
   */
  recordUsage(key, tokens, cost) {
    const usage = this.usage.get(key);
    const keyData = this.apiKeys.get(key);
    
    if (usage && keyData) {
      usage.requestsToday++;
      usage.requestsThisMonth++;
      usage.totalRequests++;
      usage.totalTokens += tokens;
      usage.totalCost += cost;
      
      keyData.lastUsed = new Date().toISOString();
    }
  }

  /**
   * Get all API keys (admin only)
   */
  getAllKeys() {
    const keys = [];
    for (const [key, data] of this.apiKeys.entries()) {
      const usage = this.usage.get(key);
      keys.push({
        ...data,
        key: this.maskKey(key),
        fullKey: key,
        usage
      });
    }
    return keys;
  }

  /**
   * Get API key details
   */
  getKeyDetails(key) {
    const keyData = this.apiKeys.get(key);
    const usage = this.usage.get(key);
    
    if (!keyData) return null;
    
    return {
      ...keyData,
      key: this.maskKey(key),
      usage
    };
  }

  /**
   * Revoke API key
   */
  revokeKey(key) {
    const keyData = this.apiKeys.get(key);
    if (keyData) {
      keyData.status = 'revoked';
      keyData.revokedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  /**
   * Delete API key
   */
  deleteKey(key) {
    this.apiKeys.delete(key);
    this.usage.delete(key);
    return true;
  }

  /**
   * Update API key limits
   */
  updateLimits(key, limits) {
    const keyData = this.apiKeys.get(key);
    if (keyData) {
      keyData.limits = { ...keyData.limits, ...limits };
      return true;
    }
    return false;
  }

  /**
   * Mask API key for display
   */
  maskKey(key) {
    if (!key) return '';
    return key.substring(0, 12) + '...' + key.substring(key.length - 4);
  }

  /**
   * Reset daily usage counters
   */
  resetDailyUsage() {
    for (const usage of this.usage.values()) {
      usage.requestsToday = 0;
    }
  }

  /**
   * Reset monthly usage counters
   */
  resetMonthlyUsage() {
    for (const usage of this.usage.values()) {
      usage.requestsThisMonth = 0;
    }
  }

  /**
   * Get usage statistics
   */
  getUsageStats() {
    let totalRequests = 0;
    let totalTokens = 0;
    let totalCost = 0;
    let activeKeys = 0;

    for (const [key, keyData] of this.apiKeys.entries()) {
      if (keyData.status === 'active') {
        activeKeys++;
        const usage = this.usage.get(key);
        if (usage) {
          totalRequests += usage.totalRequests;
          totalTokens += usage.totalTokens;
          totalCost += usage.totalCost;
        }
      }
    }

    return {
      totalKeys: this.apiKeys.size,
      activeKeys,
      totalRequests,
      totalTokens,
      totalCost: parseFloat(totalCost.toFixed(4))
    };
  }
}

// Singleton instance
const apiKeyManager = new APIKeyManager();

export default apiKeyManager;
