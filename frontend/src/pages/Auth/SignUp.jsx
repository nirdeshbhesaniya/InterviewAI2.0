import React, { useState, useContext } from 'react';
import { Eye, EyeOff, Mail, User, Upload, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { UserContext } from '../../context/UserContext.jsx';
import axios from '../../utils/axiosInstance';
import { API } from '../../utils/apiPaths';
import { useNavigate } from 'react-router-dom';
import VerifyOTP from './VerifyOTP.jsx';

const SignUp = ({ onSwitch }) => {
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
      onSwitch(); // Switch to login page
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
    <div className="w-full">
      <h2 className="text-xl sm:text-2xl font-bold text-center text-[rgb(var(--accent))] mb-1">Create an Account ✨</h2>
      <p className="text-xs sm:text-sm text-[rgb(var(--text-muted))] text-center mb-4 sm:mb-6">Join us by filling the details below</p>

      {/* Profile Upload */}
      <div className="flex justify-center mb-4 sm:mb-6">
        <label className="relative cursor-pointer group">
          {photoPreview ? (
            <img
              src={photoPreview}
              alt="Profile"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-[rgb(var(--accent))] shadow-md"
            />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[rgb(var(--accent))]/10 flex items-center justify-center border-2 border-[rgb(var(--accent))]/50">
              <Upload className="text-[rgb(var(--accent))] w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </label>
      </div>

      <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit}>
        {/* Full Name */}
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))] w-4 h-4 sm:w-5 sm:h-5" />
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full Name"
            required
            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-2 text-sm sm:text-base bg-[rgb(var(--bg-body-alt))] border border-[rgb(var(--border))] rounded-md text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent"
          />
        </div>

        {/* Username */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))] text-sm sm:text-base font-semibold select-none">@</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            placeholder="username (e.g. john_doe)"
            required
            minLength={3}
            maxLength={20}
            className="w-full pl-8 sm:pl-9 pr-3 sm:pr-4 py-2.5 sm:py-2 text-sm sm:text-base bg-[rgb(var(--bg-body-alt))] border border-[rgb(var(--border))] rounded-md text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent"
          />
        </div>

        {/* Email */}
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))] w-4 h-4 sm:w-5 sm:h-5" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            required
            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-2 text-sm sm:text-base bg-[rgb(var(--bg-body-alt))] border border-[rgb(var(--border))] rounded-md text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent"
          />
        </div>

        {/* Password */}
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))] w-4 h-4 sm:w-5 sm:h-5" />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Min 8 chars, uppercase, number, symbol"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            maxLength={128}
            className="w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2.5 sm:py-2 text-sm sm:text-base bg-[rgb(var(--bg-body-alt))] border border-[rgb(var(--border))] rounded-md text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent))] p-1"
          >
            {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>

        {/* Password strength meter */}
        {password.length > 0 && (
          <div className="space-y-1 px-0.5">
            {/* Bar */}
            <div className="flex gap-1">
              {[1,2,3,4,5].map(i => (
                <div
                  key={i}
                  className="h-1 flex-1 rounded-full transition-all duration-300"
                  style={{ backgroundColor: i <= passedChecks ? strengthColor : 'rgb(var(--border))' }}
                />
              ))}
            </div>
            {/* Label */}
            <p className="text-xs font-medium" style={{ color: strengthColor }}>
              {strengthLabel}
            </p>
            {/* Checklist */}
            <ul className="space-y-0.5">
              {pwdChecks.map((c, i) => (
                <li key={i} className="flex items-center gap-1.5 text-xs"
                  style={{ color: c.test(password) ? '#22c55e' : 'rgb(var(--text-muted))' }}>
                  <span>{c.test(password) ? '✓' : '○'}</span>
                  {c.label}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Terms and Conditions Checkbox */}
        <div className="flex items-start gap-2 pt-1 pb-1">
          <input
            type="checkbox"
            id="terms"
            checked={agreeToTerms}
            onChange={(e) => setAgreeToTerms(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-[rgb(var(--border))] text-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] bg-[rgb(var(--bg-body-alt))]"
          />
          <label htmlFor="terms" className="text-xs sm:text-sm text-[rgb(var(--text-secondary))] leading-tight">
            I agree to the{' '}
            <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="text-[rgb(var(--accent))] hover:underline">
              Terms and Conditions
            </a>{' '}
            and{' '}
            <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[rgb(var(--accent))] hover:underline">
              Privacy Policy
            </a>
          </label>
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          whileTap={{ scale: 0.97 }}
          disabled={loading || !agreeToTerms}
          className={`w-full py-2.5 sm:py-2 rounded-md transition font-semibold tracking-wide shadow-md text-sm sm:text-base ${loading || !agreeToTerms
            ? 'bg-[rgb(var(--text-muted))]/50 text-[rgb(var(--text-secondary))] cursor-not-allowed'
            : 'bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] hover:shadow-lg text-white'
            }`}
        >
          {loading ? 'Signing Up...' : 'SIGN UP'}
        </motion.button>
      </form>

      {/* Switch to login */}
      <p className="text-xs sm:text-sm text-center mt-4 sm:mt-5 text-[rgb(var(--text-secondary))]">
        Already have an account?{' '}
        <button
          onClick={onSwitch}
          className="text-[rgb(var(--accent))] hover:text-[rgb(var(--accent-hover))] font-medium transition-colors"
        >
          Login
        </button>
      </p>
    </div>
  );
};

export default SignUp;
