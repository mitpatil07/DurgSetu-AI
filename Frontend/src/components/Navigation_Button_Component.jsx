import React, { useState } from 'react';
import { Shield, TrendingUp, ChevronRight } from 'lucide-react';

const NavigationButtons = ({ onStageChange, setIsLoading, currentStage = null, disabled = false }) => {
  const [loadingStage, setLoadingStage] = useState(null);

  const handleStageClick = async (stage) => {
    if (disabled || loadingStage) return;
    
    setLoadingStage(stage);
    setIsLoading(true);
    
    try {
      // Simulate loading with a minimum time for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      onStageChange(stage);
    } catch (error) {
      console.error('Error changing stage:', error);
    } finally {
      setIsLoading(false);
      setLoadingStage(null);
    }
  };

  const stages = [
    {
      id: 'stage1',
      title: 'Stage 1',
      subtitle: 'Live Monitoring',
      description: 'Real-time fort surveillance and sensor data',
      icon: Shield,
      gradient: 'from-orange-500 to-orange-600',
      hoverShadow: 'hover:shadow-orange-500/50',
      textColor: 'text-orange-200'
    },
    {
      id: 'stage2',
      title: 'Stage 2',
      subtitle: 'AI Analytics',
      description: 'Advanced AI predictions and threat analysis',
      icon: TrendingUp,
      gradient: 'from-purple-500 to-pink-600',
      hoverShadow: 'hover:shadow-purple-500/50',
      textColor: 'text-purple-200'
    }
  ];

  return (
    <div className="flex flex-col items-center space-y-6 mb-8">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Choose Your Dashboard</h2>
        <p className="text-gray-600 max-w-md">
          Select the monitoring stage that best fits your current operational needs
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col lg:flex-row justify-center gap-6 lg:gap-12 w-full max-w-4xl">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isLoading = loadingStage === stage.id;
          const isCurrent = currentStage === stage.id;
          const isDisabled = disabled || loadingStage !== null;

          return (
            <button
              key={stage.id}
              onClick={() => handleStageClick(stage.id)}
              disabled={isDisabled}
              className={`group relative bg-gradient-to-r ${stage.gradient} text-white px-8 sm:px-12 lg:px-16 py-6 lg:py-8 rounded-2xl font-bold text-lg lg:text-xl shadow-2xl ${stage.hoverShadow} transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0 flex-1 lg:flex-none ${
                isCurrent ? 'ring-4 ring-white/50' : ''
              }`}
              aria-label={`${stage.title}: ${stage.description}`}
              title={stage.description}
            >
              <div className="flex items-center gap-3 lg:gap-4">
                <div className={`p-2 lg:p-3 bg-white/20 rounded-lg group-hover:rotate-12 transition-transform duration-300 ${
                  isLoading ? 'animate-spin' : ''
                }`}>
                  <Icon className="w-6 h-6 lg:w-8 lg:h-8" />
                </div>
                
                <div className="text-left flex-1">
                  <div className="flex items-center gap-2">
                    <span>{stage.title}</span>
                    {isCurrent && (
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <div className={`text-sm lg:text-base font-normal ${stage.textColor} mb-1`}>
                    {stage.subtitle}
                  </div>
                  <div className="text-xs text-white/70 hidden sm:block">
                    {stage.description}
                  </div>
                </div>

                {/* Arrow indicator */}
                <div className="hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>

              {/* Loading overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 rounded-2xl transition-all duration-300 pointer-events-none"></div>
              
              {/* Current stage indicator */}
              {isCurrent && (
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Progress indicator */}
      <div className="flex items-center space-x-4 mt-6">
        {stages.map((stage, index) => (
          <React.Fragment key={stage.id}>
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentStage === stage.id ? 'bg-orange-500 scale-125' : 
              loadingStage === stage.id ? 'bg-orange-300 animate-pulse' : 'bg-gray-300'
            }`}></div>
            {index < stages.length - 1 && (
              <div className={`w-8 h-0.5 transition-all duration-300 ${
                stages.findIndex(s => s.id === currentStage) > index ? 'bg-orange-500' : 'bg-gray-300'
              }`}></div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Help text */}
      <p className="text-sm text-gray-500 text-center max-w-md">
        {loadingStage ? 'Loading dashboard...' : 
         currentStage ? `Currently viewing ${stages.find(s => s.id === currentStage)?.subtitle}` :
         'Select a stage to begin monitoring your forts'}
      </p>
    </div>
  );
};

export default NavigationButtons;