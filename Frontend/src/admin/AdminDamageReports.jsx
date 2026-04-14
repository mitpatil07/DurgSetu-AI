import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Shield, Clock, CheckCircle, AlertCircle,
    RefreshCw, Edit3, Upload, X, LogOut,
    FileText, MapPin, Calendar, ChevronDown, ZoomIn,
    Image as ImageIcon, Bell, Settings, ChevronRight,
    BarChart2, Users, Home, Menu, Search, TrendingUp,
    PieChart, Activity, Layers, Flame, ArrowUpRight
} from 'lucide-react';
import UserReportAnalysis from './UserReportAnalysis';
import AdminNavbar from './AdminNavbar';
import { successToast, errorToast } from '../services/swal';

const FONT = "'DM Sans', 'Inter', system-ui, sans-serif";

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

const Label = ({ children }) => (
    <p className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{children}</p>
);

const Lightbox = ({ src, onClose }) => (
    <div className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-4" onClick={onClose}>
        <button className="absolute top-4 right-4 p-2 text-white hover:text-orange-400 transition-colors" onClick={onClose}>
            <X className="w-7 h-7" />
        </button>
        <img src={src} alt="Full view" className="max-w-full max-h-[90vh] rounded-xl shadow-2xl object-contain" onClick={e => e.stopPropagation()} />
    </div>
);





/* ─── Main page ─────────────────────────────────────── */
export default function AdminDamageReports() {
    const navigate = useNavigate();
    const location = useLocation();

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sel, setSel] = useState(null);
    const [lightbox, setLightbox] = useState(null);
    const [form, setForm] = useState({ status: '', admin_notes: '', repair_image: null });
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState(location.pathname === '/analytics' ? 'analysis' : 'reports');
    const admin = localStorage.getItem('username') || 'Admin';

    useEffect(() => {
        document.body.style.overflow = (sel || lightbox) ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [sel, lightbox]);

    useEffect(() => {
        const h = e => { if (e.key === 'Escape') { if (lightbox) setLightbox(null); else setSel(null); } };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, [lightbox]);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            if (!token || localStorage.getItem('is_staff') !== 'true') { navigate('/login'); return; }
            const res = await fetch('http://127.0.0.1:8000/api/admin-reports/', {
                headers: { Authorization: `Token ${token}` },
            });
            if (res.ok) { const d = await res.json(); setReports(Array.isArray(d) ? d : (d.results || [])); }
            else setError('Could not load reports.');
        } catch { setError('Network error.'); } finally { setLoading(false); }
    }, [navigate]);

    useEffect(() => { load(); }, [load]);

    const open = r => { setSel(r); setForm({ status: r.status, admin_notes: r.admin_notes || '', repair_image: null }); };

    const save = async e => {
        e.preventDefault(); setSaving(true);
        try {
            const fd = new FormData();
            fd.append('status', form.status);
            if (form.admin_notes) fd.append('admin_notes', form.admin_notes);
            if (form.repair_image) fd.append('repair_image', form.repair_image);
            const res = await fetch(`http://127.0.0.1:8000/api/admin-reports/${sel.id}/`, {
                method: 'PATCH',
                headers: { Authorization: `Token ${localStorage.getItem('auth_token')}` },
                body: fd,
            });
            if (res.ok) { setSel(null); load(); successToast('Report Updated', 'Changes saved successfully.'); }
            else errorToast('Update Failed', 'Please try again.');
        } catch { errorToast('Network Error', 'Connection failed. Please try again.'); } finally { setSaving(false); }
    };

    const pending = reports.filter(r => r.status === 'Pending').length;
    const resolved = reports.filter(r => r.status === 'Action Taken').length;

    return (
        <div style={{ fontFamily: FONT }} className="min-h-screen bg-[#F8F9FB]">
            <AdminNavbar pendingCount={pending} onRefresh={load} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                {/* Heading */}
                <div className="flex items-end justify-between gap-4 flex-wrap">
                    <div>
                        <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">Report Management</p>
                        <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 leading-tight">Damage Reports</h1>
                        <p className="text-sm text-slate-400 mt-1">Review submissions and track analytics across all reported forts.</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                    {[
                        { label: 'Total Reports', value: reports.length, icon: FileText, accent: 'bg-slate-100 text-slate-500' },
                        { label: 'Pending', value: pending, icon: Clock, accent: 'bg-amber-100 text-amber-600' },
                        { label: 'Resolved', value: resolved, icon: CheckCircle, accent: 'bg-emerald-100 text-emerald-600' },
                    ].map(({ label, value, icon: Icon, accent }) => (
                        <div key={label} className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-none">{value}</p>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">{label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    {/* ── Reports tab content ── */}
                    {activeTab === 'reports' && (
                        loading ? (
                            <div className="flex items-center justify-center py-28">
                                <div className="w-8 h-8 border-[3px] border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                            </div>
                        ) : error ? (
                            <div className="m-6 flex items-center gap-3 p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" /><p className="text-sm font-medium">{error}</p>
                            </div>
                        ) : reports.length === 0 ? (
                            <div className="text-center py-28 px-6">
                                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <FileText className="w-7 h-7 text-orange-300" />
                                </div>
                                <p className="font-bold text-slate-700 text-base">No reports submitted yet</p>
                                <p className="text-slate-400 text-sm mt-1">Reports from users will appear here.</p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-100">
                                                {['Fort & Location', 'Reporter', 'Type', 'Severity', 'Status', 'Date', ''].map(h => (
                                                    <th key={h} className="px-5 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reports.map(r => (
                                                <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                                                    <td className="px-5 py-4">
                                                        <p className="font-bold text-slate-900 text-sm">{r.fort_name}</p>
                                                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{r.location}</p>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <p className="font-semibold text-slate-800 text-sm">{r.user_name || r.reporter_name || '—'}</p>
                                                        <p className="text-xs text-slate-400 mt-0.5">{r.user_email || ''}</p>
                                                    </td>
                                                    <td className="px-5 py-4 text-sm text-slate-700 font-medium">{r.damage_type}</td>
                                                    <td className="px-5 py-4">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${SEVERITY_COLOR[r.severity]?.badge || 'bg-slate-100 text-slate-600'}`}>
                                                            {r.severity}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4"><Badge status={r.status} /></td>
                                                    <td className="px-5 py-4 text-xs text-slate-400">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(r.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 text-right">
                                                        <button onClick={() => open(r)}
                                                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold rounded-lg text-xs transition-all shadow-sm shadow-orange-200 cursor-pointer">
                                                            <Edit3 className="w-3.5 h-3.5" /> Review
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile cards */}
                                <div className="md:hidden divide-y divide-slate-100">
                                    {reports.map(r => (
                                        <div key={r.id} className="p-4 space-y-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className="font-bold text-slate-900 text-sm">{r.fort_name}</p>
                                                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{r.location}</p>
                                                </div>
                                                <Badge status={r.status} />
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 text-xs">
                                                <div><p className="text-slate-400 mb-0.5">Reporter</p><p className="font-semibold text-slate-800">{r.user_name || '—'}</p></div>
                                                <div><p className="text-slate-400 mb-0.5">Type</p><p className="font-semibold text-slate-800">{r.damage_type}</p></div>
                                                <div><p className="text-slate-400 mb-0.5">Severity</p><p className="font-semibold text-slate-800">{r.severity}</p></div>
                                            </div>
                                            <button onClick={() => open(r)}
                                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm transition-all cursor-pointer">
                                                <Edit3 className="w-4 h-4" /> Review Report
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )
                    )}

                    {/* ── Analysis tab content ── */}
                    {activeTab === 'analysis' && (
                        <div className="p-6">
                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <div className="w-8 h-8 border-[3px] border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                                </div>
                            ) : (
                                <UserReportAnalysis initialReports={reports} embedded={true} />
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Review Modal ── */}
            {sel && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 backdrop-blur-sm overflow-y-auto py-6 px-4">
                    <div style={{ fontFamily: FONT }} className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl my-auto">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center">
                                    <Edit3 className="w-4 h-4 text-orange-600" />
                                </div>
                                <div>
                                    <h2 className="text-base font-extrabold text-slate-900">Review Report</h2>
                                    <p className="text-xs text-slate-400">{sel.fort_name} · {sel.damage_type}</p>
                                </div>
                            </div>
                            <button onClick={() => setSel(null)} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400 font-medium">Current status:</span>
                                <Badge status={sel.status} />
                            </div>
                            <div>
                                <Label>Report Information</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {[
                                        ['Fort', sel.fort_name],
                                        ['Location', sel.location],
                                        ['Damage Type', sel.damage_type],
                                        ['Severity', sel.severity],
                                        ['Reporter', sel.user_name || sel.reporter_name || '—'],
                                        ['Date', new Date(sel.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })],
                                    ].map(([k, v]) => (
                                        <div key={k} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                                            <p className="text-[11px] text-slate-400 font-semibold">{k}</p>
                                            <p className="text-sm font-bold text-slate-800 mt-0.5">{v}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {sel.description && (
                                <div>
                                    <Label>Description</Label>
                                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                                        <p className="text-sm text-slate-700 leading-relaxed">{sel.description}</p>
                                    </div>
                                </div>
                            )}

                            {sel.images?.length > 0 && (
                                <div>
                                    <Label>Submitted Photos — click to expand</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {sel.images.map(img => (
                                            <div key={img.id} className="relative group cursor-pointer rounded-xl overflow-hidden border border-slate-200 aspect-square" onClick={() => setLightbox(img.image)}>
                                                <img src={img.image} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-200" />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                                                    <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {sel.repair_image && (
                                <div>
                                    <Label>Previous Repair Photo</Label>
                                    <div className="relative group cursor-pointer rounded-xl overflow-hidden border border-emerald-200 w-fit" onClick={() => setLightbox(`http://127.0.0.1:8000${sel.repair_image}`)}>
                                        <img src={`http://127.0.0.1:8000${sel.repair_image}`} alt="Repair" className="h-36 w-full object-cover transition-transform group-hover:scale-105 duration-200" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                                            <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={save} className="space-y-4 pt-2 border-t border-slate-100">
                                <Label>Admin Action</Label>
                                <div>
                                    <p className="text-sm font-semibold text-slate-700 mb-1.5">Update Status</p>
                                    <div className="relative">
                                        <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                                            className="w-full appearance-none pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400 transition cursor-pointer">
                                            <option>Pending</option>
                                            <option>Reviewed</option>
                                            <option>Action Taken</option>
                                            <option>Dismissed</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-700 mb-1.5">Admin Notes</p>
                                    <textarea value={form.admin_notes} onChange={e => setForm({ ...form, admin_notes: e.target.value })}
                                        rows={3} placeholder="Describe actions taken or observations..."
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition resize-none" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-700 mb-1.5">Upload Repair Photo</p>
                                    <label className="flex items-center gap-3 w-full px-4 py-4 border-2 border-dashed border-slate-200 hover:border-orange-400 hover:bg-orange-50/40 rounded-xl cursor-pointer transition-all group">
                                        <div className="w-10 h-10 bg-slate-100 group-hover:bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                                            {form.repair_image ? <ImageIcon className="w-5 h-5 text-orange-500" /> : <Upload className="w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-colors" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-slate-700 group-hover:text-orange-700 transition-colors">
                                                {form.repair_image ? form.repair_image.name : 'Click to upload photo'}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-0.5">PNG, JPG or WEBP · Max 10MB</p>
                                        </div>
                                        <input type="file" accept="image/*" className="hidden" onChange={e => setForm({ ...form, repair_image: e.target.files[0] || null })} />
                                    </label>
                                    {form.repair_image && (
                                        <button type="button" onClick={() => setForm({ ...form, repair_image: null })}
                                            className="mt-1.5 text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 cursor-pointer">
                                            <X className="w-3 h-3" /> Remove
                                        </button>
                                    )}
                                </div>
                                <div className="flex gap-3 pt-1">
                                    <button type="button" onClick={() => setSel(null)}
                                        className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-all cursor-pointer">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={saving}
                                        className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow shadow-orange-200 cursor-pointer">
                                        {saving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</> : <><CheckCircle className="w-4 h-4" /> Save Changes</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
        </div>
    );
}