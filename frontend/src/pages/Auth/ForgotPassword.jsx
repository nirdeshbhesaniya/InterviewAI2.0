import React, { useState } from 'react';
import { Mail, ArrowLeft, Eye, EyeOff, Bot, Shield } from 'lucide-react';
import axios from '../../utils/axiosInstance';
import { API } from '../../utils/apiPaths';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const ForgotPassword = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setLoading(true);
    try {
      const res = await axios.post(API.FORGOT_PASSWORD, { email });
      toast.success(res.data.message);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) return toast.error('Please enter the OTP');
    setLoading(true);
    try {
      const res = await axios.post(API.VERIFY_OTP, { email, otp });
      toast.success(res.data.message);
      setResetToken(res.data.resetToken);
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
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
      {/* Header with Bot Icon */}
      {/* <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="relative">
            <Bot className="w-12 h-12 text-[rgb(var(--accent))] drop-shadow-lg" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[rgb(var(--accent))] rounded-full animate-pulse"></div>
          </div>
          <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))]">
            Interview<span className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent">AI</span>
          </h1>
        </div>
        <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))] mb-2 flex items-center justify-center gap-2">
          <Shield className="w-6 h-6 text-blue-500" /> Reset Password
        </h2>
        <p className="text-sm text-[rgb(var(--text-muted))]">
          {step === 1 && 'Enter your email to receive a verification code'}
          {step === 2 && 'Enter the 6-digit OTP sent to your email'}
          {step === 3 && 'Create a new password'}
        </p>
      </motion.div> */}

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
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-body-alt))] py-2.5 px-4 text-center text-base tracking-widest text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent"
              required
            />
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-2.5 rounded-lg text-sm transition font-bold tracking-wide shadow-lg bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white disabled:opacity-60"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </motion.button>
            <button
              type="button"
              onClick={() => setStep(1)}
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
