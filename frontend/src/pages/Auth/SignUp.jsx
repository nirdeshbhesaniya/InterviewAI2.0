import React, { useState, useContext } from 'react';
import { Eye, EyeOff, Mail, User, Upload, Lock, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { UserContext } from '../../context/UserContext.jsx';
import { registerWithEmailPassword, resendVerificationEmail } from '../../firebase/auth';

const SignUp = ({ onSwitch }) => {
  const { setUser } = useContext(UserContext);

  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Email verification states
  const [emailSent, setEmailSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
      setPhotoFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Register user with Firebase
      const result = await registerWithEmailPassword(email, password);
      
      // Show success message
      toast.success('✅ ' + result.message);
      
      // Set email sent flag to show verification message
      setEmailSent(true);
      
      // Note: We don't set the user in context yet because email is not verified
      // The user will need to verify their email first before logging in
      
    } catch (error) {
      toast.error('❌ ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle resend verification email
  const handleResendEmail = async () => {
    setResendLoading(true);
    
    try {
      const result = await resendVerificationEmail();
      toast.success('✅ ' + result.message);
    } catch (error) {
      toast.error('❌ ' + error.message);
    } finally {
      setResendLoading(false);
    }
  };

  // If email verification sent, show verification message
  if (emailSent) {
    return (
      <div className="w-full max-w-md mx-auto bg-[rgb(var(--bg-card))] shadow-lg rounded-2xl p-6 border border-[rgb(var(--border))]">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="w-20 h-20 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center"
          >
            <CheckCircle className="w-12 h-12 text-green-500" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))] mb-2">
            Check Your Email! 📧
          </h2>
          
          <p className="text-[rgb(var(--text-muted))] mb-4">
            We've sent a verification link to:
          </p>
          
          <p className="text-[rgb(var(--accent))] font-semibold mb-6">
            {email}
          </p>
          
          <div className="bg-[rgb(var(--bg-body-alt))] border border-[rgb(var(--border))] rounded-lg p-4 mb-6">
            <p className="text-sm text-[rgb(var(--text-secondary))] mb-2">
              ⚠️ <strong>Important:</strong>
            </p>
            <ul className="text-xs text-[rgb(var(--text-muted))] text-left space-y-1 list-disc list-inside">
              <li>Click the verification link in your email</li>
              <li>Check your spam folder if you don't see it</li>
              <li>You must verify before you can log in</li>
            </ul>
          </div>
          
          {/* Resend Email Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleResendEmail}
            disabled={resendLoading}
            className={`w-full py-2 rounded-md mb-3 font-semibold tracking-wide shadow-md transition ${
              resendLoading
                ? 'bg-[rgb(var(--text-muted))]/50 text-[rgb(var(--text-secondary))] cursor-not-allowed'
                : 'bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white'
            }`}
          >
            {resendLoading ? 'Sending...' : 'Resend Verification Email'}
          </motion.button>
          
          {/* Go to Login */}
          <button
            onClick={onSwitch}
            className="text-sm text-[rgb(var(--accent))] hover:text-[rgb(var(--accent-hover))] font-medium transition-colors"
          >
            Already verified? Go to Login →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-[rgb(var(--bg-card))] shadow-lg rounded-2xl p-6 border border-[rgb(var(--border))]">
      <h2 className="text-2xl font-bold text-center text-[rgb(var(--accent))] mb-1">Create an Account ✨</h2>
      <p className="text-sm text-[rgb(var(--text-muted))] text-center mb-6">Join us by filling the details below</p>

      {/* Profile Upload */}
      <div className="flex justify-center mb-6">
        <label className="relative cursor-pointer group">
          {photoPreview ? (
            <img
              src={photoPreview}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-2 border-[rgb(var(--accent))] shadow-md"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[rgb(var(--accent))]/10 flex items-center justify-center border-2 border-[rgb(var(--accent))]/50">
              <Upload className="text-[rgb(var(--accent))]" />
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

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Full Name */}
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))] w-5 h-5" />
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full Name"
            required
            className="w-full pl-10 pr-4 py-2 bg-[rgb(var(--bg-body-alt))] border border-[rgb(var(--border))] rounded-md text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent"
          />
        </div>

        {/* Email */}
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))] w-5 h-5" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            required
            className="w-full pl-10 pr-4 py-2 bg-[rgb(var(--bg-body-alt))] border border-[rgb(var(--border))] rounded-md text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent"
          />
        </div>

        {/* Password */}
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))] w-5 h-5" />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Min 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full pl-10 pr-10 py-2 bg-[rgb(var(--bg-body-alt))] border border-[rgb(var(--border))] rounded-md text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent))]"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          whileTap={{ scale: 0.97 }}
          disabled={loading}
          className={`w-full py-2 rounded-md transition font-semibold tracking-wide shadow-md ${loading
            ? 'bg-[rgb(var(--text-muted))]/50 text-[rgb(var(--text-secondary))] cursor-not-allowed'
            : 'bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] hover:shadow-lg text-white'
            }`}
        >
          {loading ? 'Signing Up...' : 'SIGN UP'}
        </motion.button>
      </form>

      {/* Switch to login */}
      <p className="text-sm text-center mt-5 text-[rgb(var(--text-secondary))]">
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
