import React, { useContext, useState, useRef, useEffect } from 'react';
import { UserContext } from '../../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  UserCircle2,
  Menu,
  X,
  Bot,
  Settings,
  User,
  Mail,
  Calendar,
  Shield,
  Bell,
  ChevronDown,
  Edit3,
  Camera,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = ({ onLoginClick }) => {
  const { user, setUser } = useContext(UserContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setShowDropdown(false);
    setShowMobileMenu(false);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setShowDropdown(false);
    setShowMobileMenu(false);
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    setShowDropdown(false);
    setShowMobileMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatJoinDate = (dateString) => {
    if (!dateString) return 'Recently joined';
    return `Joined ${new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    })}`;
  };

  return (
    <header className="relative bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 shadow-xl">
      {/* Main Header */}
      <div className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Enhanced Logo Section */}
          <motion.div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative">
              <Bot className="w-8 h-8 sm:w-9 sm:h-9 text-white drop-shadow-lg transform group-hover:rotate-12 transition-transform duration-300" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-wide">
                Interview <span className="text-orange-100">AI</span>
              </h1>
              <p className="text-xs text-orange-100 opacity-80 -mt-1">Smart Interview Prep</p>
            </div>
            <div className="block sm:hidden">
              <h1 className="text-xl font-bold text-white">
                Interview<span className="text-orange-100">AI</span>
              </h1>
            </div>
          </motion.div>

          {/* Navigation Menu - Desktop */}
          <nav className="hidden lg:flex items-center space-x-8">
            <motion.button
              onClick={() => navigate('/dashboard')}
              className="text-white/90 hover:text-white font-medium transition-colors duration-200"
              whileHover={{ y: -2 }}
            >
              Dashboard
            </motion.button>
            <motion.button
              onClick={() => navigate('/mcq-test')}
              className="text-white/90 hover:text-white font-medium transition-colors duration-200"
              whileHover={{ y: -2 }}
            >
              MCQ Tests
            </motion.button>
            <motion.button
              onClick={() => navigate('/codebase')}
              className="text-white/90 hover:text-white font-medium transition-colors duration-200"
              whileHover={{ y: -2 }}
            >
              Code Editor
            </motion.button>
            <motion.button
              onClick={() => navigate('/notes')}
              className="flex items-center gap-2 text-white/90 hover:text-white font-medium transition-colors duration-200"
              whileHover={{ y: -2 }}
            >
              <BookOpen className="w-4 h-4" />
              Resources
            </motion.button>
          </nav>

          {/* User Section */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              {/* Desktop User Menu */}
              <motion.div
                className="hidden sm:flex items-center gap-3 cursor-pointer bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-full shadow-lg hover:bg-white transition-all duration-200"
                onClick={() => setShowDropdown((prev) => !prev)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative">
                  <img
                    src={user.photo || '/default-avatar.jpg'}
                    alt="User"
                    className="w-10 h-10 rounded-full object-cover border-2 border-orange-200"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex flex-col items-start max-w-[8rem] lg:max-w-[10rem]">
                  <span className="text-sm font-semibold text-gray-800 truncate">
                    {user.fullName || user.email?.split('@')[0]}
                  </span>
                  <span className="text-xs text-gray-600 truncate">{user.email}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-orange-500 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
              </motion.div>

              {/* Mobile User Menu Button */}
              <motion.div
                className="sm:hidden flex items-center gap-2 cursor-pointer bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg"
                onClick={() => setShowDropdown((prev) => !prev)}
                whileTap={{ scale: 0.95 }}
              >
                <img
                  src={user.photo || '/default-avatar.jpg'}
                  alt="User"
                  className="w-8 h-8 rounded-full object-cover border-2 border-orange-200"
                />
                <ChevronDown className={`w-4 h-4 text-orange-500 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
              </motion.div>

              {/* Enhanced Dropdown Menu */}
              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-[90vw] max-w-[320px] bg-white rounded-2xl shadow-2xl z-50 border border-gray-100 overflow-hidden"
                  >
                    {/* Profile Header */}
                    <div className="bg-gradient-to-r from-orange-400 to-pink-400 px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img
                            src={user.photo || '/default-avatar.jpg'}
                            className="w-16 h-16 rounded-full border-3 border-white object-cover shadow-lg"
                            alt="Profile"
                          />
                          <button
                            onClick={handleProfileClick}
                            className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                          >
                            <Camera className="w-3 h-3 text-gray-600" />
                          </button>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-bold text-lg truncate">
                            {user.fullName || user.email?.split('@')[0]}
                          </h3>
                          <p className="text-orange-100 text-sm truncate">{user.email}</p>
                          <p className="text-orange-200 text-xs mt-1">
                            {formatJoinDate(user.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <motion.button
                        onClick={handleProfileClick}
                        className="w-full flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-50 transition-colors group"
                        whileHover={{ x: 4 }}
                      >
                        <User className="w-5 h-5 text-orange-500 group-hover:text-orange-600" />
                        <div className="flex-1 text-left">
                          <p className="font-medium">My Profile</p>
                          <p className="text-xs text-gray-500">Manage your account</p>
                        </div>
                        <Edit3 className="w-4 h-4 text-gray-400" />
                      </motion.button>

                      <motion.button
                        onClick={handleSettingsClick}
                        className="w-full flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-50 transition-colors group"
                        whileHover={{ x: 4 }}
                      >
                        <Settings className="w-5 h-5 text-blue-500 group-hover:text-blue-600" />
                        <div className="flex-1 text-left">
                          <p className="font-medium">Settings</p>
                          <p className="text-xs text-gray-500">Preferences & privacy</p>
                        </div>
                      </motion.button>

                      <motion.button
                        onClick={() => navigate('/notifications')}
                        className="w-full flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-50 transition-colors group"
                        whileHover={{ x: 4 }}
                      >
                        <Bell className="w-5 h-5 text-purple-500 group-hover:text-purple-600" />
                        <div className="flex-1 text-left">
                          <p className="font-medium">Notifications</p>
                          <p className="text-xs text-gray-500">Alerts & updates</p>
                        </div>
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">3</span>
                      </motion.button>

                      <hr className="my-2 border-gray-100" />

                      <motion.button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-6 py-3 text-red-600 hover:bg-red-50 transition-colors group"
                        whileHover={{ x: 4 }}
                      >
                        <LogOut className="w-5 h-5 group-hover:text-red-700" />
                        <div className="flex-1 text-left">
                          <p className="font-medium">Sign Out</p>
                          <p className="text-xs text-red-400">Come back soon!</p>
                        </div>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.button
              onClick={onLoginClick}
              className="bg-white/95 backdrop-blur-sm text-orange-600 font-semibold px-6 py-2.5 rounded-full hover:bg-white transition-all duration-200 flex items-center gap-2 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <UserCircle2 className="w-5 h-5" />
              <span className="hidden sm:inline">Get Started</span>
              <span className="sm:hidden">Login</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      {user && (
        <div className="lg:hidden bg-white/10 backdrop-blur-sm border-t border-white/20">
          <div className="px-4 py-2">
            <div className="flex justify-center space-x-6">
              <motion.button
                onClick={() => navigate('/dashboard')}
                className="flex flex-col items-center py-2 text-white/80 hover:text-white transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                <Bot className="w-5 h-5 mb-1" />
                <span className="text-xs">Dashboard</span>
              </motion.button>
              <motion.button
                onClick={() => navigate('/mcq-test')}
                className="flex flex-col items-center py-2 text-white/80 hover:text-white transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                <Shield className="w-5 h-5 mb-1" />
                <span className="text-xs">MCQ</span>
              </motion.button>
              <motion.button
                onClick={() => navigate('/codebase')}
                className="flex flex-col items-center py-2 text-white/80 hover:text-white transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                <Settings className="w-5 h-5 mb-1" />
                <span className="text-xs">Code</span>
              </motion.button>
              <motion.button
                onClick={() => navigate('/notes')}
                className="flex flex-col items-center py-2 text-white/80 hover:text-white transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                <BookOpen className="w-5 h-5 mb-1" />
                <span className="text-xs">Resources</span>
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
