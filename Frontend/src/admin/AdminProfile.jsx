import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, Clock, MapPin, Eye, X, Image as ImageIcon, AlertTriangle, CheckCircle } from 'lucide-react';
import AdminNavbar from './AdminNavbar';
import { API_BASE, apiFetch } from '../api';

const AdminProfile = () => {
    const navigate = useNavigate();
    const [analyses, setAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAnalysis, setSelectedAnalysis] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                navigate('/login');
                return;
            }

            // Fetch all analyses (admin global view — no mine filter)
            // Handle paginated DRF responses by looping through all pages
            let allResults = [];
            let nextUrl = `${API_BASE}/structural-analyses/?page_size=100`;

            while (nextUrl) {
                const response = await fetch(nextUrl, {
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) throw new Error('Failed to fetch analysis history');

                const data = await response.json();

                if (Array.isArray(data)) {
                    allResults = data;
                    nextUrl = null;
                } else {
                    allResults = [...allResults, ...(data.results || [])];
                    nextUrl = data.next || null;
                }
            }

            const sorted = allResults.sort((a, b) => new Date(b.analysis_date) - new Date(a.analysis_date));
            setAnalyses(sorted);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (level) => {
        if (['HIGH', 'CRITICAL'].includes(level)) return 'bg-red-50 text-red-700 border-red-200';
        if (level === 'MEDIUM') return 'bg-amber-50 text-amber-700 border-amber-200';
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    };

    return (
        <div className="min-h-screen bg-[#F8F9FB]">
            <AdminNavbar onRefresh={fetchHistory} />

            {/* Page Header */}
            <div className="bg-white border-b border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 relative z-10">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-[2rem] flex items-center justify-center shadow-xl shadow-orange-500/30 transform hover:rotate-3 transition-transform">
                            <User className="w-10 h-10 text-white" />
                        </div>
                        <div className="pt-2">
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase">Admin Profile</h1>
                            <p className="text-slate-500 font-bold text-sm tracking-wide flex items-center justify-center sm:justify-start gap-2">
                                <Shield className="w-4 h-4 text-orange-500" /> SYSTEM ADMINISTRATOR OPERATIONS & HISTORY
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

                {/* Profile Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-12">
                    <div className="bg-white rounded-[2rem] p-5 sm:p-8 border border-slate-100 shadow-sm flex flex-col items-center text-center gap-3 hover:border-orange-200 hover:shadow-md transition-all group">
                        <div className="p-4 bg-orange-50 rounded-2xl text-orange-600 flex-shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-all transform group-hover:scale-110">
                            <Shield className="w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                        <div>
                            <p className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Access Level</p>
                            <p className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">Super Admin</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-[2rem] p-5 sm:p-8 border border-slate-100 shadow-sm flex flex-col items-center text-center gap-3 hover:border-orange-200 hover:shadow-md transition-all group">
                        <div className="p-4 bg-orange-50 rounded-2xl text-orange-600 flex-shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-all transform group-hover:scale-110">
                            <Clock className="w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                        <div>
                            <p className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Scans</p>
                            <p className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{analyses.length}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-[2rem] p-5 sm:p-8 border border-slate-100 shadow-sm flex flex-col items-center text-center gap-3 hover:border-orange-200 hover:shadow-md transition-all group col-span-2 md:col-span-1">
                        <div className="p-4 bg-orange-50 rounded-2xl text-orange-600 flex-shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-all transform group-hover:scale-110">
                            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                        <div>
                            <p className="text-[10px] sm:text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Verified Reports</p>
                            <p className="text-xl sm:text-4xl font-black text-slate-900 leading-tight">
                                {analyses.filter(a => a.is_verified).length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Scan History */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 md:p-8 overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                        <h2 className="text-xl md:text-2xl font-black text-slate-900">Global Scan History</h2>
                        <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">
                            Latest First
                        </span>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : error ? (
                        <div className="p-10 text-center text-red-600">
                            <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>{error}</p>
                        </div>
                    ) : analyses.length === 0 ? (
                        <div className="p-10 text-center text-slate-500">
                            <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">No historical scans found.</p>
                        </div>
                    ) : (
                        <>
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Analysis Identity</th>
                                            <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Changes</th>
                                            <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Risk Assessment</th>
                                            <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                            <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {analyses.map((analysis) => (
                                            <tr key={analysis.id} className="hover:bg-slate-50/80 transition-all group">
                                                <td className="p-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-orange-100 group-hover:text-orange-500 transition-colors">
                                                            <MapPin className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-slate-900 font-black text-sm uppercase tracking-tight">Fort #{analysis.fort}</p>
                                                            <p className="text-[10px] font-bold text-slate-400">{new Date(analysis.analysis_date).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-5 text-center">
                                                    <div className="inline-flex flex-col items-center">
                                                        <span className="text-xl font-black text-slate-800">{analysis.changes_detected}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Pixels</span>
                                                    </div>
                                                </td>
                                                <td className="p-5 text-center">
                                                    <span className={`px-3 py-1.5 text-[10px] font-black rounded-lg border uppercase tracking-wider ${getRiskColor(analysis.risk_level)}`}>
                                                        {analysis.risk_level}
                                                    </span>
                                                </td>
                                                <td className="p-5 text-center">
                                                    {analysis.is_verified ? (
                                                        <div className="flex flex-col items-center gap-0.5">
                                                            <span className="text-emerald-600 flex items-center justify-center gap-1 text-[10px] font-black uppercase tracking-tight">
                                                                <CheckCircle className="w-3.5 h-3.5" /> Verified
                                                            </span>
                                                            {analysis.is_false_positive && <span className="text-[9px] font-bold text-red-400 uppercase tracking-tight">False Positive</span>}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-300 text-[10px] font-black uppercase tracking-tight">Pending</span>
                                                    )}
                                                </td>
                                                <td className="p-5 text-center">
                                                    <button
                                                        onClick={() => setSelectedAnalysis(analysis)}
                                                        className="bg-slate-50 text-slate-400 hover:text-orange-600 hover:bg-orange-50 p-2.5 rounded-xl transition-all border border-transparent hover:border-orange-100 cursor-pointer active:scale-90"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {/* Mobile Cards */}
                            <div className="md:hidden space-y-4">
                                {analyses.map((analysis) => (
                                    <div key={analysis.id} className="bg-white p-5 rounded-3xl border border-slate-100 hover:border-orange-200 transition-all shadow-sm hover:shadow-md group">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                                                    <MapPin className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 text-sm tracking-tight uppercase">Fort #{analysis.fort}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">{new Date(analysis.analysis_date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg border tracking-wider ${getRiskColor(analysis.risk_level)}`}>
                                                {analysis.risk_level}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Changes</p>
                                                <p className="font-black text-slate-900 text-lg leading-tight">{analysis.changes_detected} <span className="text-[10px] text-slate-400 font-bold uppercase">Pixels</span></p>
                                            </div>
                                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Status</p>
                                                {analysis.is_verified ? (
                                                    <div className="flex flex-col">
                                                        <span className="text-emerald-600 flex items-center gap-1 text-[10px] font-black uppercase tracking-tight">
                                                            <CheckCircle className="w-3 h-3" /> Verified
                                                        </span>
                                                        {analysis.is_false_positive && <span className="text-[8px] font-bold text-red-400 uppercase tracking-tight">False Pos</span>}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-300 text-[10px] font-black uppercase tracking-tight">Pending Review</span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedAnalysis(analysis)}
                                            className="w-full bg-slate-50 text-slate-400 hover:text-white hover:bg-orange-500 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
                                        >
                                            <Eye className="w-4 h-4" /> View Full Report
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {selectedAnalysis && (
                <AnalysisDetailModal
                    analysis={selectedAnalysis}
                    onClose={() => setSelectedAnalysis(null)}
                />
            )}
        </div>
    );
};

const AnalysisDetailModal = ({ analysis, onClose }) => {
    const getRiskColor = (level) => {
        if (['HIGH', 'CRITICAL'].includes(level)) return 'text-red-700';
        if (level === 'MEDIUM') return 'text-amber-700';
        return 'text-emerald-700';
    };

    const getImageUrl = (url) => typeof url === 'string' && url.startsWith('http') ? url : `${API_BASE.replace('/api', '')}${url}`;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto">
            <div className="min-h-screen flex items-center justify-center p-4 py-8">
                <div className="bg-white rounded-3xl p-8 max-w-5xl w-full my-8 shadow-2xl border border-slate-100">
                    <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900">Scan Details</h2>
                            <p className="text-slate-500 font-medium mt-1">
                                Performed on {new Date(analysis.analysis_date).toLocaleString()}
                            </p>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all cursor-pointer active:scale-95">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Changes Detected', value: analysis.changes_detected, cls: 'text-slate-900' },
                                { label: 'Risk Score', value: `${analysis.risk_score || 0}/10`, cls: 'text-slate-900' },
                                { label: 'SSIM Score', value: `${analysis.ssim_score ? (analysis.ssim_score * 100).toFixed(1) : 0}%`, cls: 'text-slate-900' },
                                { label: 'Risk Level', value: analysis.risk_level, cls: getRiskColor(analysis.risk_level) },
                            ].map(({ label, value, cls }) => (
                                <div key={label} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-center">
                                    <div className={`text-2xl font-extrabold ${cls}`}>{value}</div>
                                    <div className="text-xs text-slate-500 font-semibold mt-1">{label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5 text-slate-400" /> Previous Scan
                                </h3>
                                {analysis.previous_image_url ? (
                                    <img src={getImageUrl(analysis.previous_image_url)} alt="Previous" className="w-full rounded-xl border border-slate-200" />
                                ) : (
                                    <div className="w-full h-48 bg-slate-200 rounded-xl flex items-center justify-center text-slate-500 text-sm font-medium">No previous image</div>
                                )}
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5 text-slate-400" /> Current Scan
                                </h3>
                                {analysis.current_image_url ? (
                                    <img src={getImageUrl(analysis.current_image_url)} alt="Current" className="w-full rounded-xl border border-slate-200" />
                                ) : (
                                    <div className="w-full h-48 bg-slate-200 rounded-xl flex items-center justify-center text-slate-500 text-sm font-medium">No current image</div>
                                )}
                            </div>
                        </div>

                        {analysis.annotated_image_url && (
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-orange-500" /> Annotated Damage Overlay
                                </h3>
                                <img src={getImageUrl(analysis.annotated_image_url)} alt="Annotated" className="w-full rounded-xl border-2 border-orange-200 shadow-md max-h-96 object-contain" />
                            </div>
                        )}

                        {analysis.analysis_results?.detections?.length > 0 && (
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <h4 className="font-bold text-slate-900 mb-3">Detection Coordinates & Data</h4>
                                <div className="overflow-y-auto max-h-40">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-white sticky top-0">
                                            <tr>
                                                <th className="py-2 px-3 font-bold text-slate-500 text-xs uppercase">Severity</th>
                                                <th className="py-2 px-3 font-bold text-slate-500 text-xs uppercase">Confidence</th>
                                                <th className="py-2 px-3 font-bold text-slate-500 text-xs uppercase">Area</th>
                                                <th className="py-2 px-3 font-bold text-slate-500 text-xs uppercase">BBox [x,y,w,h]</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {analysis.analysis_results.detections.map((det, i) => (
                                                <tr key={i} className="text-slate-700">
                                                    <td className="py-2 px-3 font-semibold">{det.severity}</td>
                                                    <td className="py-2 px-3">{(det.confidence * 100).toFixed(1)}%</td>
                                                    <td className="py-2 px-3">{det.area.toFixed(0)}</td>
                                                    <td className="py-2 px-3 font-mono text-xs">{JSON.stringify(det.bbox)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
