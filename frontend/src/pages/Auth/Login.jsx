import React, { useState, useContext } from 'react';
import axios from '../../utils/axiosInstance';
import { API } from '../../utils/apiPaths';
import { toast } from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';
import { UserContext } from '../../context/UserContext.jsx';
import VerifyOTP from './VerifyOTP.jsx';

const Login = () => {
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
      console.error('LOGIN ERROR DEBUG:', err);
      console.error('LOGIN ERROR RESPONSE:', err.response);

      const errorData = err.response?.data;
      const errorMessage = errorData?.message || 'Login failed';

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
    <div className="min-h-screen bg-[rgb(var(--bg-body))] relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[rgb(var(--accent))]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-500/15 rounded-full blur-[150px] pointer-events-none hidden md:block" />

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
            <Lock className="w-8 h-8 text-[rgb(var(--accent))]" />
          </div>
          <h2 className="text-3xl font-extrabold text-[rgb(var(--text-primary))] mb-2">Welcome Back</h2>
          <p className="text-[rgb(var(--text-secondary))]">Sign in to continue your journey</p>
        </div>

        <form className="space-y-5" onSubmit={handleLogin}>
          {/* Email Field */}
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))] w-5 h-5 group-focus-within:text-[rgb(var(--accent))] transition-colors" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-[rgb(var(--bg-elevated))]/50 border border-[rgb(var(--border-subtle))] rounded-xl text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/50 focus:border-[rgb(var(--accent))] transition-all shadow-sm"
              required
            />
          </div>

          {/* Password Field */}
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))] w-5 h-5 group-focus-within:text-[rgb(var(--accent))] transition-colors" />
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 bg-[rgb(var(--bg-elevated))]/50 border border-[rgb(var(--border-subtle))] rounded-xl text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/50 focus:border-[rgb(var(--accent))] transition-all shadow-sm"
              required
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent))] transition-colors"
              onClick={() => setShowPass((prev) => !prev)}
            >
              {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm font-semibold text-[rgb(var(--accent))] hover:text-[rgb(var(--accent-hover))] transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className={`w-full py-3.5 rounded-xl transition-all font-bold tracking-wide shadow-lg text-base flex justify-center items-center ${loading
              ? 'bg-[rgb(var(--text-muted))]/50 text-[rgb(var(--text-secondary))] cursor-not-allowed'
              : 'bg-gradient-to-r from-[rgb(var(--accent))] to-purple-500 hover:shadow-[0_0_20px_rgba(var(--accent),0.4)] text-white'
              }`}
          >
            {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : 'Sign In'}
          </motion.button>
        </form>

        <p className="text-sm text-center mt-8 text-[rgb(var(--text-secondary))]">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="text-[rgb(var(--accent))] hover:text-[rgb(var(--accent-hover))] font-bold transition-colors"
          >
            Create one now
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
