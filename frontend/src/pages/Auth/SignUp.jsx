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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);

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
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('fullName', fullName);
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
            placeholder="Min 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
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

        {/* Submit */}
        <motion.button
          type="submit"
          whileTap={{ scale: 0.97 }}
          disabled={loading}
          className={`w-full py-2.5 sm:py-2 rounded-md transition font-semibold tracking-wide shadow-md text-sm sm:text-base ${loading
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
