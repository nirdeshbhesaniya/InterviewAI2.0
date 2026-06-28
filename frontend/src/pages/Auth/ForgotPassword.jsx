import React, { useState, useRef, useEffect } from 'react';
import { Mail, ArrowLeft, Eye, EyeOff, Shield, RefreshCw } from 'lucide-react';
import axios from '../../utils/axiosInstance';
import { API } from '../../utils/apiPaths';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setLoading(true);
    try {
      const res = await axios.post(API.FORGOT_PASSWORD, { email });
      toast.success(res.data.message);
      setStep(2);
      setTimer(600); // Start 10 min timer
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const digits = text.replace(/\D/g, '').slice(0, 6).split('');
        const newOtp = [...otp];
        digits.forEach((digit, i) => {
          if (i < 6) newOtp[i] = digit;
        });
        setOtp(newOtp);
        const lastIndex = Math.min(digits.length, 5);
        inputRefs[lastIndex].current?.focus();
      });
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 6).split('');
    const newOtp = [...otp];
    digits.forEach((digit, i) => {
      if (i < 6) newOtp[i] = digit;
    });
    setOtp(newOtp);
    const lastIndex = Math.min(digits.length, 5);
    inputRefs[lastIndex].current?.focus();
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) return toast.error('Please enter complete 6-digit OTP');
    setLoading(true);
    try {
      const res = await axios.post(API.VERIFY_OTP, { email, otp: otpString });
      toast.success(res.data.message);
      setResetToken(res.data.resetToken);
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      inputRefs[0].current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) return toast.error('Please fill all fields');
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const res = await axios.post(API.RESET_PASSWORD, {
        resetToken,
        newPassword,
      });
      toast.success(res.data.message);
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-body))] relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[rgb(var(--accent))]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-500/15 rounded-full blur-[150px] pointer-events-none hidden md:block" />

      <Link to="/" className="absolute top-6 left-6 md:top-10 md:left-10 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--accent))] flex items-center gap-2 transition-colors z-20 font-medium">
        <ArrowLeft className="w-5 h-5" />
        Back to Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-[rgb(var(--bg-card))]/80 backdrop-blur-xl border border-[rgb(var(--border-subtle))] rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[rgb(var(--accent))]/10 mb-4 shadow-inner border border-[rgb(var(--accent))]/20">
            {step === 1 && <Mail className="w-8 h-8 text-[rgb(var(--accent))]" />}
            {step === 2 && <Shield className="w-8 h-8 text-[rgb(var(--accent))]" />}
            {step === 3 && <RefreshCw className="w-8 h-8 text-[rgb(var(--accent))]" />}
          </div>
          <h2 className="text-3xl font-extrabold text-[rgb(var(--text-primary))] mb-2">
            {step === 1 && 'Reset Password'}
            {step === 2 && 'Verify OTP'}
            {step === 3 && 'New Password'}
          </h2>
          <p className="text-[rgb(var(--text-secondary))]">
            {step === 1 && 'Enter your email to receive a reset code'}
            {step === 2 && `We sent a 6-digit code to ${email}`}
            {step === 3 && 'Create a strong new password'}
          </p>
        </div>

        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-5">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))] w-5 h-5 group-focus-within:text-[rgb(var(--accent))] transition-colors" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-[rgb(var(--bg-elevated))]/50 border border-[rgb(var(--border-subtle))] rounded-xl text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/50 focus:border-[rgb(var(--accent))] transition-all shadow-sm"
                required
              />
            </div>
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-3.5 rounded-xl transition-all font-bold tracking-wide shadow-lg text-base flex justify-center items-center ${loading
                ? 'bg-[rgb(var(--text-muted))]/50 text-[rgb(var(--text-secondary))] cursor-not-allowed'
                : 'bg-gradient-to-r from-[rgb(var(--accent))] to-purple-500 hover:shadow-[0_0_20px_rgba(var(--accent),0.4)] text-white'
                }`}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Send Reset Code'}
            </motion.button>
            <p className="text-center text-sm text-[rgb(var(--text-secondary))] mt-4">
              Remember your password?{' '}
              <Link to="/login" className="text-[rgb(var(--accent))] hover:text-[rgb(var(--accent-hover))] font-bold transition-colors">
                Login here
              </Link>
            </p>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            {/* Split OTP Inputs */}
            <div className="flex justify-center gap-2 sm:gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-14 text-center text-xl font-bold bg-[rgb(var(--bg-elevated))]/50 border-2 border-[rgb(var(--border-subtle))] rounded-xl text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/50 focus:border-[rgb(var(--accent))] transition-all shadow-sm"
                  disabled={loading}
                />
              ))}
            </div>

            {/* Timer */}
            <div className="text-center">
              {timer > 0 ? (
                <p className="text-sm text-[rgb(var(--text-muted))]">
                  Code expires in <span className="font-semibold text-[rgb(var(--accent))]">{formatTime(timer)}</span>
                </p>
              ) : (
                <p className="text-sm text-red-500 font-semibold">⚠️ Code expired</p>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-3.5 rounded-xl transition-all font-bold tracking-wide shadow-lg text-base flex justify-center items-center ${loading || otp.join('').length !== 6
                ? 'bg-[rgb(var(--text-muted))]/30 text-[rgb(var(--text-secondary))] cursor-not-allowed'
                : 'bg-gradient-to-r from-[rgb(var(--accent))] to-purple-500 hover:shadow-[0_0_20px_rgba(var(--accent),0.4)] text-white'
                }`}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Verify Code'}
            </motion.button>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp(['', '', '', '', '', '']);
              }}
              className="flex items-center justify-center gap-1 text-sm text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent))] transition-colors w-full mt-4 font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Email
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="relative group">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-4 pr-12 py-3.5 bg-[rgb(var(--bg-elevated))]/50 border border-[rgb(var(--border-subtle))] rounded-xl text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/50 focus:border-[rgb(var(--accent))] transition-all shadow-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent))] transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="relative group">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-4 pr-12 py-3.5 bg-[rgb(var(--bg-elevated))]/50 border border-[rgb(var(--border-subtle))] rounded-xl text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/50 focus:border-[rgb(var(--accent))] transition-all shadow-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent))] transition-colors"
              >
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-3.5 rounded-xl transition-all font-bold tracking-wide shadow-lg text-base flex justify-center items-center ${loading
                ? 'bg-[rgb(var(--text-muted))]/50 text-[rgb(var(--text-secondary))] cursor-not-allowed'
                : 'bg-gradient-to-r from-[rgb(var(--accent))] to-purple-500 hover:shadow-[0_0_20px_rgba(var(--accent),0.4)] text-white'
                }`}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Reset Password'}
            </motion.button>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex items-center justify-center gap-1 text-sm text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent))] transition-colors w-full mt-4 font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Back to OTP
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
