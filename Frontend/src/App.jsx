import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainDashboard from './components/Main_Dashboard';
import Stage1Dashboard from './admin/Stage_1Dash_Component';
import Stage2Dashboard from './admin/Stage_2Dash_Component';
import AdminProfile from './admin/AdminProfile';
import AdminDamageReports from './admin/AdminDamageReports';
import AdminLogin from './admin/AdminLogin';
import RoleSelect from './components/RoleSelect';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import UserReport from './user/UserReport';
import UserDashboard from './user/UserDashboard';

// Blocks admins from accessing user-only pages — redirects to admin panel
const UserOnlyRoute = ({ children }) => {
  const isAdmin = localStorage.getItem('is_staff') === 'true';
  if (isAdmin) return <Navigate to="/admin/reports" replace />;
  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainDashboard />} />

        {/* Role Selector */}
        <Route path="/login" element={<RoleSelect />} />

        {/* User Auth Pages */}
        <Route path="/user/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Auth Pages */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* User-only Routes — admins get redirected to /admin/reports */}
        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <UserOnlyRoute>
                <UserReport />
              </UserOnlyRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute>
              <UserOnlyRoute>
                <UserDashboard />
              </UserOnlyRoute>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute>
              <AdminDamageReports />
            </ProtectedRoute>
          }
        />
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
      </Routes>
    </BrowserRouter>
  );
};

export default App;