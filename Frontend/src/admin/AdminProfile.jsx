import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, Clock, MapPin, Eye, X, Image as ImageIcon, AlertTriangle, ArrowLeft, CheckCircle } from 'lucide-react';

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

            const response = await fetch('http://127.0.0.1:8000/api/structural-analyses/?mine=true', {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch analysis history');
            }

            const data = await response.json();
            const results = Array.isArray(data) ? data : (data.results || []);

            // Sort primarily by date descending
            const sorted = results.sort((a, b) => new Date(b.analysis_date) - new Date(a.analysis_date));
            setAnalyses(sorted);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (level) => {
        if (['HIGH', 'CRITICAL'].includes(level)) return 'bg-red-100 text-red-700 border-red-200';
        if (level === 'MEDIUM') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        return 'bg-green-100 text-green-700 border-green-200';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
            {/* Header */}
            <header className="bg-white border-b-2 border-orange-200 shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center shadow-lg">
                                <User className="w-6 h-6 md:w-9 md:h-9 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Profile</h1>
                                <p className="text-gray-600 font-medium text-xs md:text-sm">System Administrator Operations & History</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-white text-gray-700 border-2 border-gray-200 px-4 py-2 md:px-6 md:py-3 rounded-xl hover:bg-gray-50 hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer font-semibold flex items-center justify-center gap-2 text-sm w-full md:w-auto mt-2 md:mt-0"
                        >
                            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" /> Back to Dashboard
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-10">

                {/* Profile Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-md flex items-center gap-4">
                        <div className="p-4 bg-orange-100 rounded-xl text-orange-600">
                            <Shield className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Access Level</p>
                            <p className="text-2xl font-bold text-gray-900">Super Admin</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-md flex items-center gap-4">
                        <div className="p-4 bg-blue-100 rounded-xl text-blue-600">
                            <Clock className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Scans Performed</p>
                            <p className="text-2xl font-bold text-gray-900">{analyses.length}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-md flex items-center gap-4">
                        <div className="p-4 bg-green-100 rounded-xl text-green-600">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Verified Reports</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {analyses.filter(a => a.is_verified).length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Scan History Table Wrapper for responsive scrolling */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 md:p-8 overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Global Scan History</h2>
                        <span className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full">
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
                        <div className="p-10 text-center text-gray-500">
                            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No historical scans found.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                                        <th className="p-4 font-semibold text-gray-600">Date & Time</th>
                                        <th className="p-4 font-semibold text-gray-600">Fort ID</th>
                                        <th className="p-4 font-semibold text-gray-600 text-center">Changes Detected</th>
                                        <th className="p-4 font-semibold text-gray-600 text-center">Risk Level</th>
                                        <th className="p-4 font-semibold text-gray-600 text-center">Status</th>
                                        <th className="p-4 font-semibold text-gray-600 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {analyses.map((analysis) => (
                                        <tr key={analysis.id} className="hover:bg-orange-50/50 transition-colors">
                                            <td className="p-4 text-gray-900 font-medium">
                                                {new Date(analysis.analysis_date).toLocaleString()}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2 font-semibold text-gray-700">
                                                    <MapPin className="w-4 h-4 text-gray-400" /> Fort #{analysis.fort}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="font-bold text-gray-900">{analysis.changes_detected}</span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getRiskColor(analysis.risk_level)}`}>
                                                    {analysis.risk_level}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                {analysis.is_verified ? (
                                                    <span className="text-green-600 flex items-center justify-center gap-1 text-sm font-semibold">
                                                        <CheckCircle className="w-4 h-4" /> {analysis.is_false_positive ? 'False Pos' : 'Verified'}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-500 text-sm font-medium">Pending</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={() => setSelectedAnalysis(analysis)}
                                                    className="text-orange-600 hover:text-orange-800 hover:bg-orange-100 p-2 rounded-lg font-semibold flex items-center justify-center gap-1 mx-auto transition-all cursor-pointer active:scale-95"
                                                >
                                                    <Eye className="w-4 h-4" /> View Details
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

            {/* Detail Modal Overlay */}
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
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 overflow-y-auto">
            <div className="min-h-screen flex items-center justify-center p-4 py-8">
                <div className="bg-white rounded-3xl p-8 max-w-5xl w-full my-8 shadow-2xl border-2 border-orange-200">
                    <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-gray-100">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Historical Scan Details</h2>
                            <p className="text-gray-600 mt-1">
                                Performed on {new Date(analysis.analysis_date).toLocaleString()}
                            </p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all cursor-pointer active:scale-95">
                            <X className="w-10 h-10" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 text-center flex flex-col justify-center">
                                <div className="text-2xl md:text-3xl font-bold text-gray-900">{analysis.changes_detected}</div>
                                <div className="text-xs md:text-sm text-gray-600 font-medium">Changes Detected</div>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 text-center flex flex-col justify-center">
                                <div className="text-2xl md:text-3xl font-bold text-gray-900">{analysis.risk_score || 0}<span className="text-base text-gray-400">/10</span></div>
                                <div className="text-xs md:text-sm text-gray-600 font-medium">Risk Score</div>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 text-center flex flex-col justify-center">
                                <div className="text-2xl md:text-3xl font-bold text-gray-900">
                                    {analysis.ssim_score ? (analysis.ssim_score * 100).toFixed(1) : 0}<span className="text-base text-gray-400">%</span>
                                </div>
                                <div className="text-xs md:text-sm text-gray-600 font-medium">SSIM Score</div>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 text-center flex flex-col justify-center col-span-2 md:col-span-1 lg:col-span-1">
                                <div className={`text-xl md:text-2xl font-bold ${['HIGH', 'CRITICAL'].includes(analysis.risk_level) ? 'text-red-700' : analysis.risk_level === 'MEDIUM' ? 'text-yellow-700' : 'text-green-700'}`}>{analysis.risk_level}</div>
                                <div className="text-xs md:text-sm text-gray-600 font-medium">Risk Level</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
                                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5 text-gray-500" /> Previous Scan
                                </h3>
                                {analysis.previous_image_url ? (
                                    <img src={analysis.previous_image_url} alt="Previous" className="w-full rounded-xl border border-gray-300" />
                                ) : (
                                    <div className="w-full h-48 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500 text-sm">No previous image</div>
                                )}
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
                                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5 text-gray-500" /> Current Scan
                                </h3>
                                {analysis.current_image_url ? (
                                    <img src={analysis.current_image_url} alt="Current" className="w-full rounded-xl border border-gray-300" />
                                ) : (
                                    <div className="w-full h-48 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500 text-sm">No current image</div>
                                )}
                            </div>
                        </div>

                        {analysis.annotated_image_url && (
                            <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-orange-500" /> Annotated Damage Bounding Boxes
                                </h3>
                                <img src={analysis.annotated_image_url} alt="Annotated" className="w-full rounded-xl border-2 border-orange-300 shadow-md max-h-96 object-contain" />
                            </div>
                        )}

                        {analysis.analysis_results && analysis.analysis_results.detections && analysis.analysis_results.detections.length > 0 && (
                            <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
                                <h4 className="font-bold text-gray-900 mb-3">Detection Coordinates & Data</h4>
                                <div className="overflow-y-auto max-h-40">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="py-2 px-3 font-semibold">Severity</th>
                                                <th className="py-2 px-3 font-semibold">Confidence</th>
                                                <th className="py-2 px-3 font-semibold">Area</th>
                                                <th className="py-2 px-3 font-semibold">BBox [x, y, w, h]</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {analysis.analysis_results.detections.map((det, i) => (
                                                <tr key={i}>
                                                    <td className="py-2 px-3">{det.severity}</td>
                                                    <td className="py-2 px-3">{(det.confidence * 100).toFixed(1)}%</td>
                                                    <td className="py-2 px-3">{det.area.toFixed(0)}</td>
                                                    <td className="py-2 px-3 font-mono">{JSON.stringify(det.bbox)}</td>
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
