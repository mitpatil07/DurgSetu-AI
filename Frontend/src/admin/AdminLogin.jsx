import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, AlertCircle, Loader, User } from 'lucide-react';
import { API_BASE } from '../api';
import { useAuth } from '../context/AuthContext';
import AnimatedBackground from '../components/AnimatedBackground';

const AdminLogin = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, role: 'admin' }),
            });
            const data = await response.json();
            if (response.ok) {
                if (!data.is_staff) {
                    setError('Access denied. Admins only.');
                    return;
                }
                login(data);
                navigate('/admin/dashboard');
            } else {
                setError(data.error || 'Login failed');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <AnimatedBackground />
            <div className="w-full max-w-5xl glass-effect rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-800 relative z-10">

                {/* Brand Side */}
                <div className="w-full md:w-5/12 bg-gradient-to-br from-slate-800 to-slate-950 p-6 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-orange-500/10 blur-2xl"></div>
                    <div className="relative z-10 flex items-center gap-3 mb-4 sm:mb-10">
                        <Shield className="w-6 h-6 sm:w-10 sm:h-10 text-orange-500" />
                        <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">DurgSetu <span className="text-orange-500">Admin</span></h1>
                    </div>
                    <div className="relative z-10 hidden sm:block">
                        <h2 className="text-2xl font-bold leading-tight mb-4">Command Center</h2>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">Internal access for structural analysis and preservation management.</p>
                        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                            <p className="text-xs text-slate-400">Restricted Area: Authorized Personnel Only</p>
                        </div>
                    </div>
                    <div className="relative z-10 text-[10px] sm:text-sm font-medium text-slate-500">
                        © 2026 Admin Portal
                    </div>
                </div>

                {/* Form Side */}
                <div className="md:w-7/12 p-8 sm:p-14 flex flex-col justify-center bg-white">
                    <div className="max-w-md w-full mx-auto">
                        <div className="mb-6 sm:mb-10 text-center md:text-left">
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">Admin Portal</h2>
                            <p className="text-slate-500 text-sm">Secure Authentication Required</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 text-sm border border-red-100">
                                <AlertCircle className="w-5 h-5 text-red-500" />
                                <p className="font-medium">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Admin Username</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-orange-500" />
                                    <input type="text" name="username" value={formData.username} onChange={handleChange} required
                                        className="pl-12 w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-orange-500 transition-all outline-none"
                                        placeholder="Username" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-orange-500" />
                                    <input type="password" name="password" value={formData.password} onChange={handleChange} required
                                        className="pl-12 w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-orange-500 transition-all outline-none"
                                        placeholder="••••••••" />
                                </div>
                            </div>
                            <button type="submit" disabled={loading}
                                className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
                            >
                                {loading ? <Loader className="animate-spin" /> : <span>Authorize Access</span>}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                            <button onClick={() => navigate('/login')} className="text-slate-400 hover:text-slate-600 transition-colors text-xs font-bold uppercase tracking-widest">
                                ← Return to Role Selection
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
