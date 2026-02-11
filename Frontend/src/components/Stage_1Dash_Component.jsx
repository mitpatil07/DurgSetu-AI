import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  TrendingUp, AlertTriangle, Shield, Activity,
  ArrowUpRight, ArrowDownRight, LayoutDashboard
} from 'lucide-react';

const Stage1Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        fetch('http://localhost:8000/api/forts/statistics/'),
        fetch('http://localhost:8000/api/forts/analytics/')
      ]);

      if (!statsRes.ok || !analyticsRes.ok) throw new Error('Failed to fetch data');

      const stats = await statsRes.json();
      const analytics = await analyticsRes.json();

      setData({ stats, analytics });
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-red-500 font-bold">Error: {error}</div>
    </div>
  );

  const { stats, analytics } = data;

  // Data for Risk Distribution Pie Chart
  const pieData = [
    { name: 'Safe', value: stats.risk_distribution.SAFE, color: '#10B981' },
    { name: 'Low', value: stats.risk_distribution.LOW, color: '#3B82F6' },
    { name: 'Medium', value: stats.risk_distribution.MEDIUM, color: '#F59E0B' },
    { name: 'High', value: stats.risk_distribution.HIGH, color: '#EF4444' },
    { name: 'Critical', value: stats.risk_distribution.CRITICAL, color: '#7F1D1D' }
  ].filter(d => d.value > 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <LayoutDashboard className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Analytics Dashboard</h1>
              <p className="text-xs text-gray-500">System-wide structural health overview</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Return to Home
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Total Forts Monitored"
            value={stats.total_forts}
            icon={Shield}
            color="blue"
            subtext={`${stats.total_analyses} total scans performed`}
          />
          <KPICard
            title="Average Health Score"
            value={`${Math.round(stats.average_ssim * 100)}%`}
            icon={Activity}
            color="green"
            subtext="Structural Similarity Index"
          />
          <KPICard
            title="Sites At Risk"
            value={stats.forts_at_risk}
            icon={AlertTriangle}
            color="red"
            subtext="High or Critical Severity"
          />
          <KPICard
            title="Avg Risk Score"
            value={stats.average_risk_score.toFixed(1)}
            icon={TrendingUp}
            color="orange"
            subtext="Scale of 0-10"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

          {/* Main Trend Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gray-500" />
              Deterioration Trends (6 Months)
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.trend_data}>
                  <defs>
                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="risk"
                    stroke="#EF4444"
                    fillOpacity={1}
                    fill="url(#colorRisk)"
                    name="Avg Risk Score"
                  />
                  <Area
                    type="monotone"
                    dataKey="health"
                    stroke="#10B981"
                    fillOpacity={1}
                    fill="url(#colorHealth)"
                    name="Structural Health"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk Pie Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Risk Distribution</h2>
            <div className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-800">{stats.total_analyses}</div>
                  <div className="text-xs text-gray-500">Analyses</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Leaderboard & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Fort Health Leaderboard */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Fort Health Leaderboard</h2>
            <div className="space-y-4">
              {analytics.leaderboard.map((fort, i) => (
                <div key={fort.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${i < 3 ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-200 text-gray-600'
                      }`}>
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{fort.name}</h3>
                      <p className="text-xs text-gray-500">{fort.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-800">{fort.health}% Health</div>
                    <div className={`text-xs font-semibold ${fort.status === 'SAFE' ? 'text-green-600' :
                        fort.status === 'CRITICAL' ? 'text-red-600' : 'text-orange-600'
                      }`}>
                      {fort.status}
                    </div>
                  </div>
                </div>
              ))}
              {analytics.leaderboard.length === 0 && (
                <p className="text-center text-gray-500 italic py-8">No data available yet.</p>
              )}
            </div>
          </div>

          {/* Critical Alerts Feed */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Recent Critical Alerts
            </h2>
            <div className="space-y-4">
              {analytics.critical_alerts.map((alert) => (
                <div key={alert.id} className="p-4 bg-red-50 border border-red-100 rounded-xl">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-red-900">{alert.fort_name}</h3>
                    <span className="text-xs font-medium bg-red-200 text-red-800 px-2 py-0.5 rounded">
                      {alert.risk_level}
                    </span>
                  </div>
                  <p className="text-sm text-red-700 mb-2">{alert.message}</p>
                  <p className="text-xs text-red-500">{new Date(alert.date).toLocaleString()}</p>
                </div>
              ))}
              {analytics.critical_alerts.length === 0 && (
                <div className="text-center py-12 flex flex-col items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-gray-600 font-medium">All systems normal</p>
                  <p className="text-xs text-gray-400">No critical alerts in the last 24 hours</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

// Helper Component for KPI Cards
const KPICard = ({ title, value, icon: Icon, color, subtext }) => {
  const colorMap = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm font-medium text-gray-500 mb-2">{title}</div>
      <div className="text-xs text-gray-400">{subtext}</div>
    </div>
  );
};

export default Stage1Dashboard;
