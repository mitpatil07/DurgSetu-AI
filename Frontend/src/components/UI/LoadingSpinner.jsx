import React from 'react';
import { COLORS } from '../../styles/designSystem';

export const LoadingSpinner = ({ size = 'md', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const spinner = (
    <div className={`${sizeClasses[size]} border-4 rounded-full animate-spin`}
      style={{
        borderColor: COLORS.primary[200],
        borderTopColor: COLORS.primary[500],
      }}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          {spinner}
          <p className="text-slate-600 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
