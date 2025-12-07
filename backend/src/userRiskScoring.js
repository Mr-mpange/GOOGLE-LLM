/**
 * Per-User Risk Scoring System
 * Tracks user behavior and assigns risk scores
 */

class UserRiskScoring {
  constructor() {
    this.users = new Map();
  }

  /**
   * Record user activity
   */
  recordActivity(userId, activity) {
    if (!this.users.has(userId)) {
      this.users.set(userId, {
        userId,
        riskScore: 0,
        activities: [],
        injectionAttempts: 0,
        unsafePrompts: 0,
        totalRequests: 0,
        totalCost: 0,
        avgLatency: 0,
        firstSeen: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        blocked: false
      });
    }

    const user = this.users.get(userId);
    user.lastSeen = new Date().toISOString();
    user.totalRequests++;

    // Update based on activity type
    switch (activity.type) {
      case 'injection_attempt':
        user.injectionAttempts++;
        user.riskScore += 25;
        break;
      
      case 'unsafe_prompt':
        user.unsafePrompts++;
        user.riskScore += 15;
        break;
      
      case 'high_cost':
        user.totalCost += activity.cost;
        if (activity.cost > 0.01) {
          user.riskScore += 10;
        }
        break;
      
      case 'normal':
        // Reduce risk score for good behavior
        user.riskScore = Math.max(0, user.riskScore - 1);
        break;
    }

    // Cap risk score at 100
    user.riskScore = Math.min(100, user.riskScore);

    // Auto-block high-risk users
    if (user.riskScore >= 80 && !user.blocked) {
      user.blocked = true;
      user.blockedAt = new Date().toISOString();
      user.blockReason = 'High risk score (>80)';
    }

    // Store activity
    user.activities.push({
      timestamp: new Date().toISOString(),
      type: activity.type,
      details: activity.details
    });

    // Keep only last 50 activities
    if (user.activities.length > 50) {
      user.activities.shift();
    }

    return user;
  }

  /**
   * Get user risk profile
   */
  getUserRisk(userId) {
    return this.users.get(userId) || null;
  }

  /**
   * Get all users sorted by risk
   */
  getHighRiskUsers(limit = 10) {
    return Array.from(this.users.values())
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, limit);
  }

  /**
   * Check if user is blocked
   */
  isUserBlocked(userId) {
    const user = this.users.get(userId);
    return user ? user.blocked : false;
  }

  /**
   * Unblock user
   */
  unblockUser(userId) {
    const user = this.users.get(userId);
    if (user) {
      user.blocked = false;
      user.riskScore = Math.max(0, user.riskScore - 30);
      user.unblockedAt = new Date().toISOString();
    }
  }

  /**
   * Get risk level label
   */
  getRiskLevel(score) {
    if (score >= 80) return { level: 'critical', color: 'red' };
    if (score >= 60) return { level: 'high', color: 'orange' };
    if (score >= 40) return { level: 'medium', color: 'yellow' };
    if (score >= 20) return { level: 'low', color: 'blue' };
    return { level: 'minimal', color: 'green' };
  }

  /**
   * Get statistics
   */
  getStats() {
    const users = Array.from(this.users.values());
    return {
      totalUsers: users.length,
      blockedUsers: users.filter(u => u.blocked).length,
      highRiskUsers: users.filter(u => u.riskScore >= 60).length,
      avgRiskScore: users.length > 0 
        ? users.reduce((sum, u) => sum + u.riskScore, 0) / users.length 
        : 0
    };
  }
}

// Singleton instance
const userRiskScoring = new UserRiskScoring();

export default userRiskScoring;
