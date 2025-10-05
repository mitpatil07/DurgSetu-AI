import React, { useState, useEffect } from 'react';
import { Crown, Calendar, Activity, Shield, TrendingUp, Eye, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

        // Replace with your actual OpenWeatherMap API key from https://openweathermap.org/api
        const API_KEY = 'c48e71bd51105312e7a19c1b04ceb77e';
        
        // Set to false to use REAL data
        const USE_MOCK_DATA = false;

        let weatherData;

        if (USE_MOCK_DATA) {
          throw new Error('Mock data disabled. Please add your OpenWeatherMap API key to get real-time data.');
        } else {
          // Fetch REAL weather data from OpenWeatherMap API
          const weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
          );
          
          if (!weatherResponse.ok) {
            throw new Error('Weather data fetch failed. Please check your API key.');
          }

          weatherData = await weatherResponse.json();
        }

        // Calculate risk level based on REAL weather conditions
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

        // Real-time data from OpenWeatherMap API only
        const fortDataObject = {
          name: "Shivneri Fort",
          location: "Junnar, Pune",
          coordinates: { lat, lng: lon },
          temperature: Math.round(weatherData.main.temp),
          humidity: weatherData.main.humidity,
          windSpeed: Math.round(weatherData.wind.speed * 3.6), // Convert m/s to km/h
          visibility: Math.round(weatherData.visibility / 1000),
          condition: weatherData.weather[0].main,
          conditionDescription: weatherData.weather[0].description,
          lastUpdated: new Date().toISOString(),
          sunrise: new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString(),
          sunset: new Date(weatherData.sys.sunset * 1000).toLocaleTimeString(),
          pressure: weatherData.main.pressure,
          feelsLike: Math.round(weatherData.main.feels_like),
          tempMin: Math.round(weatherData.main.temp_min),
          tempMax: Math.round(weatherData.main.temp_max),
          cloudCoverage: weatherData.clouds.all
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

// Main Dashboard Component
const RealtimeFortDashboard = () => {
  const { fortData, loading, error } = useFortData();
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getRiskColor = (level) => {
    switch (level) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

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
          <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">Setup Required</h2>
          <p className="text-gray-600 text-center mb-4">{error}</p>
          <div className="bg-orange-50 p-4 rounded-xl">
            <p className="text-sm font-semibold mb-2">To get REAL-TIME data:</p>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Get free API key: <a href="https://openweathermap.org/api" target="_blank" className="text-orange-600 hover:underline">openweathermap.org</a></li>
              <li>Replace 'YOUR_API_KEY_HERE' in code</li>
              <li>Save and refresh</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-red-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-600 to-orange-800 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-full backdrop-blur-md">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  DurgSetu AI
                </h1>
                <p className="text-orange-200 text-xs md:text-sm">
                  Real-time Fort Monitoring System
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-white">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Live</span>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur-md border border-white/20">
                <div className="text-lg font-bold text-white">
                  {currentTime.toLocaleTimeString('en-IN', { hour12: true })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Stats Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700 font-medium">System Active</span>
              </div>
              <div className="text-sm text-gray-600">
                Auto-refresh: 5 min
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              {currentTime.toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Fort Header Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-1">{fortData.name}</h2>
                <p className="text-gray-600 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  {fortData.location}
                </p>
              </div>
            </div>
          </div>

          {/* Weather Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-orange-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-600">Temperature</p>
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Activity className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-orange-600 mb-1">{fortData.temperature}°C</p>
              <p className="text-xs text-gray-500">Feels like {fortData.feelsLike}°C</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-600">Humidity</p>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-blue-600 mb-1">{fortData.humidity}%</p>
              <p className="text-xs text-gray-500">Current level</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-green-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-600">Wind Speed</p>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Activity className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-green-600 mb-1">{fortData.windSpeed}</p>
              <p className="text-xs text-gray-500">km/h</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-purple-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-600">Visibility</p>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Eye className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-purple-600 mb-1">{fortData.visibility}</p>
              <p className="text-xs text-gray-500">km range</p>
            </div>
          </div>

          {/* Real-Time Environmental Data */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-600" />
              Real-Time Environmental Data
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Weather Condition</span>
                <span className="font-semibold text-gray-800 capitalize">{fortData.conditionDescription}</span>
              </div>
              <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Atmospheric Pressure</span>
                <span className="font-semibold text-gray-800">{fortData.pressure} hPa</span>
              </div>
              <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Cloud Coverage</span>
                <span className="font-semibold text-gray-800">{fortData.cloudCoverage}%</span>
              </div>
              <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Sunrise Time</span>
                <span className="font-semibold text-gray-800">{fortData.sunrise}</span>
              </div>
              <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Sunset Time</span>
                <span className="font-semibold text-gray-800">{fortData.sunset}</span>
              </div>
              <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Temp Range</span>
                <span className="font-semibold text-gray-800">{fortData.tempMin}°C - {fortData.tempMax}°C</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button 
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="text-xl font-bold mb-1">Live Monitoring</div>
                  <div className="text-sm text-orange-200">Real-time surveillance & alerts</div>
                </div>
                <Shield className="w-12 h-12 opacity-80" />
              </div>
              <div className="mt-3 text-xs text-orange-200 font-semibold">STAGE 1 - coming Soon</div>
            </button>

            <button 
              onClick={() => navigate('/stage2')}
              className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="text-xl font-bold mb-1">AI Analytics</div>
                  <div className="text-sm text-purple-200">Predictive insights & trends</div>
                </div>
                <TrendingUp className="w-12 h-12 opacity-80" />
              </div>
              <div className="mt-3 text-xs text-purple-200 font-semibold">STAGE 2 - CLICK TO VIEW</div>
            </button>
          </div>


        </div>
      </div>
    </div>
  );
};

export default RealtimeFortDashboard;