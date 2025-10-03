import React from 'react';

const FloatingActionButton = ({ children, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 z-50 bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center ${className}`}
  >
    {children}
  </button>
);

export default FloatingActionButton;