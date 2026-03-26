import React, { useState, useEffect } from 'react';
import { Crown, Calendar, Activity, Shield, TrendingUp, Eye, AlertCircle, LogIn, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Custom hook for fetching real-time fort data
const useFortData = () => {
  const [fortData, setFortData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFortData = async () => {
      try {
        // Default to Shivneri Fort if no location found
        let lat = 19.2183;
        let lon = 73.8478;
        let locationName = "Shivneri Fort";

        // Attempt to get user's location
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          lat = position.coords.latitude;
          lon = position.coords.longitude;
          locationName = "Current Location";
        } catch (e) {
          console.log("Using default location");
        }

        // Replace with your actual OpenWeatherMap API key from https://openweathermap.org/api
        const API_KEY = 'c48e71bd51105312e7a19c1b04ceb77e';

        // Fetch REAL weather data from OpenWeatherMap API
        const weatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );

        if (!weatherResponse.ok) {
          throw new Error('Weather data fetch failed. Please check your API key.');
        }

        const weatherData = await weatherResponse.json();

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
          name: locationName === "Current Location" ? "Live Monitoring Site" : locationName,
          location: locationName === "Current Location" ? `${lat.toFixed(4)}, ${lon.toFixed(4)}` : "Junnar, Pune",
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

  const token = localStorage.getItem('auth_token');

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_id');
    navigate('/login');
  };

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
          <p className="text-gray-700 font-medium">Loading data...</p>
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
              <h>Check Your Internet Connection</h>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-red-50">
      {/* Floating Header */}
      <header className="fixed w-full top-0 z-50 px-4 pt-4 pb-2 transition-all">
        <div className="container mx-auto max-w-7xl bg-white/90 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-2xl border border-white/40">
          <div className="px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">

            {/* Logo Area */}
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl shadow-lg shadow-orange-500/30 shrink-0">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">
                  DurgSetu AI
                </h1>
                <p className="text-orange-600 font-semibold text-xs tracking-wide uppercase">
                  Protective Analytics
                </p>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex flex-wrap items-center justify-start md:justify-end gap-3 w-full md:w-auto">

              {/* Live Status indicator */}
              <div className="hidden md:flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 shrink-0">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </div>
                <span className="text-sm font-bold text-slate-700">Live</span>
                <span className="mx-2 text-slate-300">|</span>
                <span className="text-sm font-bold text-slate-600 font-mono">
                  {currentTime.toLocaleTimeString('en-IN', { hour12: true })}
                </span>
              </div>

              {/* Auth Buttons */}
              {token ? (
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                  <button
                    onClick={() => navigate('/profile')}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700 px-4 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 active:scale-95 shadow-sm text-sm font-bold border border-orange-200/50 cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 active:scale-95 shadow-sm text-sm font-bold border border-slate-200 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="inline">Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 active:scale-95 shadow-lg shadow-orange-500/30 text-sm font-bold cursor-pointer mt-2 md:mt-0"
                >
                  <LogIn className="w-4 h-4" />
                  Admin Login
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content (added pt-28 to account for floating header) */}
      <div className="container mx-auto px-4 pt-32 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Fort Title / Location Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 mb-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-100/50 to-orange-50/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-transform group-hover:scale-110 duration-700"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-orange-100 text-orange-700 text-[10px] md:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  Active Monitoring
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight mb-2">{fortData.name}</h2>
              <p className="text-slate-500 font-medium flex items-center gap-2 text-base md:text-lg">
                <Activity className="w-5 h-5 text-orange-400" />
                {fortData.location}
              </p>
            </div>
          </div>

          {/* Environmental Metrics (Unified Orange Theme) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-orange-200 transition-all hover:-translate-y-1 hover:shadow-md group">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider">Temperature</p>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-50 rounded-xl flex items-center justify-center transition-colors group-hover:bg-orange-100">
                  <Activity className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
                </div>
              </div>
              <p className="text-3xl md:text-4xl font-bold text-slate-800 mb-1">{fortData.temperature}°C</p>
              <p className="text-xs md:text-sm font-medium text-slate-400">Feels like <span className="text-slate-600">{fortData.feelsLike}°C</span></p>
            </div>

            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-orange-200 transition-all hover:-translate-y-1 hover:shadow-md group">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider">Humidity</p>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-50 rounded-xl flex items-center justify-center transition-colors group-hover:bg-orange-100">
                  <Activity className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
                </div>
              </div>
              <p className="text-3xl md:text-4xl font-bold text-slate-800 mb-1">{fortData.humidity}%</p>
              <p className="text-xs md:text-sm font-medium text-slate-400">Current moisture level</p>
            </div>

            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-orange-200 transition-all hover:-translate-y-1 hover:shadow-md group">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider">Wind Speed</p>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-50 rounded-xl flex items-center justify-center transition-colors group-hover:bg-orange-100">
                  <Activity className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
                </div>
              </div>
              <p className="text-3xl md:text-4xl font-bold text-slate-800 mb-1">{fortData.windSpeed}</p>
              <p className="text-xs md:text-sm font-medium text-slate-400">Kilometers per hour</p>
            </div>

            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-orange-200 transition-all hover:-translate-y-1 hover:shadow-md group">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider">Visibility</p>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-50 rounded-xl flex items-center justify-center transition-colors group-hover:bg-orange-100">
                  <Eye className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
                </div>
              </div>
              <p className="text-3xl md:text-4xl font-bold text-slate-800 mb-1">{fortData.visibility}</p>
              <p className="text-xs md:text-sm font-medium text-slate-400">Kilometer range</p>
            </div>
          </div>

          {/* Detailed Environmental Specs */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 mb-8 overflow-hidden relative">
            <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                <Activity className="w-5 h-5" />
              </div>
              Real-Time Atmospheric Data
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center justify-between py-4 px-5 bg-slate-50 rounded-xl hover:bg-orange-50/50 transition-colors border border-transparent hover:border-orange-100">
                <span className="text-sm font-bold text-slate-500">Condition</span>
                <span className="font-extrabold text-slate-800 capitalize tracking-tight">{fortData.conditionDescription}</span>
              </div>
              <div className="flex items-center justify-between py-4 px-5 bg-slate-50 rounded-xl hover:bg-orange-50/50 transition-colors border border-transparent hover:border-orange-100">
                <span className="text-sm font-bold text-slate-500">Pressure</span>
                <span className="font-extrabold text-slate-800 tracking-tight">{fortData.pressure} hPa</span>
              </div>
              <div className="flex items-center justify-between py-4 px-5 bg-slate-50 rounded-xl hover:bg-orange-50/50 transition-colors border border-transparent hover:border-orange-100">
                <span className="text-sm font-bold text-slate-500">Cloud Shield</span>
                <span className="font-extrabold text-slate-800 tracking-tight">{fortData.cloudCoverage}%</span>
              </div>
              <div className="flex items-center justify-between py-4 px-5 bg-slate-50 rounded-xl hover:bg-orange-50/50 transition-colors border border-transparent hover:border-orange-100">
                <span className="text-sm font-bold text-slate-500">Sunrise</span>
                <span className="font-extrabold text-slate-800 tracking-tight">{fortData.sunrise}</span>
              </div>
              <div className="flex items-center justify-between py-4 px-5 bg-slate-50 rounded-xl hover:bg-orange-50/50 transition-colors border border-transparent hover:border-orange-100">
                <span className="text-sm font-bold text-slate-500">Sunset</span>
                <span className="font-extrabold text-slate-800 tracking-tight">{fortData.sunset}</span>
              </div>
              <div className="flex items-center justify-between py-4 px-5 bg-slate-50 rounded-xl hover:bg-orange-50/50 transition-colors border border-transparent hover:border-orange-100">
                <span className="text-sm font-bold text-slate-500">Variance</span>
                <span className="font-extrabold text-orange-600 tracking-tight">{fortData.tempMin}° / {fortData.tempMax}°</span>
              </div>
            </div>
          </div>

          {/* Action Navigation Panels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Stage 1 Panel */}
            <button
              onClick={() => navigate('/stage1')}
              className="group relative bg-slate-900 border border-slate-800 rounded-3xl p-8 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-500/20 text-left w-full cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-colors group-hover:bg-slate-700"></div>
              <div className="relative z-10 flex flex-col h-full justify-between gap-12">
                <div className="bg-slate-800 w-fit p-4 rounded-2xl border border-slate-700 shadow-inner group-hover:border-slate-600 transition-colors">
                  <TrendingUp className="w-8 h-8 text-slate-300 group-hover:text-white" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">AI Analytics Center</h3>
                  <p className="text-slate-400 font-medium mb-4">View historical trends, risk leaderboards, and system-wide predictive analytics.</p>
                  <div className="inline-flex items-center gap-2 text-sm font-bold text-orange-400 tracking-wide">
                    ACCESS STAGE 1 <Activity className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </button>

            {/* Stage 2 Panel */}
            <button
              onClick={() => navigate('/stage2')}
              className="group relative bg-gradient-to-br from-orange-500 to-orange-600 border border-orange-500 rounded-3xl p-8 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-500/40 text-left w-full cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-colors group-hover:bg-white/20"></div>
              <div className="relative z-10 flex flex-col h-full justify-between gap-12">
                <div className="bg-white/20 w-fit p-4 rounded-2xl border border-white/20 shadow-inner backdrop-blur-md">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Live Verification</h3>
                  <p className="text-orange-100 font-medium mb-4">Upload new scans, execute deep structural differencing, and dispatch high-alert emails.</p>
                  <div className="inline-flex items-center gap-2 text-sm font-bold text-white tracking-wide">
                    LAUNCH STAGE 2 <Shield className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </button>

            {/* Stage 3 (Sevak Reports) Panel */}
            <button
              onClick={() => navigate('/admin/reports')}
              className="group relative bg-[#4A3218] border border-[#7A6040] rounded-3xl p-8 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-500/20 text-left w-full cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#7A1A1A] rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-colors group-hover:bg-[#922020] opacity-40"></div>
              <div className="relative z-10 flex flex-col h-full justify-between gap-12">
                <div className="bg-[#2E1E0E] w-fit p-4 rounded-2xl border border-[#7A6040] shadow-inner group-hover:border-[#BF9020] transition-colors">
                  <AlertCircle className="w-8 h-8 text-[#DDB840] group-hover:text-[#F5E090]" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Sevak Reports</h3>
                  <p className="text-[#DDD0A8] font-medium mb-4">View field reports, visual evidence, and manage issue resolutions across forts.</p>
                  <div className="inline-flex items-center gap-2 text-sm font-bold text-[#DDB840] tracking-wide">
                    MANAGE REPORTS <AlertCircle className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </button>
          </div>


        </div>
      </div>
    </div>
  );
};

export default RealtimeFortDashboard;