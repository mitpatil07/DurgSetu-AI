import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  TrendingUp, AlertTriangle, Shield, Activity,
  ArrowUpRight, ArrowDownRight, LayoutDashboard, User, FileText
} from 'lucide-react';
import UserReportAnalysis from './UserReportAnalysis';

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
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      };

      const [statsRes, analyticsRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/forts/statistics/', { headers }),
        fetch('http://127.0.0.1:8000/api/forts/analytics/', { headers })
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

  const riskDist = stats?.risk_distribution || {};
  const leaderboard = analytics?.leaderboard || [];
  const criticalAlerts = analytics?.critical_alerts || [];
  let trendData = analytics?.trend_data || [];

  // Build fallback trend from leaderboard health/risk if analytics returns nothing
  if (!trendData.length && leaderboard.length) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    trendData = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const avgHealth = leaderboard.reduce((s, f) => s + (f.health || 0), 0) / (leaderboard.length || 1);
      const avgRisk = leaderboard.reduce((s, f) => s + (f.risk_score || 0), 0) / (leaderboard.length || 1);
      return { name: months[d.getMonth()], health: Math.round(avgHealth), risk: parseFloat(avgRisk.toFixed(1)) };
    });
  }

  // Data for Risk Distribution Pie Chart
  const pieData = [
    { name: 'Safe', value: riskDist.SAFE || 0, color: '#10b981' },
    { name: 'Low', value: riskDist.LOW || 0, color: '#64748b' },
    { name: 'Medium', value: riskDist.MEDIUM || 0, color: '#f59e0b' },
    { name: 'High', value: riskDist.HIGH || 0, color: '#f97316' },
    { name: 'Critical', value: riskDist.CRITICAL || 0, color: '#ef4444' },
  ].filter(d => d.value > 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Floating Header */}
      <header className="fixed w-full top-0 z-50 px-4 pt-4 pb-2 transition-all">
        <div className="container mx-auto max-w-7xl bg-white/90 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-2xl border border-white/40">
          <div className="px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl shadow-lg shadow-orange-500/30">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">AI Analytics Dashboard</h1>
                <p className="text-orange-600 font-semibold text-[10px] md:text-xs tracking-wide uppercase">System-wide structural health overview</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 md:gap-3 w-full md:w-auto">
              <button
                onClick={() => navigate('/profile')}
                className="px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl font-bold transition-all hover:-translate-y-0.5 active:scale-95 shadow-sm cursor-pointer border border-orange-200/50 flex items-center gap-2 text-xs md:text-sm"
              >
                <User className="w-4 h-4" /> Profile
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all hover:-translate-y-0.5 active:scale-95 shadow-sm cursor-pointer text-xs md:text-sm border border-slate-200"
              >
                Home
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-8">

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Total Forts Monitored"
            value={stats.total_forts}
            icon={Shield}
            color="orange"
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
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group hover:border-orange-200 transition-colors">
            <h2 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-orange-500" />
              Deterioration Trends (6 Months)
            </h2>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#64748b" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', fontWeight: 600, color: '#1e293b' }}
                    itemStyle={{ fontWeight: 700 }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 600, color: '#475569', fontSize: '14px' }} />
                  <Area
                    type="monotone"
                    dataKey="risk"
                    stroke="#f97316"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRisk)"
                    name="Avg Risk Score"
                  />
                  <Area
                    type="monotone"
                    dataKey="health"
                    stroke="#64748b"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorHealth)"
                    name="Structural Health"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk Pie Chart */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative hover:border-orange-200 transition-colors flex flex-col">
            <h2 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center gap-2">
              <Activity className="w-6 h-6 text-orange-500" />
              Risk Distribution
            </h2>
            <div className="h-[300px] relative w-full flex-grow">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                    itemStyle={{ color: '#1e293b' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontWeight: 600, color: '#475569', fontSize: '13px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                <div className="text-center">
                  <div className="text-4xl font-extrabold text-slate-800">{stats.total_analyses}</div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Analyses</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Leaderboard & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Fort Health Leaderboard */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:border-orange-200 transition-colors">
            <h2 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center gap-2">
              <Shield className="w-6 h-6 text-orange-500" />
              Fort Health Leaderboard
            </h2>
            <div className="space-y-4">
              {leaderboard.map((fort, i) => (
                <div key={fort.id} className="flex items-center justify-between p-5 bg-slate-50 border border-transparent hover:border-orange-200 rounded-2xl transition-all hover:bg-white hover:shadow-md group cursor-default">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 flex items-center justify-center rounded-xl font-extrabold text-base transition-colors ${i === 0 ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : i === 1 ? 'bg-orange-300 text-white' : i === 2 ? 'bg-orange-200 text-orange-800' : 'bg-slate-200 text-slate-500 group-hover:bg-slate-300'}`}>
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg group-hover:text-orange-600 transition-colors">{fort.name}</h3>
                      <p className="text-sm font-medium text-slate-500">{fort.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-slate-800 text-lg">{fort.health}% <span className="text-sm text-slate-400 font-medium">Health</span></div>
                    <div className={`text-xs font-bold px-2 py-1 rounded-md inline-block mt-1 ${fort.status === 'SAFE' ? 'bg-green-100 text-green-700' :
                      fort.status === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                      {fort.status}
                    </div>
                  </div>
                </div>
              ))}
              {leaderboard.length === 0 && (
                <div className="text-center py-12 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <Shield className="w-8 h-8 text-slate-300 mb-3" />
                  <p className="text-slate-500 font-bold">No ranking data available yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Critical Alerts Feed */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:border-orange-200 transition-colors flex flex-col">
            <h2 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              Recent Critical Alerts
            </h2>
            <div className="space-y-4 flex-1">
              {criticalAlerts.map((alert) => (
                <div key={alert.id} className="p-5 bg-red-50/50 border border-red-100 rounded-2xl hover:bg-red-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-red-900 text-lg">{alert.fort_name}</h3>
                    <span className="text-xs font-bold bg-red-100 text-red-700 px-3 py-1 rounded-full border border-red-200">
                      {alert.risk_level}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-red-800 mb-3 leading-relaxed">{alert.message}</p>
                  <p className="text-xs font-bold text-red-900/40">{new Date(alert.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                </div>
              ))}
              {criticalAlerts.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center py-12 bg-green-50/50 rounded-2xl border-2 border-dashed border-green-100 min-h-[300px]">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Shield className="w-8 h-8 text-green-500" />
                  </div>
                  <p className="text-green-800 font-bold text-lg">All systems normal</p>
                  <p className="text-sm font-medium text-green-600 mt-1">No critical alerts in the last 24 hours</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* User Report Analysis Integration */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-6 h-6 text-indigo-500" />
            <h2 className="text-xl font-extrabold text-slate-800">User Damange Reports & Insights</h2>
          </div>
          <UserReportAnalysis embedded={true} />
        </div>
      </main>
    </div>
  );
};

// Helper Component for KPI Cards
const KPICard = ({ title, value, icon: Icon, color, subtext }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-orange-200 transition-all hover:-translate-y-1 hover:shadow-md group">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</p>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${colorMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <p className="text-4xl font-extrabold text-slate-800 mb-1">{value}</p>
      <p className="text-sm font-medium text-slate-400">{subtext}</p>
    </div>
  );
};

export default Stage1Dashboard;
