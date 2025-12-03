import { DollarSign, Zap, Database, Shield } from 'lucide-react';

export default function MetricsPanel({ metrics }) {
  if (!metrics) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Live Metrics
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Send a prompt to see metrics
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Live Metrics
      </h3>

      <div className="space-y-4">
        <MetricRow
          icon={<Zap className="w-5 h-5 text-yellow-500" />}
          label="Avg Latency"
          value={`${metrics.avgLatency}ms`}
          trend="+5%"
          trendUp={false}
        />

        <MetricRow
          icon={<Database className="w-5 h-5 text-blue-500" />}
          label="Total Tokens"
          value={metrics.totalTokens.toLocaleString()}
          trend="+12%"
          trendUp={true}
        />

        <MetricRow
          icon={<DollarSign className="w-5 h-5 text-green-500" />}
          label="Total Cost"
          value={`$${metrics.totalCost.toFixed(2)}`}
          trend="+8%"
          trendUp={true}
        />

        <MetricRow
          icon={<Shield className="w-5 h-5 text-purple-500" />}
          label="Safety Score"
          value={`${(metrics.avgSafetyScore * 100).toFixed(0)}%`}
          trend="+2%"
          trendUp={true}
        />
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Error Rate</span>
          <span className={`font-semibold ${
            metrics.errorRate < 0.05 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {(metrics.errorRate * 100).toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}

function MetricRow({ icon, label, value, trend, trendUp }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
          {icon}
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
        <p className={`text-xs ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
          {trend}
        </p>
      </div>
    </div>
  );
}
