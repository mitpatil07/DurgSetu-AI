import React, { useState, useEffect } from 'react';
import { TrendingUp, Activity, Shield, Zap, RefreshCw, Eye, Upload, Camera, CheckCircle, AlertCircle, X, Image, MapPin, BarChart3, AlertTriangle } from 'lucide-react';

const Stage2Dashboard = ({ setActiveStage }) => {
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

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [fortsResponse, analysesResponse, statsResponse] = await Promise.all([
        fetch(`${API_BASE}/forts/`),
        fetch(`${API_BASE}/structural-analyses/`),
        fetch(`${API_BASE}/forts/statistics/`)
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

    try {
      const response = await fetch(`${API_BASE}/structural-analyses/analyze/`, {
        method: 'POST',
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {showUpload && <UploadModal fortsData={fortsData} selectedFort={selectedFort} setSelectedFort={setSelectedFort} selectedFile={selectedFile} preview={preview} uploading={uploading} uploadResult={uploadResult} onClose={() => {setShowUpload(false); setUploadResult(null); setSelectedFile(null); setPreview(null);}} onFileSelect={handleFileSelect} onUpload={handleUpload} />}
      {selectedFortDetails && <FortDetailModal fort={selectedFortDetails} onClose={() => setSelectedFortDetails(null)} />}
      <Header onUpload={() => setShowUpload(true)} onRefresh={fetchData} onReturn={setActiveStage ? () => setActiveStage('main') : null} />
      <div className="max-w-7xl mx-auto px-6 py-10">
        <MetricsGrid metrics={metrics} />
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Fort Monitoring</h2>
            <div className="flex items-center gap-2 text-gray-600">
              <BarChart3 className="w-5 h-5" />
              <span className="font-semibold">{fortsData.length} Forts Tracked</span>
            </div>
          </div>
          <FortsGrid fortsData={fortsData} onViewDetails={setSelectedFortDetails} />
        </div>
      </div>
    </div>
  );
};

const Header = ({ onUpload, onRefresh, onReturn }) => (
  <header className="bg-white border-b-2 border-orange-200 shadow-sm sticky top-0 z-40">
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Shield className="w-9 h-9 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fort Preservation System</h1>
            <p className="text-gray-600 font-medium">AI-powered structural monitoring</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onUpload} className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all font-semibold shadow-lg flex items-center gap-2">
            <Upload className="w-5 h-5" />Upload Image
          </button>
          <button onClick={onRefresh} className="bg-white text-orange-600 border-2 border-orange-500 px-6 py-3 rounded-xl hover:bg-orange-50 transition-all font-semibold flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />Refresh
          </button>
          {onReturn && <button onClick={onReturn} className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all font-semibold">Return</button>}
        </div>
      </div>
    </div>
  </header>
);

const MetricsGrid = ({ metrics }) => {
  const metricsData = [
    { label: "Prediction Accuracy", value: `${metrics.predictionAccuracy}%`, icon: TrendingUp, bgColor: "from-green-500 to-emerald-600", iconBg: "bg-green-100", iconColor: "text-green-600" },
    { label: "Data Correlation", value: `${metrics.dataCorrelation}%`, icon: Activity, bgColor: "from-orange-500 to-orange-600", iconBg: "bg-orange-100", iconColor: "text-orange-600" },
    { label: "Risk Mitigation", value: `${metrics.riskMitigation}%`, icon: Shield, bgColor: "from-amber-500 to-orange-600", iconBg: "bg-amber-100", iconColor: "text-amber-600" },
    { label: "System Learning", value: `${metrics.systemLearning}%`, icon: Zap, bgColor: "from-yellow-500 to-orange-500", iconBg: "bg-yellow-100", iconColor: "text-yellow-600" }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {metricsData.map((metric, index) => (
        <div key={index} className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl ${metric.iconBg}`}>
              <metric.icon className={`w-6 h-6 ${metric.iconColor}`} />
            </div>
          </div>
          <div className="text-4xl font-bold text-gray-900 mb-2">{metric.value}</div>
          <p className="text-gray-600 font-medium">{metric.label}</p>
          <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-2 bg-gradient-to-r ${metric.bgColor} rounded-full transition-all`} style={{width: metric.value}} />
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
  <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-orange-300 transition-all shadow-lg hover:shadow-xl">
    <div className="flex items-start justify-between mb-5">
      <div className="flex-1">
        <h3 className="text-xl font-bold text-gray-900 mb-1">{fort.name}</h3>
        <p className="text-gray-600 text-sm flex items-center gap-1"><MapPin className="w-4 h-4" />{fort.location}</p>
        {fort.analysisDate && <p className="text-orange-600 text-xs mt-2 font-medium">Last analyzed: {new Date(fort.analysisDate).toLocaleDateString()}</p>}
      </div>
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-md ${fort.riskLevel === 'SAFE' || fort.riskLevel === 'LOW' ? 'bg-gradient-to-br from-green-500 to-emerald-600' : fort.riskLevel === 'MEDIUM' ? 'bg-gradient-to-br from-yellow-500 to-orange-500' : 'bg-gradient-to-br from-red-500 to-rose-600'}`}>
        <Shield className="w-7 h-7 text-white" />
      </div>
    </div>
    <div className="grid grid-cols-3 gap-3 mb-5">
      <div className="bg-orange-50 rounded-xl p-3 text-center border border-orange-100">
        <div className="text-2xl font-bold text-orange-600">{fort.changesDetected}</div>
        <div className="text-xs text-gray-600 font-medium">Changes</div>
      </div>
      <div className="bg-orange-50 rounded-xl p-3 text-center border border-orange-100">
        <div className="text-2xl font-bold text-orange-600">{fort.riskScore}/10</div>
        <div className="text-xs text-gray-600 font-medium">Risk</div>
      </div>
      <div className="bg-orange-50 rounded-xl p-3 text-center border border-orange-100">
        <div className="text-2xl font-bold text-orange-600">{fort.structuralHealth}%</div>
        <div className="text-xs text-gray-600 font-medium">SSIM</div>
      </div>
    </div>
    <div className={`px-4 py-3 rounded-xl text-center font-bold text-sm mb-4 ${fort.riskLevel === 'SAFE' ? 'bg-green-100 text-green-700 border-2 border-green-200' : fort.riskLevel === 'LOW' ? 'bg-blue-100 text-blue-700 border-2 border-blue-200' : fort.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-200' : fort.riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-700 border-2 border-orange-200' : 'bg-red-100 text-red-700 border-2 border-red-200'}`}>
      {fort.riskLevel} RISK
    </div>
    <div className="space-y-2 mb-4 text-sm">
      <div className="flex items-center justify-between text-gray-700">
        <span className="font-medium">AI Confidence:</span>
        <span className="font-bold text-orange-600">{fort.aiConfidence}%</span>
      </div>
      <div className="flex items-center justify-between text-gray-700">
        <span className="font-medium">Total Area:</span>
        <span className="font-bold text-orange-600">{fort.totalArea.toLocaleString()} px</span>
      </div>
    </div>
    <p className="text-xs text-gray-500 italic mb-4 line-clamp-2">{fort.prediction}</p>
    <button onClick={() => onViewDetails(fort)} className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 rounded-xl transition-all font-semibold flex items-center justify-center gap-2 shadow-md">
      <Eye className="w-4 h-4" />View Full Analysis
    </button>
  </div>
);

const UploadModal = ({ fortsData, selectedFort, setSelectedFort, selectedFile, preview, uploading, uploadResult, onClose, onFileSelect, onUpload }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto">
    <div className="min-h-screen flex items-center justify-center p-4 py-8">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl border-2 border-orange-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Camera className="w-7 h-7 text-orange-600" />
            </div>Upload Image
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="w-8 h-8" /></button>
        </div>
        <div className="space-y-6">
          <div>
            <label className="text-gray-700 text-sm font-semibold mb-2 block">Select Fort</label>
            <select value={selectedFort} onChange={(e) => setSelectedFort(e.target.value)} className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-500">
              <option value="">Choose a fort...</option>
              {fortsData.map(fort => <option key={fort.id} value={fort.id}>{fort.name} - {fort.hasLatestImage ? 'Ready for comparison' : 'First image needed'}</option>)}
            </select>
          </div>
          <div>
            <label className="text-gray-700 text-sm font-semibold mb-2 block">Upload Image</label>
            <input type="file" accept="image/*" onChange={onFileSelect} className="hidden" id="file-upload" />
            <label htmlFor="file-upload" className="flex items-center justify-center gap-3 w-full bg-orange-50 border-2 border-dashed border-orange-300 hover:border-orange-500 text-orange-600 py-6 rounded-xl cursor-pointer transition-all">
              <Upload className="w-6 h-6" /><span className="font-semibold">Choose Image File</span>
            </label>
          </div>
          {preview && <div><p className="text-gray-700 text-sm font-semibold mb-3">Preview:</p><img src={preview} alt="Preview" className="w-full h-64 object-cover rounded-xl border-2 border-gray-200" /></div>}
          <button onClick={onUpload} disabled={!selectedFort || !selectedFile || uploading} className={`w-full py-4 rounded-xl font-semibold text-white transition-all shadow-lg ${uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'}`}>
            {uploading ? <span className="flex items-center justify-center gap-3"><div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>Analyzing Image...</span> : 'Upload & Analyze'}
          </button>
          {uploadResult?.error && <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3"><AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" /><div><p className="font-semibold text-red-900 mb-1">Upload Failed</p><p className="text-red-700 text-sm">{uploadResult.error}</p>{uploadResult.error.includes('different') && <p className="text-red-600 text-xs mt-2">The images appear to be from different forts or angles. Please verify.</p>}</div></div>}
          {uploadResult?.is_first_upload && <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-start gap-3"><CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0" /><div><p className="font-semibold text-blue-900">First Image Uploaded!</p><p className="text-blue-700 text-sm">Upload another image to start detecting changes.</p></div></div>}
          {uploadResult?.analysis && <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-start gap-3"><CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" /><div><p className="font-semibold text-green-900">Analysis Complete!</p><p className="text-green-700 text-sm">Risk Level: {uploadResult.analysis.risk_level} | Changes: {uploadResult.analysis.changes_detected}</p></div></div>}
        </div>
      </div>
    </div>
  </div>
);

const FortDetailModal = ({ fort, onClose }) => {
  if (!fort.detailedAnalysis) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 overflow-y-auto">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">{fort.name}</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-10 h-10" /></button>
            </div>
            <div className="text-center py-12">
              <Shield className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-900 text-xl font-semibold">No analysis available yet</p>
              <p className="text-gray-500 mt-2">Upload images to generate structural analysis</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4 py-8">
        <div className="bg-white rounded-3xl p-8 max-w-6xl w-full my-8 shadow-2xl border-2 border-orange-200 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-8 sticky top-0 bg-white pb-4 border-b-2 border-gray-100">
            <div>
              <h2 className="text-4xl font-bold text-gray-900">{fort.name}</h2>
              <p className="text-gray-600 mt-1">{fort.location}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-10 h-10" /></button>
          </div>
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Image className="w-6 h-6 text-orange-600" />
                </div>Analysis Visualization
              </h3>
              <img src={fort.detailedAnalysis.annotated_image_url} alt="Analysis" className="w-full rounded-xl border-2 border-gray-300 shadow-lg" />
              <p className="text-gray-600 text-sm mt-3">Red boxes show structural changes. Analyzed: {new Date(fort.analysisDate).toLocaleString()}</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
                <h4 className="text-lg font-bold text-gray-900 mb-3">Previous Image</h4>
                <img src={fort.detailedAnalysis.previous_image_url} alt="Previous" className="w-full rounded-xl border-2 border-gray-300" />
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
                <h4 className="text-lg font-bold text-gray-900 mb-3">Current Image</h4>
                <img src={fort.detailedAnalysis.current_image_url} alt="Current" className="w-full rounded-xl border-2 border-gray-300" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-6 text-white">
                <div className="text-4xl font-bold mb-1">{fort.changesDetected}</div>
                <div className="text-sm opacity-90">Changes Detected</div>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-6 text-white">
                <div className="text-4xl font-bold mb-1">{fort.riskScore}/10</div>
                <div className="text-sm opacity-90">Risk Score</div>
              </div>
              <div className="bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl p-6 text-white">
                <div className="text-4xl font-bold mb-1">{fort.structuralHealth}%</div>
                <div className="text-sm opacity-90">SSIM Score</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-white">
                <div className="text-4xl font-bold mb-1">{fort.totalArea.toLocaleString()}</div>
                <div className="text-sm opacity-90">Area Affected (px)</div>
              </div>
            </div>
            <div className={`rounded-2xl p-6 border-2 ${fort.riskLevel === 'HIGH' || fort.riskLevel === 'CRITICAL' ? 'bg-red-50 border-red-200' : fort.riskLevel === 'MEDIUM' ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Risk Assessment: {fort.riskLevel}</h3>
              <p className="text-gray-700 text-lg mb-4">{fort.prediction}</p>
              {fort.detailedAnalysis.analysis_results?.risk_assessment?.factors && (
                <div className="mb-4">
                  <h4 className="font-bold text-gray-900 mb-2">Risk Factors:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {fort.detailedAnalysis.analysis_results.risk_assessment.factors.map((factor, i) => (
                      <li key={i}>{factor}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {fort.recommendations.length > 0 && (
              <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Recommendations</h3>
                <ul className="space-y-3">
                  {fort.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-700">
                      <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-sm">{i + 1}</div>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {fort.detailedAnalysis.analysis_results?.detections && fort.detailedAnalysis.analysis_results.detections.length > 0 && (
              <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-orange-600" />
                  Detected Changes ({fort.detailedAnalysis.analysis_results.detections.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fort.detailedAnalysis.analysis_results.detections.map((detection, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 border-2 border-orange-100">
                      <div className="font-bold text-orange-600 mb-2">Change #{i + 1}</div>
                      <div className="text-sm space-y-1 text-gray-700">
                        <div>Area: {detection.area.toFixed(0)} px²</div>
                        <div>Confidence: {(detection.confidence * 100).toFixed(1)}%</div>
                        <div>Position: ({detection.bbox[0]}, {detection.bbox[1]})</div>
                        <div>Size: {detection.bbox[2]} × {detection.bbox[3]} px</div>
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