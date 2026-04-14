import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText, Clock, CheckCircle, AlertCircle,
    XCircle, RefreshCw, LogOut, ArrowLeft,
    MapPin, Calendar, ImageIcon, ChevronRight, Plus, Shield,
    TrendingUp, Star, Sparkles
} from 'lucide-react';

const STATUS = {
    'Pending': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-400', label: 'Pending Review' },
    'Reviewed': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-400', label: 'Under Review' },
    'Action Taken': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'Action Taken' },
    'Dismissed': { bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200', dot: 'bg-slate-400', label: 'Dismissed' },
};

const formatImageUrl = (url) => typeof url === 'string' && url.startsWith('http') ? url : `http://127.0.0.1:8000${url}`;

const SEVERITY_COLOR = {
    'Critical': 'bg-red-100 text-red-700 border-red-200',
    'Severe': 'bg-orange-100 text-orange-700 border-orange-200',
    'Moderate': 'bg-amber-100 text-amber-700 border-amber-200',
    'Minor': 'bg-slate-100 text-slate-600 border-slate-200',
};

const Badge = ({ status }) => {
    const s = STATUS[status] || STATUS['Pending'];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${s.bg} ${s.text} ${s.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {s.label}
        </span>
    );
};

export default function UserDashboard() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sel, setSel] = useState(null);
    const navigate = useNavigate();
    const username = localStorage.getItem('username') || 'User';
    const initial = username[0]?.toUpperCase();

    const load = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) { navigate('/login'); return; }
            const res = await fetch('http://127.0.0.1:8000/api/user-reports/', {
                headers: { Authorization: `Token ${token}` }
            });
            if (res.ok) {
                const d = await res.json();
                setReports(Array.isArray(d) ? d : (d.results || []));
            } else setError('Failed to load reports.');
        } catch { setError('Network error.'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const pending = reports.filter(r => r.status === 'Pending').length;
    const resolved = reports.filter(r => r.status === 'Action Taken').length;
    const reviewed = reports.filter(r => r.status === 'Reviewed').length;

    return (
        <div className="min-h-screen bg-[#F8F9FB]">

            {/* ── Nav ── */}
            <nav className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm relative">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="h-6 w-px bg-slate-200" />
                        <div className="flex items-center gap-3 pl-1">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-black text-slate-900 text-lg hidden sm:inline tracking-tight">DurgSetu User</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4">
                        <button onClick={() => navigate('/report')}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-orange-500/20 active:scale-95 cursor-pointer">
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Submit Report</span>
                        </button>

                        <div className="hidden sm:flex items-center gap-3 bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200 rounded-xl px-3 py-1.5 cursor-pointer">
                            <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                                <span className="text-white font-black text-xs">{initial}</span>
                            </div>
                            <span className="text-sm font-bold text-slate-700 px-1">{username}</span>
                        </div>

                        <button onClick={() => { localStorage.clear(); navigate('/login'); }}
                            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-red-600 p-2 sm:px-4 sm:py-2.5 rounded-xl hover:bg-red-50 border border-transparent hover:border-red-100 transition-all cursor-pointer">
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                {/* ── Header ── */}
                <div className="mb-8">
                    <p className="text-orange-600 text-xs font-bold uppercase tracking-widest mb-1.5">Overview</p>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        Welcome back, {username.split('@')[0]} <Sparkles className="w-6 h-6 text-yellow-400" />
                    </h1>
                </div>

                {/* ── Stats ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {[
                        { label: 'Total', value: reports.length, icon: FileText, accent: 'from-slate-400 to-slate-500', bg: 'bg-slate-50', text: 'text-slate-600' },
                        { label: 'Pending', value: pending, icon: Clock, accent: 'from-amber-400 to-amber-500', bg: 'bg-amber-50', text: 'text-amber-600' },
                        { label: 'Reviewed', value: reviewed, icon: TrendingUp, accent: 'from-blue-400 to-blue-500', bg: 'bg-blue-50', text: 'text-blue-600' },
                        { label: 'Resolved', value: resolved, icon: CheckCircle, accent: 'from-emerald-400 to-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-600' },
                    ].map(({ label, value, icon: Icon, accent, bg, text }) => (
                        <div key={label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-orange-100 transition-all">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center mb-3 shadow-sm`}>
                                <Icon className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
                            <p className="text-xs text-slate-400 font-semibold mt-1 uppercase tracking-wide">{label}</p>
                        </div>
                    ))}
                </div>

                {/* ── Reports List ── */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                        <div>
                            <h2 className="font-black text-slate-900">Submitted Reports</h2>
                            <p className="text-xs text-slate-400 mt-0.5">Your fort damage submissions &amp; admin responses</p>
                        </div>
                        <button onClick={load} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-orange-600 font-bold transition-colors cursor-pointer p-2 rounded-xl hover:bg-orange-50">
                            <RefreshCw className="w-3.5 h-3.5" /> Refresh
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-28">
                            <div className="w-10 h-10 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="m-6 p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-3 border border-red-100">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm font-semibold">{error}</p>
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="text-center py-24 px-8">
                            <div className="w-20 h-20 bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                                <FileText className="w-10 h-10 text-orange-300" />
                            </div>
                            <p className="text-slate-800 font-black text-xl mb-1">No reports yet</p>
                            <p className="text-slate-400 text-sm mb-6">Submit your first fort damage report and track its status here.</p>
                            <button onClick={() => navigate('/report')}
                                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-orange-200 cursor-pointer active:scale-95">
                                Submit First Report
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {reports.map(r => {
                                const hasAdminUpdate = r.admin_notes || r.repair_image;
                                const sevCls = SEVERITY_COLOR[r.severity] || 'bg-slate-100 text-slate-600 border-slate-200';
                                return (
                                    <div key={r.id} className="p-5 sm:p-6 hover:bg-slate-50/60 transition-colors group">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">

                                                {/* Title + badge */}
                                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                                    <h3 className="font-black text-slate-900 text-base group-hover:text-orange-600 transition-colors">{r.fort_name}</h3>
                                                    <Badge status={r.status} />
                                                </div>

                                                {/* Meta pills */}
                                                <div className="flex flex-wrap gap-1.5 mb-3">
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold">
                                                        <MapPin className="w-3 h-3 text-slate-400" />{r.location}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold">
                                                        {r.damage_type}
                                                    </span>
                                                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold border ${sevCls}`}>
                                                        {r.severity}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-400 rounded-lg text-xs font-semibold">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(r.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>

                                                {/* Admin response */}
                                                {hasAdminUpdate && (
                                                    <div className="mt-2 p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-2.5">
                                                        <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-black text-emerald-700 mb-0.5">Admin Response</p>
                                                            {r.admin_notes && <p className="text-xs text-emerald-800 leading-relaxed">{r.admin_notes}</p>}
                                                            {r.repair_image && (
                                                                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                                                                    <ImageIcon className="w-3 h-3" /> Repair photo attached — tap Details to view
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Details button */}
                                            <button onClick={() => setSel(r)}
                                                className="flex-shrink-0 flex items-center gap-1 px-3.5 py-2.5 text-xs font-bold text-slate-500 hover:text-orange-600 bg-slate-100 hover:bg-orange-50 rounded-xl transition-all border border-transparent hover:border-orange-100 cursor-pointer group-hover:shadow-sm">
                                                Details <ChevronRight className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Detail Modal ── */}
            {sel && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[92vh] flex flex-col">
                        {/* Modal header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                                    <Shield className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="font-black text-slate-900">Report Details</h2>
                                    <p className="text-xs text-slate-400 mt-0.5">{sel.fort_name}</p>
                                </div>
                            </div>
                            <button onClick={() => setSel(null)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 space-y-4 flex-1">
                            {/* Status + date */}
                            <div className="flex items-center gap-3">
                                <Badge status={sel.status} />
                                <span className="text-xs text-slate-400 font-medium">{new Date(sel.submitted_at).toLocaleString('en-IN')}</span>
                            </div>

                            {/* Details grid */}
                            <div className="grid grid-cols-2 gap-2.5">
                                {[['Fort', sel.fort_name], ['Location', sel.location], ['Damage Type', sel.damage_type], ['Severity', sel.severity]].map(([k, v]) => (
                                    <div key={k} className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100">
                                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">{k}</p>
                                        <p className="text-sm font-black text-slate-800 mt-0.5">{v}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Description */}
                            {sel.description && (
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Your Description</p>
                                    <p className="text-sm text-slate-700 leading-relaxed">{sel.description}</p>
                                </div>
                            )}

                            {/* Photos */}
                            {sel.images?.length > 0 && (
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Your Photos</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {sel.images.map(img => (
                                            <img key={img.id} src={img.image} alt="" className="w-full h-36 object-cover rounded-2xl border border-slate-200 shadow-sm" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Admin response */}
                            {(sel.admin_notes || sel.repair_image) && (
                                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 space-y-3">
                                    <p className="text-xs font-black text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                                        <CheckCircle className="w-3.5 h-3.5" /> Admin Response
                                    </p>
                                    {sel.admin_notes && <p className="text-sm text-emerald-800 leading-relaxed">{sel.admin_notes}</p>}
                                    {sel.repair_image && (
                                        <div>
                                            <p className="text-xs text-emerald-600 font-semibold mb-2 flex items-center gap-1">
                                                <ImageIcon className="w-3 h-3" /> Repair Documentation
                                            </p>
                                            <img src={formatImageUrl(sel.repair_image)} alt="Repair"
                                                className="w-full h-48 object-cover rounded-2xl border border-emerald-200 shadow-sm" />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
