import { useState, useEffect } from 'react';
import { DollarSign, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

export default function CostOptimizationPanel() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/metrics`);
      setMetrics(response.data);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  const avgCostPerRequest = metrics?.totalRequests > 0 
    ? (metrics.totalCost / metrics.totalRequests).toFixed(6)
    : 0;

  const projectedMonthlyCost = metrics?.totalRequests > 0
    ? ((metrics.totalCost / metrics.totalRequests) * 100000).toFixed(2)
    : 0;

  const costStatus = avgCostPerRequest < 0.001 ? 'optimal' : avgCostPerRequest < 0.01 ? 'good' : 'high';

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-green-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Cost Optimization
          </h3>
        </div>
        <StatusBadge status={costStatus} />
      </div>

      {/* Cost Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <MetricCard
          label="Total Cost"
          value={`$${metrics?.totalCost?.toFixed(4) || '0.0000'}`}
          icon={<DollarSign className="w-4 h-4" />}
          color="green"
        />
        <MetricCard
          label="Avg/Request"
          value={`$${avgCostPerRequest}`}
          icon={<TrendingDown className="w-4 h-4" />}
          color="blue"
        />
      </div>

      {/* Projections */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              Projected Monthly (100K req)
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
              ${projectedMonthlyCost}
            </p>
          </div>
          <TrendingDown className="w-6 h-6 text-blue-500" />
        </div>
      </div>

      {/* Optimization Tips */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-2">
          Active Optimizations:
        </p>
        <OptimizationTip
          active={true}
          text="Auto-switch to cheaper models"
        />
        <OptimizationTip
          active={true}
          text="Token limit enforcement"
        />
        <OptimizationTip
          active={metrics?.totalCost > 0.1}
          text="High-cost prompt detection"
        />
      </div>

      {/* Cost Breakdown */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Token Usage:
        </p>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">Input Tokens:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {metrics?.totalTokensIn?.toLocaleString() || 0}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">Output Tokens:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {metrics?.totalTokensOut?.toLocaleString() || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    optimal: { label: 'Optimal', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
    good: { label: 'Good', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
    high: { label: 'High', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' }
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${config[status].color}`}>
      {config[status].label}
    </span>
  );
}

function MetricCard({ label, value, icon, color }) {
  const colors = {
    green: 'text-green-500 bg-green-50 dark:bg-green-900/20',
    blue: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'
  };

  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <div className="flex items-center space-x-2 mb-1">
        <div className={colors[color]}>{icon}</div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      </div>
      <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

function OptimizationTip({ active, text }) {
  return (
    <div className="flex items-center space-x-2 text-xs">
      {active ? (
        <CheckCircle className="w-3 h-3 text-green-500" />
      ) : (
        <AlertCircle className="w-3 h-3 text-gray-400" />
      )}
      <span className={active ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}>
        {text}
      </span>
    </div>
  );
}
