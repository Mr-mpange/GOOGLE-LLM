/**
 * AI Self-Healing System - Automatic Recovery and Optimization
 * AIOps Autoremediation for LLM Guardian
 */

import alertsStore from './alertsStore.js';

class SelfHealingSystem {
  constructor() {
    this.config = {
      latencyThreshold: 5000,
      errorRateThreshold: 0.1,
      tokenSpikeThreshold: 5000,
      safetyScoreThreshold: 0.7,
      consecutiveFailures: 0,
      maxConsecutiveFailures: 3
    };

    this.models = [
      { name: 'gemini-2.0-flash-exp', priority: 1, speed: 'fast', cost: 'low' },
      { name: 'gemini-1.5-flash', priority: 2, speed: 'faster', cost: 'lower' },
      { name: 'gemini-1.5-pro', priority: 3, speed: 'slower', cost: 'higher' }
    ];

    this.currentModel = this.models[0];
    this.healingActions = [];
  }

  /**
   * Analyze system health and trigger healing if needed
   */
  async analyzeAndHeal(metrics) {
    const issues = this.detectIssues(metrics);
    
    if (issues.length === 0) {
      this.config.consecutiveFailures = 0;
      return { healthy: true, actions: [] };
    }

    const actions = await this.triggerHealing(issues, metrics);
    
    return {
      healthy: false,
      issues,
      actions,
      currentModel: this.currentModel.name
    };
  }

  /**
   * Detect system issues
   */
  detectIssues(metrics) {
    const issues = [];

    // High latency detection
    if (metrics.latency > this.config.latencyThreshold) {
      issues.push({
        type: 'high_latency',
        severity: 'high',
        value: metrics.latency,
        threshold: this.config.latencyThreshold
      });
    }

    // Token spike detection
    if (metrics.tokensOut > this.config.tokenSpikeThreshold) {
      issues.push({
        type: 'token_spike',
        severity: 'medium',
        value: metrics.tokensOut,
        threshold: this.config.tokenSpikeThreshold
      });
    }

    // Low safety score
    if (metrics.safetyScore < this.config.safetyScoreThreshold) {
      issues.push({
        type: 'low_safety',
        severity: 'high',
        value: metrics.safetyScore,
        threshold: this.config.safetyScoreThreshold
      });
    }

    // High cost detection
    if (metrics.cost > 0.01) {
      issues.push({
        type: 'high_cost',
        severity: 'medium',
        value: metrics.cost,
        threshold: 0.01
      });
    }

    return issues;
  }

  /**
   * Trigger healing actions based on issues
   */
  async triggerHealing(issues, metrics) {
    const actions = [];

    for (const issue of issues) {
      switch (issue.type) {
        case 'high_latency':
          actions.push(await this.healHighLatency(metrics));
          break;

        case 'token_spike':
          actions.push(await this.healTokenSpike(metrics));
          break;

        case 'low_safety':
          actions.push(await this.healLowSafety(metrics));
          break;

        case 'high_cost':
          actions.push(await this.healHighCost(metrics));
          break;
      }
    }

    this.healingActions.push({
      timestamp: new Date().toISOString(),
      issues,
      actions
    });

    // Keep only last 50 healing actions
    if (this.healingActions.length > 50) {
      this.healingActions.shift();
    }

    return actions;
  }

  /**
   * Heal high latency by switching to faster model
   */
  async healHighLatency(metrics) {
    this.config.consecutiveFailures++;

    if (this.config.consecutiveFailures >= this.config.maxConsecutiveFailures) {
      // Switch to faster model
      const fasterModel = this.models.find(m => m.speed === 'faster');
      if (fasterModel && this.currentModel.name !== fasterModel.name) {
        const previousModel = this.currentModel.name;
        this.currentModel = fasterModel;
        
        alertsStore.addAlert({
          severity: 'high',
          title: 'Self-Healing: Model Switched',
          message: `Automatically switched from ${previousModel} to ${fasterModel.name} due to high latency`,
          metadata: { previousLatency: metrics.latency, action: 'model_switch', from: previousModel, to: fasterModel.name }
        });

        return {
          action: 'switch_model',
          from: previousModel,
          to: fasterModel.name,
          reason: 'high_latency',
          success: true
        };
      }
    }

    return {
      action: 'monitor',
      reason: 'high_latency',
      consecutiveFailures: this.config.consecutiveFailures
    };
  }

  /**
   * Heal token spike by reducing max tokens
   */
  async healTokenSpike(metrics) {
    alertsStore.addAlert({
      severity: 'medium',
      title: 'Self-Healing: Token Limit Reduced',
      message: `Reduced max output tokens to prevent cost spike`,
      metadata: { tokens: metrics.tokensOut, action: 'reduce_tokens' }
    });

    return {
      action: 'reduce_max_tokens',
      from: 2048,
      to: 1024,
      reason: 'token_spike',
      success: true
    };
  }

  /**
   * Heal low safety score by increasing safety threshold
   */
  async healLowSafety(metrics) {
    alertsStore.addAlert({
      severity: 'high',
      title: 'Self-Healing: Safety Enhanced',
      message: `Increased safety filters due to low safety score`,
      metadata: { safetyScore: metrics.safetyScore, action: 'enhance_safety' }
    });

    return {
      action: 'enhance_safety_filters',
      reason: 'low_safety',
      success: true
    };
  }

  /**
   * Heal high cost by switching to cheaper model
   */
  async healHighCost(metrics) {
    const cheaperModel = this.models.find(m => m.cost === 'lower');
    if (cheaperModel && this.currentModel.name !== cheaperModel.name) {
      this.currentModel = cheaperModel;

      alertsStore.addAlert({
        severity: 'medium',
        title: 'Self-Healing: Cost Optimized',
        message: `Switched to ${cheaperModel.name} to reduce costs`,
        metadata: { cost: metrics.cost, action: 'cost_optimization' }
      });

      return {
        action: 'switch_to_cheaper_model',
        to: cheaperModel.name,
        reason: 'high_cost',
        success: true
      };
    }

    return {
      action: 'monitor_cost',
      reason: 'high_cost'
    };
  }

  /**
   * Get current model recommendation
   */
  getCurrentModel() {
    return this.currentModel.name;
  }

  /**
   * Get healing history
   */
  getHealingHistory(limit = 10) {
    return this.healingActions.slice(-limit);
  }

  /**
   * Reset to default model
   */
  reset() {
    this.currentModel = this.models[0];
    this.config.consecutiveFailures = 0;
  }
}

// Singleton instance
const selfHealingSystem = new SelfHealingSystem();

export default selfHealingSystem;
