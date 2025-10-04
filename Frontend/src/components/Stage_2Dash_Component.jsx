import React, { useState, useEffect } from 'react';
import { TrendingUp, Activity, Shield, Zap, RefreshCw, Eye, Upload, Camera, CheckCircle, AlertCircle, X, Image, MapPin } from 'lucide-react';

const Stage2Dashboard = ({ setActiveStage }) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [fortsData, setFortsData] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal States
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFortDetails, setSelectedFortDetails] = useState(null);
  
  // Upload States
  const [selectedFort, setSelectedFort] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  
  const API_BASE = 'http://localhost:8000/api';

  // ============================================================================
  // DATA FETCHING
  // ============================================================================
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
          aiConfidence: latestAnalysis ? 
            Math.round((1 - Math.min(latestAnalysis.cnn_distance, 3) / 3) * 100) : 95,
          structuralHealth: latestAnalysis ? 
            Math.round(latestAnalysis.ssim_score * 100) : 95,
          changesDetected: latestAnalysis?.changes_detected || 0,
          riskScore: latestAnalysis?.risk_score || 0,
          totalArea: latestAnalysis?.total_area_affected || 0,
          analysisDate: latestAnalysis?.analysis_date || null,
          prediction: latestAnalysis?.risk_assessment?.description || 'No recent analysis available',
          recommendations: latestAnalysis?.recommendations || [],
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

  // ============================================================================
  // UPLOAD HANDLERS
  // ============================================================================
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
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

  // ============================================================================
  // METRICS CALCULATION
  // ============================================================================
  const calculateOverallMetrics = () => {
    if (!fortsData.length) return {
      predictionAccuracy: 0,
      dataCorrelation: 0,
      riskMitigation: 0,
      systemLearning: 0
    };

    const avgConfidence = fortsData.reduce((sum, f) => sum + f.aiConfidence, 0) / fortsData.length;
    const avgStructural = fortsData.reduce((sum, f) => sum + f.structuralHealth, 0) / fortsData.length;
    const safeCount = fortsData.filter(f => ['SAFE', 'LOW'].includes(f.riskLevel)).length;
    const riskMitigation = (safeCount / fortsData.length) * 100;

    return {
      predictionAccuracy: avgConfidence.toFixed(1),
      dataCorrelation: avgStructural.toFixed(1),
      riskMitigation: riskMitigation.toFixed(1),
      systemLearning: ((avgConfidence + avgStructural) / 2).toFixed(1)
    };
  };

  const metrics = calculateOverallMetrics();

  // ============================================================================
  // LOADING & ERROR STATES
  // ============================================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading Analytics Data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black flex items-center justify-center p-4">
        <div className="bg-red-500/20 border border-red-400/30 rounded-2xl p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-300 mb-2">Connection Error</h2>
          <p className="text-red-200 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black text-white relative overflow-hidden">
      {/* Background Animation */}
      <BackgroundAnimation />
      
      {/* Upload Modal */}
      {showUpload && (
        <UploadModal
          fortsData={fortsData}
          selectedFort={selectedFort}
          setSelectedFort={setSelectedFort}
          selectedFile={selectedFile}
          preview={preview}
          uploading={uploading}
          uploadResult={uploadResult}
          onClose={() => setShowUpload(false)}
          onFileSelect={handleFileSelect}
          onUpload={handleUpload}
        />
      )}

      {/* Detail Modal */}
      {selectedFortDetails && (
        <FortDetailModal
          fort={selectedFortDetails}
          onClose={() => setSelectedFortDetails(null)}
        />
      )}

      {/* Header */}
      <Header
        onUpload={() => setShowUpload(true)}
        onRefresh={fetchData}
        onReturn={setActiveStage ? () => setActiveStage('main') : null}
      />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Metrics Overview */}
        <MetricsGrid metrics={metrics} />

        {/* Forts Grid */}
        <FortsGrid
          fortsData={fortsData}
          onViewDetails={setSelectedFortDetails}
        />
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const BackgroundAnimation = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(8)].map((_, i) => (
      <div
        key={i}
        className="absolute w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-sm"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animation: `float ${8 + i}s ease-in-out infinite`,
          animationDelay: `${i * 0.5}s`
        }}
      />
    ))}
  </div>
);

const Header = ({ onUpload, onRefresh, onReturn }) => (
  <header className="relative bg-gradient-to-r from-purple-900/90 to-indigo-900/90 backdrop-blur-md shadow-2xl border-b border-purple-500/30">
    <div className="container mx-auto px-6 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-purple-500/20 rounded-xl backdrop-blur-md border border-purple-400/30">
            <TrendingUp className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Fort Preservation System
            </h1>
            <p className="text-purple-300">AI-powered structural monitoring & change detection</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onUpload}
            className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-semibold shadow-lg flex items-center gap-2"
          >
            <Upload className="w-5 h-5" />
            Upload Image
          </button>
          <button 
            onClick={onRefresh}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 font-semibold shadow-lg flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
          {onReturn && (
            <button 
              onClick={onReturn}
              className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 font-semibold shadow-lg"
            >
              Return
            </button>
          )}
        </div>
      </div>
    </div>
  </header>
);

const MetricsGrid = ({ metrics }) => {
  const metricsData = [
    { label: "Prediction Accuracy", value: `${metrics.predictionAccuracy}%`, trend: "+2.3%", icon: TrendingUp, color: "from-green-400 to-emerald-400" },
    { label: "Data Correlation", value: `${metrics.dataCorrelation}%`, trend: "+5.1%", icon: Activity, color: "from-blue-400 to-cyan-400" },
    { label: "Risk Mitigation", value: `${metrics.riskMitigation}%`, trend: "+1.8%", icon: Shield, color: "from-purple-400 to-pink-400" },
    { label: "System Learning", value: `${metrics.systemLearning}%`, trend: "+0.9%", icon: Zap, color: "from-yellow-400 to-orange-400" }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
      {metricsData.map((metric, index) => (
        <div key={index} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-purple-400/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <metric.icon className={`w-8 h-8 bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`} />
            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white">{metric.value}</span>
                <span className="text-green-400 text-sm font-bold">{metric.trend}</span>
              </div>
              <p className="text-gray-400 text-sm">{metric.label}</p>
            </div>
          </div>
          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className={`h-1 bg-gradient-to-r ${metric.color} rounded-full transition-all`} 
              style={{width: metric.value}}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

const FortsGrid = ({ fortsData, onViewDetails }) => {
  if (fortsData.length === 0) {
    return (
      <div className="col-span-full text-center py-12 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
        <Shield className="w-16 h-16 text-purple-400/50 mx-auto mb-4" />
        <p className="text-purple-300 text-lg">No fort data available</p>
        <p className="text-purple-400 text-sm mt-2">Add forts and upload images to start monitoring</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {fortsData.map((fort) => (
        <FortCard key={fort.id} fort={fort} onViewDetails={onViewDetails} />
      ))}
    </div>
  );
};

const FortCard = ({ fort, onViewDetails }) => (
  <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-purple-400/50 transition-all">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-xl font-bold text-white">{fort.name}</h3>
        <p className="text-purple-300 text-sm">{fort.location}</p>
        {fort.analysisDate && (
          <p className="text-purple-400 text-xs mt-1">
            Last analyzed: {new Date(fort.analysisDate).toLocaleDateString()}
          </p>
        )}
      </div>
      <div className={`w-12 h-12 bg-gradient-to-br ${
        fort.riskLevel === 'SAFE' || fort.riskLevel === 'LOW' ? 'from-green-400 to-emerald-500' : 
        fort.riskLevel === 'MEDIUM' ? 'from-yellow-400 to-orange-500' : 
        'from-red-400 to-pink-500'
      } rounded-full flex items-center justify-center shadow-lg`}>
        <Shield className="w-6 h-6 text-white" />
      </div>
    </div>

    <div className="grid grid-cols-3 gap-3 mb-4">
      <div className="bg-black/30 rounded-lg p-3 text-center">
        <div className="text-lg font-bold text-cyan-400">{fort.changesDetected}</div>
        <div className="text-xs text-cyan-300">Changes</div>
      </div>
      <div className="bg-black/30 rounded-lg p-3 text-center">
        <div className="text-lg font-bold text-orange-400">{fort.riskScore}/10</div>
        <div className="text-xs text-orange-300">Risk</div>
      </div>
      <div className="bg-black/30 rounded-lg p-3 text-center">
        <div className="text-lg font-bold text-blue-400">{fort.structuralHealth}%</div>
        <div className="text-xs text-blue-300">SSIM</div>
      </div>
    </div>

    <div className="space-y-3">
      <div className={`px-4 py-2 rounded-lg text-center font-bold ${
        fort.riskLevel === 'SAFE' ? 'bg-green-500/30 text-green-300' :
        fort.riskLevel === 'LOW' ? 'bg-blue-500/30 text-blue-300' :
        fort.riskLevel === 'MEDIUM' ? 'bg-yellow-500/30 text-yellow-300' :
        fort.riskLevel === 'HIGH' ? 'bg-orange-500/30 text-orange-300' :
        'bg-red-500/30 text-red-300'
      }`}>
        {fort.riskLevel}
      </div>

      <div className="text-sm text-purple-300">
        <div className="flex items-center justify-between mb-1">
          <span>AI Confidence:</span>
          <span className="font-bold text-cyan-400">{fort.aiConfidence}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Total Area:</span>
          <span className="font-bold text-purple-400">{fort.totalArea.toLocaleString()} px</span>
        </div>
      </div>

      <p className="text-xs text-gray-400 italic">{fort.prediction}</p>

      <button
        onClick={() => onViewDetails(fort)}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 rounded-lg transition-all font-semibold flex items-center justify-center gap-2"
      >
        <Eye className="w-4 h-4" />
        View Analysis
      </button>
    </div>
  </div>
);

const UploadModal = ({ fortsData, selectedFort, setSelectedFort, selectedFile, preview, uploading, uploadResult, onClose, onFileSelect, onUpload }) => (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto">
    <div className="min-h-screen flex items-center justify-center p-4 py-8">
      <div className="bg-gradient-to-br from-purple-900/95 to-indigo-900/95 rounded-2xl p-8 max-w-2xl w-full border border-purple-500/30">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-3">
          <Camera className="w-8 h-8 text-purple-400" />
          Upload Image for Analysis
        </h2>
        <button onClick={onClose} className="text-white hover:text-red-400 text-2xl">&times;</button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-purple-300 text-sm font-semibold mb-2 block">Select Fort</label>
          <select
            value={selectedFort}
            onChange={(e) => setSelectedFort(e.target.value)}
            className="w-full bg-black/40 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-400"
          >
            <option value="">Choose a fort...</option>
            {fortsData.map(fort => (
              <option key={fort.id} value={fort.id}>
                {fort.name} - {fort.hasLatestImage ? 'Ready for comparison' : 'First image needed'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-purple-300 text-sm font-semibold mb-2 block">Upload Image</label>
          <input type="file" accept="image/*" onChange={onFileSelect} className="hidden" id="file-upload" />
          <label htmlFor="file-upload" className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-lg cursor-pointer transition-all">
            <Upload className="w-5 h-5" />
            Choose Image
          </label>
        </div>

        {preview && (
          <div>
            <p className="text-purple-300 text-sm font-semibold mb-2">Preview:</p>
            <img src={preview} alt="Preview" className="w-full h-64 object-cover rounded-lg border-2 border-purple-500/30" />
          </div>
        )}

        <button
          onClick={onUpload}
          disabled={!selectedFort || !selectedFile || uploading}
          className={`w-full py-4 rounded-lg font-semibold text-white transition-all ${
            uploading ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
          }`}
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Analyzing...
            </span>
          ) : (
            'Upload & Analyze'
          )}
        </button>

        {uploadResult?.error && (
          <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4">
            <AlertCircle className="w-6 h-6 text-red-400 mb-2" />
            <p className="text-red-200 text-sm">{uploadResult.error}</p>
          </div>
        )}

        {uploadResult?.is_first_upload && (
          <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
            <CheckCircle className="w-6 h-6 text-blue-400 mb-2" />
            <p className="text-blue-200 text-sm">First image uploaded! Upload another to start detecting changes.</p>
          </div>
        )}

        {uploadResult?.analysis && (
          <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4">
            <CheckCircle className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-green-200 font-semibold">Analysis Complete!</p>
            <p className="text-green-200 text-sm mt-1">
              Risk: {uploadResult.analysis.risk_level} | Changes: {uploadResult.analysis.changes_detected}
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
  </div>
);

const FortDetailModal = ({ fort, onClose }) => (
  <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-y-auto">
    <div className="min-h-screen flex items-center justify-center p-4 py-8">
      <div className="bg-gradient-to-br from-purple-900/95 to-indigo-900/95 rounded-2xl p-8 max-w-6xl w-full border border-purple-500/30 my-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">{fort.name}</h2>
        <button onClick={onClose} className="text-white hover:text-red-400">
          <X className="w-8 h-8" />
        </button>
      </div>

      {fort.detailedAnalysis ? (
        <div className="space-y-6">
          {/* Annotated Image */}
          <div className="bg-black/40 rounded-xl p-4">
            <h3 className="text-xl font-bold text-purple-300 mb-4 flex items-center gap-2">
              <Image className="w-6 h-6" />
              Structural Analysis Visualization
            </h3>
            <img 
              src={fort.detailedAnalysis.annotated_image_url} 
              alt="Annotated Analysis"
              className="w-full rounded-lg border-2 border-purple-500/30"
            />
            <p className="text-purple-300 text-sm mt-2">
              Red boxes indicate detected structural changes. Analysis performed on {new Date(fort.analysisDate).toLocaleString()}
            </p>
          </div>

          {/* Comparison Images */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/40 rounded-xl p-4">
              <h4 className="text-lg font-bold text-purple-300 mb-2">Previous Image</h4>
              <img 
                src={fort.detailedAnalysis.previous_image_url} 
                alt="Previous"
                className="w-full rounded-lg border border-purple-500/30"
              />
            </div>
            <div className="bg-black/40 rounded-xl p-4">
              <h4 className="text-lg font-bold text-purple-300 mb-2">Current Image</h4>
              <img 
                src={fort.detailedAnalysis.current_image_url} 
                alt="Current"
                className="w-full rounded-lg border border-purple-500/30"
              />
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-xl p-4 border border-red-400/30">
              <div className="text-3xl font-bold text-red-300">{fort.changesDetected}</div>
              <div className="text-red-200 text-sm">Changes Detected</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-xl p-4 border border-orange-400/30">
              <div className="text-3xl font-bold text-orange-300">{fort.riskScore}/10</div>
              <div className="text-orange-200 text-sm">Risk Score</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-400/30">
              <div className="text-3xl font-bold text-blue-300">{fort.structuralHealth}%</div>
              <div className="text-blue-200 text-sm">SSIM Score</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-400/30">
              <div className="text-3xl font-bold text-purple-300">{fort.totalArea.toLocaleString()}</div>
              <div className="text-purple-200 text-sm">Area Affected (px)</div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className={`rounded-xl p-6 border-2 ${
            fort.riskLevel === 'HIGH' || fort.riskLevel === 'CRITICAL' 
              ? 'bg-red-500/20 border-red-400/50' 
              : fort.riskLevel === 'MEDIUM'
              ? 'bg-yellow-500/20 border-yellow-400/50'
              : 'bg-green-500/20 border-green-400/50'
          }`}>
            <h3 className="text-2xl font-bold mb-2">Risk Assessment: {fort.riskLevel}</h3>
            <p className="text-lg mb-4">{fort.prediction}</p>
            
            {fort.detailedAnalysis.risk_assessment?.factors && (
              <div className="mb-4">
                <h4 className="font-bold mb-2">Risk Factors:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {fort.detailedAnalysis.risk_assessment.factors.map((factor, i) => (
                    <li key={i}>{factor}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Recommendations */}
          {fort.recommendations.length > 0 && (
            <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-6">
              <h3 className="text-xl font-bold text-blue-300 mb-4">Recommendations</h3>
              <ul className="space-y-2">
                {fort.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Detection Details */}
          {fort.detailedAnalysis.analysis_results?.detections && (
            <div className="bg-black/40 rounded-xl p-6">
              <h3 className="text-xl font-bold text-purple-300 mb-4 flex items-center gap-2">
                <MapPin className="w-6 h-6" />
                Detected Changes ({fort.detailedAnalysis.analysis_results.detections.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fort.detailedAnalysis.analysis_results.detections.map((detection, i) => (
                  <div key={i} className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/30">
                    <div className="font-bold text-purple-300 mb-2">Change #{i + 1}</div>
                    <div className="text-sm space-y-1">
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
      ) : (
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-purple-400/50 mx-auto mb-4" />
          <p className="text-purple-300 text-lg">No analysis available yet</p>
          <p className="text-purple-400 text-sm mt-2">Upload images to generate structural analysis</p>
        </div>
      )}
    </div>
  </div>
  </div>
);
export default Stage2Dashboard;