import { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

export default function AlertsPanel() {
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({ active: 0, investigating: 0, resolved: 0 });
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/alerts?limit=10`);
      setAlerts(response.data.alerts);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    }
  };

  const displayedAlerts = showAll ? alerts : alerts.slice(0, 3);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Alerts
        </h3>
        {stats.active > 0 && (
          <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full">
            {stats.active} Active
          </span>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No alerts</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">System is running smoothly</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {displayedAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>

          {alerts.length > 3 && (
            <button 
              onClick={() => setShowAll(!showAll)}
              className="w-full mt-4 text-sm text-datadog-purple hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium transition-colors"
            >
              {showAll ? '← Show Less' : `View All Alerts (${alerts.length}) →`}
            </button>
          )}
        </>
      )}
    </div>
  );
}

function AlertCard({ alert }) {
  const severityConfig = {
    high: {
      icon: <AlertTriangle className="w-4 h-4" />,
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      iconColor: 'text-red-500'
    },
    medium: {
      icon: <AlertCircle className="w-4 h-4" />,
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      iconColor: 'text-yellow-500'
    },
    low: {
      icon: <Info className="w-4 h-4" />,
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      iconColor: 'text-blue-500'
    }
  };

  const statusConfig = {
    active: { label: 'Active', color: 'text-red-600 dark:text-red-400' },
    investigating: { label: 'Investigating', color: 'text-yellow-600 dark:text-yellow-400' },
    resolved: { label: 'Resolved', color: 'text-green-600 dark:text-green-400' }
  };

  const config = severityConfig[alert.severity];
  const status = statusConfig[alert.status];

  return (
    <div className={`p-3 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
      <div className="flex items-start space-x-3">
        <div className={`${config.iconColor} mt-0.5`}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {alert.title}
            </p>
            <span className={`text-xs font-medium ${status.color}`}>
              {status.label}
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            {alert.message}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {alert.timeAgo || alert.timestamp}
          </p>
        </div>
      </div>
    </div>
  );
}
