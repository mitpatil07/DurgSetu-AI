import React, { useState, useEffect, useRef } from 'react';
import MainDashboard from './Main_Dashboard';
import Stage1Dashboard from './Stage_1Dash_Component';
import Stage2Dashboard from './Stage_2Dash_Component';

const DurgSetuAI = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeStage, setActiveStage] = useState('main');
  const [selectedFort, setSelectedFort] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const renderCurrentStage = () => {
    const commonProps = {
      currentTime,
      setActiveStage,
      selectedFort,
      setSelectedFort,
      isLoading,
      setIsLoading,
      theme,
      setTheme
    };

    switch(activeStage) {
      case 'stage1':
        return <Stage1Dashboard {...commonProps} />;
      case 'stage2':
        return <Stage2Dashboard {...commonProps} />;
      default:
        return <MainDashboard {...commonProps} />;
    }
  };

  return renderCurrentStage();
};

export default DurgSetuAI;