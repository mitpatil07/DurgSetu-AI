import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, Lock, Eye, EyeOff, AlertCircle, Loader, CheckCircle } from 'lucide-react';
import { resetPassword } from '../../services/authService';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate('/user/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Your link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  // Invalid token page
  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 text-center border border-slate-100">
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 p-5 rounded-full">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Invalid Reset Link</h2>
          <p className="text-slate-500 mb-8">This password reset link is invalid or has expired. Please request a new one.</p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl shadow-[0_8px_20px_-6px_rgba(249,115,22,0.5)] transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          >
            Request New Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100">

        {/* Brand Side */}
        <div className="md:w-5/12 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 p-10 text-white flex flex-col justify-between relative overflow-hidden">
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
              Set New <span className="text-orange-200">Password.</span>
            </h2>
            <p className="text-orange-100 text-lg leading-relaxed mb-8">
              Choose a strong, unique password to protect your DurgSetu AI account and heritage data.
            </p>

            <div className="bg-black/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
              <p className="text-sm font-medium text-orange-50 italic">
                "Forts are the foundation of the kingdom" <br />- Chhatrapati Shivaji Maharaj
              </p>
            </div>
          </div>

          <div className="relative z-10 text-sm font-medium text-orange-200/80 mt-8 md:mt-0">
            © 2026 DurgSetu AI
          </div>
        </div>

        {/* Form Side */}
        <div className="md:w-7/12 p-10 sm:p-14 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">

            {success ? (
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="bg-green-100 p-5 rounded-full">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-3">Password Reset!</h2>
                <p className="text-slate-500 font-medium mb-8">
                  Your password has been updated. Redirecting to login...
                </p>
                <button
                  onClick={() => navigate('/user/login')}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl shadow-[0_8px_20px_-6px_rgba(249,115,22,0.5)] transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                >
                  Go to Login
                </button>
              </div>
            ) : (
              <>
                <div className="mb-10">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Reset Password</h2>
                  <p className="text-slate-500 font-medium">Enter and confirm your new password below.</p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 text-sm border border-red-100 shadow-sm animate-pulse">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
                    <p className="font-medium">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-orange-500 text-slate-400">
                        <Lock className="h-5 w-5" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        className="pl-12 pr-12 w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-slate-900 font-medium outline-none placeholder:text-slate-400"
                        placeholder="Min 8 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Confirm Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-orange-500 text-slate-400">
                        <Lock className="h-5 w-5" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={loading}
                        className="pl-12 pr-12 w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-slate-900 font-medium outline-none placeholder:text-slate-400"
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl shadow-[0_8px_20px_-6px_rgba(249,115,22,0.5)] hover:shadow-[0_12px_25px_-6px_rgba(249,115,22,0.6)] transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer disabled:opacity-70 disabled:hover:translate-y-0 disabled:active:scale-100 mt-2"
                  >
                    {loading ? <Loader className="w-5 h-5 animate-spin" /> : <span>Reset Password</span>}
                  </button>
                </form>

                <div className="mt-10 pt-6 border-t border-slate-100 text-center text-sm font-medium text-slate-500">
                  <button
                    onClick={() => navigate('/user/login')}
                    className="text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 cursor-pointer mx-auto"
                  >
                    ← Back to Login
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResetPassword;
