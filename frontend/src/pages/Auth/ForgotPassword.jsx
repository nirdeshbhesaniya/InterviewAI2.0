import React, { useState, useRef, useEffect } from 'react';
import { Mail, ArrowLeft, Eye, EyeOff, Bot, Shield, RefreshCw } from 'lucide-react';
import axios from '../../utils/axiosInstance';
import { API } from '../../utils/apiPaths';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const ForgotPassword = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  // OTP state as array for split input (6 digits for password reset)
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [loading, setLoading] = useState(false);

  // Refs for OTP inputs
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

  // Timer logic for OTP step
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

  // Handle OTP Input Changes
  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const digits = text.replace(/\D/g, '').slice(0, 6).split('');
        const newOtp = [...otp];
        digits.forEach((digit, i) => {
          if (i < 6) newOtp[i] = digit;
        });
        setOtp(newOtp);
        // Focus last filled input
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
      // Clear OTP on error
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
      onNavigate('login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[380px] sm:max-w-[420px] mx-auto px-3 sm:px-0">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[rgb(var(--bg-elevated))] shadow-lg rounded-xl p-5 sm:p-6 border border-[rgb(var(--border))]"
      >

        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-3.5 sm:space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))] w-4 h-4" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-body-alt))] py-2.5 pl-9 pr-4 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent"
                required
              />
            </div>
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-2.5 rounded-lg text-sm transition font-bold tracking-wide shadow-lg bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white disabled:opacity-60"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </motion.button>
            <p className="text-center text-xs text-[rgb(var(--text-secondary))]">
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="text-[rgb(var(--accent))] hover:text-[rgb(var(--accent-hover))] font-semibold transition-colors"
              >
                Login here
              </button>
            </p>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-3.5 sm:space-y-4">

            <div className="text-center mb-4">
              <h3 className="text-base font-semibold text-[rgb(var(--text-primary))]">Enter Verification Code</h3>
              <p className="text-xs text-[rgb(var(--text-muted))] mt-1">We sent a 6-digit code to {email}</p>
            </div>

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
                  className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg sm:text-lg font-bold bg-[rgb(var(--bg-body-alt))] border-2 border-[rgb(var(--border))] rounded-lg text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent transition"
                  disabled={loading}
                />
              ))}
            </div>

            {/* Timer */}
            <div className="text-center">
              {timer > 0 ? (
                <p className="text-xs text-[rgb(var(--text-muted))]">
                  Code expires in <span className="font-semibold text-[rgb(var(--accent))]">{formatTime(timer)}</span>
                </p>
              ) : (
                <p className="text-xs text-red-500 font-semibold">⚠️ Code expired</p>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={`w-full py-2.5 rounded-lg text-sm transition font-bold tracking-wide shadow-lg text-white disabled:opacity-60 ${loading || otp.join('').length !== 6 ? 'bg-[rgb(var(--text-muted))]/50 cursor-not-allowed' : 'bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))]'}`}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </motion.button>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp(['', '', '', '', '', '']);
              }}
              className="flex items-center justify-center gap-1 text-xs text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent))] transition-colors w-full"
            >
              <ArrowLeft className="w-3 h-3" /> Back to Email
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-3.5 sm:space-y-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-body-alt))] py-2.5 px-4 pr-10 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent))]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-body-alt))] py-2.5 px-4 pr-10 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent))]"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-2.5 rounded-lg text-sm transition font-bold tracking-wide shadow-lg bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white disabled:opacity-60"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </motion.button>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex items-center justify-center gap-1 text-xs text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent))] transition-colors w-full"
            >
              <ArrowLeft className="w-3 h-3" /> Back to OTP
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
