import React, { useState, useEffect } from 'react';
import { Activity, Shield, TrendingUp, Eye, AlertCircle, ClipboardList, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../admin/AdminNavbar';

const useFortData = () => {
  const [fortData, setFortData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFortData = async () => {
      try {
        let lat = 19.2183;
        let lon = 73.8478;
        let locationName = "Shivneri Fort";

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

        const API_KEY = 'c48e71bd51105312e7a19c1b04ceb77e';
        const weatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );

        if (!weatherResponse.ok) throw new Error('Weather data fetch failed. Please check your API key.');

        const weatherData = await weatherResponse.json();

        const calculateRiskLevel = (weather) => {
          const temp = weather.main.temp;
          const humidity = weather.main.humidity;
          const windSpeed = weather.wind.speed;
          const visibility = weather.visibility / 1000;
          if (temp > 40 || humidity > 85 || windSpeed > 15 || visibility < 2) return { level: 'High', confidence: 75 };
          else if (temp > 35 || humidity > 75 || windSpeed > 10 || visibility < 5) return { level: 'Medium', confidence: 85 };
          return { level: 'Low', confidence: 98 };
        };

        const risk = calculateRiskLevel(weatherData);

        setFortData({
          name: locationName === "Current Location" ? "Live Monitoring Site" : locationName,
          location: locationName === "Current Location" ? `${lat.toFixed(4)}, ${lon.toFixed(4)}` : "Junnar, Pune",
          coordinates: { lat, lng: lon },
          temperature: Math.round(weatherData.main.temp),
          humidity: weatherData.main.humidity,
          windSpeed: Math.round(weatherData.wind.speed * 3.6),
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
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching fort data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchFortData();
    const interval = setInterval(fetchFortData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { fortData, loading, error };
};

const RealtimeFortDashboard = () => {
  const { fortData, loading, error } = useFortData();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md border border-slate-100">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2 text-center">Setup Required</h2>
          <p className="text-slate-500 text-center mb-4">{error}</p>
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
            <p className="text-sm font-bold text-orange-800 mb-2">To get REAL-TIME data:</p>
            <p className="text-sm text-slate-600">Check Your Internet Connection</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <AdminNavbar />

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-12 pt-8">
        <div className="max-w-6xl mx-auto">

          {/* Fort Title */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 mb-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-100/50 to-orange-50/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-transform group-hover:scale-110 duration-700"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-orange-100 text-orange-700 text-[10px] md:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Active Monitoring</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight mb-2">{fortData.name}</h2>
              <p className="text-slate-500 font-medium flex items-center gap-2 text-base md:text-lg">
                <Activity className="w-5 h-5 text-orange-400" /> {fortData.location}
              </p>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8">
            {[
              { label: 'Temperature', value: `${fortData.temperature}°C`, sub: `Feels like ${fortData.feelsLike}°C` },
              { label: 'Humidity', value: `${fortData.humidity}%`, sub: 'Current moisture' },
              { label: 'Wind Speed', value: fortData.windSpeed, sub: 'Km per hour' },
            ].map(({ label, value, sub }) => (
              <div key={label} className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-orange-200 transition-all hover:-translate-y-1 hover:shadow-md group overflow-hidden">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <p className="text-[10px] md:text-sm font-bold text-slate-500 uppercase tracking-wider mr-1.5">{label}</p>
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-orange-50 rounded-xl flex items-center justify-center transition-colors group-hover:bg-orange-100 shrink-0">
                    <Activity className="w-4 h-4 md:w-6 md:h-6 text-orange-500" />
                  </div>
                </div>
                <p className="text-xl md:text-4xl font-bold text-slate-800 mb-1">{value}</p>
                <p className="text-[9px] md:text-sm font-medium text-slate-400">{sub}</p>
              </div>
            ))}
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-orange-200 transition-all hover:-translate-y-1 hover:shadow-md group overflow-hidden">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <p className="text-[10px] md:text-sm font-bold text-slate-500 uppercase tracking-wider mr-1.5">Visibility</p>
                <div className="w-8 h-8 md:w-12 md:h-12 bg-orange-50 rounded-xl flex items-center justify-center transition-colors group-hover:bg-orange-100 shrink-0">
                  <Eye className="w-4 h-4 md:w-6 md:h-6 text-orange-500" />
                </div>
              </div>
              <p className="text-xl md:text-4xl font-bold text-slate-800 mb-1">{fortData.visibility}</p>
              <p className="text-[9px] md:text-sm font-medium text-slate-400">KM range</p>
            </div>
          </div>

          {/* Atmospheric Data */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 mb-8 overflow-hidden relative">
            <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><Activity className="w-5 h-5" /></div>
              Real-Time Atmospheric Data
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              {[
                { label: 'Condition', value: fortData.conditionDescription, cls: 'capitalize' },
                { label: 'Pressure', value: `${fortData.pressure} hPa` },
                { label: 'Cloud Shield', value: `${fortData.cloudCoverage}%` },
                { label: 'Sunrise', value: fortData.sunrise },
                { label: 'Sunset', value: fortData.sunset },
                { label: 'Variance', value: `${fortData.tempMin}° / ${fortData.tempMax}°`, cls: 'text-orange-600' },
              ].map(({ label, value, cls }) => (
                <div key={label} className="flex flex-col sm:flex-row sm:items-center justify-between py-2 sm:py-4 px-3 sm:px-5 bg-slate-50 rounded-xl hover:bg-orange-50/50 transition-colors border border-transparent hover:border-orange-100">
                  <span className="text-[9px] sm:text-sm font-bold text-slate-500 uppercase tracking-tight mb-0.5 sm:mb-0 whitespace-nowrap">{label}</span>
                  <span className={`font-extrabold text-slate-800 tracking-tight text-[11px] sm:text-base ${cls || ''} whitespace-nowrap`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Cards: Stage 1 | Stage 2 | User Reports */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">

            {/* Stage 1 */}
            <button
              onClick={() => navigate('/stage1')}
              className="group relative bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-orange-500/20 text-left w-full cursor-pointer min-h-[160px] md:min-h-[180px] flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-800 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none transition-colors group-hover:bg-slate-700"></div>
              <div className="relative z-10">
                <div className="bg-slate-800 w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl border border-slate-700 shadow-inner group-hover:border-slate-600 transition-colors flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-slate-300 group-hover:text-white" />
                </div>
              </div>
              <div className="relative z-10">
                <h3 className="text-lg md:text-xl font-black text-white leading-tight uppercase tracking-tight">AI Analytics</h3>
                <div className="inline-flex items-center gap-2 text-[10px] md:text-[11px] font-black text-orange-400 tracking-widest uppercase mt-1.5">
                  STAGE 1 <Activity className="w-3 md:w-3.5 h-3 md:h-3.5" />
                </div>
              </div>
            </button>

            {/* Stage 2 */}
            <button
              onClick={() => navigate('/stage2')}
              className="group relative bg-gradient-to-br from-orange-500 to-orange-600 border border-orange-500 rounded-3xl p-6 md:p-8 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-orange-500/40 text-left w-full cursor-pointer min-h-[160px] md:min-h-[180px] flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none transition-colors group-hover:bg-white/20"></div>
              <div className="relative z-10">
                <div className="bg-white/20 w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl border border-white/20 shadow-inner backdrop-blur-md flex items-center justify-center">
                  <Shield className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
              </div>
              <div className="relative z-10">
                <h3 className="text-lg md:text-xl font-black text-white leading-tight uppercase tracking-tight">Verification</h3>
                <div className="inline-flex items-center gap-2 text-[10px] md:text-[11px] font-black text-white/90 tracking-widest uppercase mt-1.5">
                  STAGE 2 <Shield className="w-3 md:w-3.5 h-3 md:h-3.5" />
                </div>
              </div>
            </button>

            {/* User Reports */}
            <button
              onClick={() => navigate('/admin/reports')}
              className="group relative bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 rounded-3xl p-6 md:p-8 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-orange-500/20 text-left w-full cursor-pointer col-span-2 md:col-span-2 lg:col-span-1 min-h-[100px] flex items-center justify-between"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-colors group-hover:bg-orange-500/20"></div>
              <div className="relative z-10 flex items-center gap-6">
                <div className="bg-orange-500/20 w-12 h-12 md:w-14 md:h-14 flex-shrink-0 rounded-xl md:rounded-2xl border border-orange-500/30 shadow-inner group-hover:border-orange-400/50 transition-colors flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 md:w-8 md:h-8 text-orange-400 group-hover:text-orange-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg md:text-xl font-black text-white leading-tight uppercase tracking-tight">User Reports</h3>
                  <div className="flex items-center gap-2 text-[10px] md:text-[11px] font-black text-orange-400 tracking-widest uppercase mt-1">
                    CENTRAL LOG <ClipboardList className="w-3 md:w-3.5 h-3 md:h-3.5" />
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-all transform group-hover:translate-x-1 relative z-10" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RealtimeFortDashboard;
