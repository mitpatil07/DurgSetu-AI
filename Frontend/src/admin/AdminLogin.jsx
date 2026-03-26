import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, AlertCircle, Loader, UserPlus, User } from 'lucide-react';

const AdminLogin = () => {
    const [mode, setMode] = useState('login'); // 'login' or 'register'
    const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (mode === 'register' && formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        setLoading(true);
        try {
            const url = mode === 'login'
                ? 'http://127.0.0.1:8000/api/login/'
                : 'http://127.0.0.1:8000/api/register/';

            const body = mode === 'login'
                ? { username: formData.username, password: formData.password }
                : { username: formData.username, email: formData.email, password: formData.password };

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await response.json();

            if (response.ok) {
                // Check if user is actually an admin
                if (!data.is_staff) {
                    setError('Access denied. This login is for admins only.');
                    return;
                }
                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('user_email', data.email);
                localStorage.setItem('user_id', data.user_id);
                localStorage.setItem('username', data.username || data.email);
                localStorage.setItem('is_staff', data.is_staff);
                navigate('/');
            } else {
                const firstErr = typeof data === 'object' ? Object.values(data)[0] : null;
                setError(Array.isArray(firstErr) ? firstErr[0] : (data.error || 'Something went wrong'));
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100">

                {/* Brand Side */}
                <div className="md:w-5/12 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 p-10 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-orange-400/20 blur-3xl" />

                    <div className="relative z-10 flex items-center gap-3 mb-10">
                        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm border border-white/20 shadow-lg">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight">DurgSetu AI</h1>
                    </div>

                    <div className="relative z-10 mb-10 md:mb-0">
                        <h2 className="text-4xl font-bold leading-tight mb-4">
                            Manage & Protect <span className="text-orange-200">Heritage.</span>
                        </h2>
                        <p className="text-orange-100 text-lg leading-relaxed mb-8">
                            Access the admin dashboard to review damage reports, run AI analysis, and update repair records.
                        </p>
                        <div className="bg-black/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                            <p className="text-sm font-medium text-orange-50 italic">
                                "Forts are the foundation of the kingdom" <br />- Chhatrapati Shivaji Maharaj
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10 text-sm font-medium text-orange-200/80 mt-8 md:mt-0">
                        © 2026 Admin Portal
                    </div>
                </div>

                {/* Form Side */}
                <div className="md:w-7/12 p-10 sm:p-14 flex flex-col justify-center bg-white">
                    <div className="max-w-md w-full mx-auto">

                        {/* Toggle Tabs */}
                        <div className="flex bg-slate-100 rounded-2xl p-1 mb-10">
                            <button
                                onClick={() => { setMode('login'); setError(''); }}
                                className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${mode === 'login'
                                    ? 'bg-white shadow text-slate-900'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Admin Login
                            </button>
                            <button
                                onClick={() => { setMode('register'); setError(''); }}
                                className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${mode === 'register'
                                    ? 'bg-white shadow text-slate-900'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Register Admin
                            </button>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">
                                {mode === 'login' ? 'Welcome Back, Admin' : 'Create Admin Account'}
                            </h2>
                            <p className="text-slate-500 font-medium">
                                {mode === 'login'
                                    ? 'Enter your admin credentials to access the dashboard.'
                                    : 'Register a new admin account. Staff access is required.'}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 text-sm border border-red-100">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
                                <p className="font-medium">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Username</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-500 transition-colors">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <input type="text" name="username" value={formData.username} onChange={handleChange} required
                                        className="pl-12 w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-slate-900 font-medium outline-none placeholder:text-slate-400"
                                        placeholder="admin_username" />
                                </div>
                            </div>

                            {mode === 'register' && (
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-500 transition-colors">
                                            <Mail className="h-5 w-5" />
                                        </div>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} required
                                            className="pl-12 w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-slate-900 font-medium outline-none placeholder:text-slate-400"
                                            placeholder="admin@durgsetu.ai" />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-500 transition-colors">
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <input type="password" name="password" value={formData.password} onChange={handleChange} required
                                        className="pl-12 w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-slate-900 font-medium outline-none placeholder:text-slate-400"
                                        placeholder="••••••••" />
                                </div>
                            </div>

                            {mode === 'register' && (
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Confirm Password</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-500 transition-colors">
                                            <Lock className="h-5 w-5" />
                                        </div>
                                        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required
                                            className="pl-12 w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-slate-900 font-medium outline-none placeholder:text-slate-400"
                                            placeholder="••••••••" />
                                    </div>
                                </div>
                            )}

                            <button type="submit" disabled={loading}
                                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl shadow-[0_8px_20px_-6px_rgba(249,115,22,0.5)] hover:shadow-[0_12px_25px_-6px_rgba(249,115,22,0.6)] transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer disabled:opacity-70 disabled:hover:translate-y-0 mt-4"
                            >
                                {loading
                                    ? <Loader className="w-5 h-5 animate-spin" />
                                    : mode === 'login'
                                        ? <><Shield className="w-5 h-5" /> Access Admin Dashboard</>
                                        : <><UserPlus className="w-5 h-5" /> Create Admin Account</>
                                }
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                            <button onClick={() => navigate('/login')} className="text-slate-400 hover:text-slate-600 transition-colors text-sm">
                                ← Back to Role Selection
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
