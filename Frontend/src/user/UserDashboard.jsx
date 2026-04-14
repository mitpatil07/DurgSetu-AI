import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText, Clock, CheckCircle, AlertCircle,
    XCircle, RefreshCw, LogOut, ArrowLeft,
    MapPin, Calendar, ImageIcon, ChevronRight, Plus, Shield
} from 'lucide-react';

const STATUS = {
    'Pending': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-400', label: 'Pending Review' },
    'Reviewed': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-400', label: 'Under Review' },
    'Action Taken': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'Action Taken' },
    'Dismissed': { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', dot: 'bg-slate-400', label: 'Dismissed' },
};

const Badge = ({ status }) => {
    const s = STATUS[status] || STATUS['Pending'];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${s.bg} ${s.text} ${s.border}`}>
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
            const res = await fetch('http://127.0.0.1:8000/api/user-reports/', { headers: { Authorization: `Token ${token}` } });
            if (res.ok) { const d = await res.json(); setReports(Array.isArray(d) ? d : (d.results || [])); }
            else setError('Failed to load reports.');
        } catch { setError('Network error.'); } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const pending = reports.filter(r => r.status === 'Pending').length;
    const resolved = reports.filter(r => r.status === 'Action Taken').length;

    return (
        <div className="min-h-screen bg-slate-50 font-sans">

            {/* ── Nav ── */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/')} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer">
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div className="h-5 w-px bg-slate-200" />
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow shadow-orange-200">
                                <Shield className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-slate-800 text-sm hidden sm:inline">DurgSetu User</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/report')}
                            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-orange-200 active:scale-95 cursor-pointer">
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Submit Report</span>
                        </button>

                        <div className="hidden sm:flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-lg px-3 py-1.5">
                            <div className="w-6 h-6 bg-orange-500 rounded-md flex items-center justify-center">
                                <span className="text-white font-bold text-xs">{initial}</span>
                            </div>
                            <span className="text-sm font-semibold text-orange-800">{username}</span>
                        </div>

                        <button onClick={() => { localStorage.clear(); navigate('/login'); }}
                            className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-red-600 px-3 py-2 rounded-xl hover:bg-red-50 transition-all cursor-pointer">
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                {/* ── Page Title ── */}
                <div>
                    <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">My Activity</p>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">My Reports</h1>
                    <p className="text-slate-400 text-sm mt-1">Track all your submitted fort damage reports and admin responses.</p>
                </div>

                {/* ── Stats ── */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                    {[
                        { label: 'Submitted', value: reports.length, icon: FileText, accent: 'bg-slate-100 text-slate-500' },
                        { label: 'Pending', value: pending, icon: Clock, accent: 'bg-amber-100 text-amber-600' },
                        { label: 'Resolved', value: resolved, icon: CheckCircle, accent: 'bg-emerald-100 text-emerald-600' },
                    ].map(({ label, value, icon: Icon, accent }) => (
                        <div key={label} className="bg-white rounded-xl border border-slate-100 px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-none">{value}</p>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">{label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Reports List ── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                        <h2 className="font-bold text-slate-800">Submitted Reports</h2>
                        <button onClick={load} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-orange-600 font-semibold transition-colors cursor-pointer">
                            <RefreshCw className="w-3.5 h-3.5" /> Refresh
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-28">
                            <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="m-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 border border-red-100">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" /><p className="text-sm font-medium">{error}</p>
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="text-center py-24 px-8">
                            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-orange-300" />
                            </div>
                            <p className="text-slate-700 font-bold text-lg">No reports yet</p>
                            <p className="text-slate-400 text-sm mt-1 mb-6">Submit your first damage report and track its status here.</p>
                            <button onClick={() => navigate('/report')}
                                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm transition-all shadow-sm shadow-orange-200 cursor-pointer">
                                Submit a Report
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {reports.map(r => {
                                const s = STATUS[r.status] || STATUS['Pending'];
                                const hasAdminUpdate = r.admin_notes || r.repair_image;
                                return (
                                    <div key={r.id} className="p-5 sm:p-6 hover:bg-slate-50/60 transition-colors">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                {/* Title row */}
                                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                                    <h3 className="font-bold text-slate-900">{r.fort_name}</h3>
                                                    <Badge status={r.status} />
                                                </div>

                                                {/* Meta pills */}
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">
                                                        <MapPin className="w-3 h-3" />{r.location}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">
                                                        {r.damage_type}
                                                    </span>
                                                    <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold ${r.severity === 'Critical' ? 'bg-red-100 text-red-700' : r.severity === 'High' ? 'bg-orange-100 text-orange-700' : r.severity === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                                                        {r.severity}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-500 rounded-md text-xs font-medium">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(r.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>

                                                {/* Admin Update banner */}
                                                {hasAdminUpdate && (
                                                    <div className="mt-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2.5">
                                                        <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-bold text-emerald-700 mb-0.5">Admin Response</p>
                                                            {r.admin_notes && <p className="text-xs text-emerald-800 leading-relaxed">{r.admin_notes}</p>}
                                                            {r.repair_image && <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1"><ImageIcon className="w-3 h-3" />Repair photo attached — tap Details to view</p>}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Details button */}
                                            <button onClick={() => setSel(r)}
                                                className="flex-shrink-0 flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-orange-600 bg-slate-100 hover:bg-orange-50 rounded-lg transition-all border border-transparent hover:border-orange-100 cursor-pointer">
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

            {/* ── Detail Drawer / Modal ── */}
            {sel && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
                            <div>
                                <h2 className="font-bold text-slate-900">Report Details</h2>
                                <p className="text-xs text-slate-400 mt-0.5">{sel.fort_name}</p>
                            </div>
                            <button onClick={() => setSel(null)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all cursor-pointer">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 space-y-5 flex-1">
                            <div className="flex items-center gap-3">
                                <Badge status={sel.status} />
                                <span className="text-xs text-slate-400">{new Date(sel.submitted_at).toLocaleString('en-IN')}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5">
                                {[['Fort', sel.fort_name], ['Location', sel.location], ['Damage Type', sel.damage_type], ['Severity', sel.severity]].map(([k, v]) => (
                                    <div key={k} className="bg-slate-50 rounded-xl p-3">
                                        <p className="text-xs text-slate-400 font-medium">{k}</p>
                                        <p className="text-sm font-bold text-slate-800 mt-0.5">{v}</p>
                                    </div>
                                ))}
                            </div>

                            {sel.description && (
                                <div className="bg-slate-50 rounded-xl p-4">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Your Description</p>
                                    <p className="text-sm text-slate-700 leading-relaxed">{sel.description}</p>
                                </div>
                            )}

                            {sel.images?.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Your Photos</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {sel.images.map(img => <img key={img.id} src={img.image} alt="" className="w-full h-32 object-cover rounded-xl border border-slate-200" />)}
                                    </div>
                                </div>
                            )}

                            {(sel.admin_notes || sel.repair_image) && (
                                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-3">
                                    <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                                        <CheckCircle className="w-3.5 h-3.5" /> Admin Response
                                    </p>
                                    {sel.admin_notes && <p className="text-sm text-emerald-800 leading-relaxed">{sel.admin_notes}</p>}
                                    {sel.repair_image && (
                                        <div>
                                            <p className="text-xs text-emerald-600 font-medium mb-2 flex items-center gap-1"><ImageIcon className="w-3 h-3" />Repair Documentation</p>
                                            <img src={`http://127.0.0.1:8000${sel.repair_image}`} alt="Repair"
                                                className="w-full h-44 object-cover rounded-xl border border-emerald-200 shadow-sm" />
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
