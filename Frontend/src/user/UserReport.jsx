import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Camera, MapPin, AlertCircle, Loader, Shield,
    Upload, X, CheckCircle, ImageIcon, ChevronDown, User,
    Mail, ArrowLeft
} from 'lucide-react';
import { errorToast, successToast } from '../services/swal';
import { apiFetch } from '../api';

const DAMAGE_TYPES = [
    'Structural Crack', 'Wall Damage', 'Foundation Issue',
    'Water Seepage', 'Stone Erosion', 'Vegetation Overgrowth',
    'Vandalism', 'Collapse Risk', 'Other',
];

const SEVERITY = [
    { label: 'Minor', active: 'bg-emerald-50 border-emerald-400 text-emerald-700 shadow-sm', dot: 'bg-emerald-400' },
    { label: 'Moderate', active: 'bg-amber-50 border-amber-400 text-amber-700 shadow-sm', dot: 'bg-amber-400' },
    { label: 'Severe', active: 'bg-orange-50 border-orange-500 text-orange-700 shadow-sm', dot: 'bg-orange-500' },
    { label: 'Critical', active: 'bg-red-50 border-red-500 text-red-700 shadow-sm', dot: 'bg-red-500' },
];

const InputWrapper = ({ icon: Icon, children }) => (
    <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-500 transition-colors">
            <Icon className="w-5 h-5" />
        </div>
        {children}
    </div>
);

const inputCls = "pl-12 w-full py-3.5 px-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:outline-none focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 text-slate-800 font-bold text-sm transition-all placeholder:text-slate-400";

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

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) return;
                const res = await apiFetch('/profile/');
                if (res.ok) {
                    const data = await res.json();
                    setFormData(prev => ({
                        ...prev,
                        reporter_name: data.username || data.name || prev.reporter_name,
                        reporter_contact: data.email || prev.reporter_contact,
                    }));
                }
            } catch { /* silent */ }
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

            const res = await apiFetch('/user-reports/', {
                method: 'POST',
                body: fd,
            });

            if (res.ok) {
                successToast('Report Submitted', 'Your report has been successfully submitted to our conservation team.');
                navigate('/user/dashboard');
            }
            else {
                const data = await res.json();
                errorToast('Submission Failed', data.error || 'Please try again.');
            }
        } catch { errorToast('Network Error', 'Check your connection and try again.'); }
        finally { setLoading(false); }
    };



    return (
        <div className="min-h-screen bg-[#F8F9FB] flex flex-col">

            {/* ── Navbar ── */}
            <nav className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/user/dashboard')} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="h-6 w-px bg-slate-200" />
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md shadow-orange-200">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-black text-slate-800 text-base tracking-tight hidden sm:inline">DurgSetu AI</span>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">

                {/* ── Header ── */}
                <div className="text-center mb-8 sm:mb-12">
                    <span className="inline-block py-1 px-3 rounded-full bg-orange-100 text-orange-600 text-xs font-black uppercase tracking-widest mb-4">
                        Heritage Conservation
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3 tracking-tight">Report Fort Damage</h1>
                    <p className="text-slate-500 text-sm sm:text-base font-medium max-w-xl mx-auto">
                        Help preserve Maharashtra's historical forts by reporting structural issues. Please provide clear photos and accurate details.
                    </p>
                </div>

                <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-6 sm:p-10 mb-12">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* ── Section 1: Photos ── */}
                        <div>
                            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
                                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                    <Camera className="w-5 h-5 text-orange-500" /> Damage Photos
                                </h3>
                                <span className="text-xs font-bold text-slate-400">{images.length}/5 Uploaded</span>
                            </div>

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
                                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all
                                    ${dragOver ? 'border-orange-400 bg-orange-50' : 'border-slate-200 bg-slate-50 hover:border-orange-300 hover:bg-white'}`}
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shadow-sm ${dragOver ? 'bg-orange-100' : 'bg-white border border-slate-100'}`}>
                                    <Upload className={`w-6 h-6 ${dragOver ? 'text-orange-500' : 'text-slate-400'}`} />
                                </div>
                                <div className="text-center">
                                    <p className="text-base font-black text-slate-700">{dragOver ? 'Drop to add' : 'Click or Drag & Drop Images'}</p>
                                    <p className="text-xs font-semibold text-slate-400 mt-1">JPG, PNG, WEBP files up to 5MB.</p>
                                </div>
                                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={e => handleFiles(e.target.files)} className="hidden" />
                            </div>

                            {images.length > 0 && (
                                <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-3">
                                    {images.map((img, i) => (
                                        <div key={i} className="relative group aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                                            <img src={img.preview} alt="" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                                                <button type="button" onClick={() => removeImage(i)}
                                                    className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-50 cursor-pointer">
                                                    <X className="w-4 h-4 text-black font-bold " />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {images.length < 5 && (
                                        <button type="button" onClick={() => fileInputRef.current?.click()}
                                            className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 hover:border-orange-300 flex items-center justify-center text-slate-400 hover:text-orange-500 transition-colors bg-slate-50 hover:bg-orange-50 cursor-pointer">
                                            <ImageIcon className="w-6 h-6" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ── Section 2: Location ── */}
                        <div>
                            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-orange-500" /> Location Information
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Fort Name <span className="text-red-500">*</span></label>
                                    <InputWrapper icon={Shield}>
                                        <input type="text" name="fort_name" value={formData.fort_name} onChange={handleChange} required
                                            className={inputCls} placeholder="e.g. Raigad Fort" />
                                    </InputWrapper>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Location / Section <span className="text-red-500">*</span></label>
                                    <InputWrapper icon={MapPin}>
                                        <input type="text" name="location" value={formData.location} onChange={handleChange} required
                                            className={inputCls} placeholder="e.g. North Gate" />
                                    </InputWrapper>
                                </div>
                            </div>
                        </div>

                        {/* ── Section 3: Damage Details ── */}
                        <div>
                            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-orange-500" /> Damage Details
                                </h3>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4 mb-5">
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Damage Type <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <select name="damage_type" value={formData.damage_type} onChange={handleChange} required
                                            className="w-full py-3.5 pl-4 pr-10 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all appearance-none cursor-pointer">
                                            <option value="" disabled>Select category…</option>
                                            {DAMAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="mb-5">
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Severity Level <span className="text-red-500">*</span></label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {SEVERITY.map(({ label, active, dot }) => (
                                        <button key={label} type="button"
                                            onClick={() => setFormData(p => ({ ...p, severity: label }))}
                                            className={`py-3 rounded-xl border-2 font-black text-sm transition-all flex items-center justify-center gap-2 cursor-pointer
                                                ${formData.severity === label ? active : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-white hover:border-slate-200'}`}>
                                            <span className={`w-2.5 h-2.5 rounded-full ${formData.severity === label ? dot : 'bg-slate-300'}`} />
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows={3}
                                    className="w-full py-3.5 px-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all resize-none placeholder:text-slate-400"
                                    placeholder="Provide more context — how large is the crack? When was it noticed?" />
                            </div>
                        </div>

                        {/* ── Section 4: Contact ── */}
                        <div>
                            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                    <User className="w-5 h-5 text-orange-500" /> Reporter Information
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Your Name</label>
                                    <InputWrapper icon={User}>
                                        <input type="text" name="reporter_name" value={formData.reporter_name} onChange={handleChange}
                                            className={inputCls} placeholder="Enter Name" />
                                    </InputWrapper>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Contact Info</label>
                                    <InputWrapper icon={Mail}>
                                        <input type="text" name="reporter_contact" value={formData.reporter_contact} onChange={handleChange}
                                            className={inputCls} placeholder="Enter Email" />
                                    </InputWrapper>
                                </div>
                            </div>
                        </div>

                        {/* ── Submit ── */}
                        <div className="pt-4 mt-8 border-t border-slate-100">
                            <button type="submit" disabled={loading}
                                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black py-4.5 rounded-xl shadow-xl shadow-orange-200 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-60 disabled:hover:translate-y-0 cursor-pointer text-base">
                                {loading
                                    ? <><Loader className="w-5 h-5 animate-spin" /> Submitting Report…</>
                                    : <><Camera className="w-5 h-5" /> Submit Damage Report</>
                                }
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}