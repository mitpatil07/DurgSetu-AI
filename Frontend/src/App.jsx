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
import AdminSettings from './admin/AdminSettings';
import AdminUserListing from './admin/AdminUserListing';


const HomeRoute = () => {
  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("is_staff") === "true";

  if (!token) {
    return <RoleSelect />;
  }

  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/user/dashboard" replace />;
};


const UserOnlyRoute = ({ children }) => {
  const isAdmin = localStorage.getItem('is_staff') === 'true';
  if (isAdmin) return <Navigate to="/admin/dashboard" replace />;
  return children;
};


const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* ✅ ROOT: Role Selector if unauth, Dashboard if Admin */}
        <Route path="/" element={<HomeRoute />} />

        <Route path="/login" element={<RoleSelect />} />

        <Route path="/user/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/admin/login" element={<AdminLogin />} />

        {/* User Routes */}
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
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <MainDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute>
              <AdminDamageReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <AdminDamageReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <AdminUserListing />
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
          path="/settings"
          element={
            <ProtectedRoute>
              <AdminSettings />
            </ProtectedRoute>
          }
        />

        {/* Stage Routes */}
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

        {/* Redirects */}
        <Route path="/dashboard1" element={<Navigate to="/stage1" replace />} />
        <Route path="/dashboard2" element={<Navigate to="/stage2" replace />} />
        <Route path="/analytics" element={<Navigate to="/stage2" replace />} />

      </Routes>
    </BrowserRouter>
  );
};

export default App;