import React, { useState, useEffect } from 'react';
import { Crown, Calendar, Activity, Shield, TrendingUp, Eye, AlertCircle } from 'lucide-react';

// Custom hook for fetching real-time fort data
const useFortData = () => {
  const [fortData, setFortData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFortData = async () => {
      try {
        // Shivneri Fort coordinates
        const lat = 19.2183;
        const lon = 73.8478;

        // Replace 'YOUR_API_KEY' with your actual OpenWeatherMap API key
        const API_KEY = 'c48e71bd51105312e7a19c1b04ceb77e';
        
        // For testing without API key, set USE_MOCK_DATA to true
        const USE_MOCK_DATA = true;

        let weatherData;

        if (USE_MOCK_DATA || API_KEY === 'c48e71bd51105312e7a19c1b04ceb77e') {
          // Mock data for testing
          weatherData = {
            main: {
              temp: 26 + Math.random() * 4,
              feels_like: 28 + Math.random() * 3,
              humidity: 65 + Math.floor(Math.random() * 10),
              pressure: 1010 + Math.floor(Math.random() * 10)
            },
            wind: {
              speed: 2 + Math.random() * 3
            },
            visibility: 9000 + Math.floor(Math.random() * 1000),
            weather: [
              {
                main: ['Clear', 'Clouds', 'Haze'][Math.floor(Math.random() * 3)],
                description: 'partly cloudy'
              }
            ],
            sys: {
              sunrise: Math.floor(Date.now() / 1000) - 3600 * 8,
              sunset: Math.floor(Date.now() / 1000) + 3600 * 4
            }
          };
        } else {
          // Fetch real weather data from OpenWeatherMap API
          const weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
          );
          
          if (!weatherResponse.ok) {
            throw new Error('Weather data fetch failed');
          }

          weatherData = await weatherResponse.json();
        }

        // Calculate risk level based on weather conditions
        const calculateRiskLevel = (weather) => {
          const temp = weather.main.temp;
          const humidity = weather.main.humidity;
          const windSpeed = weather.wind.speed;
          const visibility = weather.visibility / 1000; // Convert to km

          if (temp > 40 || humidity > 85 || windSpeed > 15 || visibility < 2) {
            return { level: 'High', confidence: 75 };
          } else if (temp > 35 || humidity > 75 || windSpeed > 10 || visibility < 5) {
            return { level: 'Medium', confidence: 85 };
          }
          return { level: 'Low', confidence: 98 };
        };

        const risk = calculateRiskLevel(weatherData);

        // Generate simulated sensor data (replace with real API when available)
        const fortDataObject = {
          id: 1,
          name: "Shivneri Fort",
          location: "Junnar, Pune",
          coordinates: { lat, lng: lon },
          temperature: Math.round(weatherData.main.temp),
          humidity: weatherData.main.humidity,
          windSpeed: Math.round(weatherData.wind.speed * 3.6), // Convert m/s to km/h
          visibility: Math.round(weatherData.visibility / 1000),
          condition: weatherData.weather[0].main,
          conditionDescription: weatherData.weather[0].description,
          riskLevel: risk.level,
          prediction: risk.level === 'Low' 
            ? "Optimal monitoring conditions" 
            : risk.level === 'Medium'
            ? "Moderate weather conditions detected"
            : "Adverse weather conditions - Enhanced monitoring advised",
          aiConfidence: risk.confidence,
          sensorStatus: "active",
          batteryLevel: Math.floor(Math.random() * 15) + 85, // 85-100%
          signalStrength: Math.floor(Math.random() * 2) + 4, // 4-5 bars
          lastUpdated: new Date().toISOString(),
          historicalRisk: [1, 1, 2, 1, 1],
          weatherTrend: weatherData.main.temp > 30 ? "warming" : "stable",
          cameraStatus: "online",
          structuralHealth: 98,
          visitorCount: Math.floor(Math.random() * 100) + 100,
          securityLevel: risk.level === 'Low' ? "normal" : "elevated",
          maintenance: "good",
          sunrise: new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString(),
          sunset: new Date(weatherData.sys.sunset * 1000).toLocaleTimeString(),
          pressure: weatherData.main.pressure,
          feelsLike: Math.round(weatherData.main.feels_like)
        };

        setFortData(fortDataObject);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching fort data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchFortData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchFortData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return { fortData, loading, error };
};

// Fort Card Component
const FortCard = ({ fort }) => {
  if (!fort) return null;

  const getRiskColor = (level) => {
    switch (level) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-orange-200 hover:shadow-2xl transition-all duration-300 max-w-2xl mx-auto">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">{fort.name}</h3>
          <p className="text-gray-600">{fort.location}</p>
        </div>
        <div className={`px-4 py-2 rounded-full font-bold ${getRiskColor(fort.riskLevel)}`}>
          {fort.riskLevel} Risk
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-orange-50 p-4 rounded-xl">
          <p className="text-sm text-gray-600 mb-1">Temperature</p>
          <p className="text-2xl font-bold text-orange-600">{fort.temperature}°C</p>
          <p className="text-xs text-gray-500">Feels like {fort.feelsLike}°C</p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-xl">
          <p className="text-sm text-gray-600 mb-1">Humidity</p>
          <p className="text-2xl font-bold text-blue-600">{fort.humidity}%</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-xl">
          <p className="text-sm text-gray-600 mb-1">Wind Speed</p>
          <p className="text-2xl font-bold text-green-600">{fort.windSpeed} km/h</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-xl">
          <p className="text-sm text-gray-600 mb-1">Visibility</p>
          <p className="text-2xl font-bold text-purple-600">{fort.visibility} km</p>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Condition:</span>
          <span className="font-semibold text-gray-800">{fort.condition}</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">AI Confidence:</span>
          <span className="font-semibold text-gray-800">{fort.aiConfidence}%</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Battery Level:</span>
          <span className="font-semibold text-gray-800">{fort.batteryLevel}%</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Visitors Today:</span>
          <span className="font-semibold text-gray-800">{fort.visitorCount}</span>
        </div>
      </div>

      <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
        <p className="text-sm font-medium text-gray-700 mb-1">AI Prediction:</p>
        <p className="text-sm text-gray-600">{fort.prediction}</p>
      </div>

      <div className="mt-3 text-xs text-gray-500 flex items-center justify-between">
        <span>Last updated: {new Date(fort.lastUpdated).toLocaleTimeString()}</span>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Live</span>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const RealtimeFortDashboard = () => {
  const { fortData, loading, error } = useFortData();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading real-time data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">Error Loading Data</h2>
          <p className="text-gray-600 text-center mb-4">{error}</p>
          <p className="text-sm text-gray-500 text-center">
            Note: You need to replace 'YOUR_API_KEY' with a valid OpenWeatherMap API key.
            Get one free at: <a href="https://openweathermap.org/api" target="_blank" className="text-orange-600 hover:underline">openweathermap.org</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-red-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-600 to-orange-800 shadow-2xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-full backdrop-blur-md">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  DurgSetu AI
                </h1>
                <p className="text-orange-200 text-sm md:text-base">
                  Real-time Fort Monitoring System
                </p>
              </div>
            </div>

            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/20">
              <div className="text-2xl font-bold text-white mb-1">
                {currentTime.toLocaleTimeString('en-IN', { hour12: true })}
              </div>
              <div className="text-orange-200 flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4" />
                {currentTime.toLocaleDateString('en-IN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-white/80 backdrop-blur-md border-b border-white/30 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">System Active</span>
            </div>
            <div className="text-sm text-gray-600">
              Auto-refresh: Every 5 minutes
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <FortCard fort={fortData} />

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row justify-center gap-4 mt-8 max-w-2xl mx-auto">
          <button className="flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
            <Shield className="w-6 h-6" />
            <div className="text-left">
              <div>Live Monitoring</div>
              <div className="text-xs font-normal text-orange-200">Stage 1</div>
            </div>
          </button>

          <button className="flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
            <TrendingUp className="w-6 h-6" />
            <div className="text-left">
              <div>AI Analytics</div>
              <div className="text-xs font-normal text-purple-200">Stage 2</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RealtimeFortDashboard;