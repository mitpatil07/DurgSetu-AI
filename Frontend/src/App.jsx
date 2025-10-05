import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainDashboard from './components/Main_Dashboard';
import Stage1Dashboard from './components/Stage_1Dash_Component';
import Stage2Dashboard from './components/Stage_2Dash_Component';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainDashboard />} />
        <Route path="/stage1" element={<Stage1Dashboard />} />
        <Route path="/stage2" element={<Stage2Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;