const API_BASE = 'http://127.0.0.1:8000/api';

export const login = async (username, password, role = 'user') => {
    const response = await fetch(`${API_BASE}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role }),
    });
    const data = await response.json();
    if (!response.ok) throw { response: { data } };
    return data;
};

export const register = async (username, password, email, role = 'user', adminSecret = '') => {
    const body = { username, password, email, role };
    if (role === 'admin') body.admin_secret = adminSecret;

    const response = await fetch(`${API_BASE}/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) throw { response: { data } };
    return data;
};

export const forgotPassword = async (email) => {
    const response = await fetch(`${API_BASE}/forgot-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok) throw { response: { data } };
    return data;
};

export const verifyOTP = async (email, otp) => {
    const response = await fetch(`${API_BASE}/verify-otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
    });
    const data = await response.json();
    if (!response.ok) throw { response: { data } };
    return data;
};

export const resetPassword = async (token, password) => {
    const response = await fetch(`${API_BASE}/reset-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
    });
    const data = await response.json();
    if (!response.ok) throw { response: { data } };
    return data;
};
