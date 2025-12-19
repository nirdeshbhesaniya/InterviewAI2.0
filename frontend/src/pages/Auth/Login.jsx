import React, { useState, useContext } from 'react';
import axios from '../../utils/axiosInstance';
import { API } from '../../utils/apiPaths';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { UserContext } from '../../context/UserContext.jsx';
import VerifyOTP from './VerifyOTP.jsx';

const Login = ({ onSwitch, onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(API.LOGIN, { email, password });
      const userData = res.data.user;

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', res.data.token);
      setUser(userData);

      toast.success('✅ Login successful!');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      const errorData = err.response?.data;
      const errorMessage = errorData?.message || 'Login failed';
      
      // Check if email verification is required
      if (errorData?.requiresVerification) {
        toast.error('⚠️ ' + errorMessage);
        setUnverifiedEmail(errorData.email || email);
        setShowOTPVerification(true);
      } else {
        toast.error('❌ ' + errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerified = () => {
    toast.success('🎉 Email verified! Please login now.');
    setShowOTPVerification(false);
    setUnverifiedEmail('');
  };

  const handleBackToLogin = () => {
    setShowOTPVerification(false);
    setUnverifiedEmail('');
  };

  // Show OTP verification if needed
  if (showOTPVerification) {
    return (
      <VerifyOTP 
        email={unverifiedEmail} 
        onBack={handleBackToLogin}
        onVerified={handleVerified}
      />
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-[rgb(var(--bg-card))] shadow-lg rounded-2xl p-6 border border-[rgb(var(--border))]">
      <h2 className="text-2xl font-bold text-center text-[rgb(var(--accent))] mb-1">Welcome Back 👋</h2>
      <p className="text-sm text-[rgb(var(--text-muted))] text-center mb-6">Login with your account below</p>

      <form className="space-y-5" onSubmit={handleLogin}>
        {/* Email Field */}
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))] w-5 h-5" />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[rgb(var(--bg-body-alt))] border border-[rgb(var(--border))] rounded-md text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent"
            required
          />
        </div>

        {/* Password Field */}
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))] w-5 h-5" />
          <input
            type={showPass ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-[rgb(var(--bg-body-alt))] border border-[rgb(var(--border))] rounded-md text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent"
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent))]"
            onClick={() => setShowPass((prev) => !prev)}
          >
            {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {/* Forgot Password Link */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-[rgb(var(--accent))] hover:text-[rgb(var(--accent-hover))] transition-colors"
          >
            Forgot password?
          </button>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          whileTap={{ scale: 0.97 }}
          disabled={loading}
          className={`w-full py-2 rounded-md transition font-semibold tracking-wide shadow-md ${loading
            ? 'bg-[rgb(var(--text-muted))]/50 text-[rgb(var(--text-secondary))] cursor-not-allowed'
            : 'bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] hover:shadow-lg text-white'
            }`}
        >
          {loading ? 'Logging in...' : 'LOGIN'}
        </motion.button>
      </form>

      <p className="text-sm text-center mt-4 text-[rgb(var(--text-secondary))]">
        New here?{' '}
        <button
          onClick={onSwitch}
          className="text-[rgb(var(--accent))] hover:text-[rgb(var(--accent-hover))] font-medium transition-colors"
        >
          Create an account
        </button>
      </p>
    </div>
  );
};

export default Login;
