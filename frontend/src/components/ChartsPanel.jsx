import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

export default function ChartsPanel() {
  const [latencyData, setLatencyData] = useState([]);
  const [tokenData, setTokenData] = useState([]);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/metrics`);
      const { timeSeries } = response.data;
      
      if (timeSeries) {
        // Format latency data
        const formattedLatency = timeSeries.latency.map((item, index) => ({
          time: formatTime(item.timestamp),
          latency: item.value,
          index
        }));
        
        // Format token data
        const formattedTokens = timeSeries.tokens.map((item, index) => ({
          time: formatTime(item.timestamp),
          input: item.input,
          output: item.output,
          index
        }));
        
        setLatencyData(formattedLatency);
        setTokenData(formattedTokens);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const hasData = latencyData.length > 0 || tokenData.length > 0;

  return (
    <div className="space-y-6">
      {/* Latency Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Response Latency
        </h3>
        {hasData && latencyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={latencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF" 
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9CA3AF" 
                style={{ fontSize: '12px' }}
                label={{ value: 'ms', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="latency" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                dot={{ fill: '#8B5CF6', r: 4 }}
                name="Latency (ms)"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-gray-500 dark:text-gray-400">
            <p className="text-sm">No data yet. Send some prompts to see the chart.</p>
          </div>
        )}
      </div>

      {/* Token Usage Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Token Usage
        </h3>
        {hasData && tokenData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={tokenData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF" 
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9CA3AF" 
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Legend />
              <Bar dataKey="input" fill="#3B82F6" name="Input Tokens" />
              <Bar dataKey="output" fill="#10B981" name="Output Tokens" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-gray-500 dark:text-gray-400">
            <p className="text-sm">No data yet. Send some prompts to see the chart.</p>
          </div>
        )}
      </div>
    </div>
  );
}
