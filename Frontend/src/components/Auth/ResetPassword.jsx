import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Alert from '../UI/Alert';
import { resetPassword } from '../../services/authService';
import { Eye, EyeOff } from 'lucide-react';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setAlert({ type: 'error', title: 'Error', message: 'Please fill in all fields' });
      return;
    }

    if (password.length < 8) {
      setAlert({ type: 'error', title: 'Error', message: 'Password must be at least 8 characters' });
      return;
    }

    if (password !== confirmPassword) {
      setAlert({ type: 'error', title: 'Error', message: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setAlert({
        type: 'success',
        title: 'Success',
        message: 'Password reset successful. Redirecting to login...',
      });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setAlert({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.message || 'Failed to reset password',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <Alert type="error" title="Invalid Link" message="Password reset link is invalid or expired" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Reset Password</h1>
        <p className="text-slate-600 mb-8">Enter your new password below</p>

        {alert && (
          <Alert
            type={alert.type}
            title={alert.title}
            message={alert.message}
            onClose={() => setAlert(null)}
            dismissible
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-700"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
