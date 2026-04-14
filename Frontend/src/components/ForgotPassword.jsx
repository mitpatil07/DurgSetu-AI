import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, AlertCircle, Loader, CheckCircle, ArrowLeft, KeyRound } from 'lucide-react';
import { API_BASE } from '../api';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE}/forgot-password/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setStep(2);
            } else {
                setError(data.error || 'Failed to send OTP');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE}/verify-otp/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp_code: otp, otp_type: 'reset' }),
            });

            const data = await response.json();

            if (response.ok) {
                setStep(3);
            } else {
                setError(data.error || 'Invalid OTP');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE}/reset-password/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp_code: otp, new_password: newPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => navigate('/user/login'), 2000);
            } else {
                setError(data.error || 'Failed to reset password');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Password Reset Successful!</h2>
                    <p className="text-slate-500 mb-6">Redirecting to login...</p>
                </div>
            </div>
        );
    }

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
                            Reset Your <span className="text-orange-200">Password</span>
                        </h2>
                        <p className="text-orange-100 text-lg leading-relaxed">
                            {step === 1 && "Enter your email to receive a password reset code."}
                            {step === 2 && "Check your email for the 6-digit verification code."}
                            {step === 3 && "Create a new secure password for your account."}
                        </p>
                    </div>

                    {/* Step Indicator */}
                    <div className="relative z-10 flex items-center gap-3 mt-8">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className={`flex items-center gap-2 ${s <= step ? 'opacity-100' : 'opacity-40'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${s === step ? 'bg-white text-orange-600' : s < step ? 'bg-orange-300 text-white' : 'bg-white/30 text-white'}`}>
                                    {s < step ? '✓' : s}
                                </div>
                                {s < 3 && <div className={`w-8 h-0.5 ${s < step ? 'bg-orange-300' : 'bg-white/30'}`} />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Side */}
                <div className="md:w-7/12 p-10 sm:p-14 flex flex-col justify-center bg-white">
                    <div className="max-w-md w-full mx-auto">

                        <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/user/login')} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-6 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> {step > 1 ? 'Back' : 'Back to Login'}
                        </button>

                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">
                                {step === 1 && "Forgot Password"}
                                {step === 2 && "Verify OTP"}
                                {step === 3 && "New Password"}
                            </h2>
                            <p className="text-slate-500 font-medium">
                                {step === 1 && "Enter your email address below."}
                                {step === 2 && "Enter the 6-digit code sent to your email."}
                                {step === 3 && "Create your new password."}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 text-sm border border-red-100">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
                                <p className="font-medium">{error}</p>
                            </div>
                        )}

                        {step === 1 && (
                            <form onSubmit={handleSendOTP} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-500">
                                            <Mail className="h-5 w-5" />
                                        </div>
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                                            className="pl-12 w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-slate-900 font-medium outline-none placeholder:text-slate-400"
                                            placeholder="you@example.com" />
                                    </div>
                                </div>

                                <button type="submit" disabled={loading}
                                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-70">
                                    {loading ? <Loader className="w-5 h-5 animate-spin" /> : "Send Reset Code"}
                                </button>
                            </form>
                        )}

                        {step === 2 && (
                            <form onSubmit={handleVerifyOTP} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Enter OTP Code</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-500">
                                            <KeyRound className="h-5 w-5" />
                                        </div>
                                        <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} required maxLength={6}
                                            className="pl-12 w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-