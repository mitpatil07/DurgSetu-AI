// import React from 'react';
// import { Activity, Shield, AlertTriangle, Zap, Satellite } from 'lucide-react';
// import { fortsData } from './Sample_data';

// const Stage1Dashboard = ({ setActiveStage }) => {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white relative overflow-hidden">
//       {/* Animated grid background */}
//       <div className="absolute inset-0 opacity-20">
//         <div className="absolute inset-0" style={{
//           backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
//           backgroundSize: '20px 20px'
//         }}></div>
//       </div>

//       <header className="relative bg-gradient-to-r from-blue-900/90 to-indigo-900/90 backdrop-blur-md shadow-2xl">
//         <div className="container mx-auto px-6 py-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               <div className="p-3 bg-blue-500/20 rounded-xl backdrop-blur-md">
//                 <Activity className="w-8 h-8 text-blue-400" />
//               </div>
//               <div>
//                 <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
//                   Stage 1 - Neural Monitoring
//                 </h1>
//                 <p className="text-blue-300">Real-time AI surveillance across Maratha strongholds</p>
//               </div>
//             </div>
//             <button 
//               onClick={() => setActiveStage('main')}
//               className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-orange-500/50"
//             >
//               ← Return to Command Center
//             </button>
//           </div>
//         </div>
//       </header>

//       <div className="container mx-auto px-6 py-8">
//         {/* Holographic metrics */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
//           {[
//             { label: "Active Forts", value: "12", icon: Shield, color: "from-green-400 to-emerald-500", glow: "shadow-green-500/50" },
//             { label: "Neural Networks", value: "47", icon: Activity, color: "from-blue-400 to-cyan-500", glow: "shadow-blue-500/50" },
//             { label: "Threat Level", value: "LOW", icon: AlertTriangle, color: "from-yellow-400 to-orange-500", glow: "shadow-yellow-500/50" },
//             { label: "Processing Power", value: "2.4THz", icon: Zap, color: "from-purple-400 to-pink-500", glow: "shadow-purple-500/50" }
//           ].map((metric, index) => (
//             <div key={index} className={`relative p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md border border-white/20 hover:border-white/40 transition-all duration-500 hover:-translate-y-2 ${metric.glow} hover:shadow-2xl`}>
//               <div className="flex items-center justify-between mb-4">
//                 <metric.icon className={`w-8 h-8 bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`} />
//                 <div className="text-right">
//                   <p className="text-3xl font-bold text-white">{metric.value}</p>
//                   <p className="text-gray-400 text-sm">{metric.label}</p>
//                 </div>
//               </div>
//               <div className={`absolute inset-0 bg-gradient-to-r ${metric.color} opacity-0 hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>
//             </div>
//           ))}
//         </div>

//         {/* Interactive monitoring grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           <div className="lg:col-span-2 bg-gradient-to-br from-white/5 to-white/10 rounded-2xl backdrop-blur-md border border-white/20 p-8">
//             <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
//               <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
//               Live Threat Assessment Matrix
//             </h2>
//             <div className="space-y-6">
//               {fortsData.map((fort, index) => (
//                 <div key={index} className="relative p-6 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 hover:border-orange-500/50 transition-all duration-300">
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="flex items-center gap-4">
//                       <div className={`w-4 h-4 rounded-full ${
//                         fort.riskLevel === 'Low' ? 'bg-green-400 shadow-lg shadow-green-400/50' : 
//                         fort.riskLevel === 'Medium' ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50 animate-pulse' : 
//                         'bg-red-400 shadow-lg shadow-red-400/50 animate-pulse'
//                       }`}></div>
//                       <h3 className="text-xl font-bold text-white">{fort.name}</h3>
//                     </div>
//                     <div className="flex items-center gap-4">
//                       <span className="text-2xl font-bold text-orange-400">{fort.temperature}°C</span>
//                       <div className="text-right">
//                         <p className="text-sm text-gray-400">AI Confidence</p>
//                         <p className="font-bold text-purple-400">{fort.aiConfidence}%</p>
//                       </div>
//                     </div>
//                   </div>
                  
//                   {/* Mini trend visualization */}
//                   <div className="flex items-center gap-2 mb-4">
//                     <span className="text-sm text-gray-400">Risk Trend:</span>
//                     <div className="flex gap-1">
//                       {fort.historicalRisk.map((risk, i) => (
//                         <div key={i} className={`w-2 h-8 rounded ${
//                           risk === 1 ? 'bg-green-400' : risk === 2 ? 'bg-yellow-400' : risk === 3 ? 'bg-orange-400' : 'bg-red-400'
//                         }`} style={{ height: `${risk * 8 + 8}px` }}></div>
//                       ))}
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-3 gap-4 text-sm">
//                     <div className="text-center p-2 bg-black/30 rounded">
//                       <p className="text-gray-400">Structural</p>
//                       <p className="font-bold text-green-400">{fort.structuralHealth}%</p>
//                     </div>
//                     <div className="text-center p-2 bg-black/30 rounded">
//                       <p className="text-gray-400">Visitors</p>
//                       <p className="font-bold text-blue-400">{fort.visitorCount}</p>
//                     </div>
//                     <div className="text-center p-2 bg-black/30 rounded">
//                       <p className="text-gray-400">Security</p>
//                       <p className={`font-bold ${fort.securityLevel === 'normal' ? 'text-green-400' : 'text-yellow-400'}`}>
//                         {fort.securityLevel.toUpperCase()}
//                       </p>
//                     </div>
//                   </div>
                  
//                   <div className="absolute top-4 right-4">
//                     <div className={`w-2 h-2 rounded-full animate-ping ${
//                       fort.sensorStatus === 'active' ? 'bg-green-400' : fort.sensorStatus === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
//                     }`}></div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Side panel with advanced controls */}
//           <div className="space-y-6">
//             {/* AI Brain Status */}
//             <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl backdrop-blur-md border border-purple-500/30 p-6">
//               <h3 className="text-xl font-bold text-purple-200 mb-4 flex items-center gap-2">
//                 <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
//                 AI Neural Core
//               </h3>
//               <div className="space-y-4">
//                 <div className="flex justify-between">
//                   <span className="text-purple-300">Processing Power</span>
//                   <span className="text-white font-bold">94.7%</span>
//                 </div>
//                 <div className="w-full bg-purple-900/30 rounded-full h-2">
//                   <div className="h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse" style={{width: '94.7%'}}></div>
//                 </div>
//                 <div className="flex justify-between text-sm">
//                   <span className="text-purple-300">Learning Rate</span>
//                   <span className="text-pink-400 font-bold">0.003</span>
//                 </div>
//                 <div className="flex justify-between text-sm">
//                   <span className="text-purple-300">Model Accuracy</span>
//                   <span className="text-green-400 font-bold">98.2%</span>
//                 </div>
//               </div>
//             </div>

//             {/* Weather Radar */}
//             <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 rounded-2xl backdrop-blur-md border border-blue-500/30 p-6">
//               <h3 className="text-xl font-bold text-blue-200 mb-4 flex items-center gap-2">
//                 <Satellite className="w-5 h-5 text-cyan-400" />
//                 Weather Radar
//               </h3>
//               <div className="relative w-full h-32 bg-gradient-to-br from-blue-950 to-black rounded-lg overflow-hidden">
//                 {/* Radar sweep effect */}
//                 <div className="absolute inset-0 flex items-center justify-center">
//                   <div className="w-24 h-24 border-2 border-cyan-400/30 rounded-full"></div>
//                   <div className="absolute w-16 h-16 border-2 border-cyan-400/50 rounded-full"></div>
//                   <div className="absolute w-8 h-8 border-2 border-cyan-400/70 rounded-full"></div>
//                   <div className="absolute w-0.5 h-12 bg-cyan-400 origin-bottom animate-spin" style={{animationDuration: '3s'}}></div>
//                 </div>
//                 {/* Weather markers */}
//                 {[...Array(5)].map((_, i) => (
//                   <div key={i} 
//                     className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
//                     style={{
//                       left: `${20 + (i * 15)}%`,
//                       top: `${30 + (i * 10)}%`,
//                       animationDelay: `${i * 0.5}s`
//                     }}
//                   ></div>
//                 ))}
//               </div>
//               <div className="mt-4 text-sm text-blue-300">
//                 <p>Cloud Coverage: 34%</p>
//                 <p>Storm Probability: 12%</p>
//               </div>
//             </div>

//             {/* Emergency Protocols */}
//             <div className="bg-gradient-to-br from-red-900/50 to-orange-900/50 rounded-2xl backdrop-blur-md border border-red-500/30 p-6">
//               <h3 className="text-xl font-bold text-red-200 mb-4 flex items-center gap-2">
//                 <AlertTriangle className="w-5 h-5 text-orange-400" />
//                 Emergency Systems
//               </h3>
//               <div className="space-y-3">
//                 <button className="w-full bg-red-600/80 hover:bg-red-500/80 text-white py-2 rounded-lg transition-colors font-semibold">
//                   Alert All Stations
//                 </button>
//                 <button className="w-full bg-orange-600/80 hover:bg-orange-500/80 text-white py-2 rounded-lg transition-colors font-semibold">
//                   Weather Warning
//                 </button>
//                 <button className="w-full bg-yellow-600/80 hover:bg-yellow-500/80 text-white py-2 rounded-lg transition-colors font-semibold">
//                   Maintenance Mode
//                 </button>
//               </div>
//               <div className="mt-4 p-3 bg-black/30 rounded-lg">
//                 <p className="text-xs text-gray-400 mb-1">Last Emergency Drill:</p>
//                 <p className="text-sm text-white">15 days ago - Success</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Stage1Dashboard;

import React from "react";
import { Construction } from "lucide-react";
import { useNavigate } from "react-router-dom"; // ✅ React Router hook

function Stage_1Dash_Component() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md">
        <Construction className="w-16 h-16 text-yellow-500 mx-auto animate-bounce" />

        <h1 className="text-3xl font-bold text-gray-800 mt-4">
          Under Working 🚧
        </h1>
        <p className="text-gray-600 mt-2">
          This page is currently under development. Please check back soon!
        </p>

        <div className="mt-6">
          <button
            onClick={() => navigate(-1)} // ✅ Go back one step
            className="px-5 py-2 rounded-xl bg-yellow-500 text-white font-semibold shadow-md hover:bg-yellow-600 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default Stage_1Dash_Component;
