import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, FileText, AlertCircle, Loader, Shield, Upload, X, CheckCircle, ImageIcon, ChevronDown } from 'lucide-react';

const DAMAGE_TYPES = [
    'Structural Crack',
    'Wall Damage',
    'Foundation Issue',
    'Water Seepage',
    'Stone Erosion',
    'Vegetation Overgrowth',
    'Vandalism',
    'Collapse Risk',
    'Other',
];

const SEVERITY_LEVELS = [
    { label: 'Minor', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    { label: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    { label: 'Severe', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
    { label: 'Critical', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
];

const UserReport = () => {
    const [formData, setFormData] = useState({
        fort_name: '',
        location: '',
        damage_type: '',
        severity: '',
        description: '',
        reporter_name: '',
        reporter_contact: '',
    });
    const [images, setImages] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFiles = (files) => {
        const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
        if (validFiles.length === 0) {
            setError('Please upload valid image files (JPG, PNG, WEBP).');
            return;
        }
        if (images.length + validFiles.length > 5) {
            setError('You can upload a maximum of 5 images.');
            return;
        }
        setError('');
        const newImages = validFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            name: file.name,
        }));
        setImages(prev => [...prev, ...newImages]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
    };

    const removeImage = (index) => {
        setImages(prev => {
            URL.revokeObjectURL(prev[index].preview);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (images.length === 0) {
            setError('Please upload at least one image of the damage.');
            return;
        }
        if (!formData.damage_type) {
            setError('Please select a damage type.');
            return;
        }
        if (!formData.severity) {
            setError('Please select a severity level.');
            return;
        }

        setLoading(true);

        try {
            const payload = new FormData();
            Object.entries(formData).forEach(([key, value]) => payload.append(key, value));
            images.forEach((img, i) => payload.append(`image_${i}`, img.file));

            const token = localStorage.getItem('auth_token');
            const response = await fetch('http://127.0.0.1:8000/api/user-reports/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`
                },
                body: payload,
            });

            if (response.ok) {
                setSuccess(true);
            } else {
                const data = await response.json();
                setError(data.error || 'Submission failed. Please try again.');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-8">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-12 flex flex-col items-center text-center border border-slate-100">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-3">Report Submitted!</h2>
                    <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                        Thank you for reporting the damage. Our administrators will review your submission and take necessary action.
                    </p>
                    <div className="space-y-3 w-full">
                        <button
                            onClick={() => { setSuccess(false); setFormData({ fort_name: '', location: '', damage_type: '', severity: '', description: '', reporter_name: '', reporter_contact: '' }); setImages([]); }}
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl shadow-[0_8px_20px_-6px_rgba(249,115,22,0.5)] transition-all duration-300 hover:-translate-y-1"
                        >
                            Submit Another Report
                        </button>
                        <button
                            onClick={() => navigate('/user/dashboard')}
                            className="w-full border-2 border-slate-100 text-slate-600 hover:bg-slate-50 font-semibold py-4 px-6 rounded-xl transition-all duration-200"
                        >
                            View My Reports
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100">

                {/* Brand Side */}
                <div className="md:w-5/12 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 p-10 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-orange-400/20 blur-3xl"></div>

                    <div className="relative z-10 flex items-center gap-3 mb-10">
                        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm border border-white/20 shadow-lg">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight">DurgSetu AI</h1>
                    </div>

                    <div className="relative z-10 mb-10 md:mb-0">
                        <h2 className="text-4xl font-bold leading-tight mb-4">
                            Report Fort <span className="text-orange-200">Damage.</span>
                        </h2>
                        <p className="text-orange-100 text-lg leading-relaxed mb-8">
                            Help us preserve our heritage. Upload photos of cracks, wall damage, or structural issues to alert our conservation team.
                        </p>

                        <div className="space-y-3">
                            <div className="flex items-start gap-3 bg-black/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                                <Camera className="w-5 h-5 text-orange-200 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-white">Upload Photos</p>
                                    <p className="text-xs text-orange-200 mt-0.5">Up to 5 high-res images of the damage</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 bg-black/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                                <MapPin className="w-5 h-5 text-orange-200 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-white">Location Details</p>
                                    <p className="text-xs text-orange-200 mt-0.5">Specify the fort name and exact location</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 bg-black/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                                <FileText className="w-5 h-5 text-orange-200 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-white">AI Analysis</p>
                                    <p className="text-xs text-orange-200 mt-0.5">Our AI will assess structural health automatically</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 text-sm font-medium text-orange-200/80 mt-8 md:mt-0">
                        © 2026 DurgSetu AI
                    </div>
                </div>

                {/* Form Side */}
                <div className="md:w-7/12 p-8 sm:p-12 flex flex-col justify-start bg-white overflow-y-auto max-h-screen">
                    <div className="max-w-md w-full mx-auto">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">Report Damage</h2>
                            <p className="text-slate-500 font-medium">Fill in the details and upload images of the damage.</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 text-sm border border-red-100 shadow-sm">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
                                <p className="font-medium">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Damage Photos <span className="text-red-500">*</span>
                                    <span className="text-slate-400 font-normal ml-1">({images.length}/5 uploaded)</span>
                                </label>

                                {/* Drop Zone */}
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={handleDrop}
                                    className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200
                                        ${dragOver
                                            ? 'border-orange-400 bg-orange-50'
                                            : 'border-slate-200 bg-slate-50 hover:border-orange-400 hover:bg-orange-50/50'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${dragOver ? 'bg-orange-100' : 'bg-slate-100'}`}>
                                        <Upload className={`w-6 h-6 ${dragOver ? 'text-orange-500' : 'text-slate-400'}`} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-slate-700">
                                            {dragOver ? 'Drop images here' : 'Click or drag & drop images'}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP — max 5 images</p>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => handleFiles(e.target.files)}
                                        className="hidden"
                                    />
                                </div>

                                {/* Image Previews */}
                                {images.length > 0 && (
                                    <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                                        {images.map((img, i) => (
                                            <div key={i} className="relative group rounded-xl overflow-hidden border-2 border-slate-100 aspect-square">
                                                <img src={img.preview} alt={img.name} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(i)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                                <div className="absolute bottom-0 inset-x-0 bg-black/40 text-white text-[9px] px-1 py-0.5 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {img.name}
                                                </div>
                                            </div>
                                        ))}
                                        {images.length < 5 && (
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 hover:border-orange-400 hover:text-orange-400 transition-colors"
                                            >
                                                <ImageIcon className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Fort Name & Location */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Fort Name <span className="text-red-500">*</span></label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-orange-500 text-slate-400">
                                            <Shield className="h-5 w-5" />
                                        </div>
                                        <input
                                            type="text"
                                            name="fort_name"
                                            value={formData.fort_name}
                                            onChange={handleChange}
                                            required
                                            className="pl-12 w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-slate-900 font-medium outline-none placeholder:text-slate-400"
                                            placeholder="e.g. Raigad Fort"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Location / Section <span className="text-red-500">*</span></label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-orange-500 text-slate-400">
                                            <MapPin className="h-5 w-5" />
                                        </div>
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            required
                                            className="pl-12 w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-slate-900 font-medium outline-none placeholder:text-slate-400"
                                            placeholder="e.g. North Wall, Gate 2"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Damage Type */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Damage Type <span className="text-red-500">*</span></label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-orange-500 text-slate-400">
                                        <AlertCircle className="h-5 w-5" />
                                    </div>
                                    <select
                                        name="damage_type"
                                        value={formData.damage_type}
                                        onChange={handleChange}
                                        required
                                        className="pl-12 pr-10 w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-slate-900 font-medium outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled>Select damage type</option>
                                        {DAMAGE_TYPES.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                                        <ChevronDown className="h-5 w-5" />
                                    </div>
                                </div>
                            </div>

                            {/* Severity */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Severity Level <span className="text-red-500">*</span></label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {SEVERITY_LEVELS.map(({ label, color, bg, border }) => (
                                        <button
                                            key={label}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, severity: label }))}
                                            className={`py-3 px-2 rounded-xl border-2 font-semibold text-sm transition-all duration-200
                                                ${formData.severity === label
                                                    ? `${bg} ${border} ${color} shadow-sm scale-[1.02]`
                                                    : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200'
                                                }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-slate-900 font-medium outline-none placeholder:text-slate-400 resize-none"
                                    placeholder="Describe what you observed — when you noticed it, how large the crack is, any sounds, etc."
                                />
                            </div>

                            {/* Reporter Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Your Name <span className="text-slate-400 font-normal">(Optional)</span></label>
                                    <input
                                        type="text"
                                        name="reporter_name"
                                        value={formData.reporter_name}
                                        onChange={handleChange}
                                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-slate-900 font-medium outline-none placeholder:text-slate-400"
                                        placeholder="Your name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Contact / Email <span className="text-slate-400 font-normal">(Optional)</span></label>
                                    <input
                                        type="text"
                                        name="reporter_contact"
                                        value={formData.reporter_contact}
                                        onChange={handleChange}
                                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-slate-900 font-medium outline-none placeholder:text-slate-400"
                                        placeholder="phone or email"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl shadow-[0_8px_20px_-6px_rgba(249,115,22,0.5)] hover:shadow-[0_12px_25px_-6px_rgba(249,115,22,0.6)] transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer disabled:opacity-70 disabled:hover:translate-y-0 disabled:active:scale-100 mt-2"
                            >
                                {loading
                                    ? <><Loader className="w-5 h-5 animate-spin" /><span>Submitting Report...</span></>
                                    : <><Camera className="w-5 h-5" /><span>Submit Damage Report</span></>
                                }
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm font-medium text-slate-500">
                            <button onClick={() => navigate('/user/dashboard')} className="text-slate-400 hover:text-slate-600 transition-colors">
                                Return to Dashboard
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default UserReport;