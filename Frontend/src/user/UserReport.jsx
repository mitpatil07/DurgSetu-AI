import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Camera, MapPin, FileText, AlertCircle, Loader, Shield,
    Upload, X, CheckCircle, ImageIcon, ChevronDown, User,
    Mail, ArrowLeft, Flame, Droplets, Leaf, Building2, Wave
} from 'lucide-react';
import { errorToast } from '../services/swal';

const DAMAGE_TYPES = [
    'Structural Crack', 'Wall Damage', 'Foundation Issue',
    'Water Seepage', 'Stone Erosion', 'Vegetation Overgrowth',
    'Vandalism', 'Collapse Risk', 'Other',
];

const SEVERITY = [
    { label: 'Minor', color: 'text-emerald-600', active: 'bg-emerald-50 border-emerald-400 text-emerald-700', dot: 'bg-emerald-400' },
    { label: 'Moderate', color: 'text-amber-600', active: 'bg-amber-50 border-amber-400 text-amber-700', dot: 'bg-amber-400' },
    { label: 'Severe', color: 'text-orange-600', active: 'bg-orange-50 border-orange-500 text-orange-700', dot: 'bg-orange-500' },
    { label: 'Critical', color: 'text-red-600', active: 'bg-red-50 border-red-500 text-red-700', dot: 'bg-red-500' },
];

const InputWrapper = ({ icon: Icon, children }) => (
    <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-500 transition-colors">
            <Icon className="w-4 h-4" />
        </div>
        {children}
    </div>
);

const inputCls = "pl-11 w-full py-3 px-4 bg-white border-2 border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 text-slate-800 font-medium text-sm transition-all placeholder:text-slate-300";

export default function UserReport() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        fort_name: '', location: '', damage_type: '',
        severity: '', description: '', reporter_name: '', reporter_contact: '',
    });
    const [images, setImages] = useState([]);
    const [dragOver, setDragOver] = useState(false);
    const [loading, setLoading] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);
    const [success, setSuccess] = useState(false);

    // ── Prefill name + email from profile API ──────────────────────
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) return;
                const res = await fetch('http://127.0.0.1:8000/api/profile/', {
                    headers: { Authorization: `Token ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setFormData(prev => ({
                        ...prev,
                        reporter_name: data.username || data.name || prev.reporter_name,
                        reporter_contact: data.email || prev.reporter_contact,
                    }));
                }
            } catch { /* silent — optional fields */ }
            finally { setProfileLoading(false); }
        };
        fetchProfile();
    }, []);

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleFiles = files => {
        const valid = Array.from(files).filter(f => f.type.startsWith('image/'));
        if (!valid.length) { errorToast('Invalid Files', 'Please upload JPG, PNG or WEBP images.'); return; }
        if (images.length + valid.length > 5) { errorToast('Too Many Files', 'Maximum 5 images allowed.'); return; }
        setImages(prev => [...prev, ...valid.map(f => ({ file: f, preview: URL.createObjectURL(f), name: f.name }))]);
    };

    const removeImage = i => {
        setImages(prev => { URL.revokeObjectURL(prev[i].preview); return prev.filter((_, idx) => idx !== i); });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!images.length) { errorToast('No Photos', 'Please upload at least one damage photo.'); return; }
        if (!formData.damage_type) { errorToast('Damage Type', 'Please select a damage type.'); return; }
        if (!formData.severity) { errorToast('Severity', 'Please select a severity level.'); return; }

        setLoading(true);
        try {
            const fd = new FormData();
            Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
            images.forEach((img, i) => fd.append(`image_${i}`, img.file));

            const token = localStorage.getItem('auth_token');
            const res = await fetch('http://127.0.0.1:8000/api/user-reports/', {
                method: 'POST',
                headers: { Authorization: `Token ${token}` },
                body: fd,
            });

            if (res.ok) { setSuccess(true); }
            else {
                const data = await res.json();
                errorToast('Submission Failed', data.error || 'Please try again.');
            }
        } catch { errorToast('Network Error', 'Check your connection and try again.'); }
        finally { setLoading(false); }
    };

    // ── Success Screen ─────────────────────────────────────────────
    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center text-center border border-slate-100">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-200">
                        <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <span className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">Success</span>
                    <h2 className="text-2xl font-black text-slate-900 mb-3">Report Submitted!</h2>
                    <p className="text-slate-500 text-sm leading-relaxed mb-8">
                        Thank you for helping preserve our heritage. The conservation team will review your report and take action shortly.
                    </p>
                    <div className="space-y-3 w-full">
                        <button
                            onClick={() => { setSuccess(false); setImages([]); setFormData(prev => ({ ...prev, fort_name: '', location: '', damage_type: '', severity: '', description: '' })); }}
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-200 transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                        >
                            Submit Another Report
                        </button>
                        <button
                            onClick={() => navigate('/user/dashboard')}
                            className="w-full border-2 border-slate-100 text-slate-600 hover:bg-slate-50 font-semibold py-3.5 rounded-xl transition-all cursor-pointer"
                        >
                            View My Reports
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Completion progress ────────────────────────────────────────────
    const filled = [
        images.length > 0,
        !!formData.fort_name,
        !!formData.location,
        !!formData.damage_type,
        !!formData.severity,
        !!formData.description,
    ].filter(Boolean).length;
    const progress = Math.round((filled / 6) * 100);

    return (
        <div className="min-h-screen bg-slate-50 flex">

            {/* ── Brand Side ─────────────────────────────────────── */}
            <div className="hidden lg:flex lg:w-5/12 xl:w-4/12 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 p-10 flex-col justify-between relative overflow-hidden sticky top-0 h-screen">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-orange-400/20 blur-3xl pointer-events-none" />

                <div className="relative z-10">
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 text-orange-200 hover:text-white text-sm font-semibold mb-10 transition-colors cursor-pointer">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </button>
                    <div className="flex items-center gap-3 mb-10">
                        <div className="bg-white/20 p-3 rounded-2xl border border-white/20 shadow-lg">
                            <Shield className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-2xl font-black text-white tracking-tight">DurgSetu AI</span>
                    </div>

                    <h1 className="text-4xl font-black text-white leading-tight mb-4">
                        Report Fort <span className="text-orange-200">Damage.</span>
                    </h1>
                    <p className="text-orange-100 text-base leading-relaxed mb-10">
                        Help preserve Maharashtra's heritage. Upload photos of structural damage to alert our conservation team instantly.
                    </p>

                    <div className="space-y-3">
                        {[
                            { icon: Camera, title: 'Upload Photos', desc: 'Up to 5 photos of the damage' },
                            { icon: MapPin, title: 'Location Details', desc: 'Fort name and exact section' },
                            { icon: FileText, title: 'Describe Damage', desc: 'What you saw and when' },
                        ].map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="flex items-start gap-3 bg-black/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Icon className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">{title}</p>
                                    <p className="text-xs text-orange-200 mt-0.5">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Progress indicator */}
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-orange-200">Report completeness</span>
                        <span className="text-xs font-black text-white">{progress}%</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-2 bg-white rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-xs text-orange-200/70 mt-3">© 2026 DurgSetu AI · Heritage Protection Platform</p>
                </div>
            </div>

            {/* ── Form Side ─────────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
                {/* Mobile top bar */}
                <div className="lg:hidden bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6 text-white" />
                        <span className="text-lg font-black text-white">DurgSetu AI</span>
                    </div>
                    <button onClick={() => navigate('/')} className="text-orange-200 hover:text-white text-sm font-semibold cursor-pointer">← Back</button>
                </div>

                <div className="flex-1 p-6 sm:p-10 max-w-2xl mx-auto w-full">
                    {/* Header */}
                    <div className="mb-8">
                        <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">Heritage Conservation</span>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 mb-1">Report Fort Damage</h2>
                        <p className="text-slate-400 text-sm font-medium">All fields marked <span className="text-red-400">*</span> are required.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* ── Photo Upload ── */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                            <label className="block text-sm font-bold text-slate-700 mb-3">
                                Damage Photos <span className="text-red-400">*</span>
                                <span className="text-slate-400 font-normal ml-1.5">({images.length}/5 uploaded)</span>
                            </label>

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
                                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-3 cursor-pointer transition-all
                                    ${dragOver ? 'border-orange-400 bg-orange-50' : 'border-slate-200 bg-slate-50 hover:border-orange-300 hover:bg-orange-50/40'}`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${dragOver ? 'bg-orange-100' : 'bg-white border border-slate-100 shadow-sm'}`}>
                                    <Upload className={`w-5 h-5 ${dragOver ? 'text-orange-500' : 'text-slate-400'}`} />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-slate-700">{dragOver ? 'Drop to add' : 'Click or drag & drop'}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">JPG, PNG, WEBP · Max 5 images</p>
                                </div>
                                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={e => handleFiles(e.target.files)} className="hidden" />
                            </div>

                            {images.length > 0 && (
                                <div className="mt-4 grid grid-cols-4 sm:grid-cols-5 gap-2">
                                    {images.map((img, i) => (
                                        <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-slate-100 shadow-sm">
                                            <img src={img.preview} alt="" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                                                <button type="button" onClick={() => removeImage(i)}
                                                    className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {images.length < 5 && (
                                        <button type="button" onClick={() => fileInputRef.current?.click()}
                                            className="aspect-square rounded-xl border-2 border-dashed border-slate-200 hover:border-orange-300 flex items-center justify-center text-slate-300 hover:text-orange-400 transition-colors">
                                            <ImageIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ── Fort Info ── */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Location Info</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Fort Name <span className="text-red-400">*</span></label>
                                    <InputWrapper icon={Shield}>
                                        <input type="text" name="fort_name" value={formData.fort_name} onChange={handleChange} required
                                            className={inputCls} placeholder="e.g. Raigad Fort" />
                                    </InputWrapper>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Location / Section <span className="text-red-400">*</span></label>
                                    <InputWrapper icon={MapPin}>
                                        <input type="text" name="location" value={formData.location} onChange={handleChange} required
                                            className={inputCls} placeholder="e.g. North Wall, Gate 2" />
                                    </InputWrapper>
                                </div>
                            </div>
                        </div>

                        {/* ── Damage Details ── */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Damage Details</p>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Damage Type <span className="text-red-400">*</span></label>
                                <div className="relative">
                                    <select name="damage_type" value={formData.damage_type} onChange={handleChange} required
                                        className="w-full py-3 pl-4 pr-10 bg-white border-2 border-slate-100 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all appearance-none cursor-pointer">
                                        <option value="" disabled>Select damage type…</option>
                                        {DAMAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Severity Level <span className="text-red-400">*</span></label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {SEVERITY.map(({ label, active, dot }) => (
                                        <button key={label} type="button"
                                            onClick={() => setFormData(p => ({ ...p, severity: label }))}
                                            className={`py-2.5 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer
                                                ${formData.severity === label ? `${active} scale-[1.03] shadow-sm` : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'}`}>
                                            <span className={`w-2 h-2 rounded-full ${formData.severity === label ? dot : 'bg-slate-300'}`} />
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows={3}
                                    className="w-full py-3 px-4 bg-white border-2 border-slate-100 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all resize-none placeholder:text-slate-300"
                                    placeholder="Describe what you observed — size of crack, sounds, how long it's been visible…" />
                            </div>
                        </div>

                        {/* ── Reporter Info (prefilled) ── */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Details</p>
                                {profileLoading
                                    ? <span className="text-xs text-slate-400 flex items-center gap-1"><Loader className="w-3 h-3 animate-spin" /> Loading…</span>
                                    : <span className="text-xs text-emerald-600 font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Auto-filled from profile</span>
                                }
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Your Name</label>
                                    <InputWrapper icon={User}>
                                        <input type="text" name="reporter_name" value={formData.reporter_name} onChange={handleChange}
                                            className={inputCls} placeholder="Your name" />
                                    </InputWrapper>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Contact / Email</label>
                                    <InputWrapper icon={Mail}>
                                        <input type="text" name="reporter_contact" value={formData.reporter_contact} onChange={handleChange}
                                            className={inputCls} placeholder="email or phone" />
                                    </InputWrapper>
                                </div>
                            </div>
                        </div>

                        {/* ── Submit ── */}
                        <button type="submit" disabled={loading}
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-orange-200 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-60 disabled:hover:translate-y-0 cursor-pointer text-base">
                            {loading
                                ? <><Loader className="w-5 h-5 animate-spin" /> Submitting…</>
                                : <><Camera className="w-5 h-5" /> Submit Damage Report</>
                            }
                        </button>

                        <button type="button" onClick={() => navigate('/user/dashboard')}
                            className="w-full text-center text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors py-2 cursor-pointer">
                            ← Return to Dashboard
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}