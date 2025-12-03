import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';

export default function AlertsPanel() {
  const alerts = [
    {
      id: 1,
      severity: 'high',
      title: 'High Latency Detected',
      message: 'Response time exceeded 5s threshold',
      timestamp: '2 min ago',
      status: 'active'
    },
    {
      id: 2,
      severity: 'medium',
      title: 'Token Usage Spike',
      message: 'Token consumption increased by 45%',
      timestamp: '15 min ago',
      status: 'investigating'
    },
    {
      id: 3,
      severity: 'low',
      title: 'Prompt Injection Blocked',
      message: 'Suspicious prompt pattern detected',
      timestamp: '1 hour ago',
      status: 'resolved'
    }
  ];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Alerts
        </h3>
        <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full">
          1 Active
        </span>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </div>

      <button className="w-full mt-4 text-sm text-datadog-purple hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium transition-colors">
        View All Alerts →
      </button>
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
            {alert.timestamp}
          </p>
        </div>
      </div>
    </div>
  );
}
