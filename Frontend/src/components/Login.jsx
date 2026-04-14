import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, AlertCircle, Loader } from 'lucide-react';
import { API_BASE } from '../api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
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
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (response.ok) {
                if (data.is_staff) {
                    setError('User not found');
                    return;
                }
                login(data);
                navigate('/user/dashboard');
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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100">

                {/* Brand Side - Compact on Mobile */}
                <div className="w-full md:w-5/12 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 p-6 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl"></div>
                    <div className="relative z-10 flex items-center gap-3 mb-4 sm:mb-10">
                        <Shield className="w-6 h-6 sm:w-10 sm:h-10 text-white" />
                        <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">DurgSetu AI</h1>
                    </div>
                    <div className="relative z-10 hidden sm:block">
                        <h2 className="text-3xl font-bold leading-tight mb-4 text-orange-50">
                            Preserving Heritage with Intelligence.
                        </h2>
                        <div className="bg-black/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                            <p className="text-sm font-medium italic">"Forts are the foundation of the kingdom" - Shivaji Maharaj</p>
                        </div>
                    </div>
                    <div className="relative z-10 text-[10px] sm:text-sm font-medium text-orange-200/80">
                        © 2026 User Portal
                    </div>
                </div>

                {/* Form Side */}
                <div className="md:w-7/12 p-8 sm:p-14 flex flex-col justify-center bg-white">
                    <div className="max-w-md w-full mx-auto">
                        <div className="mb-6 sm:mb-10 text-center md:text-left">
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 leading-tight">Welcome Back</h2>
                            <p className="text-slate-500 text-sm sm:font-medium">User Login</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 text-sm border border-red-100">
                                <AlertCircle className="w-5 h-5 text-red-500" />
                                <p className="font-medium">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Username</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-orange-500" />
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
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
                            >
                                {loading ? <Loader className="animate-spin" /> : 'Sign In'}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs sm:text-sm">
                            <p className="text-slate-500 mb-4">No account? <button onClick={() => navigate('/register')} className="text-orange-600 font-bold">Register</button></p>
                            <button onClick={() => navigate('/login')} className="text-slate-400 hover:text-slate-600 transition-colors uppercase font-bold tracking-wider">← Role Selection</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
