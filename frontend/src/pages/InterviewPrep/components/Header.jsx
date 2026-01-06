import React, { useContext, useState, useRef, useEffect } from 'react';
import { UserContext } from '../../../context/UserContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LogOut,
  UserCircle2,
  Bot,
  Settings,
  User,
  ShieldAlert,
  Shield,
  Bell,
  ChevronDown,
  Edit3,
  Camera,
  BookOpen,
  Library,
  Code,
  Moon,
  Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../../../utils/axiosInstance';
import { API } from '../../../utils/apiPaths';

const Header = ({ onLoginClick }) => {
  const { user, setUser, logout } = useContext(UserContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('interviewPrepTheme') === 'dark';
  });
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    setShowDropdown(false);
    setShowMobileMenu(false);
    logout(navigate);
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

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('interviewPrepTheme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('interviewPrepTheme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notification count
  useEffect(() => {
    const fetchNotificationCount = async () => {
      if (!user?.email) return;
      try {
        const response = await axios.get(API.NOTIFICATIONS.GET_ALL(user.email), {
          params: { unreadOnly: true }
        });
        if (response.data.success) {
          setUnreadCount(response.data.unreadCount || 0);
        }
      } catch (error) {
        console.error('Failed to fetch notification count:', error);
      }
    };

    fetchNotificationCount();

    // Refresh count every 30 seconds
    const interval = setInterval(fetchNotificationCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const formatJoinDate = (dateString) => {
    if (!dateString) return 'Recently joined';
    return `Joined ${new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    })}`;
  };

  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'text-[rgb(var(--accent))] font-bold' : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]';
  };

  return (
    <header className="relative bg-[rgb(var(--bg-elevated))] border-b border-[rgb(var(--border))] shadow-sm z-50">
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
              <Bot className="w-8 h-8 sm:w-9 sm:h-9 text-[rgb(var(--accent))] drop-shadow-lg transform group-hover:rotate-12 transition-transform duration-300" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[rgb(var(--accent))] rounded-full animate-pulse"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl lg:text-3xl font-bold text-[rgb(var(--text-primary))] tracking-wide">
                Interview <span className="text-[rgb(var(--accent))]">AI</span>
              </h1>
              <p className="text-xs text-[rgb(var(--text-muted))] -mt-1">Smart Interview Prep</p>
            </div>
            <div className="block sm:hidden">
              <h1 className="text-xl font-bold text-[rgb(var(--text-primary))]">
                Interview<span className="text-[rgb(var(--accent))]">AI</span>
              </h1>
            </div>
          </motion.div>

          {/* Navigation Menu - Desktop */}
          <nav className="hidden lg:flex items-center space-x-8">
            <motion.button
              onClick={() => navigate('/dashboard')}
              className={`${isActive('/dashboard')} font-medium transition-colors duration-200`}
              whileHover={{ y: -2 }}
            >
              Dashboard
            </motion.button>
            {user?.role === 'admin' && (
              <motion.button
                onClick={() => navigate('/admin')}
                className={`${location.pathname.startsWith('/admin') ? 'text-red-600 font-bold' : 'text-red-500 hover:text-red-600'} font-medium transition-colors duration-200`}
                whileHover={{ y: -2 }}
              >
                Admin
              </motion.button>
            )}
            <motion.button
              onClick={() => navigate('/mcq-test')}
              className={`${isActive('/mcq-test')} font-medium transition-colors duration-200`}
              whileHover={{ y: -2 }}
            >
              MCQ Tests
            </motion.button>
            <motion.button
              onClick={() => navigate('/codebase')}
              className={`${isActive('/codebase')} font-medium transition-colors duration-200`}
              whileHover={{ y: -2 }}
            >
              Code Editor
            </motion.button>
            <motion.button
              onClick={() => navigate('/notes')}
              className={`flex items-center gap-2 ${isActive('/notes')} font-medium transition-colors duration-200`}
              whileHover={{ y: -2 }}
            >
              Notes
            </motion.button>
            <motion.button
              onClick={() => navigate('/resources')}
              className={`flex items-center gap-2 ${isActive('/resources')} font-medium transition-colors duration-200`}
              whileHover={{ y: -2 }}
            >

              Resources
            </motion.button>
          </nav>

          {/* User Section */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              {/* Desktop User Menu */}
              <motion.div
                className="hidden sm:flex items-center gap-3 cursor-pointer bg-[rgb(var(--bg-card))] px-4 py-2 rounded-full shadow-md border border-[rgb(var(--border))] hover:shadow-lg transition-all"
                onClick={() => setShowDropdown((prev) => !prev)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative">
                  <img
                    src={user.photo || '/default-avatar.jpg'}
                    alt="User"
                    className="w-10 h-10 rounded-full object-cover border-2 border-[rgb(var(--accent))]"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[rgb(var(--accent))] border-2 border-[rgb(var(--bg-card))] rounded-full"></div>
                </div>
                <div className="flex flex-col items-start max-w-[8rem] lg:max-w-[10rem]">
                  <span className="text-sm font-semibold text-[rgb(var(--text-primary))] truncate">
                    {user.fullName || user.email?.split('@')[0]}
                  </span>
                  <span className="text-xs text-[rgb(var(--text-muted))] truncate">{user.email}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-[rgb(var(--accent))] transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
              </motion.div>

              {/* Mobile User Menu Button */}
              <motion.div
                className="sm:hidden flex items-center gap-2 cursor-pointer bg-[rgb(var(--bg-card))] px-3 py-2 rounded-full shadow-md border border-[rgb(var(--border))]"
                onClick={() => setShowDropdown((prev) => !prev)}
                whileTap={{ scale: 0.95 }}
              >
                <img
                  src={user.photo || '/default-avatar.jpg'}
                  alt="User"
                  className="w-8 h-8 rounded-full object-cover border-2 border-[rgb(var(--accent))]"
                />
                <ChevronDown className={`w-4 h-4 text-[rgb(var(--accent))] transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
              </motion.div>

              {/* Enhanced Dropdown Menu */}
              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-[90vw] max-w-[320px] bg-[rgb(var(--bg-elevated))] rounded-2xl shadow-xl z-[100] border border-[rgb(var(--border))] overflow-hidden"
                  >
                    {/* Profile Header */}
                    <div className="bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-hover))] px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img
                            src={user.photo || '/default-avatar.jpg'}
                            className="w-16 h-16 rounded-full border-3 border-white object-cover shadow-lg"
                            alt="Profile"
                          />
                          <button
                            onClick={handleProfileClick}
                            className="absolute -bottom-1 -right-1 w-6 h-6 bg-[rgb(var(--bg-card))] rounded-full shadow-md flex items-center justify-center hover:bg-[rgb(var(--bg-card-alt))] transition-colors border border-[rgb(var(--border))]"
                          >
                            <Camera className="w-3 h-3 text-[rgb(var(--text-secondary))]" />
                          </button>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-bold text-lg truncate">
                            {user.fullName || user.email?.split('@')[0]}
                          </h3>
                          <p className="text-white/90 text-sm truncate">{user.email}</p>
                          <p className="text-white/70 text-xs mt-1">
                            {formatJoinDate(user.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <motion.button
                        onClick={handleProfileClick}
                        className="w-full flex items-center gap-3 px-6 py-3 bg-[rgb(var(--bg-elevated))] hover:bg-[rgb(var(--bg-elevated-alt))] transition-colors group"
                        whileHover={{ x: 4 }}
                      >
                        <User className="w-5 h-5 text-[rgb(var(--accent))] group-hover:text-[rgb(var(--accent-hover))]" />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-[rgb(var(--text-primary))]">My Profile</p>
                          <p className="text-xs text-[rgb(var(--text-muted))]">Manage your account</p>
                        </div>
                        <Edit3 className="w-4 h-4 text-[rgb(var(--text-muted))] group-hover:text-[rgb(var(--text-secondary))]" />
                      </motion.button>

                      <motion.button
                        onClick={handleSettingsClick}
                        className="w-full flex items-center gap-3 px-6 py-3 bg-[rgb(var(--bg-elevated))] hover:bg-[rgb(var(--bg-elevated-alt))] transition-colors group"
                        whileHover={{ x: 4 }}
                      >
                        <Settings className="w-5 h-5 text-[rgb(var(--accent))] group-hover:text-[rgb(var(--accent-hover))]" />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-[rgb(var(--text-primary))]">Settings</p>
                          <p className="text-xs text-[rgb(var(--text-muted))]">Preferences & privacy</p>
                        </div>
                      </motion.button>

                      <motion.button
                        onClick={() => {
                          navigate('/notifications');
                          setShowDropdown(false);
                        }}
                        className="w-full flex items-center gap-3 px-6 py-3 bg-[rgb(var(--bg-elevated))] hover:bg-[rgb(var(--bg-elevated-alt))] transition-colors group"
                        whileHover={{ x: 4 }}
                      >
                        <Bell className="w-5 h-5 text-[rgb(var(--accent))] group-hover:text-[rgb(var(--accent-hover))]" />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-[rgb(var(--text-primary))]">Notifications</p>
                          <p className="text-xs text-[rgb(var(--text-muted))]">Alerts & updates</p>
                        </div>
                        {unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[1.5rem] text-center">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
                      </motion.button>

                      <motion.button
                        onClick={() => setDarkMode(!darkMode)}
                        className="w-full flex items-center gap-3 px-6 py-3 bg-[rgb(var(--bg-elevated))] hover:bg-[rgb(var(--bg-elevated-alt))] transition-colors group"
                        whileHover={{ x: 4 }}
                      >
                        {darkMode ? (
                          <Sun className="w-5 h-5 text-[rgb(var(--accent))] group-hover:text-[rgb(var(--accent-hover))]" />
                        ) : (
                          <Moon className="w-5 h-5 text-[rgb(var(--accent))] group-hover:text-[rgb(var(--accent-hover))]" />
                        )}
                        <div className="flex-1 text-left">
                          <p className="font-medium text-[rgb(var(--text-primary))]">Theme</p>
                          <p className="text-xs text-[rgb(var(--text-muted))]">
                            {darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                          </p>
                        </div>
                      </motion.button>

                      <hr className="my-2 border-[rgb(var(--border))]" />

                      <motion.button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-6 py-3 bg-[rgb(var(--bg-elevated))] hover:bg-red-50 transition-colors group"
                        whileHover={{ x: 4 }}
                      >
                        <LogOut className="w-5 h-5 text-red-500 group-hover:text-red-600" />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-red-600">Sign Out</p>
                          <p className="text-xs text-red-500">Come back soon!</p>
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
              className="bg-[rgb(var(--accent))] text-white font-semibold px-6 py-2.5 rounded-full hover:bg-[rgb(var(--accent-hover))] hover:shadow-lg transition-all duration-200 flex items-center gap-2 shadow-md"
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
        <div className="lg:hidden bg-[rgb(var(--bg-card))] border-t border-[rgb(var(--border))]">
          <div className="px-2 py-2">
            <div className="flex justify-around items-center">
              <motion.button
                onClick={() => navigate('/dashboard')}
                className="flex flex-col items-center py-2 px-1.5 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] transition-colors min-w-0"
                whileTap={{ scale: 0.95 }}
              >
                <Bot className="w-5 h-5 mb-1" />
                <span className="text-[10px] leading-tight">Dashboard</span>
              </motion.button>
              {user?.role === 'admin' && (
                <motion.button
                  onClick={() => navigate('/admin')}
                  className="flex flex-col items-center py-2 px-1.5 text-red-500 hover:text-red-600 transition-colors min-w-0"
                  whileTap={{ scale: 0.95 }}
                >
                  <ShieldAlert className="w-5 h-5 mb-1" />
                  <span className="text-[10px] leading-tight">Admin</span>
                </motion.button>
              )}
              <motion.button
                onClick={() => navigate('/mcq-test')}
                className="flex flex-col items-center py-2 px-1.5 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] transition-colors min-w-0"
                whileTap={{ scale: 0.95 }}
              >
                <Shield className="w-5 h-5 mb-1" />
                <span className="text-[10px] leading-tight">MCQ</span>
              </motion.button>
              <motion.button
                onClick={() => navigate('/codebase')}
                className="flex flex-col items-center py-2 px-1.5 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] transition-colors min-w-0"
                whileTap={{ scale: 0.95 }}
              >
                <Code className="w-5 h-5 mb-1" />
                <span className="text-[10px] leading-tight">Code</span>
              </motion.button>
              <motion.button
                onClick={() => navigate('/notes')}
                className="flex flex-col items-center py-2 px-1.5 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] transition-colors min-w-0"
                whileTap={{ scale: 0.95 }}
              >
                <BookOpen className="w-5 h-5 mb-1" />
                <span className="text-[10px] leading-tight">Notes</span>
              </motion.button>
              <motion.button
                onClick={() => navigate('/resources')}
                className="flex flex-col items-center py-2 px-1.5 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] transition-colors min-w-0"
                whileTap={{ scale: 0.95 }}
              >
                <Library className="w-5 h-5 mb-1" />
                <span className="text-[10px] leading-tight">Resources</span>
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
