import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, AlertCircle, Loader, User, Shield } from 'lucide-react';
import { API_BASE } from '../api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                }),
            });
            const data = await response.json();
            if (response.ok) {
                login(data);
                navigate('/user/dashboard');
            } else {
                const firstError = typeof data === 'object' ? Object.values(data)[0] : null;
                setError(Array.isArray(firstError) ? firstError[0] : (data.error || 'Registration failed'));
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row-reverse border border-slate-100">

                {/* Brand Side - Compact on Mobile */}
                <div className="w-full md:w-5/12 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 p-6 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 left-0 -ml-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
                    <div className="relative z-10 flex items-center gap-3 mb-4">
                        <Shield className="w-6 h-6 sm:w-10 sm:h-10 text-white" />
                        <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">DurgSetu AI</h1>
                    </div>
                    <h2 className="relative z-10 text-2xl sm:text-4xl font-bold leading-tight mb-4 sm:block hidden">
                        Join the Conservation Effort.
                    </h2>
                    <div className="relative z-10 text-[10px] sm:text-sm font-medium text-orange-200/80">
                        © 2026 User Portal
                    </div>
                </div>

                {/* Form Side */}
                <div className="md:w-7/12 p-8 sm:p-14 flex flex-col justify-center bg-white">
                    <div className="max-w-md w-full mx-auto">
                        <div className="mb-6 sm:mb-8 text-center md:text-left">
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 leading-tight">Create Account</h2>
                            <p className="text-slate-500 text-xs sm:text-sm">Public User Registration</p>
                        </div>

                        {error && (
                            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 text-xs border border-red-100">
                                <AlertCircle className="w-4 h-4 text-red-500" />
                                <p className="font-medium">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Username</label>
                                    <input type="text" name="username" placeholder='Username' value={formData.username} onChange={handleChange} required
                                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-orange-500 outline-none text-sm font-medium" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Email</label>
                                    <input type="email" name="email" placeholder='Email' value={formData.email} onChange={handleChange} required
                                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-orange-500 outline-none text-sm font-medium" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Password</label>
                                    <input type="password" name="password" placeholder='Password' value={formData.password} onChange={handleChange} required
                                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-orange-500 outline-none text-sm font-medium" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Confirm</label>
                                    <input type="password" name="confirmPassword" placeholder='Confirm Password' value={formData.confirmPassword} onChange={handleChange} required
                                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-orange-500 outline-none text-sm font-medium" />
                                </div>
                            </div>

                            <button type="submit" disabled={loading}
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-4"
                            >
                                {loading ? <Loader className="animate-spin" /> : <span>Start Conserving</span>}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs">
                            <p className="text-slate-500 mb-3">Member? <button onClick={() => navigate('/user/login')} className="text-orange-600 font-bold">Login</button></p>
                            <button onClick={() => navigate('/login')} className="text-slate-400 font-bold uppercase tracking-widest">← Back</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
