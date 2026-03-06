import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, AlertCircle, Loader } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('user_email', data.email);
                localStorage.setItem('user_id', data.user_id);
                navigate('/');
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100">

                {/* Brand Side (Left on Desktop, Top on Mobile) */}
                <div className="md:w-5/12 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 p-10 text-white flex flex-col justify-between relative overflow-hidden">
                    {/* Abstract overlapping circles for depth */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-orange-400/20 blur-3xl"></div>

                    <div className="relative z-10 flex items-center gap-3 mb-10">
                        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm border border-white/20 shadow-lg">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight">DurgSetu AI</h1>
                    </div>

                    <div className="relative z-10 mb-10 md:mb-0">
                        <h2 className="text-4xl font-bold leading-tight mb-4">
                            Preserving Heritage with <span className="text-orange-200">Intelligence.</span>
                        </h2>
                        <p className="text-orange-100 text-lg leading-relaxed mb-8">
                            Sign in to access real-time structural analytics, manage verification workflows, and safeguard historical monuments.
                        </p>

                        <div className="bg-black/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                            <p className="text-sm font-medium text-orange-50 italic">
                                "Forts are the foundation of the kingdom" <br/>- Chhatrapati Shivaji Maharaj
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10 text-sm font-medium text-orange-200/80 mt-8 md:mt-0">
                        © 2026 Admin Portal
                    </div>
                </div>

                {/* Form Side (Right) */}
                <div className="md:w-7/12 p-10 sm:p-14 flex flex-col justify-center bg-white">
                    <div className="max-w-md w-full mx-auto">
                        <div className="mb-10">
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
                            <p className="text-slate-500 font-medium">Please enter your admin credentials to continue.</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 text-sm border border-red-100 shadow-sm animate-pulse">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
                                <p className="font-medium">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Username or Email</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-orange-500 text-slate-400">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                        className="pl-12 w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-slate-900 font-medium outline-none placeholder:text-slate-400"
                                        placeholder="admin@durgsetu.ai"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-bold text-slate-700">Password</label>
                                    <button type="button" className="text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors">Forgot password?</button>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-orange-500 text-slate-400">
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="pl-12 w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-slate-900 font-medium outline-none placeholder:text-slate-400"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl shadow-[0_8px_20px_-6px_rgba(249,115,22,0.5)] hover:shadow-[0_12px_25px_-6px_rgba(249,115,22,0.6)] transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer disabled:opacity-70 disabled:hover:translate-y-0 disabled:active:scale-100 mt-4"
                            >
                                {loading ? <Loader className="w-5 h-5 animate-spin" /> : <span>Access Admin Dashboard</span>}
                            </button>
                        </form>

                        <div className="mt-10 pt-6 border-t border-slate-100 text-center text-sm font-medium text-slate-500 flex flex-col items-center gap-4">
                            <p>
                                Don't have an admin account?{' '}
                                <button onClick={() => navigate('/register')} className="text-orange-600 hover:text-orange-700 font-bold transition-colors">
                                    Register here
                                </button>
                            </p>
                            <button onClick={() => navigate('/')} className="text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 cursor-pointer">
                                Return to Landing Page
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
