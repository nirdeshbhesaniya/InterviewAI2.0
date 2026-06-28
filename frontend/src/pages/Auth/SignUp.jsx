import React, { useState, useContext } from 'react';
import { Eye, EyeOff, Mail, User, Upload, Lock, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { UserContext } from '../../context/UserContext.jsx';
import axios from '../../utils/axiosInstance';
import { API } from '../../utils/apiPaths';
import { useNavigate, Link } from 'react-router-dom';
import VerifyOTP from './VerifyOTP.jsx';

const SignUp = () => {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // ─ Password strength helpers ───────────────────────────────────
  const pwdChecks = [
    { label: 'At least 8 characters',      test: (p) => p.length >= 8 },
    { label: 'One uppercase letter (A-Z)',  test: (p) => /[A-Z]/.test(p) },
    { label: 'One lowercase letter (a-z)', test: (p) => /[a-z]/.test(p) },
    { label: 'One number (0-9)',            test: (p) => /[0-9]/.test(p) },
    { label: 'One special character (!@#$)', test: (p) => /[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?`~]/.test(p) },
  ];
  const passedChecks = pwdChecks.filter(c => c.test(password)).length;
  const strengthLabel = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][passedChecks];
  const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'][passedChecks];

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('❌ Only JPEG, JPG, and PNG images are allowed!');
        e.target.value = ''; // Clear the input
        return;
      }

      // Validate file size (5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        toast.error('❌ Image file is too large. Maximum size is 5MB.');
        e.target.value = ''; // Clear the input
        return;
      }

      setPhotoPreview(URL.createObjectURL(file));
      setPhotoFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agreeToTerms) {
      toast.error('❌ You must agree to the Terms and Conditions and Privacy Policy.');
      return;
    }

    setLoading(true);

    // ── Full name check ────────────────────────────────────────
    if (!fullName.trim() || fullName.trim().length < 2) {
      toast.error('❌ Full name must be at least 2 characters.');
      setLoading(false); return;
    }
    if (!/^[a-zA-Z\s'\-.]+$/.test(fullName.trim())) {
      toast.error("❌ Full name may only contain letters, spaces, hyphens, and apostrophes.");
      setLoading(false); return;
    }

    // ── Username check ───────────────────────────────────────
    if (!username.trim() || username.length < 3) {
      toast.error('❌ Username must be at least 3 characters.');
      setLoading(false); return;
    }
    if (!/^[a-z0-9_]+$/.test(username)) {
      toast.error('❌ Username: letters, numbers, underscores only.');
      setLoading(false); return;
    }
    if (username.startsWith('_') || username.endsWith('_')) {
      toast.error('❌ Username cannot start or end with an underscore.');
      setLoading(false); return;
    }

    // ── Password strength check ────────────────────────────────
    if (passedChecks < 5) {
      toast.error('❌ Password is too weak. Please meet all 5 requirements below.');
      setLoading(false); return;
    }

    try {
      const formData = new FormData();
      formData.append('fullName', fullName);
      formData.append('username', username.trim().toLowerCase());
      formData.append('email', email);
      formData.append('password', password);
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      console.log('📤 Sending registration request...');
      const res = await axios.post(API.REGISTER, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('📥 Registration response:', res.data);

      if (res.data.requiresVerification) {
        console.log('✅ Email verification required');
        toast.success('✅ Verification code sent to your email!');
        setShowOTPVerification(true);
      } else {
        // Fallback in case old flow is still used
        console.log('ℹ️ Using old registration flow (no verification)');
        const userData = res.data.user;
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', res.data.token);
        setUser(userData);
        toast.success('✅ Registration successful!');
        setTimeout(() => navigate('/dashboard'), 1000);
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);

      // Handle specific error messages
      let errorMessage = 'Registration failed';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message === 'Network Error') {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error('❌ ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerified = () => {
    toast.success('🎉 Account created successfully! Please login.');
    setTimeout(() => {
      navigate('/login'); // Switch to login page
    }, 1500);
  };

  const handleBackToSignup = () => {
    setShowOTPVerification(false);
  };

  // Show OTP verification if needed
  if (showOTPVerification) {
    return (
      <VerifyOTP
        email={email}
        onBack={handleBackToSignup}
        onVerified={handleVerified}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-body))] relative flex items-center justify-center p-4 overflow-hidden py-12">
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
        className="w-full max-w-lg bg-[rgb(var(--bg-card))]/80 backdrop-blur-xl border border-[rgb(var(--border-subtle))] rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 my-auto"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[rgb(var(--accent))]/10 mb-4 shadow-inner border border-[rgb(var(--accent))]/20">
            <User className="w-8 h-8 text-[rgb(var(--accent))]" />
          </div>
          <h2 className="text-3xl font-extrabold text-[rgb(var(--text-primary))] mb-2">Create an Account</h2>
          <p className="text-[rgb(var(--text-secondary))]">Join us and start your journey today</p>
        </div>

        {/* Profile Upload */}
        <div className="flex justify-center mb-8">
          <label className="relative cursor-pointer group">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-[rgb(var(--bg-card))] shadow-[0_0_15px_rgba(var(--accent),0.3)] transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[rgb(var(--bg-elevated))]/80 flex flex-col items-center justify-center border-2 border-dashed border-[rgb(var(--border-subtle))] group-hover:border-[rgb(var(--accent))] group-hover:bg-[rgb(var(--accent))]/5 transition-all">
                <Upload className="text-[rgb(var(--text-muted))] group-hover:text-[rgb(var(--accent))] w-6 h-6 mb-1 transition-colors" />
                <span className="text-[10px] text-[rgb(var(--text-muted))] group-hover:text-[rgb(var(--accent))] transition-colors font-medium">Upload</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
            {photoPreview && (
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="text-white w-6 h-6" />
              </div>
            )}
          </label>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))] w-5 h-5 group-focus-within:text-[rgb(var(--accent))] transition-colors" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full Name"
              required
              className="w-full pl-12 pr-4 py-3.5 bg-[rgb(var(--bg-elevated))]/50 border border-[rgb(var(--border-subtle))] rounded-xl text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/50 focus:border-[rgb(var(--accent))] transition-all shadow-sm"
            />
          </div>

          {/* Username & Email Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Username */}
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))] w-5 h-5 group-focus-within:text-[rgb(var(--accent))] transition-colors flex items-center justify-center font-bold text-lg pointer-events-none">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="username"
                required
                minLength={3}
                maxLength={20}
                className="w-full pl-12 pr-4 py-3.5 bg-[rgb(var(--bg-elevated))]/50 border border-[rgb(var(--border-subtle))] rounded-xl text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/50 focus:border-[rgb(var(--accent))] transition-all shadow-sm"
              />
            </div>

            {/* Email */}
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))] w-5 h-5 group-focus-within:text-[rgb(var(--accent))] transition-colors" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                required
                className="w-full pl-12 pr-4 py-3.5 bg-[rgb(var(--bg-elevated))]/50 border border-[rgb(var(--border-subtle))] rounded-xl text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/50 focus:border-[rgb(var(--accent))] transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Password */}
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))] w-5 h-5 group-focus-within:text-[rgb(var(--accent))] transition-colors" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 8 chars, uppercase, number, symbol"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              maxLength={128}
              className="w-full pl-12 pr-12 py-3.5 bg-[rgb(var(--bg-elevated))]/50 border border-[rgb(var(--border-subtle))] rounded-xl text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/50 focus:border-[rgb(var(--accent))] transition-all shadow-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent))] transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Password strength meter */}
          {password.length > 0 && (
            <div className="space-y-2 p-3 bg-[rgb(var(--bg-body-alt))]/50 rounded-lg border border-[rgb(var(--border-subtle))]">
              {/* Bar */}
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-1.5 flex-1 rounded-full transition-all duration-300"
                    style={{ backgroundColor: i <= passedChecks ? strengthColor : 'rgba(128,128,128,0.2)' }}
                  />
                ))}
              </div>
              {/* Label */}
              <p className="text-xs font-semibold" style={{ color: strengthColor }}>
                {strengthLabel} Password
              </p>
              {/* Checklist */}
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-2">
                {pwdChecks.map((c, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-[11px] sm:text-xs"
                    style={{ color: c.test(password) ? '#22c55e' : 'rgb(var(--text-muted))' }}
                  >
                    <div className={`w-3 h-3 rounded-full flex items-center justify-center ${c.test(password) ? 'bg-green-500/20' : 'bg-[rgb(var(--text-muted))]/10'}`}>
                       {c.test(password) && <span className="text-green-500 text-[8px]">✓</span>}
                    </div>
                    {c.label}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Terms and Conditions Checkbox */}
          <div className="flex items-start gap-3 py-2">
            <input
              type="checkbox"
              id="terms"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-[rgb(var(--border))] text-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] bg-[rgb(var(--bg-body-alt))] cursor-pointer"
            />
            <label htmlFor="terms" className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed cursor-pointer select-none">
              I agree to the{' '}
              <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="text-[rgb(var(--accent))] hover:underline font-medium">
                Terms and Conditions
              </a>{' '}
              and{' '}
              <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[rgb(var(--accent))] hover:underline font-medium">
                Privacy Policy
              </a>
            </label>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading || !agreeToTerms}
            className={`w-full py-3.5 rounded-xl transition-all font-bold tracking-wide shadow-lg text-base flex justify-center items-center ${loading || !agreeToTerms
              ? 'bg-[rgb(var(--text-muted))]/30 text-[rgb(var(--text-secondary))] cursor-not-allowed'
              : 'bg-gradient-to-r from-[rgb(var(--accent))] to-purple-500 hover:shadow-[0_0_20px_rgba(var(--accent),0.4)] text-white'
              }`}
          >
            {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : 'Create Account'}
          </motion.button>
        </form>

        {/* Switch to login */}
        <p className="text-sm text-center mt-8 text-[rgb(var(--text-secondary))]">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-[rgb(var(--accent))] hover:text-[rgb(var(--accent-hover))] font-bold transition-colors"
          >
            Sign in instead
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SignUp;
