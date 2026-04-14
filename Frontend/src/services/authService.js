import { apiFetch } from '../api';

export const login = async (username, password, role = 'user') => {
    const response = await apiFetch('/login/', {
        method: 'POST',
        body: JSON.stringify({ username, password, role }),
    });
    const data = await response.json();
    if (!response.ok) throw { response: { data } };
    return data;
};

export const register = async (username, password, email, role = 'user', adminSecret = '') => {
    const body = { username, password, email, role };
    if (role === 'admin') body.admin_secret = adminSecret;

    const response = await apiFetch('/register/', {
        method: 'POST',
        body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) throw { response: { data } };
    return data;
};

export const forgotPassword = async (email) => {
    const response = await apiFetch('/forgot-password/', {
        method: 'POST',
        body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok) throw { response: { data } };
    return data;
};

export const verifyOTP = async (email, otp) => {
    const response = await apiFetch('/verify-otp/', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
    });
    const data = await response.json();
    if (!response.ok) throw { response: { data } };
    return data;
};

export const resetPassword = async (token, password) => {
    const response = await apiFetch('/reset-password/', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
    });
    const data = await response.json();
    if (!response.ok) throw { response: { data } };
    return data;
};
