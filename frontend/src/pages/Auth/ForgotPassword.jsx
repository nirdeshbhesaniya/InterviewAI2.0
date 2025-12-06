import React, { useState } from 'react';
import { Mail, ArrowLeft, Eye, EyeOff } from 'lucide-react';
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
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-6 space-y-6"
    >
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Reset Password</h2>
        <p className="text-sm text-gray-500 dark:text-gray-300">
          {step === 1 && 'Enter your email to receive a verification code'}
          {step === 2 && 'Enter the 6-digit OTP sent to your email'}
          {step === 3 && 'Create a new password'}
        </p>
      </div>

      {step === 1 && (
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-orange-600 hover:bg-orange-700 text-white py-2 font-semibold transition disabled:opacity-60"
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
          <p className="text-center text-sm ">
            Remember your password?{' '}
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="text-orange-600 hover:underline"
            >
              Login here
            </button>
          </p>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            className="w-full rounded-lg border border-border bg-background py-2 px-4 text-center text-lg tracking-widest focus:outline-none focus:ring focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-orange-600 hover:bg-orange-700 text-white py-2 font-semibold transition disabled:opacity-60"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="flex items-center justify-center gap-1 text-sm text-gray-600 hover:text-blue-600"
          >
            <ArrowLeft size={16} /> Back to Email
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-background py-2 px-4 focus:outline-none focus:ring focus:ring-blue-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-background py-2 px-4 focus:outline-none focus:ring focus:ring-blue-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-orange-600 hover:bg-orange-700 text-white py-2 font-semibold transition disabled:opacity-60"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
          <button
            type="button"
            onClick={() => setStep(2)}
            className="flex items-center justify-center gap-1 text-sm text-gray-600 hover:text-blue-600"
          >
            <ArrowLeft size={16} /> Back to OTP
          </button>
        </form>
      )}
    </motion.div>
  );
};

export default ForgotPassword;
