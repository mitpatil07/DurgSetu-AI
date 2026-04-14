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
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-md shadow-orange-200">
                            <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Profile</h1>
                            <p className="text-sm font-medium text-slate-500">System Administrator Operations & History</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

                {/* Profile Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4 hover:border-orange-200 hover:shadow-md transition-all">
                        <div className="p-3 bg-orange-100 rounded-xl text-orange-600 flex-shrink-0">
                            <Shield className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500">Access Level</p>
                            <p className="text-2xl font-extrabold text-slate-900">Super Admin</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4 hover:border-orange-200 hover:shadow-md transition-all">
                        <div className="p-3 bg-orange-100 rounded-xl text-orange-600 flex-shrink-0">
                            <Clock className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500">Total Scans Performed</p>
                            <p className="text-2xl font-extrabold text-slate-900">{analyses.length}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4 hover:border-orange-200 hover:shadow-md transition-all">
                        <div className="p-3 bg-orange-100 rounded-xl text-orange-600 flex-shrink-0">
                            <CheckCircle className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500">Verified Reports</p>
                            <p className="text-2xl font-extrabold text-slate-900">
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
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b-2 border-slate-100">
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fort ID</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Changes</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Risk Level</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {analyses.map((analysis) => (
                                        <tr key={analysis.id} className="hover:bg-orange-50/40 transition-colors">
                                            <td className="p-4 text-slate-800 font-semibold text-sm">
                                                {new Date(analysis.analysis_date).toLocaleString()}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2 font-semibold text-slate-700 text-sm">
                                                    <MapPin className="w-4 h-4 text-slate-400" /> Fort #{analysis.fort}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="font-extrabold text-slate-900">{analysis.changes_detected}</span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getRiskColor(analysis.risk_level)}`}>
                                                    {analysis.risk_level}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                {analysis.is_verified ? (
                                                    <span className="text-emerald-600 flex items-center justify-center gap-1 text-sm font-semibold">
                                                        <CheckCircle className="w-4 h-4" /> {analysis.is_false_positive ? 'False Pos' : 'Verified'}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 text-sm font-medium">Pending</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={() => setSelectedAnalysis(analysis)}
                                                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 px-3 py-1.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 mx-auto transition-all cursor-pointer active:scale-95 border border-transparent hover:border-orange-100"
                                                >
                                                    <Eye className="w-4 h-4" /> View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
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
                                    <img src={analysis.previous_image_url} alt="Previous" className="w-full rounded-xl border border-slate-200" />
                                ) : (
                                    <div className="w-full h-48 bg-slate-200 rounded-xl flex items-center justify-center text-slate-500 text-sm font-medium">No previous image</div>
                                )}
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5 text-slate-400" /> Current Scan
                                </h3>
                                {analysis.current_image_url ? (
                                    <img src={analysis.current_image_url} alt="Current" className="w-full rounded-xl border border-slate-200" />
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
                                <img src={analysis.annotated_image_url} alt="Annotated" className="w-full rounded-xl border-2 border-orange-200 shadow-md max-h-96 object-contain" />
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
