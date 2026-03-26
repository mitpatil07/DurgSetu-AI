import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Shield, Clock, CheckCircle, AlertCircle,
    RefreshCw, Edit3, Upload, X, LogOut,
    FileText, MapPin, Calendar, ChevronDown, ZoomIn,
    Image as ImageIcon, Bell, Settings, ChevronRight,
    BarChart2, Users, Home, Menu, Search
} from 'lucide-react';

/* ─── Design tokens ───────────────────────────────── */
const FONT = "'DM Sans', 'Inter', system-ui, sans-serif";

const STATUS = {
    'Pending':      { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-400'   },
    'Reviewed':     { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    dot: 'bg-blue-400'    },
    'Action Taken': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    'Dismissed':    { bg: 'bg-slate-100',  text: 'text-slate-500',   border: 'border-slate-200',   dot: 'bg-slate-400'   },
};

/* ─── Atoms ─────────────────────────────────────────── */
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

/* ─── Lightbox ──────────────────────────────────────── */
const Lightbox = ({ src, onClose }) => (
    <div className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-4" onClick={onClose}>
        <button className="absolute top-4 right-4 p-2 text-white hover:text-orange-400 transition-colors" onClick={onClose}>
            <X className="w-7 h-7" />
        </button>
        <img src={src} alt="Full view" className="max-w-full max-h-[90vh] rounded-xl shadow-2xl object-contain" onClick={e => e.stopPropagation()} />
    </div>
);

/* ─── Nav config ────────────────────────────────────── */
const NAV_LINKS = [
    { icon: Home,      label: 'Dashboard', path: '/'          },
    { icon: FileText,  label: 'Reports',   path: '/reports'   },
    { icon: BarChart2, label: 'Analytics', path: '/analytics' },
    { icon: Users,     label: 'Users',     path: '/users'     },
];

/* ─── Navbar component ──────────────────────────────── */
function Navbar({ admin, pendingCount, onRefresh, navigate }) {
    const [profileOpen, setProfileOpen] = useState(false);
    const [mobileOpen,  setMobileOpen]  = useState(false);
    const activePath = '/reports';

    return (
        <div className="sticky top-0 z-30">

            {/* ── Primary bar ── */}
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center h-16 gap-3">

                        {/* Brand */}
                        <div className="flex items-center gap-2.5 flex-shrink-0 mr-4">
                            <div className="relative w-9 h-9">
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl shadow-md shadow-orange-200" />
                                <Shield className="absolute inset-0 m-auto w-[18px] h-[18px] text-white" />
                            </div>
                            <div className="hidden sm:block leading-tight">
                                <p className="text-[13px] font-extrabold text-slate-900 tracking-tight">DurgSetu</p>
                                <p className="text-[10px] text-slate-400 font-semibold tracking-wide">Admin Portal</p>
                            </div>
                        </div>

                        <span className="hidden md:block h-6 w-px bg-slate-200 flex-shrink-0" />

                        {/* Nav links — desktop */}
                        <nav className="hidden md:flex items-center gap-0.5 flex-1">
                            {NAV_LINKS.map(({ icon: Icon, label, path }) => {
                                const active = path === activePath;
                                return (
                                    <button
                                        key={label}
                                        onClick={() => navigate(path)}
                                        className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer
                                            ${active
                                                ? 'text-orange-600 bg-orange-50'
                                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {label}
                                        {label === 'Reports' && pendingCount > 0 && (
                                            <span className="px-1.5 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full leading-none">
                                                {pendingCount}
                                            </span>
                                        )}
                                        {active && (
                                            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-orange-500 rounded-full" />
                                        )}
                                    </button>
                                );
                            })}
                        </nav>

                        {/* Spacer on mobile */}
                        <div className="flex-1 md:hidden" />

                        {/* Right actions */}
                        <div className="flex items-center gap-1.5">

                            {/* Search pill — desktop only */}
                            <button className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 hover:border-slate-300 hover:bg-white transition-all cursor-pointer">
                                <Search className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-xs font-medium text-slate-400">Search…</span>
                                <kbd className="ml-1 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-400">⌘K</kbd>
                            </button>

                            {/* Refresh */}
                            <button
                                onClick={onRefresh}
                                title="Refresh reports"
                                className="p-2 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 transition-all cursor-pointer"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>

                            {/* Bell */}
                            <div className="relative">
                                <button className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer">
                                    <Bell className="w-4 h-4" />
                                </button>
                                {pendingCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-white pointer-events-none" />
                                )}
                            </div>

                            <span className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

                            {/* Profile button + dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setProfileOpen(v => !v)}
                                    className={`flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-xl border transition-all cursor-pointer
                                        ${profileOpen
                                            ? 'bg-orange-50 border-orange-200'
                                            : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300'}`}
                                >
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-sm flex-shrink-0">
                                        <span className="text-white font-extrabold text-xs">{admin[0]?.toUpperCase()}</span>
                                    </div>
                                    <div className="hidden sm:block text-left leading-tight">
                                        <p className="text-[12px] font-bold text-slate-800">{admin}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">Administrator</p>
                                    </div>
                                    <ChevronDown className={`hidden sm:block w-3.5 h-3.5 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {profileOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/60 z-50 overflow-hidden">
                                            {/* Dropdown header */}
                                            <div className="px-4 py-3.5 bg-gradient-to-br from-orange-50 to-amber-50 border-b border-orange-100/80">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md shadow-orange-200">
                                                        <span className="text-white font-extrabold text-sm">{admin[0]?.toUpperCase()}</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-extrabold text-slate-900 leading-none">{admin}</p>
                                                        <p className="text-xs text-orange-600 font-semibold mt-0.5">Administrator</p>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Menu items */}
                                            <div className="p-2 space-y-0.5">
                                                <button
                                                    onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer group"
                                                >
                                                    <Settings className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                                                    Settings
                                                    <ChevronRight className="w-3.5 h-3.5 ml-auto text-slate-300" />
                                                </button>
                                                <div className="h-px bg-slate-100 mx-1" />
                                                <button
                                                    onClick={() => { localStorage.clear(); navigate('/login'); }}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Sign out
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Mobile hamburger */}
                            <button
                                onClick={() => setMobileOpen(v => !v)}
                                className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Mobile slide-down menu ── */}
                {mobileOpen && (
                    <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
                        {NAV_LINKS.map(({ icon: Icon, label, path }) => {
                            const active = path === activePath;
                            return (
                                <button
                                    key={label}
                                    onClick={() => { navigate(path); setMobileOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer
                                        ${active ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                    {label === 'Reports' && pendingCount > 0 && (
                                        <span className="ml-auto px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full">
                                            {pendingCount}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </header>

            {/* ── Breadcrumb ── */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-9 flex items-center gap-1.5 text-xs font-semibold">
                    <button onClick={() => navigate('/')} className="flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                        <Home className="w-3.5 h-3.5" /> Home
                    </button>
                    <ChevronRight className="w-3 h-3 text-slate-300" />
                    <button onClick={() => navigate('/reports')} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                        Reports
                    </button>
                    <ChevronRight className="w-3 h-3 text-slate-300" />
                    <span className="text-orange-500">Damage Reports</span>
                </div>
            </div>
        </div>
    );
}

/* ─── Main page ─────────────────────────────────────── */
export default function AdminDamageReports() {
    const [reports,  setReports]  = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState('');
    const [sel,      setSel]      = useState(null);
    const [lightbox, setLightbox] = useState(null);
    const [form,     setForm]     = useState({ status: '', admin_notes: '', repair_image: null });
    const [saving,   setSaving]   = useState(false);
    const navigate = useNavigate();
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
            if (form.admin_notes)  fd.append('admin_notes',  form.admin_notes);
            if (form.repair_image) fd.append('repair_image', form.repair_image);
            const res = await fetch(`http://127.0.0.1:8000/api/admin-reports/${sel.id}/`, {
                method: 'PATCH',
                headers: { Authorization: `Token ${localStorage.getItem('auth_token')}` },
                body: fd,
            });
            if (res.ok) { setSel(null); load(); }
            else alert('Update failed. Please try again.');
        } catch { alert('Network error.'); } finally { setSaving(false); }
    };

    const pending  = reports.filter(r => r.status === 'Pending').length;
    const resolved = reports.filter(r => r.status === 'Action Taken').length;

    return (
        <div style={{ fontFamily: FONT }} className="min-h-screen bg-[#F8F9FB]">

            <Navbar admin={admin} pendingCount={pending} onRefresh={load} navigate={navigate} />

            {/* ── Page body ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                {/* Heading */}
                <div>
                    <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">Report Management</p>
                    <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 leading-tight">Damage Reports</h1>
                    <p className="text-sm text-slate-400 mt-1">Review submissions and update repair status.</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                    {[
                        { label: 'Total Reports', value: reports.length, icon: FileText,    accent: 'bg-slate-100 text-slate-500'     },
                        { label: 'Pending',        value: pending,        icon: Clock,       accent: 'bg-amber-100 text-amber-600'     },
                        { label: 'Resolved',       value: resolved,       icon: CheckCircle, accent: 'bg-emerald-100 text-emerald-600' },
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

                {/* Table card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-28">
                            <div className="w-8 h-8 border-[3px] border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="m-6 flex items-center gap-3 p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
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
                                            {['Fort & Location','Reporter','Type','Severity','Status','Date',''].map(h => (
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
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold
                                                        ${r.severity === 'Critical' ? 'bg-red-100 text-red-700'
                                                        : r.severity === 'High'     ? 'bg-orange-100 text-orange-700'
                                                        :                             'bg-slate-100 text-slate-600'}`}>
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
                                        ['Fort',        sel.fort_name],
                                        ['Location',    sel.location],
                                        ['Damage Type', sel.damage_type],
                                        ['Severity',    sel.severity],
                                        ['Reporter',    sel.user_name || sel.reporter_name || '—'],
                                        ['Date',        new Date(sel.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })],
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
                                            <div key={img.id}
                                                className="relative group cursor-pointer rounded-xl overflow-hidden border border-slate-200 aspect-square"
                                                onClick={() => setLightbox(img.image)}>
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
                                    <div className="relative group cursor-pointer rounded-xl overflow-hidden border border-emerald-200 w-fit"
                                        onClick={() => setLightbox(`http://127.0.0.1:8000${sel.repair_image}`)}>
                                        <img src={`http://127.0.0.1:8000${sel.repair_image}`} alt="Repair"
                                            className="h-36 w-full object-cover transition-transform group-hover:scale-105 duration-200" />
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
                                            {form.repair_image
                                                ? <ImageIcon className="w-5 h-5 text-orange-500" />
                                                : <Upload className="w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-colors" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-slate-700 group-hover:text-orange-700 transition-colors">
                                                {form.repair_image ? form.repair_image.name : 'Click to upload photo'}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-0.5">PNG, JPG or WEBP · Max 10MB</p>
                                        </div>
                                        <input type="file" accept="image/*" className="hidden"
                                            onChange={e => setForm({ ...form, repair_image: e.target.files[0] || null })} />
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
                                        {saving
                                            ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</>
                                            : <><CheckCircle className="w-4 h-4" /> Save Changes</>}
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