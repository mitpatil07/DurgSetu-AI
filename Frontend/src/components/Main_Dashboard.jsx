import React, { useEffect, useRef } from 'react';
import { Crown, Calendar, Zap, Activity, Satellite, Wifi, Shield, TrendingUp, Eye } from 'lucide-react';
import AdvancedFortCard from './Card_Component';
import FloatingActionButton from './button';
import { fortsData } from './Sample_data';

const MainDashboard = ({
  currentTime,
  setActiveStage,
  selectedFort,
  setSelectedFort,
  isLoading,
  setIsLoading,
  theme,
  setTheme
}) => {
  const canvasRef = useRef(null);

  // Particle animation for background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particleArray = [];
    for (let i = 0; i < 50; i++) {
      particleArray.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: Math.random() * 1 - 0.5,
        speedY: Math.random() * 1 - 0.5,
        opacity: Math.random() * 0.5 + 0.2
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particleArray.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x > canvas.width) particle.x = 0;
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.y > canvas.height) particle.y = 0;
        if (particle.y < 0) particle.y = canvas.height;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(249, 115, 22, ${particle.opacity})`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
      />

      {/* Gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-orange-50/90 via-orange-100/90 to-red-50/90 z-10"></div>

      {/* Main content */}
      <div className="relative z-20">
        {/* Enhanced Header with glassmorphism */}
        <header className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/90 to-orange-800/90 backdrop-blur-md"></div>
          <div className="relative container mx-auto px-4 sm:px-6 py-4 sm:py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
              <div className="flex items-center space-x-3 sm:space-x-6 w-full sm:w-auto">
                <div className="relative">
                  <div className="bg-white/20 p-2 sm:p-4 rounded-full backdrop-blur-md shadow-2xl">
                    <Crown className="w-8 h-8 sm:w-12 sm:h-12 text-orange-100" />
                  </div>
                </div>
                <div className="flex-1 sm:flex-none">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-wide mb-1 sm:mb-2">
                    <span className="bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">
                      DurgSetu AI
                    </span>
                  </h1>
                  <p className="text-orange-200 text-xs sm:text-sm md:text-base lg:text-lg font-medium text-left">
                    Next-Gen Fort Monitoring & Prediction System
                  </p>
                </div>
              </div>

              {/* Enhanced time display */}
              <div className="text-center sm:text-right bg-white/10 p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl backdrop-blur-md border border-white/20 w-full sm:w-auto">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">
                  {currentTime.toLocaleTimeString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    hour12: true
                  })}
                </div>
                <div className="text-orange-200 flex items-center justify-center sm:justify-end gap-2 text-xs sm:text-sm">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-left">
                    {currentTime.toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-center sm:justify-end gap-2 text-orange-300 text-xs">
                  <Activity className="w-3 h-3" />
                  <span className="text-left">System Active • All Sensors Online</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Stats bar with live data */}
        <div className="bg-white/80 backdrop-blur-md border-b border-white/30 py-3 sm:py-4">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
              <div className="flex flex-wrap gap-4 sm:gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700 text-left">1 Forts Active</span>
                </div>
              </div>
              <div className="text-xs sm:text-sm text-gray-600 text-left sm:text-right">
                Last Updated: {currentTime.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
          {/* Enhanced fort cards */}
          <div className="flex justify-center mb-8 sm:mb-12">
            <AdvancedFortCard
              fort={fortsData[0]}
              onSelect={setSelectedFort}
              isSelected={selectedFort?.id === fortsData[0]?.id}
            />
          </div>



          {/* Interactive navigation with 3D effects */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 lg:gap-12 mb-8">
            <button
              onClick={() => {
                setIsLoading(true);
                setTimeout(() => {
                  setActiveStage('stage1');
                  setIsLoading(false);
                }, 1000);
              }}
              className="group relative bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 sm:px-12 lg:px-16 py-6 sm:py-7 lg:py-8 rounded-xl sm:rounded-2xl font-bold text-lg sm:text-xl shadow-2xl hover:shadow-orange-500/50 transform hover:scale-105 sm:hover:scale-110 hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-500 w-full sm:w-auto"
            >
              <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4">
                <div className="p-2 bg-white/20 rounded-lg group-hover:rotate-12 transition-transform duration-300">
                  <Shield className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                </div>
                <div className="text-center sm:text-left">
                  <div>Stage 1</div>
                  <div className="text-xs sm:text-sm font-normal text-orange-200">Live Monitoring</div>
                </div>
              </div>
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 rounded-xl sm:rounded-2xl transition-all duration-300"></div>
            </button>

            <button
              onClick={() => {
                setIsLoading(true);
                setTimeout(() => {
                  setActiveStage('stage2');
                  setIsLoading(false);
                }, 1000);
              }}
              className="group relative bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 sm:px-12 lg:px-16 py-6 sm:py-7 lg:py-8 rounded-xl sm:rounded-2xl font-bold text-lg sm:text-xl shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 sm:hover:scale-110 hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-500 w-full sm:w-auto"
            >
              <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4">
                <div className="p-2 bg-white/20 rounded-lg group-hover:rotate-12 transition-transform duration-300">
                  <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                </div>
                <div className="text-center sm:text-left">
                  <div>Stage 2</div>
                  <div className="text-xs sm:text-sm font-normal text-purple-200">AI Analytics</div>
                </div>
              </div>
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 rounded-xl sm:rounded-2xl transition-all duration-300"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Floating action buttons */}
      <FloatingActionButton
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        className="bg-gradient-to-r from-gray-600 to-gray-700 text-white"
      >
        <Eye className="w-6 h-6" />
      </FloatingActionButton>

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium text-sm sm:text-base">Loading Dashboard...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainDashboard;