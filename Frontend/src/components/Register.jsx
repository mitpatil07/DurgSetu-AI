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
                if (typeof data === 'object' && data !== null) {
                    const firstError = Object.values(data)[0];
                    setError(Array.isArray(firstError) ? firstError[0] : (data.error || 'Registration failed'));
                } else {
                    setError('Registration failed');
                }
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row-reverse border border-slate-100">

                {/* Brand Side */}
                <div className="md:w-5/12 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 p-10 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 left-0 -ml-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute bottom-0 right-0 -mr-16 -mb-16 w-80 h-80 rounded-full bg-orange-400/20 blur-3xl" />

                    <div className="relative z-10 flex items-center gap-3 mb-10">
                        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm border border-white/20 shadow-lg">
                            <UserPlus className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight">DurgSetu AI</h1>
                    </div>

                    <div className="relative z-10 mb-10 md:mb-0">
                        <h2 className="text-4xl font-bold leading-tight mb-4">
                            Join the Conservation <span className="text-orange-200">Effort.</span>
                        </h2>
                        <p className="text-orange-100 text-lg leading-relaxed mb-8">
                            Create an account to start reporting damage, tracking repairs, and helping preserve historical monuments.
                        </p>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 bg-black/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                                <Shield className="w-5 h-5 text-orange-200" />
                                <span className="text-sm font-medium text-orange-50">Report Damage Securely</span>
                            </div>
                            <div className="flex items-center gap-3 bg-black/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                                <Mail className="w-5 h-5 text-orange-200" />
                                <span className="text-sm font-medium text-orange-50">Track Report Status</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 text-sm font-medium text-orange-200/80 mt-8 md:mt-0">
                        © 2026 DurgSetu AI
                    </div>
                </div>

                {/* Form Side */}
                <div className="md:w-7/12 p-10 sm:p-14 flex flex-col justify-center bg-white">
                    <div className="max-w-md w-full mx-auto">
                        <div className="mb-10">
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h2>
                            <p className="text-slate-500 font-medium">Set up your user account credentials below.</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 text-sm border border-red-100 shadow-sm">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
                                <p className="font-medium">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Username</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-orange-500 text-slate-400">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <input type="text" name="username" value={formData.username} onChange={handleChange} required
                                        className="pl-12 w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-slate-900 font-medium outline-none placeholder:text-slate-400"
                                        placeholder="Choose a username" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-orange-500 text-slate-400">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} required
                                        className="pl-12 w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-slate-900 font-medium outline-none placeholder:text-slate-400"
                                        placeholder="you@example.com" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-orange-500 text-slate-400">
                                            <Lock className="h-5 w-5" />
                                        </div>
                                        <input type="password" name="password" value={formData.password} onChange={handleChange} required
                                            className="pl-12 w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-slate-900 font-medium outline-none placeholder:text-slate-400"
                                            placeholder="••••••••" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Confirm Password</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-orange-500 text-slate-400">
                                            <Lock className="h-5 w-5" />
                                        </div>
                                        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required
                                            className="pl-12 w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-slate-900 font-medium outline-none placeholder:text-slate-400"
                                            placeholder="••••••••" />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" disabled={loading}
                                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl shadow-[0_8px_20px_-6px_rgba(249,115,22,0.5)] hover:shadow-[0_12px_25px_-6px_rgba(249,115,22,0.6)] transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer disabled:opacity-70 mt-6"
                            >
                                {loading ? <Loader className="w-5 h-5 animate-spin" /> : <span>Create Account</span>}
                            </button>
                        </form>

                        <div className="mt-10 pt-6 border-t border-slate-100 text-center text-sm font-medium text-slate-500 flex flex-col items-center gap-4">
                            <p>
                                Already have an account?{' '}
                                <button onClick={() => navigate('/user/login')} className="text-orange-600 hover:text-orange-700 font-bold transition-colors">
                                    Log in
                                </button>
                            </p>
                            <button onClick={() => navigate('/login')} className="text-slate-400 hover:text-slate-600 transition-colors">
                                ← Back to Role Selection
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
