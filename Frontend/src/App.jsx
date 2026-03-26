import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainDashboard from './components/Main_Dashboard';
import Stage1Dashboard from './components/Stage_1Dash_Component';
import Stage2Dashboard from './components/Stage_2Dash_Component';
import AdminProfile from './components/AdminProfile';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import ReportIssue from './components/ReportIssue';
import ReportsAdmin from './components/ReportsAdmin';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProtectedRoute><MainDashboard /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/stage1"
          element={
            <ProtectedRoute>
              <Stage1Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stage2"
          element={
            <ProtectedRoute>
              <Stage2Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AdminProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report-issue"
          element={
            <ProtectedRoute>
              <ReportIssue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute>
              <ReportsAdmin />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;