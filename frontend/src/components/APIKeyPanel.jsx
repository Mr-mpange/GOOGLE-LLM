import { useState, useEffect } from 'react';
import { Key, Copy, Eye, EyeOff, Plus, Trash2, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

export default function APIKeyPanel() {
  const [keys, setKeys] = useState([]);
  const [showKey, setShowKey] = useState({});
  const [newKey, setNewKey] = useState(null);
  const [copied, setCopied] = useState(false);
  const [userId] = useState('demo-user');

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/keys/${userId}`);
      setKeys(response.data.keys);
    } catch (error) {
      console.error('Failed to fetch keys:', error);
    }
  };

  const generateKey = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/keys/generate`, {
        userId,
        userName: 'Demo User'
      });
      
      setNewKey(response.data);
      await fetchKeys();
    } catch (error) {
      console.error('Failed to generate key:', error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const revokeKey = async (apiKey) => {
    if (!confirm('Are you sure you want to revoke this API key?')) return;
    
    try {
      await axios.delete(`${API_URL}/api/keys/${apiKey}`);
      await fetchKeys();
    } catch (error) {
      console.error('Failed to revoke key:', error);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Key className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            API Keys
          </h3>
        </div>
        <button
          onClick={generateKey}
          className="btn-primary flex items-center space-x-2 text-sm py-2 px-3"
        >
          <Plus className="w-4 h-4" />
          <span>Generate</span>
        </button>
      </div>

      {/* New Key Display */}
      {newKey && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              New API Key Generated
            </p>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <code className="flex-1 text-xs bg-white dark:bg-gray-800 p-2 rounded border border-green-300 dark:border-green-700 font-mono">
              {newKey.apiKey}
            </code>
            <button
              onClick={() => copyToClipboard(newKey.apiKey)}
              className="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-green-600 dark:text-green-400" />
              )}
            </button>
          </div>
          <p className="text-xs text-green-700 dark:text-green-300">
            ⚠️ Save this key now. You won't be able to see it again.
          </p>
        </div>
      )}

      {/* Keys List */}
      <div className="space-y-2">
        {keys.length === 0 ? (
          <div className="text-center py-8">
            <Key className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No API keys yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Generate one to get started
            </p>
          </div>
        ) : (
          keys.map((keyData) => (
            <KeyCard
              key={keyData.fullKey}
              keyData={keyData}
              showKey={showKey[keyData.fullKey]}
              onToggleShow={() => setShowKey({ ...showKey, [keyData.fullKey]: !showKey[keyData.fullKey] })}
              onCopy={() => copyToClipboard(keyData.fullKey)}
              onRevoke={() => revokeKey(keyData.fullKey)}
              copied={copied}
            />
          ))
        )}
      </div>

      {/* Usage Info */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          How to use:
        </p>
        <code className="block text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">
          curl -H "X-API-Key: your-key" {API_URL}/api/prompt
        </code>
      </div>
    </div>
  );
}

function KeyCard({ keyData, showKey, onToggleShow, onCopy, onRevoke, copied }) {
  return (
    <div className={`p-3 rounded-lg border ${
      keyData.active 
        ? 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Key className={`w-4 h-4 ${keyData.active ? 'text-purple-500' : 'text-red-500'}`} />
          <code className="text-xs font-mono text-gray-900 dark:text-white">
            {showKey ? keyData.fullKey : keyData.key}
          </code>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={onToggleShow}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            title={showKey ? 'Hide' : 'Show'}
          >
            {showKey ? (
              <EyeOff className="w-3 h-3 text-gray-600 dark:text-gray-400" />
            ) : (
              <Eye className="w-3 h-3 text-gray-600 dark:text-gray-400" />
            )}
          </button>
          <button
            onClick={onCopy}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            title="Copy"
          >
            {copied ? (
              <CheckCircle className="w-3 h-3 text-green-500" />
            ) : (
              <Copy className="w-3 h-3 text-gray-600 dark:text-gray-400" />
            )}
          </button>
          {keyData.active && (
            <button
              onClick={onRevoke}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
              title="Revoke"
            >
              <Trash2 className="w-3 h-3 text-red-600 dark:text-red-400" />
            </button>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Requests: {keyData.requestCount}</span>
        <span>{keyData.active ? 'Active' : 'Revoked'}</span>
      </div>
      
      {keyData.lastUsed && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Last used: {new Date(keyData.lastUsed).toLocaleString()}
        </p>
      )}
    </div>
  );
}
