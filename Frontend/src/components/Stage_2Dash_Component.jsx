import React, { useState, useEffect } from 'react';
import { TrendingUp, Activity, Shield, Zap, RefreshCw, Eye, Upload, Camera, CheckCircle, AlertCircle, X, Image, MapPin, BarChart3, AlertTriangle, User, Loader } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

const Stage2Dashboard = ({ setActiveStage }) => {
  const navigate = useNavigate();
  const [fortsData, setFortsData] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFortDetails, setSelectedFortDetails] = useState(null);
  const [selectedFort, setSelectedFort] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const API_BASE = 'http://localhost:8000/api';

  useEffect(() => {
    fetchData();
  }, []);

  // ... (keeping fetchData and other functions same)

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      };

      const [fortsResponse, analysesResponse, statsResponse] = await Promise.all([
        fetch(`${API_BASE}/forts/`, { headers }),
        fetch(`${API_BASE}/structural-analyses/`, { headers }),
        fetch(`${API_BASE}/forts/statistics/`, { headers })
      ]);

      if (!fortsResponse.ok || !analysesResponse.ok || !statsResponse.ok) {
        throw new Error('Failed to fetch data from backend');
      }

      const fortsData = await fortsResponse.json();
      const analysesData = await analysesResponse.json();
      const stats = await statsResponse.json();

      const forts = Array.isArray(fortsData) ? fortsData : (fortsData.results || []);
      const analyses = Array.isArray(analysesData) ? analysesData : (analysesData.results || []);

      const enrichedForts = forts.map(fort => {
        const fortAnalyses = analyses.filter(a => a.fort === fort.id);
        const latestAnalysis = fortAnalyses.sort((a, b) =>
          new Date(b.analysis_date) - new Date(a.analysis_date)
        )[0];

        return {
          id: fort.id,
          name: fort.name,
          location: fort.location,
          description: fort.description,
          riskLevel: latestAnalysis?.risk_level || 'SAFE',
          aiConfidence: latestAnalysis ? Math.round(Math.max(0, Math.min(100, (1 - Math.min(latestAnalysis.cnn_distance, 3) / 3) * 100))) : 95,
          structuralHealth: latestAnalysis ? Math.round(latestAnalysis.ssim_score * 100) : 95,
          changesDetected: latestAnalysis?.changes_detected || 0,
          riskScore: latestAnalysis?.risk_score || 0,
          totalArea: latestAnalysis?.total_area_affected || 0,
          analysisDate: latestAnalysis?.analysis_date || null,
          prediction: latestAnalysis?.analysis_results?.risk_assessment?.description || 'No recent analysis available',
          recommendations: latestAnalysis?.analysis_results?.risk_assessment?.recommendations || [],
          detailedAnalysis: latestAnalysis,
          hasLatestImage: fort.latest_image ? true : false,
          analysisCount: fort.analysis_count || 0,
          latestImageUrl: fort.latest_image?.url || null,
          allAnalyses: fortAnalyses
        };
      });

      setFortsData(enrichedForts);
      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
    }
    setLoading(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFort || !selectedFile) {
      alert('Please select a fort and an image');
      return;
    }

    setUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('fort_id', selectedFort);
    formData.append('image', selectedFile);

    // Phase 3: Attach Climate Data
    const activeFortData = fortsData.find(f => f.id.toString() === selectedFort.toString());
    if (activeFortData && activeFortData.weather) {
      formData.append('temperature', activeFortData.weather.temp);
      formData.append('humidity', activeFortData.weather.humidity);
      formData.append('wind_speed', activeFortData.weather.windSpeed);
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/structural-analyses/analyze/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Upload failed');
      }

      setUploadResult(data);
      await fetchData();

      setSelectedFile(null);
      setPreview(null);

      if (data.is_first_upload || data.analysis) {
        setTimeout(() => {
          setShowUpload(false);
          setUploadResult(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Error uploading:', error);
      setUploadResult({ error: error.message });
    } finally {
      setUploading(false);
    }
  };

  const calculateOverallMetrics = () => {
    if (!fortsData.length) return {
      predictionAccuracy: 0,
      dataCorrelation: 0,
      riskMitigation: 0,
      systemLearning: 0
    };

    const fortsWithAnalyses = fortsData.filter(f => f.analysisDate);

    if (fortsWithAnalyses.length === 0) return {
      predictionAccuracy: 0,
      dataCorrelation: 0,
      riskMitigation: 0,
      systemLearning: 0
    };

    const avgConfidence = fortsWithAnalyses.reduce((sum, f) => sum + f.aiConfidence, 0) / fortsWithAnalyses.length;
    const avgStructural = fortsWithAnalyses.reduce((sum, f) => sum + f.structuralHealth, 0) / fortsWithAnalyses.length;
    const safeCount = fortsWithAnalyses.filter(f => ['SAFE', 'LOW'].includes(f.riskLevel)).length;
    const riskMitigation = (safeCount / fortsWithAnalyses.length) * 100;

    return {
      predictionAccuracy: avgConfidence.toFixed(1),
      dataCorrelation: avgStructural.toFixed(1),
      riskMitigation: riskMitigation.toFixed(1),
      systemLearning: ((avgConfidence + avgStructural) / 2).toFixed(1)
    };
  };

  const metrics = calculateOverallMetrics();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-800 text-2xl font-semibold">Loading Fort Analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-10 max-w-md text-center">
          <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Connection Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={fetchData} className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all font-semibold shadow-lg">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {showUpload && <UploadModal fortsData={fortsData} selectedFort={selectedFort} setSelectedFort={setSelectedFort} selectedFile={selectedFile} preview={preview} uploading={uploading} uploadResult={uploadResult} onClose={() => { setShowUpload(false); setUploadResult(null); setSelectedFile(null); setPreview(null); }} onFileSelect={handleFileSelect} onUpload={handleUpload} />}
      {selectedFortDetails && <FortDetailModal fort={selectedFortDetails} onClose={() => setSelectedFortDetails(null)} onRefresh={fetchData} />}
      <Header onUpload={() => setShowUpload(true)} onRefresh={fetchData} onProfile={() => navigate('/profile')} onReturn={() => navigate('/')} />
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-10">
        <MetricsGrid metrics={metrics} />
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-extrabold text-slate-800">Fort Monitoring Panel</h2>
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm text-slate-600">
              <BarChart3 className="w-5 h-5 text-orange-500" />
              <span className="font-bold">{fortsData.length} Tracked</span>
            </div>
          </div>
          <FortsGrid fortsData={fortsData} onViewDetails={setSelectedFortDetails} />
        </div>
      </div>
    </div>
  );
};
const Header = ({ onUpload, onRefresh, onProfile, onReturn }) => (
  <header className="fixed w-full top-0 z-50 px-4 pt-4 pb-2 transition-all">
    <div className="container mx-auto max-w-7xl bg-white/90 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-2xl border border-white/40">
      <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl shadow-lg shadow-orange-500/30">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">Live Verification</h1>
            <p className="text-orange-600 font-semibold text-xs tracking-wide uppercase">AI-powered structural monitoring</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 md:gap-3 w-full md:w-auto">
          <button onClick={onUpload} className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2.5 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer font-bold shadow-lg shadow-orange-500/30 flex items-center gap-2 text-sm">
            <Upload className="w-4 h-4" />Upload Image
          </button>
          <button onClick={onRefresh} className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-sm font-bold flex items-center gap-2 text-sm">
            <RefreshCw className="w-4 h-4" />
          </button>
          {onProfile && (
            <button onClick={onProfile} className="bg-orange-50 text-orange-700 border border-orange-200/50 px-4 py-2.5 rounded-xl hover:bg-orange-100 transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-sm font-bold flex items-center gap-2 text-sm">
              <User className="w-4 h-4" /> Profile
            </button>
          )}
          {onReturn && <button onClick={onReturn} className="bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-200 transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-sm font-bold text-sm">Return</button>}
        </div>
      </div>
    </div>
  </header>
);

const MetricsGrid = ({ metrics }) => {
  const metricsData = [
    { label: "Prediction Accuracy", value: `${metrics.predictionAccuracy}%`, icon: TrendingUp, bgColor: "from-orange-400 to-orange-500", iconBg: "bg-orange-50", iconColor: "text-orange-500" },
    { label: "Data Correlation", value: `${metrics.dataCorrelation}%`, icon: Activity, bgColor: "from-orange-500 to-orange-600", iconBg: "bg-orange-50", iconColor: "text-orange-600" },
    { label: "Risk Mitigation", value: `${metrics.riskMitigation}%`, icon: Shield, bgColor: "from-red-400 to-orange-500", iconBg: "bg-red-50", iconColor: "text-red-500" },
    { label: "System Learning", value: `${metrics.systemLearning}%`, icon: Zap, bgColor: "from-amber-400 to-orange-500", iconBg: "bg-amber-50", iconColor: "text-amber-500" }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {metricsData.map((metric, index) => (
        <div key={index} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:border-orange-200 hover:-translate-y-1 transition-all group">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-4 rounded-2xl ${metric.iconBg} group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-100`}>
              <metric.icon className={`w-6 h-6 ${metric.iconColor}`} />
            </div>
          </div>
          <div className="text-4xl font-extrabold text-slate-800 mb-2 tracking-tight">{metric.value}</div>
          <p className="text-slate-500 font-bold text-sm tracking-wide uppercase">{metric.label}</p>
          <div className="mt-5 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-2 bg-gradient-to-r ${metric.bgColor} rounded-full transition-all duration-1000 ease-in-out`} style={{ width: metric.value }} />
          </div>
        </div>
      ))}
    </div>
  );
};

const FortsGrid = ({ fortsData, onViewDetails }) => {
  if (fortsData.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border-2 border-gray-100">
        <Shield className="w-20 h-20 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-900 text-xl font-semibold">No fort data available</p>
        <p className="text-gray-500 mt-2">Add forts and upload images to start monitoring</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {fortsData.map((fort) => <FortCard key={fort.id} fort={fort} onViewDetails={onViewDetails} />)}
    </div>
  );
};

const FortCard = ({ fort, onViewDetails }) => (
  <div className="bg-white rounded-3xl p-6 border border-slate-100 hover:border-orange-200 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 group relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:bg-orange-100 transition-colors"></div>
    <div className="relative z-10 flex items-start justify-between mb-6">
      <div className="flex-1">
        <h3 className="text-xl font-extrabold text-slate-800 mb-1 group-hover:text-orange-600 transition-colors">{fort.name}</h3>
        <p className="text-slate-500 text-sm flex items-center gap-1 font-medium"><MapPin className="w-4 h-4 text-orange-400" />{fort.location}</p>
        {fort.analysisDate && <p className="text-orange-600 text-xs mt-2 font-bold tracking-wide">Last Update: {new Date(fort.analysisDate).toLocaleDateString()}</p>}
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${fort.riskLevel === 'SAFE' || fort.riskLevel === 'LOW' ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-emerald-500/30' : fort.riskLevel === 'MEDIUM' ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-orange-500/30' : 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/30'}`}>
        <Shield className="w-7 h-7 text-white" />
      </div>
    </div>

    <div className="grid grid-cols-3 gap-3 mb-6">
      <div className="bg-slate-50 rounded-xl p-3 text-center border border-transparent group-hover:border-orange-100 transition-colors">
        <div className="text-2xl font-extrabold text-slate-800">{fort.changesDetected}</div>
        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Changes</div>
      </div>
      <div className="bg-slate-50 rounded-xl p-3 text-center border border-transparent group-hover:border-orange-100 transition-colors">
        <div className="text-2xl font-extrabold text-slate-800">{fort.riskScore}<span className="text-sm text-slate-400">/10</span></div>
        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Risk</div>
      </div>
      <div className="bg-slate-50 rounded-xl p-3 text-center border border-transparent group-hover:border-orange-100 transition-colors">
        <div className="text-2xl font-extrabold text-slate-800">{fort.structuralHealth}<span className="text-sm text-slate-400">%</span></div>
        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">SSIM</div>
      </div>
    </div>

    <div className={`px-4 py-3 rounded-xl text-center font-extrabold text-sm mb-5 tracking-wide ${fort.riskLevel === 'SAFE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' : fort.riskLevel === 'LOW' ? 'bg-slate-100 text-slate-700 border border-slate-200' : fort.riskLevel === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border border-amber-200/50' : 'bg-red-50 text-red-700 border border-red-200/50'}`}>
      {fort.riskLevel} RISK
    </div>

    <div className="space-y-3 mb-6 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-bold text-slate-500">AI Confidence:</span>
        <span className="font-extrabold text-slate-800">{fort.aiConfidence}%</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-bold text-slate-500">Total Area:</span>
        <span className="font-extrabold text-slate-800">{fort.totalArea.toLocaleString()} px</span>
      </div>
    </div>

    <p className="text-xs text-slate-400 italic mb-6 line-clamp-2 font-medium bg-slate-50 p-3 rounded-lg border border-slate-100">{fort.prediction}</p>

    <button onClick={() => onViewDetails(fort)} className="w-full bg-slate-900 hover:bg-orange-600 text-white py-3.5 rounded-xl transition-colors font-bold flex items-center justify-center gap-2 shadow-md">
      <Eye className="w-5 h-5" />View Full Analysis
    </button>
  </div>
);

const UploadModal = ({ fortsData, selectedFort, setSelectedFort, selectedFile, preview, uploading, uploadResult, onClose, onFileSelect, onUpload }) => (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 overflow-y-auto">
    <div className="min-h-screen flex items-center justify-center p-4 py-8">
      <div className="bg-white rounded-[2rem] p-8 md:p-10 max-w-2xl w-full shadow-2xl border border-white/20">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Upload className="w-5 h-5 text-orange-600" />
            </div>
            Upload Current Image
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition-colors"><X className="w-6 h-6" /></button>
        </div>
        <div className="space-y-6">
          <div>
            <label className="text-slate-700 text-sm font-bold mb-2 block tracking-wide">Select Target Fort</label>
            <select value={selectedFort} onChange={(e) => setSelectedFort(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-5 py-4 text-slate-900 font-medium focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all cursor-pointer appearance-none">
              <option value="">Choose a fort...</option>
              {fortsData.map(fort => <option key={fort.id} value={fort.id}>{fort.name} - {fort.hasLatestImage ? 'Ready for comparison' : 'First image needed'}</option>)}
            </select>
          </div>
          <div>
            <label className="text-slate-700 text-sm font-bold mb-2 block tracking-wide">Image File</label>
            <input type="file" accept="image/*" onChange={onFileSelect} className="hidden" id="file-upload" />
            <label htmlFor="file-upload" className="flex flex-col items-center justify-center gap-3 w-full bg-slate-50 border-2 border-dashed border-slate-300 hover:border-orange-500 hover:bg-orange-50/50 text-slate-500 hover:text-orange-600 py-10 rounded-2xl cursor-pointer transition-all">
              <Upload className="w-8 h-8" />
              <span className="font-bold">Click to Browse Images</span>
            </label>
          </div>
          {preview && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-slate-500 text-sm font-bold mb-3 tracking-wide">Preview</p>
              <img src={preview} alt="Preview" className="w-full h-64 object-cover rounded-xl border border-slate-200 shadow-sm" />
            </div>
          )}
          <button onClick={onUpload} disabled={!selectedFort || !selectedFile || uploading} className={`w-full py-3.5 rounded-xl font-bold text-white transition-all shadow-lg text-lg ${uploading ? 'bg-slate-400 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:-translate-y-1 hover:shadow-orange-500/30 active:scale-[0.98]'}`}>
            {uploading ? (
              <span className="flex items-center justify-center gap-3">
                <Loader className="w-5 h-5 animate-spin" />
                Processing Image...
              </span>
            ) : 'Upload & Proceed'}
          </button>

          {uploadResult?.error && <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-4"><AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" /><div><p className="font-extrabold text-red-900 mb-1">Upload Failed</p><p className="text-red-700 text-sm font-medium">{uploadResult.error}</p>{uploadResult.error.includes('different') && <p className="text-red-600 text-xs mt-2 font-bold bg-white/50 p-2 rounded-lg">Potential misalignment: Ensure images are of the same location.</p>}</div></div>}
          {uploadResult?.is_first_upload && <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-4"><CheckCircle className="w-6 h-6 text-blue-500 flex-shrink-0" /><div><p className="font-extrabold text-blue-900 mb-1">Initialization Complete</p><p className="text-blue-700 text-sm font-medium">Upload a subsequent image to perform differencing.</p></div></div>}
          {uploadResult?.analysis && <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-4"><CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" /><div><p className="font-extrabold text-emerald-900 mb-1">Analysis Complete</p><p className="text-emerald-700 text-sm font-medium">Risk: <span className="font-bold">{uploadResult.analysis.risk_level}</span> | Detected: <span className="font-bold">{uploadResult.analysis.changes_detected}</span></p></div></div>}
        </div>
      </div>
    </div>
  </div>
);

const FortDetailModal = ({ fort, onClose, onRefresh }) => {
  const [verificationMessage, setVerificationMessage] = useState(null);

  if (!fort.detailedAnalysis) {
    return (
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 overflow-y-auto">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-10 max-w-2xl w-full shadow-2xl border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-extrabold text-slate-800">{fort.name}</h2>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-xl transition-colors"><X className="w-8 h-8" /></button>
            </div>
            <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <Shield className="w-20 h-20 text-slate-300 mx-auto mb-6" />
              <p className="text-slate-800 text-2xl font-bold">No Analysis Yet</p>
              <p className="text-slate-500 mt-2 font-medium">Upload images to generate the first structural analysis report.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4 py-8">
        <div className="bg-white rounded-3xl p-6 md:p-8 max-w-5xl w-full my-8 shadow-2xl border border-slate-100 max-h-[95vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6 sticky top-0 bg-white/95 backdrop-blur-sm z-10 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-3xl font-bold text-slate-800">{fort.name}</h2>
              <p className="text-slate-500 text-sm mt-1 flex items-center gap-1"><MapPin className="w-4 h-4" /> {fort.location}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2.5 rounded-xl transition-colors"><X className="w-6 h-6" /></button>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-lg border border-slate-200 flex items-center justify-center shadow-sm">
                  <Image className="w-4 h-4 text-orange-500" />
                </div>
                Analysis Visualization
              </h3>
              <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <img src={fort.detailedAnalysis.annotated_image_url} alt="Analysis" className="w-full object-cover max-h-[500px]" />
              </div>
              <p className="text-slate-500 text-xs font-semibold mt-3">Bounding boxes designate structural variation. Computed: {new Date(fort.analysisDate).toLocaleString()}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">Baseline Image</h4>
                <div className="rounded-xl overflow-hidden border border-slate-200">
                  <img src={fort.detailedAnalysis.previous_image_url} alt="Previous" className="w-full object-cover aspect-video" />
                </div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">Current State</h4>
                <div className="rounded-xl overflow-hidden border border-slate-200">
                  <img src={fort.detailedAnalysis.current_image_url} alt="Current" className="w-full object-cover aspect-video" />
                </div>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white border border-slate-100 rounded-2xl p-4 text-slate-800 shadow-sm flex flex-col justify-center">
                <div className="text-xl md:text-2xl font-bold mb-1 text-orange-600 truncate">{fort.detailedAnalysis.environmental_data?.climate_stress_index?.toFixed(1) || '0.0'}</div>
                <div className="text-[10px] md:text-xs font-semibold text-slate-500 tracking-normal uppercase">Climate Stress</div>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-4 text-slate-800 shadow-sm flex flex-col justify-center">
                <div className="text-xl md:text-2xl font-bold mb-1 text-orange-600 truncate">{fort.changesDetected}</div>
                <div className="text-[10px] md:text-xs font-semibold text-slate-500 tracking-normal uppercase">Anomalies Detected</div>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-4 text-slate-800 shadow-sm flex flex-col justify-center">
                <div className="text-xl md:text-2xl font-bold mb-1 text-orange-600 truncate">{fort.detailedAnalysis.environmental_data?.final_heritage_risk_score || fort.riskScore}<span className="text-sm md:text-lg text-slate-300">/10</span></div>
                <div className="text-[10px] md:text-xs font-semibold text-slate-500 tracking-normal uppercase">Final Severity</div>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-4 text-slate-800 shadow-sm flex flex-col justify-center">
                <div className="text-xl md:text-2xl font-bold mb-1 text-orange-600 truncate">{fort.structuralHealth}<span className="text-sm md:text-lg text-slate-300">%</span></div>
                <div className="text-[10px] md:text-xs font-semibold text-slate-500 tracking-normal uppercase">SSIM Index</div>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-4 text-slate-800 shadow-sm flex flex-col justify-center col-span-2 md:col-span-1">
                <div className="text-xl md:text-2xl font-bold mb-1 text-orange-600 truncate">{fort.totalArea.toLocaleString()}</div>
                <div className="text-[10px] md:text-xs font-semibold text-slate-500 tracking-normal uppercase">Impact (px)</div>
              </div>
            </div>

            {/* Risk Assessment Box */}
            <div className={`rounded-2xl p-6 border ${fort.riskLevel === 'HIGH' || fort.riskLevel === 'CRITICAL' ? 'bg-red-50 border-red-100' : fort.riskLevel === 'MEDIUM' ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`px-3 py-1 rounded-md text-xs font-bold tracking-wide uppercase ${fort.riskLevel === 'HIGH' || fort.riskLevel === 'CRITICAL' ? 'bg-red-500 text-white shadow-sm shadow-red-500/20' : fort.riskLevel === 'MEDIUM' ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20' : 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'}`}>
                  {fort.riskLevel} Assessment
                </div>
              </div>
              <p className="text-slate-700 text-base font-medium leading-relaxed mb-5">{fort.prediction}</p>

              {fort.detailedAnalysis.analysis_results?.risk_assessment?.factors && (
                <div className="mb-5 bg-white/60 p-5 rounded-xl border border-white/80">
                  <h4 className="font-bold text-slate-800 mb-2 text-sm">Key Risk Factors</h4>
                  <ul className="space-y-1.5 text-slate-600 text-sm">
                    {fort.detailedAnalysis.analysis_results.risk_assessment.factors.map((factor, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-orange-500 leading-tight mt-0.5">•</span>{factor}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Verification Section */}
              <div className="mt-6 flex flex-col md:flex-row gap-4 border-t border-slate-200/60 pt-6 relative">
                <div className="w-full md:w-auto md:flex-1 hidden md:flex items-center">
                  <h4 className="font-semibold text-slate-800 text-sm">Human Verification Required</h4>
                </div>
                {verificationMessage && (
                  <div className="absolute top-0 right-0 -mt-2 bg-emerald-100 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-lg font-semibold text-sm animate-pulse z-10">
                    {verificationMessage}
                  </div>
                )}
                {fort.detailedAnalysis.is_verified ? (
                  <div className="w-full md:w-auto p-4 bg-white text-slate-800 rounded-xl border border-slate-200 font-semibold flex items-center justify-center gap-2 shadow-sm">
                    {fort.detailedAnalysis.is_false_positive ? (
                      <><AlertTriangle className="w-5 h-5 text-amber-500" /> Logged as False Positive</>
                    ) : (
                      <><CheckCircle className="w-5 h-5 text-emerald-500" /> Verified</>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-3 w-full md:w-auto">
                    <button
                      onClick={async () => {
                        try {
                          await fetch(`http://localhost:8000/api/structural-analyses/${fort.detailedAnalysis.id}/verify/`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${localStorage.getItem('auth_token')}` },
                            body: JSON.stringify({ is_verified: true, is_false_positive: false })
                          });
                          setVerificationMessage("Verified!");
                          setTimeout(() => { setVerificationMessage(null); onRefresh(); onClose(); }, 1500);
                        } catch (e) { console.error(e); }
                      }}
                      className="flex-1 bg-emerald-500 text-white px-5 py-3 rounded-xl hover:bg-emerald-600 font-semibold shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <CheckCircle className="w-4 h-4" /> Confirm
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await fetch(`http://localhost:8000/api/structural-analyses/${fort.detailedAnalysis.id}/verify/`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${localStorage.getItem('auth_token')}` },
                            body: JSON.stringify({ is_verified: true, is_false_positive: true })
                          });
                          setVerificationMessage("Rejected!");
                          setTimeout(() => { setVerificationMessage(null); onRefresh(); onClose(); }, 1500);
                        } catch (e) { console.error(e); }
                      }}
                      className="flex-1 bg-white border border-slate-300 text-slate-700 px-5 py-3 rounded-xl hover:bg-slate-50 font-semibold shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Recommendations */}
            {fort.recommendations.length > 0 && (
              <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-500" /> Actions Recommended
                </h3>
                <ul className="space-y-3">
                  {fort.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-700 text-sm">
                      <div className="w-6 h-6 rounded-md bg-white border border-orange-200 text-orange-600 flex items-center justify-center flex-shrink-0 font-bold shadow-sm">{i + 1}</div>
                      <span className="mt-0.5">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Detections List */}
            {fort.detailedAnalysis.analysis_results?.detections && fort.detailedAnalysis.analysis_results.detections.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  Isolation Data ({fort.detailedAnalysis.analysis_results.detections.length} Nodes)
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {fort.detailedAnalysis.analysis_results.detections.map((detection, i) => (
                    <div key={i} className={`bg-slate-50 rounded-xl p-4 border-l-4 ${detection.severity === 'Critical' ? 'border-l-red-500' : detection.severity === 'Moderate' ? 'border-l-orange-500' : 'border-l-yellow-400'} border-y border-r border-slate-100 shadow-sm`}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="font-bold text-slate-800 text-sm">Node #{i + 1}</div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${detection.severity === 'Critical' ? 'bg-red-100 text-red-700' : detection.severity === 'Moderate' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {detection.severity}
                        </span>
                      </div>
                      <div className="space-y-2 text-slate-600 font-medium text-xs">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-500 font-semibold">AI Confidence</span>
                            <span className="font-bold text-slate-800">{(detection.confidence * 100).toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div className={`h-1.5 rounded-full ${detection.confidence > 0.8 ? 'bg-emerald-400' : detection.confidence > 0.5 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${detection.confidence * 100}%` }}></div>
                          </div>
                        </div>
                        <div className="flex justify-between border-t border-slate-200/60 pt-2">
                          <span className="flex flex-col"><span className="text-slate-400">Pixel Area</span><span className="text-slate-800 font-bold">{detection.area.toFixed(0)}</span></span>
                          <span className="flex flex-col text-right"><span className="text-slate-400">Dimensions</span><span className="text-slate-800 font-bold">{detection.bbox[2]}x{detection.bbox[3]}</span></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Stage2Dashboard;