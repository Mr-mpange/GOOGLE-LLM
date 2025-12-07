/**
 * In-memory alerts store for tracking system alerts
 */

class AlertsStore {
  constructor() {
    this.alerts = [];
    this.alertIdCounter = 1;
  }

  addAlert(alert) {
    const newAlert = {
      id: this.alertIdCounter++,
      timestamp: new Date().toISOString(),
      status: 'active',
      ...alert
    };
    
    this.alerts.unshift(newAlert);
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts.pop();
    }
    
    return newAlert;
  }

  updateAlertStatus(id, status) {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) {
      alert.status = status;
      alert.updatedAt = new Date().toISOString();
    }
    return alert;
  }

  getAlerts(limit = 50) {
    return this.alerts.slice(0, limit);
  }

  getActiveAlerts() {
    return this.alerts.filter(a => a.status === 'active');
  }

  clearOldAlerts(olderThanHours = 24) {
    const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    this.alerts = this.alerts.filter(alert => {
      const alertTime = new Date(alert.timestamp);
      return alertTime > cutoffTime;
    });
  }

  getAlertStats() {
    const active = this.alerts.filter(a => a.status === 'active').length;
    const investigating = this.alerts.filter(a => a.status === 'investigating').length;
    const resolved = this.alerts.filter(a => a.status === 'resolved').length;
    
    return {
      total: this.alerts.length,
      active,
      investigating,
      resolved
    };
  }
}

// Singleton instance
const alertsStore = new AlertsStore();

// Helper function to format time ago
export function getTimeAgo(timestamp) {
  const now = new Date();
  const alertTime = new Date(timestamp);
  const diffMs = now - alertTime;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

export default alertsStore;
