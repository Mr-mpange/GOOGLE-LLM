import { useState } from 'react';
import { Send, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function PromptTester({ onMetricsUpdate }) {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await axios.post(`${API_URL}/api/prompt`, {
        prompt,
        userId: 'demo-user',
        sessionId: sessionStorage.getItem('sessionId') || generateSessionId()
      });

      setResponse(result.data);
      
      // Fetch updated metrics
      const metricsResult = await axios.get(`${API_URL}/api/metrics`);
      onMetricsUpdate(metricsResult.data);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process prompt');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateSessionId = () => {
    const id = 'session-' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('sessionId', id);
    return id;
  };

  const examplePrompts = [
    'Explain quantum computing in simple terms',
    'Write a haiku about cloud computing',
    'What are the benefits of observability in AI systems?'
  ];

  return (
    <div className="card">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Test LLM Prompt
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Enter your prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask anything..."
            rows={4}
            className="input-field resize-none"
            disabled={loading}
          />
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-200">Error</p>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Response Display */}
      {response && (
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Response Generated
              </p>
            </div>
            <div 
              className="formatted-response text-sm text-gray-700 dark:text-gray-300"
              dangerouslySetInnerHTML={{ __html: response.formatted?.html || response.text }}
            />
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricBadge label="Latency" value={`${response.metadata.latency}ms`} />
            <MetricBadge label="Tokens In" value={response.metadata.tokensIn} />
            <MetricBadge label="Tokens Out" value={response.metadata.tokensOut} />
            <MetricBadge label="Cost" value={`$${response.metadata.cost.toFixed(4)}`} />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-400">Safety Score</span>
            <div className="flex items-center space-x-2">
              <div className="w-32 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-400"
                  style={{ width: `${response.metadata.safetyScore * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {(response.metadata.safetyScore * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricBadge({ label, value }) {
  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{value}</p>
    </div>
  );
}
