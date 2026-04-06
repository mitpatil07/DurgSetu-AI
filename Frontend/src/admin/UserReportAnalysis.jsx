import React, { useState, useEffect, useCallback } from 'react';
import {
    FileText, Clock, Flame, TrendingUp,
    Activity, Layers, MapPin, ArrowUpRight,
    PieChart, Shield, Users
} from 'lucide-react';

const STATUS = {
    'Pending': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-400' },
    'Reviewed': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-400' },
    'Action Taken': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
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
            {status}
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
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-start gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-2xl font-extrabold text-slate-900 leading-none">{value}</p>
                <p className="text-xs font-semibold text-slate-500 mt-1">{label}</p>
                {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

export default function UserReportAnalysis({ initialReports = null, embedded = false }) {
    const [reports, setReports] = useState(initialReports || []);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(!initialReports);
    const [error, setError] = useState(null);

    const loadData = useCallback(async () => {
        if (initialReports && embedded) return; // Only fetch if we're not embedded with existing reports

        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) return;

            // Fetch reports and users concurrently
            const [reportsRes, usersRes] = await Promise.all([
                fetch('http://127.0.0.1:8000/api/admin-reports/', {
                    headers: { Authorization: `Token ${token}` },
                }),
                fetch('http://127.0.0.1:8000/api/profile/all/', {
                    headers: { Authorization: `Token ${token}` },
                })
            ]);

            if (reportsRes.ok) {
                const d = await reportsRes.json();
                setReports(Array.isArray(d) ? d : (d.results || []));
            } else if (!initialReports) {
                setError('Could not load reports.');
            }

            if (usersRes.ok) {
                const u = await usersRes.json();
                setUsers(Array.isArray(u) ? u : (u.results || []));
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

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="w-8 h-8 border-[3px] border-orange-200 border-t-orange-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (error && !reports.length) {
        return (
            <div className="m-6 flex items-center justify-center py-24">
                <p className="text-red-500 font-bold">{error}</p>
            </div>
        );
    }

    const total = reports.length;
    const pending = reports.filter(r => r.status === 'Pending').length;
    const reviewed = reports.filter(r => r.status === 'Reviewed').length;
    const action = reports.filter(r => r.status === 'Action Taken').length;
    const dismissed = reports.filter(r => r.status === 'Dismissed').length;
    const resolvedPct = total ? Math.round(((action + dismissed) / total) * 100) : 0;

    const bySeverity = countBy(reports, 'severity');
    const byType = countBy(reports, 'damage_type');
    const byFort = countBy(reports, 'fort_name');
    const byStatus = { Pending: pending, Reviewed: reviewed, 'Action Taken': action, Dismissed: dismissed };

    const maxSeverity = Math.max(...Object.values(bySeverity), 1);
    const maxType = Math.max(...Object.values(byType), 1);
    const maxFort = Math.max(...Object.values(byFort), 1);

    const topFort = Object.entries(byFort).sort((a, b) => b[1] - a[1])[0];
    const critical = reports.filter(r => r.severity === 'Critical' || r.severity === 'Severe').length;
    const recent = [...reports].sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at)).slice(0, 5);

    const SEVERITY_ORDER = ['Critical', 'Severe', 'Moderate', 'Minor'];
    const STATUS_ITEMS = [
        { key: 'Pending', color: 'bg-amber-400', textColor: 'text-amber-700', bg: 'bg-amber-50' },
        { key: 'Reviewed', color: 'bg-blue-400', textColor: 'text-blue-700', bg: 'bg-blue-50' },
        { key: 'Action Taken', color: 'bg-emerald-500', textColor: 'text-emerald-700', bg: 'bg-emerald-50' },
        { key: 'Dismissed', color: 'bg-slate-400', textColor: 'text-slate-600', bg: 'bg-slate-100' },
    ];

    if (total === 0 && users.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-100 py-24 text-center">
                <PieChart className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="font-bold text-slate-500">No report data to analyse yet.</p>
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${!embedded ? 'max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-8' : ''}`}>
            {!embedded && (
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 leading-tight">System Analytics & Reports</h1>
                    <p className="text-sm text-slate-400 mt-1">Cross-system insights combining user reports and platform engagement.</p>
                </div>
            )}

            {/* ── KPI row ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={FileText} label="Total Reports" value={total} sub="All submissions" accent="bg-slate-100 text-slate-500" />
                {users.length > 0 ? (
                    <StatCard icon={Users} label="Total Users" value={users.length} sub="Registered platform users" accent="bg-purple-100 text-purple-600" />
                ) : (
                    <StatCard icon={Clock} label="Pending" value={pending} sub="Awaiting review" accent="bg-amber-100 text-amber-600" />
                )}
                <StatCard icon={Flame} label="High Severity" value={critical} sub="Critical + Severe" accent="bg-red-100 text-red-600" />
                <StatCard icon={TrendingUp} label="Resolution Rate" value={`${resolvedPct}%`} sub="Action + Dismissed" accent="bg-emerald-100 text-emerald-600" />
            </div>

            {/* ── Status distribution ── */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                    <Activity className="w-4 h-4 text-orange-500" />
                    <h3 className="text-sm font-extrabold text-slate-900">Status Distribution</h3>
                </div>
                <div className="flex rounded-xl overflow-hidden h-5 mb-4 border border-slate-100">
                    {STATUS_ITEMS.map(({ key, color }) =>
                        byStatus[key] > 0 ? (
                            <div key={key} title={`${key}: ${byStatus[key]}`}
                                className={`${color} transition-all`}
                                style={{ width: `${(byStatus[key] / total) * 100}%` }} />
                        ) : null
                    )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {STATUS_ITEMS.map(({ key, color, textColor, bg }) => (
                        <div key={key} className={`${bg} rounded-xl p-3 text-center border border-white/50 shadow-sm`}>
                            <p className={`text-2xl font-extrabold ${textColor}`}>{byStatus[key]}</p>
                            <div className="flex items-center justify-center gap-1.5 mt-1">
                                <span className={`w-2 h-2 rounded-full ${color}`} />
                                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{key}</p>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{total ? Math.round((byStatus[key] / total) * 100) : 0}% of total</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* ── Severity breakdown ── */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-5">
                        <Flame className="w-4 h-4 text-red-500" />
                        <h3 className="text-sm font-extrabold text-slate-900">Severity Breakdown</h3>
                    </div>
                    <div className="space-y-4">
                        {SEVERITY_ORDER.map(sev => (
                            bySeverity[sev] != null ? (
                                <HorizBar
                                    key={sev} label={sev} value={bySeverity[sev]} max={maxSeverity}
                                    colorClass={SEVERITY_COLOR[sev]?.bar || 'bg-slate-400'}
                                    badgeClass={SEVERITY_COLOR[sev]?.badge || 'bg-slate-100 text-slate-600'}
                                />
                            ) : null
                        ))}
                        {SEVERITY_ORDER.every(s => !bySeverity[s]) && (
                            <p className="text-sm text-slate-400 text-center py-4">No data</p>
                        )}
                    </div>
                </div>

                {/* ── Damage type breakdown ── */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-5">
                        <Layers className="w-4 h-4 text-orange-500" />
                        <h3 className="text-sm font-extrabold text-slate-900">Damage Type Breakdown</h3>
                    </div>
                    <div className="space-y-4">
                        {Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                            <HorizBar key={type} label={type} value={count} max={maxType}
                                colorClass="bg-orange-400" badgeClass="bg-orange-100 text-orange-700" />
                        ))}
                        {Object.keys(byType).length === 0 && (
                            <p className="text-sm text-slate-400 text-center py-4">No data</p>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Fort-wise report count ── */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                    <MapPin className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-sm font-extrabold text-slate-900">Reports by Fort</h3>
                    {topFort && (
                        <span className="ml-auto text-[11px] font-semibold text-slate-400">
                            Most reported: <span className="text-orange-600">{topFort[0]}</span> ({topFort[1]})
                        </span>
                    )}
                </div>
                <div className="space-y-4">
                    {Object.entries(byFort).sort((a, b) => b[1] - a[1]).map(([fort, count]) => (
                        <HorizBar key={fort} label={fort} value={count} max={maxFort}
                            colorClass="bg-indigo-400" badgeClass="bg-indigo-100 text-indigo-700" />
                    ))}
                    {Object.keys(byFort).length === 0 && (
                        <p className="text-sm text-slate-400 text-center py-4">No data</p>
                    )}
                </div>
            </div>

            {/* ── Recent 5 reports ── */}
            {recent.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-5">
                        <ArrowUpRight className="w-4 h-4 text-slate-500" />
                        <h3 className="text-sm font-extrabold text-slate-900">5 Most Recent Reports</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    {['Fort', 'Damage Type', 'Severity', 'Status', 'Date'].map(h => (
                                        <th key={h} className="px-3 py-2 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {recent.map(r => (
                                    <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-3 py-3 font-semibold text-slate-800">{r.fort_name}</td>
                                        <td className="px-3 py-3 text-slate-600">{r.damage_type}</td>
                                        <td className="px-3 py-3">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${SEVERITY_COLOR[r.severity]?.badge || 'bg-slate-100 text-slate-600'}`}>
                                                {r.severity}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3"><Badge status={r.status} /></td>
                                        <td className="px-3 py-3 text-xs text-slate-400">
                                            {new Date(r.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
