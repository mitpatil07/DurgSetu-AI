import React from 'react';
import { 
  MapPin, 
  Shield, 
  Droplets, 
  Wind, 
  Battery, 
  Signal, 
  Camera,
  Thermometer,
  AlertCircle
} from 'lucide-react';

const AdvancedFortCard = ({ fort, onSelect, isSelected }) => (
  <div 
    className={`relative group cursor-pointer transition-all duration-500 transform mx-auto w-full max-w-md ${
      isSelected ? 'ring-4 ring-orange-400 shadow-2xl' : ''
    }`}
    onClick={() => onSelect(fort)}
  >
    {/* Glassmorphism background */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md rounded-2xl"></div>
    
    <div className="relative bg-white/90 rounded-2xl shadow-xl border border-white/20 overflow-hidden">
      {/* Status Badge */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center space-x-2 bg-white/50 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/30">
        <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full animate-pulse ${
          fort.sensorStatus === 'active' ? 'bg-green-400' : 
          fort.sensorStatus === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
        }`}></div>
        <div className="text-xs text-gray-700 font-medium">{fort.lastUpdated}</div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4 sm:mb-6">
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-1">
              {fort.name}
            </h3>
            <p className="text-gray-600 flex items-center gap-1 text-xs sm:text-sm">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="text-left">{fort.location}</span>
            </p>
          </div>
          {/* <div className="relative ml-2">
            <div className="bg-gradient-to-br from-orange-100 to-red-100 p-2 sm:p-3 rounded-full">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-xs font-bold">{fort.id}</span>
            </div>
          </div> */}
        </div>

        {/* Temperature Section */}
        <div className="mb-4 sm:mb-6 bg-gradient-to-br from-orange-50 to-red-50 p-3 sm:p-4 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">Temperature</span>
            </div>
            <span className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              {fort.temperature}°C
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="h-2 bg-gradient-to-r from-blue-400 via-green-400 to-red-500 rounded-full transition-all duration-1000"
              style={{ width: `${(fort.temperature / 50) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Weather Stats Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div className="flex items-center gap-2 p-2 sm:p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <div className="bg-blue-200/50 p-1.5 sm:p-2 rounded-lg">
              <Droplets className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-xs text-blue-600 font-medium">Humidity</p>
              <p className="text-sm sm:text-base font-bold text-blue-800">{fort.humidity}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 sm:p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
            <div className="bg-gray-200/50 p-1.5 sm:p-2 rounded-lg">
              <Wind className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-xs text-gray-600 font-medium">Wind</p>
              <p className="text-sm sm:text-base font-bold text-gray-800">{fort.windSpeed} km/h</p>
            </div>
          </div>
        </div>

        {/* System Status Row */}
        <div className="flex justify-between items-center mb-4 sm:mb-5 p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex items-center gap-1.5">
              <Battery className={`w-3 h-3 sm:w-4 sm:h-4 ${
                fort.batteryLevel > 60 ? 'text-green-600' : 
                fort.batteryLevel > 30 ? 'text-yellow-600' : 'text-red-600'
              }`} />
              <span className={`text-xs font-bold ${
                fort.batteryLevel > 60 ? 'text-green-600' : 
                fort.batteryLevel > 30 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {fort.batteryLevel}%
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Signal className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
              <div className="flex space-x-0.5">
                {[1,2,3,4,5].map(i => (
                  <div 
                    key={i}
                    className={`w-1 h-2 sm:h-3 rounded-sm ${
                      i <= fort.signalStrength ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md">
            <Camera className={`w-4 h-4 sm:w-5 sm:h-5 ${
              fort.cameraStatus === 'online' ? 'text-green-500' : 'text-red-500'
            }`} />
            <span className={`text-xs font-medium ${
              fort.cameraStatus === 'online' ? 'text-green-600' : 'text-red-600'
            }`}>
              {fort.cameraStatus === 'online' ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>

        {/* AI Confidence Section */}
        <div className="mb-4 sm:mb-5 p-2 sm:p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <div className="flex justify-between text-xs sm:text-sm mb-2">
            <span className="text-gray-700 font-medium">AI Confidence Score</span>
            <span className="font-bold text-purple-700">{fort.aiConfidence}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="h-2 bg-gradient-to-r from-purple-400 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 relative"
              style={{ width: `${fort.aiConfidence}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Risk Level Footer */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border-2 border-gray-200">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-lg ${
              fort.riskLevel === 'Low' ? 'bg-green-400 shadow-green-400/50' : 
              fort.riskLevel === 'Medium' ? 'bg-yellow-400 shadow-yellow-400/50' : 'bg-red-400 shadow-red-400/50'
            }`}></div>
            <AlertCircle className="w-4 h-4 text-gray-600" />
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Risk Assessment</span>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-md ${
            fort.riskLevel === 'Low' ? 'bg-green-100 text-green-800 border border-green-300' : 
            fort.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : 
            'bg-red-100 text-red-800 border border-red-300'
          }`}>
            {fort.riskLevel}
          </span>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      {/* <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-600/0 group-hover:from-orange-500/10 group-hover:to-orange-600/20 transition-all duration-300 rounded-2xl pointer-events-none"></div> */}
      
      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute inset-0 border-4 border-orange-400 rounded-2xl pointer-events-none animate-pulse"></div>
      )}
    </div>
  </div>
);

export default AdvancedFortCard;