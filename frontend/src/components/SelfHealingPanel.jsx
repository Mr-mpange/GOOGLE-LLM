import { useState, useEffect } from 'react';
import { Activity, Zap, Shield, TrendingDown, RefreshCw } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

export default function SelfHealingPanel() {
  const [healingData, setHealingData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHealingStatus();
    const interval = setInterval(fetchHealingStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchHealingStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/self-healing`);
      setHealingData(response.data);
    } catch (error) {
      console.error('Failed to fetch self-healing status:', error);
    }
  };

  const handleModelSwitch = async (model) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/model/switch`, { model });
      console.log('Model switched:', response.data);
      await fetchHealingStatus();
      
      // Show success feedback
      setTimeout(() => {
        fetchHealingStatus();
      }, 1000);
    } catch (error) {
      console.error('Failed to switch model:', error);
      alert('Failed to switch model. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const models = [
    { name: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash', speed: 'Fast', cost: 'Low' },
    { name: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', speed: 'Faster', cost: 'Lower' },
    { name: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', speed: 'Slower', cost: 'Higher' }
  ];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            AI Self-Healing
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
            Active
          </span>
        </div>
      </div>

      {/* Current Model */}
      <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
              Current Model
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
              {healingData?.currentModel || 'gemini-2.0-flash-exp'}
            </p>
          </div>
          <Activity className="w-5 h-5 text-purple-500" />
        </div>
      </div>

      {/* Model Switcher */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
          Switch Model
        </p>
        <div className="space-y-2">
          {models.map((model) => (
            <button
              key={model.name}
              onClick={() => handleModelSwitch(model.name)}
              disabled={loading || healingData?.currentModel === model.name}
              className={`w-full p-2 rounded-lg border text-left transition-colors ${
                healingData?.currentModel === model.name
                  ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700'
                  : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {model.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Speed: {model.speed} • Cost: {model.cost}
                  </p>
                </div>
                {healingData?.currentModel === model.name && (
                  <Shield className="w-4 h-4 text-purple-500" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Healing Actions */}
      {healingData?.history && healingData.history.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
            Recent Actions
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {healingData.history.slice(0, 5).map((action, idx) => (
              <HealingActionCard key={idx} action={action} />
            ))}
          </div>
        </div>
      )}

      {/* Features */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Auto-Recovery Features:
        </p>
        <div className="grid grid-cols-2 gap-2">
          <FeatureBadge icon={<RefreshCw className="w-3 h-3" />} label="Model Switch" />
          <FeatureBadge icon={<TrendingDown className="w-3 h-3" />} label="Cost Optimize" />
          <FeatureBadge icon={<Shield className="w-3 h-3" />} label="Safety Boost" />
          <FeatureBadge icon={<Zap className="w-3 h-3" />} label="Token Limit" />
        </div>
      </div>
    </div>
  );
}

function HealingActionCard({ action }) {
  const getActionIcon = (actions) => {
    if (!actions || actions.length === 0) return <Activity className="w-3 h-3" />;
    const actionType = actions[0]?.action;
    
    switch (actionType) {
      case 'switch_model':
        return <RefreshCw className="w-3 h-3" />;
      case 'reduce_max_tokens':
        return <TrendingDown className="w-3 h-3" />;
      case 'enhance_safety_filters':
        return <Shield className="w-3 h-3" />;
      default:
        return <Activity className="w-3 h-3" />;
    }
  };

  const getActionLabel = (actions) => {
    if (!actions || actions.length === 0) return 'Monitoring';
    return actions[0]?.action?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600">
      <div className="flex items-center space-x-2">
        <div className="text-purple-500">
          {getActionIcon(action.actions)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
            {getActionLabel(action.actions)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(action.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureBadge({ icon, label }) {
  return (
    <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400">
      <div className="text-green-500">{icon}</div>
      <span>{label}</span>
    </div>
  );
}
