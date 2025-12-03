import { useState, useEffect } from 'react';
import { Moon, Sun, Shield, Activity, AlertTriangle, TrendingUp } from 'lucide-react';
import PromptTester from './components/PromptTester';
import MetricsPanel from './components/MetricsPanel';
import AlertsPanel from './components/AlertsPanel';
import ChartsPanel from './components/ChartsPanel';

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-datadog-purple" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  LLM Guardian
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  AI Observability Platform
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <Activity className="w-4 h-4 text-green-500" />
                <span className="text-gray-600 dark:text-gray-300">
                  System Healthy
                </span>
              </div>
              
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Activity className="w-6 h-6" />}
            label="Total Requests"
            value={metrics?.totalRequests || '0'}
            color="blue"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Avg Latency"
            value={metrics?.avgLatency ? `${metrics.avgLatency}ms` : '0ms'}
            color="green"
          />
          <StatCard
            icon={<AlertTriangle className="w-6 h-6" />}
            label="Error Rate"
            value={metrics?.errorRate ? `${(metrics.errorRate * 100).toFixed(2)}%` : '0%'}
            color="yellow"
          />
          <StatCard
            icon={<Shield className="w-6 h-6" />}
            label="Safety Score"
            value={metrics?.avgSafetyScore ? (metrics.avgSafetyScore * 100).toFixed(0) + '%' : '0%'}
            color="purple"
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Prompt Tester */}
          <div className="lg:col-span-2 space-y-8">
            <PromptTester onMetricsUpdate={setMetrics} />
            <ChartsPanel />
          </div>

          {/* Right Column - Metrics & Alerts */}
          <div className="space-y-8">
            <MetricsPanel metrics={metrics} />
            <AlertsPanel />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Built for Google Cloud × Datadog Hackathon | Powered by Vertex AI & Datadog
          </p>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colorClasses = {
    blue: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
    green: 'text-green-500 bg-green-50 dark:bg-green-900/20',
    yellow: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
    purple: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20'
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default App;
