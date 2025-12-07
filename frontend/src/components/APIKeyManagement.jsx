import { useState, useEffect } from 'react';
import { Key, Plus, Trash2, Eye, EyeOff, Copy, Check } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

export default function APIKeyManagement() {
  const [keys, setKeys] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchKeys();
    fetchStats();
  }, []);

  const fetchKeys = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/keys`);
      setKeys(response.data.keys);
    } catch (error) {
      console.error('Failed to fetch keys:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/keys/stats/usage`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            API Key Management
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage API keys for external users and applications
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Key</span>
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="Total Keys" value={stats.totalKeys} />
          <StatCard label="Active Keys" value={stats.activeKeys} />
          <StatCard label="Total Requests" value={stats.totalRequests.toLocaleString()} />
          <StatCard label="Total Cost" value={`$${stats.totalCost}`} />
        </div>
      )}

      {/* Keys List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          API Keys
        </h3>
        <div className="space-y-3">
          {keys.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No API keys yet. Create one to get started.
            </p>
          ) : (
            keys.map((key) => (
              <APIKeyCard
                key={key.fullKey}
                keyData={key}
                onRevoke={() => handleRevoke(key.fullKey)}
                onDelete={() => handleDelete(key.fullKey)}
                onRefresh={fetchKeys}
              />
            ))
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateKeyModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchKeys();
            fetchStats();
          }}
        />
      )}
    </div>
  );

  async function handleRevoke(key) {
    if (!confirm('Are you sure you want to revoke this API key?')) return;
    
    try {
      await axios.post(`${API_URL}/api/keys/${key}/revoke`);
      fetchKeys();
    } catch (error) {
      alert('Failed to revoke key');
    }
  }

  async function handleDelete(key) {
    if (!confirm('Are you sure you want to delete this API key? This cannot be undone.')) return;
    
    try {
      await axios.delete(`${API_URL}/api/keys/${key}`);
      fetchKeys();
      fetchStats();
    } catch (error) {
      alert('Failed to delete key');
    }
  }
}

function StatCard({ label, value }) {
  return (
    <div className="card">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
    </div>
  );
}

function APIKeyCard({ keyData, onRevoke, onDelete, onRefresh }) {
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyKey = () => {
    navigator.clipboard.writeText(keyData.fullKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusColor = {
    active: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    revoked: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <Key className="w-4 h-4 text-purple-500" />
            <h4 className="font-semibold text-gray-900 dark:text-white">{keyData.name}</h4>
            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[keyData.status]}`}>
              {keyData.status}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            User: {keyData.userId}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowKey(!showKey)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={copyKey}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
          {keyData.status === 'active' && (
            <button
              onClick={onRevoke}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mb-3">
        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">
          {showKey ? keyData.fullKey : keyData.key}
        </code>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-gray-500 dark:text-gray-400">Requests Today:</span>
          <span className="ml-1 font-medium text-gray-900 dark:text-white">
            {keyData.usage?.requestsToday || 0} / {keyData.limits.requestsPerDay}
          </span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Total Requests:</span>
          <span className="ml-1 font-medium text-gray-900 dark:text-white">
            {keyData.usage?.totalRequests || 0}
          </span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Total Tokens:</span>
          <span className="ml-1 font-medium text-gray-900 dark:text-white">
            {keyData.usage?.totalTokens?.toLocaleString() || 0}
          </span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Total Cost:</span>
          <span className="ml-1 font-medium text-gray-900 dark:text-white">
            ${keyData.usage?.totalCost?.toFixed(4) || '0.0000'}
          </span>
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Created: {new Date(keyData.createdAt).toLocaleString()}
        {keyData.lastUsed && ` • Last used: ${new Date(keyData.lastUsed).toLocaleString()}`}
      </div>
    </div>
  );
}

function CreateKeyModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    requestsPerDay: 1000,
    requestsPerMonth: 30000,
    maxTokensPerRequest: 5000
  });
  const [loading, setLoading] = useState(false);
  const [createdKey, setCreatedKey] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/keys/create`, {
        userId: formData.userId,
        name: formData.name,
        limits: {
          requestsPerDay: parseInt(formData.requestsPerDay),
          requestsPerMonth: parseInt(formData.requestsPerMonth),
          maxTokensPerRequest: parseInt(formData.maxTokensPerRequest)
        }
      });

      setCreatedKey(response.data.key);
    } catch (error) {
      alert('Failed to create API key');
    } finally {
      setLoading(false);
    }
  };

  if (createdKey) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            API Key Created!
          </h3>
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Save this key now. You won't be able to see it again!
            </p>
            <code className="block text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded font-mono break-all">
              {createdKey}
            </code>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(createdKey);
              onSuccess();
            }}
            className="w-full btn-primary"
          >
            Copy & Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Create New API Key
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              User ID
            </label>
            <input
              type="text"
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Key Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Requests Per Day
            </label>
            <input
              type="number"
              value={formData.requestsPerDay}
              onChange={(e) => setFormData({ ...formData, requestsPerDay: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Key'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
