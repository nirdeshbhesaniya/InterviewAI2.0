import React, { useState, useContext } from 'react';
import { Eye, EyeOff, Mail, User, Upload, Lock } from 'lucide-react';
import axios from '../../utils/axiosInstance';
import { API } from '../../utils/apiPaths';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { UserContext } from '../../context/UserContext.jsx';

const SignUp = ({ onSwitch }) => {
  const { setUser } = useContext(UserContext);

  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('email', email);
    formData.append('password', password);
    if (photoFile) formData.append('photo', photoFile);

    try {
      const res = await axios.post(API.REGISTER, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { fullName, email, photo } = res.data;

      const userObj = { fullName, email, photo };
      localStorage.setItem('user', JSON.stringify(userObj));
      setUser(userObj);

      toast.success('🎉 Registered successfully!');
      setTimeout(onSwitch, 1000);
    } catch (err) {
      toast.error(err?.response?.data?.message || '❌ Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white shadow-xl rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-center text-orange-600 mb-1">Create an Account ✨</h2>
      <p className="text-sm text-gray-500 text-center mb-6">Join us by filling the details below</p>

      {/* Profile Upload */}
      <div className="flex justify-center mb-6">
        <label className="relative cursor-pointer group">
          {photoPreview ? (
            <img
              src={photoPreview}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-2 border-orange-500"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center">
              <Upload className="text-orange-500" />
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
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full Name"
            required
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        {/* Email */}
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            required
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        {/* Password */}
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Min 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-500"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          whileTap={{ scale: 0.97 }}
          disabled={loading}
          className={`w-full py-2 rounded-md transition font-semibold tracking-wide ${
            loading
              ? 'bg-orange-300 text-white cursor-not-allowed'
              : 'bg-orange-500 hover:bg-orange-600 text-white'
          }`}
        >
          {loading ? 'Signing Up...' : 'SIGN UP'}
        </motion.button>
      </form>

      {/* Switch to login */}
      <p className="text-sm text-center mt-5">
        Already have an account?{' '}
        <button
          onClick={onSwitch}
          className="text-orange-600 hover:underline font-medium"
        >
          Login
        </button>
      </p>
    </div>
  );
};

export default SignUp;
