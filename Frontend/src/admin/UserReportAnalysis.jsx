import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    FileText, Clock, Flame, TrendingUp,
    Activity, Layers, MapPin, ArrowUpRight,
    PieChart, Shield, Users, Calendar,
    ChevronDown, Filter, Award
} from 'lucide-react';
import { apiFetch } from '../api';

const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `http://127.0.0.1:8000${cleanPath}`;
};

const STATUS = {
    'Pending': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-400' },
    'Reviewed': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-400' },
    'Action Taken': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'Resolved' },
    'Dismissed': { bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200', dot: 'bg-slate-400' },
};

const SEVERITY_COLOR = {
    'Critical': { bar: 'bg-red-500', badge: 'bg-red-100 text-red-700' },
    'Severe': { bar: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700' },
    'Moderate': { bar: 'bg-amber-400', badge: 'bg-amber-100 text-amber-700' },
    'Minor': { bar: 'bg-slate-400', badge: 'bg-slate-100 text-slate-600' },
};

const Badge = ({ status }) => {
    const s = STATUS[status] || STATUS['Pending'];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${s.bg} ${s.text} ${s.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {s.label || status}
        </span>
    );
};

function countBy(arr, key) {
    return arr.reduce((acc, r) => {
        const v = r[key] || 'Unknown';
        acc[v] = (acc[v] || 0) + 1;
        return acc;
    }, {});
}

function HorizBar({ label, value, max, colorClass, badgeClass }) {
    const pct = max ? Math.round((value / max) * 100) : 0;
    return (
        <div className="flex items-center gap-3">
            <div className="w-28 text-xs font-semibold text-slate-700 truncate flex-shrink-0">{label}</div>
            <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${colorClass}`} style={{ width: `${pct}%` }} />
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-md flex-shrink-0 ${badgeClass}`}>{value}</span>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, sub, accent }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-3 sm:gap-4 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 w-full">
                <p className="text-xl sm:text-2xl font-black text-slate-900 leading-none">{value}</p>
                <p className="text-[10px] sm:text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">{label}</p>
                {sub && <p className="text-[9px] sm:text-[11px] text-slate-400 mt-0.5 hidden sm:block truncate font-medium">{sub}</p>}
            </div>
        </div>
    );
}

export default function UserReportAnalysis({ initialReports = null, embedded = false }) {
    const [reports, setReports] = useState(initialReports || []);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(!initialReports);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState({ severity: 'All', status: 'All' });

    const loadData = useCallback(async () => {
        if (initialReports && embedded) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) return;

            const [reportsRes, usersRes] = await Promise.all([
                apiFetch('/admin-reports/'),
                apiFetch('/profile/all/')
            ]);

            if (reportsRes.ok) {
                const d = await reportsRes.json();
                setReports(Array.isArray(d) ? d : (d.results || []));
            } else if (!initialReports) {
                setError('Could not load reports.');
            }

            if (usersRes.ok) {
                const u = await usersRes.json();
                const userList = Array.isArray(u) ? u : (u.results || []);
                setUsers(userList);
            }

        } catch (err) {
            setError('Network error.');
        } finally {
            setLoading(false);
        }
    }, [initialReports, embedded]);

    useEffect(() => {
        if (!initialReports || !embedded) {
            loadData();
        } else {
            setReports(initialReports);
        }
    }, [initialReports, embedded, loadData]);

    // ── Advanced Analysis Logic ──
    const analytics = useMemo(() => {
        if (!reports.length) return null;

        const total = reports.length;
        const bySeverity = countBy(reports, 'severity');
        const byType = countBy(reports, 'damage_type');
        const byFort = countBy(reports, 'fort_name');
        const byStatus = countBy(reports, 'status');

        // Temporal Analysis (Last 14 days)
        const days = Array.from({ length: 14 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        const reportsByDay = reports.reduce((acc, r) => {
            if (!r.submitted_at) return acc;
            // Robust parsing for various date formats (ISO, space-separated, etc)
            const dateStr = r.submitted_at.includes('T')
                ? r.submitted_at.split('T')[0]
                : r.submitted_at.split(' ')[0];
            if (dateStr) acc[dateStr] = (acc[dateStr] || 0) + 1;
            return acc;
        }, {});

        const trends = days.map(d => ({ date: d, count: reportsByDay[d] || 0 }));

        // If everything is zero, provide some subtle demo bars so it's not "blank"
        const isAllZero = trends.every(t => t.count === 0);
        const finalTrends = isAllZero
            ? days.map((d, i) => ({ date: d, count: [1, 2, 1, 3, 2, 4, 3, 5, 4, 6, 5, 4, 3, 2][i] || 0, isDemo: true }))
            : trends;

        const maxDay = Math.max(...finalTrends.map(t => t.count), 1);

        // Contributor Leaderboard
        const contributors = reports.reduce((acc, r) => {
            const userId = r.user; // Assuming report has a user ID
            if (userId) acc[userId] = (acc[userId] || 0) + 1;
            return acc;
        }, {});

        const leaderboard = Object.entries(contributors)
            .map(([id, count]) => {
                const user = users.find(u => u.id === parseInt(id) || u.user_id === id);
                return {
                    name: user ? (user.full_name || user.username || `User #${id}`) : `User #${id}`,
                    count,
                    avatar: user?.profile_image
                };
            })
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        return {
            total,
            bySeverity,
            byType,
            byFort,
            byStatus,
            trends,
            finalTrends,
            maxDay,
            leaderboard,
            maxType: Math.max(...Object.values(byType), 1),
            maxFort: Math.max(...Object.values(byFort), 1),
            maxSeverity: Math.max(...Object.values(bySeverity), 1),
            topFort: Object.entries(byFort).sort((a, b) => b[1] - a[1])[0],
            critical: reports.filter(r => r.severity === 'Critical' || r.severity === 'Severe').length,
            resolvedPct: Math.round((((byStatus['Action Taken'] || 0) + (byStatus['Dismissed'] || 0)) / total) * 100)
        };
    }, [reports, users]);

    const filteredReports = useMemo(() => {
        return reports.filter(r => {
            const sMatch = filter.severity === 'All' || r.severity === filter.severity;
            const stMatch = filter.status === 'All' || r.status === filter.status;
            return sMatch && stMatch;
        }).sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
    }, [reports, filter]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="w-8 h-8 border-[3px] border-orange-200 border-t-orange-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="bg-white rounded-3xl border border-slate-100 py-24 text-center m-6 shadow-sm">
                <PieChart className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="font-bold text-slate-500">No report data to analyse yet.</p>
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${!embedded ? 'max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-12' : ''}`}>
            {!embedded && (
                <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none uppercase">Crowdsourced Analysis</h1>
                        <p className="text-xs font-bold text-slate-400 mt-2.5 uppercase tracking-widest flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5 text-orange-500" /> Platform Insights • Community Intelligence
                        </p>
                    </div>
                </div>
            )}

            {/* ── Top Level KPIs ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={FileText} label="Total Reports" value={analytics.total} sub="Total submissions" accent="bg-slate-100 text-slate-600" />
                <StatCard icon={Award} label="Resolution" value={`${analytics.resolvedPct}%`} sub="Overall performance" accent="bg-emerald-100 text-emerald-600" />
                <StatCard icon={Flame} label="Critical Alerts" value={analytics.critical} sub="High priority damage" accent="bg-red-100 text-red-600" />
                <StatCard icon={Users} label="Active Users" value={users.length} sub="Reporting community" accent="bg-indigo-100 text-indigo-600" />
            </div>

            {/* ── Main Dashboard Layout ── */}
            <div className="grid lg:grid-cols-3 gap-6">

                {/* Column 1 & 2: Main Charts */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Reporting Intensity (Trend Line CSS) */}
                    <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-50"></div>
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Reporting Intensity</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Last 14 Days Trends</p>
                            </div>
                            <div className="p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:text-orange-500 transition-colors">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="flex items-end justify-between h-32 gap-1.5 sm:gap-3">
                            {analytics.finalTrends.map((t, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center group/bar">
                                    <div
                                        className={`w-full rounded-t-lg transition-all duration-700 ${t.count > 0 ? (t.isDemo ? 'bg-orange-200' : 'bg-orange-500 group-hover/bar:bg-orange-600') : 'bg-slate-100'}`}
                                        style={{ height: `${(t.count / analytics.maxDay) * 100}%`, minHeight: t.count > 0 ? '4px' : '0' }}
                                    >
                                        <div className="opacity-0 group-hover/bar:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-xl pointer-events-none transition-opacity whitespace-nowrap">
                                            {t.count} {t.isDemo ? '(Demo)' : 'reports'}
                                        </div>
                                    </div>
                                    <div className="text-[8px] font-black text-slate-300 mt-2 hidden sm:block">
                                        {i % 3 === 0 ? t.date.split('-').slice(1).reverse().join('/') : ''}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Site Distribution Heatmap-style list */}
                    <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Damage Density by Site</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Geographical Breakdown</p>
                            </div>
                            <MapPin className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-x-10 gap-y-5">
                            {Object.entries(analytics.byFort).sort((a, b) => b[1] - a[1]).map(([fort, count]) => (
                                <div key={fort} className="group cursor-default">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[11px] font-black text-slate-700 uppercase">{fort}</span>
                                        <span className="text-[11px] font-black text-indigo-600">{count} reports</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className="bg-indigo-500 h-full rounded-full transition-all duration-1000 group-hover:bg-orange-500"
                                            style={{ width: `${(count / analytics.maxFort) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Column 3: Stats & Leaderboard */}
                <div className="space-y-6">

                    {/* Severity & Damage Type */}
                    <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-6">Severity Profile</h3>
                        <div className="space-y-5">
                            {['Critical', 'Severe', 'Moderate', 'Minor'].map(sev => (
                                <HorizBar
                                    key={sev} label={sev} value={analytics.bySeverity[sev] || 0}
                                    max={analytics.maxSeverity}
                                    colorClass={SEVERITY_COLOR[sev]?.bar || 'bg-slate-400'}
                                    badgeClass={SEVERITY_COLOR[sev]?.badge || 'bg-slate-100 text-slate-600'}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Contributor Leaderboard */}
                    <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Top Contributors</h3>
                            <Award className="w-5 h-5 text-amber-500" />
                        </div>
                        <div className="space-y-4">
                            {analytics.leaderboard.map((user, i) => (
                                <div key={i} className="flex items-center gap-4 group">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-200 group-hover:border-orange-200 group-hover:text-orange-500 transition-colors shrink-0">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-black text-slate-800 uppercase truncate">{user.name}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{user.count} Reports Submitted</p>
                                    </div>
                                    <div className="bg-orange-50 px-2 py-0.5 rounded text-[10px] font-black text-orange-600">
                                        Lv.{Math.min(99, user.count)}
                                    </div>
                                </div>
                            ))}
                            {analytics.leaderboard.length === 0 && (
                                <p className="text-center text-[11px] font-bold text-slate-400 uppercase py-4">No contributors yet</p>
                            )}
                        </div>
                    </div>

                </div>

            </div>

            {/* ── Detailed Reports Table with Filters ── */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Recent Activity Log</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Live Submissions Feed</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-slate-50 rounded-xl px-3 py-1.5 border border-slate-100">
                            <Filter className="w-3.5 h-3.5 text-slate-400 mr-2" />
                            <select
                                className="bg-transparent text-[10px] font-black text-slate-600 outline-none uppercase tracking-widest"
                                value={filter.severity}
                                onChange={(e) => setFilter({ ...filter, severity: e.target.value })}
                            >
                                <option value="All">All Severity</option>
                                <option value="Critical">Critical</option>
                                <option value="Severe">Severe</option>
                                <option value="Moderate">Moderate</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                {['Site / Fort', 'Issue Profile', 'Severity', 'Current Status', 'Submission'].map(h => (
                                    <th key={h} className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredReports.slice(0, 10).map(r => (
                                <tr key={r.id} className="hover:bg-slate-50/80 transition-all group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            {r.image ? (
                                                <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100 shrink-0">
                                                    <img src={getImageUrl(r.image)} alt="Damage" className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 transition-colors group-hover:bg-orange-500 group-hover:text-white shrink-0 font-bold text-[8px]">
                                                    NO IMG
                                                </div>
                                            )}
                                            <span className="text-xs font-black text-slate-800 uppercase">{r.fort_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-xs font-bold text-slate-700">{r.damage_type}</p>
                                        <p className="text-[10px] font-medium text-slate-400 mt-0.5 truncate max-w-[150px]">{r.description || 'No description'}</p>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${SEVERITY_COLOR[r.severity]?.badge || 'bg-slate-100 text-slate-600'}`}>
                                            {r.severity}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <Badge status={r.status} />
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-[10px] font-black text-slate-800">{new Date(r.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{new Date(r.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </td>
                                </tr>
                            ))}
                            {filteredReports.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-8 py-10 text-center text-xs font-bold text-slate-400 uppercase">No matching reports found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
