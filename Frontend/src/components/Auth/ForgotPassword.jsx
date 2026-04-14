import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle, Loader, CheckCircle, KeyRound } from 'lucide-react';
import { forgotPassword, verifyOTP, resetPassword } from '../../services/authService';

// Step indicator
const steps = ['Email', 'Verify OTP', 'New Password'];

const ForgotPassword = () => {
  const navigate = useNavigate();

  // Step: 1=email, 2=otp, 3=password
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpRefs = useRef([]);

  // ── OTP box helpers ──────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  // ── Step 1: send OTP ─────────────────────────────────────────
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setStep(2);
      startResendCooldown();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const t = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(t); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // ── Step 2: verify OTP ───────────────────────────────────────
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    const otpStr = otp.join('');
    if (otpStr.length < 6) { setError('Please enter the complete 6-digit OTP.'); return; }
    setLoading(true);
    try {
      const data = await verifyOTP(email.trim(), otpStr);
      setResetToken(data.reset_token);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setOtp(['', '', '', '', '', '']);
      startResendCooldown();
    } catch (err) {
      setError('Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: reset password ───────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (!password || !confirmPassword) { setError('Please fill in both fields.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await resetPassword(resetToken, password);
      setSuccess(true);
      setTimeout(() => navigate('/user/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Please start over.');
    } finally {
      setLoading(false);
    }
  };

  // ── Left panel content per step ──────────────────────────────
  const panelContent = [
    { heading: 'Account', accent: 'Recovery.', body: 'Enter your registered email address and we\'ll send you a 6-digit OTP to reset your password.' },
    { heading: 'Verify', accent: 'Your OTP.', body: `We've sent a 6-digit code to ${email}. Enter it below to continue.` },
    { heading: 'Set New', accent: 'Password.', body: 'Choose a strong, unique password to protect your DurgSetu AI account.' },
  ];
  const panel = panelContent[step - 1];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100">

        {/* ── Brand Side ──────────────────────────────── */}
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
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-8">
              {steps.map((s, i) => (
                <React.Fragment key={i}>
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i + 1 < step ? 'bg-white text-orange-600' :
                        i + 1 === step ? 'bg-white/30 border-2 border-white text-white' :
                          'bg-white/10 text-white/40'
                      }`}>
                      {i + 1 < step ? '✓' : i + 1}
                    </div>
                    <span className={`text-xs font-semibold hidden sm:block ${i + 1 === step ? 'text-white' : 'text-white/50'}`}>{s}</span>
                  </div>
                  {i < 2 && <div className={`flex-1 h-0.5 rounded ${i + 1 < step ? 'bg-white' : 'bg-white/20'}`} />}
                </React.Fragment>
              ))}
            </div>

            <h2 className="text-4xl font-bold leading-tight mb-4">
              {panel.heading} <span className="text-orange-200">{panel.accent}</span>
            </h2>
            <p className="text-orange-100 text-lg leading-relaxed mb-8">{panel.body}</p>

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

        {/* ── Form Side ───────────────────────────────── */}
        <div className="md:w-7/12 p-10 sm:p-14 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">

            {success ? (
              /* Success state */
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="bg-green-100 p-5 rounded-full">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-3">Password Reset!</h2>
                <p className="text-slate-500 font-medium mb-8">Your password has been updated. Redirecting to login...</p>
                <button onClick={() => navigate('/user/login')} className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl shadow-[0_8px_20px_-6px_rgba(249,115,22,0.5)] transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  Go to Login
                </button>
              </div>
            ) : (
              <>
                {/* Step heading */}
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-900 mb-1">
                    {step === 1 && 'Forgot Password?'}
                    {step === 2 && 'Enter OTP'}
                    {step === 3 && 'New Password'}
                  </h2>
                  <p className="text-slate-500 font-medium">
                    {step === 1 && "We'll send a 6-digit OTP to your email."}
                    {step === 2 && `Check ${email} for the 6-digit code.`}
                    {step === 3 && 'Choose a strong password to secure your account.'}
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 text-sm border border-red-100 shadow-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
                    <p className="font-medium">{error}</p>
                  </div>
                )}

                {/* ── Step 1: Email form ── */}
                {step === 1 && (
                  <form onSubmit={handleSendOTP} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-orange-500 text-slate-400">
                          <Mail className="h-5 w-5" />
                        </div>
                        <input
                          type="email" value={email} onChange={e => setEmail(e.target.value)}
                          required disabled={loading}
                          className="pl-12 w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-slate-900 font-medium outline-none placeholder:text-slate-400"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>
                    <button type="submit" disabled={loading}
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl shadow-[0_8px_20px_-6px_rgba(249,115,22,0.5)] transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer disabled:opacity-70 disabled:hover:translate-y-0">
                      {loading ? <Loader className="w-5 h-5 animate-spin" /> : <span>Send OTP</span>}
                    </button>
                  </form>
                )}

                {/* ── Step 2: OTP boxes ── */}
                {step === 2 && (
                  <form onSubmit={handleVerifyOTP} className="space-y-8">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-4 text-center">Enter 6-Digit OTP</label>
                      <div className="flex gap-3 justify-center" onPaste={handleOtpPaste}>
                        {otp.map((digit, i) => (
                          <input
                            key={i}
                            ref={el => otpRefs.current[i] = el}
                            type="text" inputMode="numeric" maxLength={1} value={digit}
                            onChange={e => handleOtpChange(i, e.target.value)}
                            onKeyDown={e => handleOtpKeyDown(i, e)}
                            disabled={loading}
                            className="w-12 h-14 text-center text-2xl font-bold bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all text-slate-900 disabled:opacity-60"
                          />
                        ))}
                      </div>
                      <div className="mt-4 text-center">
                        <button type="button" onClick={handleResend} disabled={resendCooldown > 0 || loading}
                          className="text-sm font-semibold text-orange-600 hover:text-orange-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors">
                          {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                        </button>
                      </div>
                    </div>
                    <button type="submit" disabled={loading || otp.join('').length < 6}
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl shadow-[0_8px_20px_-6px_rgba(249,115,22,0.5)] transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed">
                      {loading ? <Loader className="w-5 h-5 animate-spin" /> : <><KeyRound className="w-5 h-5" /><span>Verify OTP</span></>}
                    </button>
                    <button type="button" onClick={() => { setStep(1); setError(''); setOtp(['', '', '', '', '', '']); }}
                      className="w-full text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors">
                      ← Change email address
                    </button>
                  </form>
                )}

                {/* ── Step 3: New password ── */}
                {step === 3 && (
                  <form onSubmit={handleResetPassword} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-orange-500 text-slate-400">
                          <Lock className="h-5 w-5" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'} value={password}
                          onChange={e => setPassword(e.target.value)} required disabled={loading}
                          className="pl-12 pr-12 w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-slate-900 font-medium outline-none placeholder:text-slate-400"
                          placeholder="Min 8 characters"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600">
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Confirm Password</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-orange-500 text-slate-400">
                          <Lock className="h-5 w-5" />
                        </div>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)} required disabled={loading}
                          className="pl-12 pr-12 w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-slate-900 font-medium outline-none placeholder:text-slate-400"
                          placeholder="Confirm your password"
                        />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600">
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    <button type="submit" disabled={loading}
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl shadow-[0_8px_20px_-6px_rgba(249,115,22,0.5)] transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer disabled:opacity-70 disabled:hover:translate-y-0 mt-2">
                      {loading ? <Loader className="w-5 h-5 animate-spin" /> : <span>Reset Password</span>}
                    </button>
                  </form>
                )}

                {/* Back to login */}
                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                  <button onClick={() => navigate('/user/login')}
                    className="text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 cursor-pointer mx-auto text-sm font-medium">
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

export default ForgotPassword;
