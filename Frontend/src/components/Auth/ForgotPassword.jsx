import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../UI/Alert';
import { forgotPassword } from '../../services/authService';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setAlert({ type: 'error', title: 'Error', message: 'Please enter your email address' });
      return;
    }

    setLoading(true);
    try {
      const response = await forgotPassword(email);
      setAlert({
        type: 'success',
        title: 'Success',
        message: 'Check your email for password reset instructions',
      });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setAlert({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.message || 'Failed to send reset email',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Forgot Password?</h1>
        <p className="text-slate-600 mb-8">Enter your email and we'll send you a reset link</p>

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
            <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPassword;
