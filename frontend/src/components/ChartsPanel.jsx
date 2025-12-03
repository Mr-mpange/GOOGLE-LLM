import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function ChartsPanel() {
  // Mock data for demonstration
  const latencyData = [
    { time: '00:00', latency: 1200 },
    { time: '04:00', latency: 1450 },
    { time: '08:00', latency: 2100 },
    { time: '12:00', latency: 1800 },
    { time: '16:00', latency: 1650 },
    { time: '20:00', latency: 1400 }
  ];

  const tokenData = [
    { time: '00:00', input: 1200, output: 2400 },
    { time: '04:00', input: 1500, output: 2800 },
    { time: '08:00', input: 2200, output: 4100 },
    { time: '12:00', input: 1900, output: 3600 },
    { time: '16:00', input: 1700, output: 3200 },
    { time: '20:00', input: 1400, output: 2700 }
  ];

  return (
    <div className="space-y-6">
      {/* Latency Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Response Latency (24h)
        </h3>
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
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Token Usage Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Token Usage (24h)
        </h3>
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
      </div>
    </div>
  );
}
