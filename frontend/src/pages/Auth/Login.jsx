import React, { useState, useContext } from 'react';
import axios from '../../utils/axiosInstance';
import { API } from '../../utils/apiPaths';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { UserContext } from '../../context/UserContext.jsx';

const Login = ({ onSwitch, onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(API.LOGIN, { email, password });
      const userData = res.data.user;
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      toast.success('✅ Login successful!');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      toast.error(err?.response?.data?.message || '❌ Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-bg-card shadow-xl shadow-primary/10 rounded-2xl p-6 border border-border-subtle">
      <h2 className="text-2xl font-bold text-center text-highlight mb-1">Welcome Back 👋</h2>
      <p className="text-sm text-text-muted text-center mb-6">Login with your account below</p>

      <form className="space-y-5" onSubmit={handleLogin}>
        {/* Email Field */}
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-bg-body border border-border-subtle rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>

        {/* Password Field */}
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
          <input
            type={showPass ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-bg-body border border-border-subtle rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-highlight"
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
            className="text-sm text-highlight hover:text-pink-500 transition-colors"
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
              ? 'bg-text-muted/50 text-text-secondary cursor-not-allowed'
              : 'bg-gradient-to-r from-highlight to-pink-500 hover:shadow-lg hover:shadow-highlight/50 text-white'
            }`}
        >
          {loading ? 'Logging in...' : 'LOGIN'}
        </motion.button>
      </form>

      <p className="text-sm text-center mt-4 text-text-secondary">
        New here?{' '}
        <button
          onClick={onSwitch}
          className="text-highlight hover:text-pink-500 font-medium transition-colors"
        >
          Create an account
        </button>
      </p>
    </div>
  );
};

export default Login;
