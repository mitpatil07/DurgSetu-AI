import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

/**
 * Provides centralised authentication state to the entire app.
 * Components can call useAuth() to get the current token, isStaff flag,
 * and the login / logout helpers instead of reading localStorage directly.
 */
export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
    const [isStaff, setIsStaff] = useState(() => localStorage.getItem('is_staff') === 'true');

    const login = useCallback((data) => {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user_email', data.email || '');
        localStorage.setItem('user_id', String(data.user_id || ''));
        localStorage.setItem('username', data.username || data.email || '');
        localStorage.setItem('is_staff', String(data.is_staff || false));
        setToken(data.token);
        setIsStaff(Boolean(data.is_staff));
    }, []);

    const logout = useCallback(() => {
        localStorage.clear();
        setToken(null);
        setIsStaff(false);
    }, []);

    return (
        <AuthContext.Provider value={{ token, isStaff, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
