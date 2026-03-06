import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('auth_token');

    if (!token) {
        // If not logged in, redirect to login page
        return <Navigate to="/login" replace />;
    }

    // If logged in, allow access to the protected route
    return children;
};

export default ProtectedRoute;
