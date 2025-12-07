/**
 * In-memory metrics store for tracking application metrics
 * In production, this would be replaced with a proper database or time-series DB
 */

class MetricsStore {
  constructor() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalLatency: 0,
      totalTokensIn: 0,
      totalTokensOut: 0,
      totalCost: 0,
      safetyScores: [],
      recentRequests: []
    };
    
    // Time-series data for charts (last 24 hours)
    this.timeSeries = {
      latency: [],
      tokens: []
    };
  }

  recordRequest(data) {
    this.metrics.totalRequests++;
    
    const timestamp = new Date();
    
    if (data.status === 'success') {
      this.metrics.successfulRequests++;
      this.metrics.totalLatency += data.latency;
      this.metrics.totalTokensIn += data.tokensIn;
      this.metrics.totalTokensOut += data.tokensOut;
      this.metrics.totalCost += data.cost;
      this.metrics.safetyScores.push(data.safetyScore);
      
      // Record time-series data
      this.timeSeries.latency.push({
        timestamp: timestamp.toISOString(),
        value: data.latency
      });
      
      this.timeSeries.tokens.push({
        timestamp: timestamp.toISOString(),
        input: data.tokensIn,
        output: data.tokensOut
      });
      
      // Keep only last 100 data points for charts
      if (this.timeSeries.latency.length > 100) {
        this.timeSeries.latency.shift();
      }
      if (this.timeSeries.tokens.length > 100) {
        this.timeSeries.tokens.shift();
      }
      
      // Keep only last 100 safety scores
      if (this.metrics.safetyScores.length > 100) {
        this.metrics.safetyScores.shift();
      }
    } else {
      this.metrics.failedRequests++;
    }

    // Store recent request (keep last 50)
    this.metrics.recentRequests.push({
      timestamp: timestamp.toISOString(),
      ...data
    });
    
    if (this.metrics.recentRequests.length > 50) {
      this.metrics.recentRequests.shift();
    }
  }

  getMetrics() {
    const avgLatency = this.metrics.successfulRequests > 0
      ? Math.round(this.metrics.totalLatency / this.metrics.successfulRequests)
      : 0;

    const avgSafetyScore = this.metrics.safetyScores.length > 0
      ? this.metrics.safetyScores.reduce((a, b) => a + b, 0) / this.metrics.safetyScores.length
      : 0;

    const errorRate = this.metrics.totalRequests > 0
      ? this.metrics.failedRequests / this.metrics.totalRequests
      : 0;

    const totalTokens = this.metrics.totalTokensIn + this.metrics.totalTokensOut;

    return {
      totalRequests: this.metrics.totalRequests,
      successfulRequests: this.metrics.successfulRequests,
      failedRequests: this.metrics.failedRequests,
      avgLatency,
      totalTokens,
      totalTokensIn: this.metrics.totalTokensIn,
      totalTokensOut: this.metrics.totalTokensOut,
      totalCost: parseFloat(this.metrics.totalCost.toFixed(4)),
      avgSafetyScore: parseFloat(avgSafetyScore.toFixed(2)),
      errorRate: parseFloat(errorRate.toFixed(4)),
      recentRequests: this.metrics.recentRequests.slice(-10), // Last 10 requests
      timeSeries: {
        latency: this.timeSeries.latency,
        tokens: this.timeSeries.tokens
      }
    };
  }

  reset() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalLatency: 0,
      totalTokensIn: 0,
      totalTokensOut: 0,
      totalCost: 0,
      safetyScores: [],
      recentRequests: []
    };
    
    this.timeSeries = {
      latency: [],
      tokens: []
    };
  }
}

// Singleton instance
const metricsStore = new MetricsStore();

export default metricsStore;
