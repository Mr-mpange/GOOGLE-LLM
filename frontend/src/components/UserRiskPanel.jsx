import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Users, Ban } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

export default function UserRiskPanel() {
  const [riskData, setRiskData] = useState(null);

  useEffect(() => {
    fetchRiskData();
    const interval = setInterval(fetchRiskData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchRiskData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users/risk`);
      setRiskData(response.data);
    } catch (error) {
      console.error('Failed to fetch risk data:', error);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            User Risk Scoring
          </h3>
        </div>
        {riskData?.stats.blockedUsers > 0 && (
          <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full">
            {riskData.stats.blockedUsers} Blocked
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <StatCard
          icon={<Users className="w-4 h-4" />}
          label="Total"
          value={riskData?.stats.totalUsers || 0}
          color="blue"
        />
        <StatCard
          icon={<AlertTriangle className="w-4 h-4" />}
          label="High Risk"
          value={riskData?.stats.highRiskUsers || 0}
          color="orange"
        />
        <StatCard
          icon={<Ban className="w-4 h-4" />}
          label="Blocked"
          value={riskData?.stats.blockedUsers || 0}
          color="red"
        />
      </div>

      {/* High Risk Users */}
      {riskData?.users && riskData.users.length > 0 ? (
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
            High Risk Users:
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {riskData.users.slice(0, 5).map((user) => (
              <UserRiskCard key={user.userId} user={user} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <Shield className="w-10 h-10 text-green-500 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No high-risk users detected
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    blue: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
    orange: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
    red: 'text-red-500 bg-red-50 dark:bg-red-900/20'
  };

  return (
    <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <div className={`${colors[color]} w-fit p-1 rounded mb-1`}>
        {icon}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

function UserRiskCard({ user }) {
  const getRiskColor = (level) => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300';
      case 'high':
        return 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300';
      default:
        return 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300';
    }
  };

  return (
    <div className={`p-3 rounded-lg border ${getRiskColor(user.riskLevel.level)}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">
            {user.userId}
          </p>
          {user.blocked && (
            <Ban className="w-3 h-3" />
          )}
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">{user.riskScore}</p>
          <p className="text-xs uppercase">{user.riskLevel.level}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="opacity-75">Requests</p>
          <p className="font-semibold">{user.totalRequests}</p>
        </div>
        <div>
          <p className="opacity-75">Injections</p>
          <p className="font-semibold">{user.injectionAttempts}</p>
        </div>
        <div>
          <p className="opacity-75">Unsafe</p>
          <p className="font-semibold">{user.unsafePrompts}</p>
        </div>
      </div>
    </div>
  );
}
