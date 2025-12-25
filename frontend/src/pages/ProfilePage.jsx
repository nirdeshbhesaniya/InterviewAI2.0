import React, { useState, useContext, useEffect, useRef } from 'react';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
    User,
    Mail,
    Calendar,
    Camera,
    Edit3,
    Save,
    X,
    Upload,
    Lock,
    Eye,
    EyeOff,
    Check,
    AlertCircle,
    ArrowLeft,
    Shield,
    Bell,
    Globe,
    Trash2,
    TrendingUp,
    Award,
    Sparkles,
    MapPin,
    Link2,
    Github,
    Linkedin
} from 'lucide-react';
import Button from '../components/ui/SimpleButton';
import Card from '../components/ui/SimpleCard';
import axiosInstance from '../utils/axiosInstance';
import { API } from '../utils/apiPaths';
import toast from 'react-hot-toast';

const ProfilePage = () => {
    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    // Ref for password section auto-scroll
    const passwordSectionRef = useRef(null);

    // Profile form data
    const [profileData, setProfileData] = useState({
        fullName: '',
        email: '',
        bio: '',
        location: '',
        website: '',
        linkedin: '',
        github: ''
    });

    // Password form data
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    // Profile picture upload
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    // Preferences state
    const [preferences, setPreferences] = useState({
        emailNotifications: true,
        testReminders: true,
        weeklyDigest: false,
        language: 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });

    // Security state
    const [sessions, setSessions] = useState([]);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [loadingSecurity, setLoadingSecurity] = useState(false);

    // Stats state
    const [stats, setStats] = useState({
        interviewsSessions: 0,
        mcqTestsTaken: 0,
        notesShared: 0,
        activityTimeline: [],
        performanceByCategory: []
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                fullName: user.fullName || '',
                email: user.email || '',
                bio: user.bio || '',
                location: user.location || '',
                website: user.website || '',
                linkedin: user.linkedin || '',
                github: user.github || ''
            });

            // Fetch preferences and security data
            fetchPreferences();
            fetchSecurityInfo();
            fetchStats();
        }
    }, [user]);

    const fetchStats = async () => {
        try {
            const response = await axiosInstance.get(API.PROFILE.GET_STATS);
            if (response.data.success) {
                setStats(response.data.data.stats);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchPreferences = async () => {
        try {
            const response = await axiosInstance.get(API.PROFILE.GET_PREFERENCES);
            if (response.data.success) {
                setPreferences(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching preferences:', error);
        }
    };

    const fetchSecurityInfo = async () => {
        try {
            const response = await axiosInstance.get(API.PROFILE.GET_SECURITY);
            if (response.data.success) {
                setSessions(response.data.data.sessions || []);
                setTwoFactorEnabled(response.data.data.twoFactorEnabled || false);
            }
        } catch (error) {
            console.error('Error fetching security info:', error);
        }
    };

    const handleInputChange = (field, value) => {
        setProfileData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePasswordChange = (field, value) => {
        setPasswordData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePhotoUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        setUploadingPhoto(true);
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('email', user.email); // Add user email for authentication

        try {
            const response = await axiosInstance.post(API.PROFILE.UPLOAD_PHOTO, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                const updatedUser = { ...user, photo: response.data.data.photoUrl };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                toast.success('Profile photo updated successfully!');
            }
        } catch (error) {
            console.error('Error uploading photo:', error);
            toast.error(error.response?.data?.message || 'Failed to upload photo');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            const updateData = {
                ...profileData,
                email: user.email // Include user email for authentication
            };

            const response = await axiosInstance.put(API.PROFILE.UPDATE, updateData);

            if (response.data.success) {
                const updatedUser = { ...user, ...profileData };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setIsEditing(false);
                toast.success('Profile updated successfully!');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePreferenceChange = (field, value) => {
        setPreferences(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSavePreferences = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.put(API.PROFILE.UPDATE_PREFERENCES, preferences);
            if (response.data.success) {
                toast.success('Preferences updated successfully!');
            }
        } catch (error) {
            console.error('Error updating preferences:', error);
            toast.error(error.response?.data?.message || 'Failed to update preferences');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            return;
        }

        setLoadingSecurity(true);
        try {
            const response = await axiosInstance.delete(API.PROFILE.DELETE_ACCOUNT);
            if (response.data.success) {
                toast.success('Account deleted successfully');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
                navigate('/');
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            toast.error(error.response?.data?.message || 'Failed to delete account');
        } finally {
            setLoadingSecurity(false);
        }
    };

    const handleRevokeSession = async (sessionId) => {
        setLoadingSecurity(true);
        try {
            const response = await axiosInstance.post(API.PROFILE.REVOKE_SESSION, { sessionId });
            if (response.data.success) {
                toast.success('Session revoked successfully');
                fetchSecurityInfo();
            }
        } catch (error) {
            console.error('Error revoking session:', error);
            toast.error(error.response?.data?.message || 'Failed to revoke session');
        } finally {
            setLoadingSecurity(false);
        }
    };

    const handleToggle2FA = async (enabled) => {
        setLoadingSecurity(true);
        try {
            const response = await axiosInstance.post(API.PROFILE.TOGGLE_2FA, { enabled });
            if (response.data.success) {
                setTwoFactorEnabled(enabled);
                toast.success(response.data.message);
            }
        } catch (error) {
            console.error('Error toggling 2FA:', error);
            toast.error(error.response?.data?.message || 'Failed to toggle two-factor authentication');
            setTwoFactorEnabled(!enabled); // Revert on error
        } finally {
            setLoadingSecurity(false);
        }
    };

    const handleChangePassword = async (e) => {
        if (e) e.preventDefault();

        if (!passwordData.currentPassword) {
            toast.error('Please enter your current password');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        try {
            const response = await axiosInstance.put(API.PROFILE.CHANGE_PASSWORD, {
                email: user.email, // Include email for backend authentication
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            if (response.data.success) {
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setShowPasswordForm(false);
                toast.success('Password changed successfully!');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const renderProfileTab = () => (
        <div className="space-y-6">
            {/* Enhanced Profile Header with Gradient */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="overflow-hidden bg-gradient-to-br from-[rgb(var(--accent))] via-purple-500 to-pink-500 border-0 shadow-2xl">
                    <div className="relative p-6 sm:p-8">
                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>

                        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
                            {/* Enhanced Profile Picture */}
                            <motion.div
                                className="relative"
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <div className="relative">
                                    {/* Animated Ring */}
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/40 to-white/20 animate-pulse"></div>

                                    {/* Avatar Container */}
                                    <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden bg-white p-1.5 shadow-2xl">
                                        <img
                                            src={user?.photo || '/default-avatar.jpg'}
                                            alt="Profile"
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    </div>

                                    {/* Upload Button */}
                                    <label className="absolute bottom-0 right-0 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center cursor-pointer hover:scale-110 transition-transform border-4 border-[rgb(var(--accent))]">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoUpload}
                                            className="hidden"
                                            disabled={uploadingPhoto}
                                        />
                                        {uploadingPhoto ? (
                                            <div className="w-6 h-6 border-2 border-[rgb(var(--accent))] border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Camera className="w-6 h-6 text-[rgb(var(--accent))]" />
                                        )}
                                    </label>

                                    {/* Online Status */}
                                    <div className="absolute top-2 right-2 w-5 h-5 bg-green-400 rounded-full border-4 border-white shadow-lg"></div>
                                </div>
                            </motion.div>

                            {/* Profile Info */}
                            <div className="flex-1 text-center sm:text-left">
                                <motion.h2
                                    className="text-3xl sm:text-4xl font-extrabold text-white mb-2 drop-shadow-lg"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    {user?.fullName || user?.email?.split('@')[0]}
                                </motion.h2>

                                <motion.div
                                    className="flex items-center justify-center sm:justify-start gap-2 text-white/90 mb-3"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <Mail className="w-4 h-4" />
                                    <p className="text-sm sm:text-base">{user?.email}</p>
                                </motion.div>

                                <motion.div
                                    className="flex items-center justify-center sm:justify-start gap-2 text-white/80 mb-6"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <Calendar className="w-4 h-4" />
                                    <p className="text-sm">
                                        Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', {
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </motion.div>

                                {/* Action Buttons */}
                                <motion.div
                                    className="flex flex-wrap gap-3 justify-center sm:justify-start"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <button
                                        onClick={() => setIsEditing(!isEditing)}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-white text-[rgb(var(--accent))] rounded-lg font-semibold hover:shadow-xl hover:scale-105 transition-all duration-200"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        {isEditing ? 'Cancel' : 'Edit Profile'}
                                    </button>

                                    <button
                                        onClick={() => {
                                            setShowPasswordForm(!showPasswordForm);
                                            if (isEditing) setIsEditing(false);
                                            setTimeout(() => {
                                                passwordSectionRef.current?.scrollIntoView({
                                                    behavior: 'smooth',
                                                    block: 'start'
                                                });
                                            }, 100);
                                        }}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/30 hover:scale-105 transition-all duration-200 border border-white/30"
                                    >
                                        <Lock className="w-4 h-4" />
                                        Change Password
                                    </button>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
            >
                {/* Tests Taken */}
                <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 hover:shadow-lg hover:scale-105 transition-all duration-300">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/20 rounded-xl">
                            <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">{stats.mcqTestsTaken}</p>
                            <p className="text-sm text-[rgb(var(--text-muted))]">Tests Taken</p>
                        </div>
                    </div>
                </Card>

                {/* Notes Shared */}
                <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 hover:shadow-lg hover:scale-105 transition-all duration-300">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/20 rounded-xl">
                            <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">{stats.notesShared}</p>
                            <p className="text-sm text-[rgb(var(--text-muted))]">Notes Shared</p>
                        </div>
                    </div>
                </Card>

                {/* Days Active */}
                <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 hover:shadow-lg hover:scale-105 transition-all duration-300">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/20 rounded-xl">
                            <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">
                                {Math.floor((Date.now() - new Date(user?.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24))}
                            </p>
                            <p className="text-sm text-[rgb(var(--text-muted))]">Days Active</p>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Progress Summary Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
            >
                <Card className="p-4 sm:p-8 bg-gradient-to-br from-[rgb(var(--bg-card))] via-[rgb(var(--bg-card))] to-purple-500/5 border-2 border-[rgb(var(--border-subtle))] shadow-2xl overflow-hidden relative">
                    {/* Decorative background elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl -z-10" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl -z-10" />

                    <div className="mb-6 sm:mb-8">
                        <div className="flex items-center gap-3 sm:gap-4 mb-2">
                            <motion.div
                                className="p-3 bg-gradient-to-br from-[rgb(var(--accent))] via-purple-500 to-pink-500 rounded-2xl shadow-lg"
                                whileHover={{ scale: 1.05, rotate: 5 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                            </motion.div>
                            <div>
                                <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[rgb(var(--text-primary))]">
                                    Your Progress Summary
                                </h3>
                                <p className="text-xs sm:text-sm text-[rgb(var(--text-muted))] mt-1">
                                    Track your learning journey over the last 30 days
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
                        {/* Activity Timeline Chart */}
                        <motion.div
                            className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-5 sm:p-6 border-2 border-blue-200/50 dark:border-blue-800/50 shadow-xl hover:shadow-2xl transition-all duration-300"
                            whileHover={{ y: -5 }}
                        >
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                                        <Calendar className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-base sm:text-lg font-bold text-[rgb(var(--text-primary))]">
                                            Activity Timeline
                                        </h4>
                                        <p className="text-xs text-[rgb(var(--text-muted))]">Daily engagement</p>
                                    </div>
                                </div>
                            </div>

                            {stats.activityTimeline && stats.activityTimeline.length > 0 ? (
                                <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-3 sm:p-4">
                                    <ResponsiveContainer width="100%" height={280}>
                                        <AreaChart data={stats.activityTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                                            <defs>
                                                <linearGradient id="colorTests" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                                                </linearGradient>
                                                <linearGradient id="colorNotes" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.9} />
                                                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1} />
                                                </linearGradient>
                                                <linearGradient id="colorInterviews" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.9} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                                            <XAxis
                                                dataKey="date"
                                                stroke="#9ca3af"
                                                tick={{ fontSize: 11, fill: '#6b7280' }}
                                                tickFormatter={(value) => {
                                                    const date = new Date(value);
                                                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                                }}
                                                angle={-35}
                                                textAnchor="end"
                                                height={70}
                                            />
                                            <YAxis
                                                stroke="#9ca3af"
                                                tick={{ fontSize: 11, fill: '#6b7280' }}
                                                width={35}
                                                allowDecimals={false}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                                    border: '2px solid #e5e7eb',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                                                    padding: '12px',
                                                    fontSize: '13px'
                                                }}
                                                labelStyle={{ fontWeight: 'bold', marginBottom: '8px', color: '#111827' }}
                                                labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            />
                                            <Legend
                                                wrapperStyle={{
                                                    fontSize: '12px',
                                                    paddingTop: '15px',
                                                    fontWeight: '600'
                                                }}
                                                iconType="circle"
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="tests"
                                                stroke="#3b82f6"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorTests)"
                                                name="MCQ Tests"
                                                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="notes"
                                                stroke="#a855f7"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorNotes)"
                                                name="Notes Shared"
                                                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="interviews"
                                                stroke="#10b981"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorInterviews)"
                                                name="Interview Prep"
                                                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-[280px] flex items-center justify-center bg-white/50 dark:bg-gray-900/50 rounded-xl">
                                    <div className="text-center px-6">
                                        <motion.div
                                            animate={{ y: [0, -10, 0] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            <Calendar className="w-16 h-16 mx-auto mb-4 text-blue-300 dark:text-blue-700" />
                                        </motion.div>
                                        <p className="text-base font-semibold text-[rgb(var(--text-primary))] mb-2">No activity data yet</p>
                                        <p className="text-sm text-[rgb(var(--text-muted))]">Start your learning journey today!</p>
                                        <p className="text-xs text-[rgb(var(--text-muted))] mt-1">Take tests, create notes, and prep for interviews</p>
                                    </div>
                                </div>
                            )}
                        </motion.div>

                        {/* Performance by Category Chart */}
                        <motion.div
                            className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-2xl p-5 sm:p-6 border-2 border-purple-200/50 dark:border-purple-800/50 shadow-xl hover:shadow-2xl transition-all duration-300"
                            whileHover={{ y: -5 }}
                        >
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-md">
                                        <Award className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-base sm:text-lg font-bold text-[rgb(var(--text-primary))]">
                                            Performance by Topic
                                        </h4>
                                        <p className="text-xs text-[rgb(var(--text-muted))]">Average scores</p>
                                    </div>
                                </div>
                            </div>

                            {stats.performanceByCategory && stats.performanceByCategory.length > 0 ? (
                                <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-3 sm:p-4">
                                    <ResponsiveContainer width="100%" height={280}>
                                        <BarChart
                                            data={stats.performanceByCategory}
                                            layout="vertical"
                                            margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                                            <XAxis
                                                type="number"
                                                domain={[0, 100]}
                                                stroke="#9ca3af"
                                                tick={{ fontSize: 11, fill: '#6b7280' }}
                                                label={{ value: 'Score (%)', position: 'bottom', fontSize: 12, fill: '#6b7280' }}
                                            />
                                            <YAxis
                                                dataKey="category"
                                                type="category"
                                                width={90}
                                                stroke="#9ca3af"
                                                tick={{ fontSize: 11, fill: '#6b7280', fontWeight: '600' }}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                                    border: '2px solid #e5e7eb',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                                                    padding: '12px',
                                                    fontSize: '13px'
                                                }}
                                                cursor={{ fill: 'rgba(168, 85, 247, 0.1)' }}
                                                formatter={(value, name, props) => {
                                                    if (name === 'score') {
                                                        const tests = props.payload.tests || 0;
                                                        return [
                                                            <div key="score">
                                                                <div className="font-bold text-purple-600">{value}%</div>
                                                                <div className="text-xs text-gray-500">{tests} test{tests !== 1 ? 's' : ''} taken</div>
                                                            </div>,
                                                            'Score'
                                                        ];
                                                    }
                                                    return [value, name];
                                                }}
                                            />
                                            <Bar
                                                dataKey="score"
                                                radius={[0, 12, 12, 0]}
                                                label={{
                                                    position: 'right',
                                                    fill: '#7c3aed',
                                                    fontSize: 12,
                                                    fontWeight: 'bold',
                                                    formatter: (value) => `${value}%`
                                                }}
                                            >
                                                <defs>
                                                    <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                                                        <stop offset="0%" stopColor="#a855f7" />
                                                        <stop offset="50%" stopColor="#c026d3" />
                                                        <stop offset="100%" stopColor="#ec4899" />
                                                    </linearGradient>
                                                </defs>
                                                {stats.performanceByCategory.map((entry, index) => (
                                                    <motion.rect
                                                        key={`bar-${index}`}
                                                        initial={{ scaleX: 0 }}
                                                        animate={{ scaleX: 1 }}
                                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                                        fill="url(#barGradient)"
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-[280px] flex items-center justify-center bg-white/50 dark:bg-gray-900/50 rounded-xl">
                                    <div className="text-center px-6">
                                        <motion.div
                                            animate={{ rotate: [0, 10, -10, 0] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            <Award className="w-16 h-16 mx-auto mb-4 text-purple-300 dark:text-purple-700" />
                                        </motion.div>
                                        <p className="text-base font-semibold text-[rgb(var(--text-primary))] mb-2">No performance data yet</p>
                                        <p className="text-sm text-[rgb(var(--text-muted))]">Complete MCQ tests to track your progress!</p>
                                        <p className="text-xs text-[rgb(var(--text-muted))] mt-1">See which topics you excel at</p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </Card>
            </motion.div>

            {/* Profile Form */}
            <Card className="p-4 sm:p-6 bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))]">
                <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-[rgb(var(--accent))]" />
                    <span className="text-[rgb(var(--text-primary))]">Personal Information</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="sm:col-span-1">
                        <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={profileData.fullName}
                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                            disabled={!isEditing}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-[rgb(var(--border-subtle))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent bg-[rgb(var(--bg-body))] text-[rgb(var(--text-primary))] disabled:bg-[rgb(var(--bg-body))]/50 disabled:cursor-not-allowed"
                        />
                    </div>

                    <div className="sm:col-span-1">
                        <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={profileData.email}
                            disabled
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-[rgb(var(--border-subtle))] rounded-lg bg-[rgb(var(--bg-body))]/30 cursor-not-allowed text-[rgb(var(--text-muted))]"
                        />
                        <p className="text-xs text-[rgb(var(--text-muted))] mt-1">Email cannot be changed</p>
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                            Bio
                        </label>
                        <textarea
                            value={profileData.bio}
                            onChange={(e) => handleInputChange('bio', e.target.value)}
                            disabled={!isEditing}
                            rows={3}
                            placeholder="Tell us about yourself..."
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-[rgb(var(--border-subtle))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent bg-[rgb(var(--bg-body))] text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] disabled:bg-[rgb(var(--bg-body))]/50 disabled:cursor-not-allowed resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                            Location
                        </label>
                        <input
                            type="text"
                            value={profileData.location}
                            onChange={(e) => handleInputChange('location', e.target.value)}
                            disabled={!isEditing}
                            placeholder="City, Country"
                            className="w-full px-4 py-3 border border-[rgb(var(--border-subtle))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent bg-[rgb(var(--bg-body))] text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] disabled:bg-[rgb(var(--bg-body))]/50 disabled:cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                            Website
                        </label>
                        <input
                            type="url"
                            value={profileData.website}
                            onChange={(e) => handleInputChange('website', e.target.value)}
                            disabled={!isEditing}
                            placeholder="https://yourwebsite.com"
                            className="w-full px-4 py-3 border border-[rgb(var(--border-subtle))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent bg-[rgb(var(--bg-body))] text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] disabled:bg-[rgb(var(--bg-body))]/50 disabled:cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                            LinkedIn
                        </label>
                        <input
                            type="url"
                            value={profileData.linkedin}
                            onChange={(e) => handleInputChange('linkedin', e.target.value)}
                            disabled={!isEditing}
                            placeholder="https://linkedin.com/in/username"
                            className="w-full px-4 py-3 border border-[rgb(var(--border-subtle))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent bg-[rgb(var(--bg-body))] text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] disabled:bg-[rgb(var(--bg-body))]/50 disabled:cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                            GitHub
                        </label>
                        <input
                            type="url"
                            value={profileData.github}
                            onChange={(e) => handleInputChange('github', e.target.value)}
                            disabled={!isEditing}
                            placeholder="https://github.com/username"
                            className="w-full px-4 py-3 border border-[rgb(var(--border-subtle))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent bg-[rgb(var(--bg-body))] text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] disabled:bg-[rgb(var(--bg-body))]/50 disabled:cursor-not-allowed"
                        />
                    </div>
                </div>

                {isEditing && (
                    <div className="flex gap-3 mt-6">
                        <Button
                            onClick={handleSaveProfile}
                            disabled={loading}
                            className="bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white shadow-lg shadow-[rgb(var(--accent))]/30"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Saving...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Save className="w-4 h-4" />
                                    <span>Save Changes</span>
                                </div>
                            )}
                        </Button>
                        <Button
                            onClick={() => setIsEditing(false)}
                            variant="outline"
                            className="border-[rgb(var(--border))] bg-[rgb(var(--bg-body))] hover:bg-[rgb(var(--bg-body-alt))] text-[rgb(var(--text-primary))]"
                        >
                            Cancel
                        </Button>
                    </div>
                )}
            </Card>

            {/* Password Change Form */}
            {showPasswordForm && (
                <Card ref={passwordSectionRef} className="p-6 bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))]">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-[rgb(var(--accent))]" />
                        <span className="text-[rgb(var(--text-primary))]">Change Password</span>
                    </h3>

                    <div className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                Current Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.current ? 'text' : 'password'}
                                    value={passwordData.currentPassword}
                                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                                    className="w-full px-4 py-3 pr-12 border border-[rgb(var(--border-subtle))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent bg-[rgb(var(--bg-body))] text-[rgb(var(--text-primary))]"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))]"
                                >
                                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.new ? 'text' : 'password'}
                                    value={passwordData.newPassword}
                                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                                    className="w-full px-4 py-3 pr-12 border border-[rgb(var(--border-subtle))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent bg-[rgb(var(--bg-body))] text-[rgb(var(--text-primary))]"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))]"
                                >
                                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.confirm ? 'text' : 'password'}
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                                    className="w-full px-4 py-3 pr-12 border border-[rgb(var(--border-subtle))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent bg-[rgb(var(--bg-body))] text-[rgb(var(--text-primary))]"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))]"
                                >
                                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button
                                onClick={handleChangePassword}
                                disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                                className="bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white shadow-lg shadow-[rgb(var(--accent))]/30"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Changing...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Check className="w-4 h-4" />
                                        <span>Change Password</span>
                                    </div>
                                )}
                            </Button>
                            <Button
                                onClick={() => setShowPasswordForm(false)}
                                variant="outline"
                                className="border-[rgb(var(--border))] bg-[rgb(var(--bg-body))] hover:bg-[rgb(var(--bg-body-alt))] text-[rgb(var(--text-primary))]"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );

    if (!user) {
        navigate('/');
        return null;
    }

    return (
        <div className="min-h-screen bg-[rgb(var(--bg-body))]">
            {/* Header */}
            <div className="bg-[rgb(var(--bg-card))] shadow-sm border-b border-[rgb(var(--border-subtle))]">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-[rgb(var(--bg-body-alt))] rounded-lg transition-colors hover:scale-105 active:scale-95">
                            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[rgb(var(--text-muted))]" />
                        </button>
                        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[rgb(var(--text-primary))]">Profile Settings</h1>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                    {/* Sidebar - Mobile: Horizontal scroll, Desktop: Vertical */}
                    <div className="lg:col-span-1">
                        <Card className="p-3 sm:p-4 bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))]">
                            {/* Mobile: Horizontal navigation */}
                            <nav className="lg:space-y-2">
                                <div className="flex lg:flex-col gap-2 lg:gap-0 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
                                    <button
                                        onClick={() => setActiveTab('profile')}
                                        className={`flex-shrink-0 lg:w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-left transition-all text-sm sm:text-base ${activeTab === 'profile'
                                            ? 'bg-[rgb(var(--accent))]/20 text-[rgb(var(--accent))] border border-[rgb(var(--accent))]/30'
                                            : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-body-alt))] hover:text-[rgb(var(--accent))]'
                                            }`}
                                    >
                                        <User className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span className="whitespace-nowrap">Profile</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('preferences')}
                                        className={`flex-shrink-0 lg:w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-left transition-all text-sm sm:text-base ${activeTab === 'preferences'
                                            ? 'bg-[rgb(var(--accent))]/20 text-[rgb(var(--accent))] border border-[rgb(var(--accent))]/30'
                                            : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-body-alt))] hover:text-[rgb(var(--accent))]'
                                            }`}
                                    >
                                        <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span className="whitespace-nowrap">Preferences</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('security')}
                                        className={`flex-shrink-0 lg:w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-left transition-all text-sm sm:text-base ${activeTab === 'security'
                                            ? 'bg-[rgb(var(--accent))]/20 text-[rgb(var(--accent))] border border-[rgb(var(--accent))]/30'
                                            : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-body-alt))] hover:text-[rgb(var(--accent))]'
                                            }`}
                                    >
                                        <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span className="whitespace-nowrap">Security</span>
                                    </button>
                                </div>
                            </nav>
                        </Card>
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-3">
                        <div className="animate-fade-in space-y-4 sm:space-y-6">
                            {activeTab === 'profile' && renderProfileTab()}
                            {activeTab === 'preferences' && (
                                <div className="space-y-6">
                                    {/* Notification Preferences */}
                                    <Card className="p-4 sm:p-6 bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))]">
                                        <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                                            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-[rgb(var(--accent))]" />
                                            <span className="text-[rgb(var(--text-primary))]">Notification Preferences</span>
                                        </h3>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between py-3 border-b border-[rgb(var(--border-subtle))]">
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-medium text-[rgb(var(--text-primary))]">Email Notifications</h4>
                                                    <p className="text-xs sm:text-sm text-[rgb(var(--text-muted))] mt-1">Receive email updates about your account activity</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer ml-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={preferences.emailNotifications}
                                                        onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-[rgb(var(--border))] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[rgb(var(--accent))] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[rgb(var(--accent))]"></div>
                                                </label>
                                            </div>

                                            <div className="flex items-center justify-between py-3 border-b border-[rgb(var(--border-subtle))]">
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-medium text-[rgb(var(--text-primary))]">Test Reminders</h4>
                                                    <p className="text-xs sm:text-sm text-[rgb(var(--text-muted))] mt-1">Get notified about upcoming scheduled tests</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer ml-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={preferences.testReminders}
                                                        onChange={(e) => handlePreferenceChange('testReminders', e.target.checked)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-[rgb(var(--border))] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[rgb(var(--accent))] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[rgb(var(--accent))]"></div>
                                                </label>
                                            </div>

                                            <div className="flex items-center justify-between py-3">
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-medium text-[rgb(var(--text-primary))]">Weekly Digest</h4>
                                                    <p className="text-xs sm:text-sm text-[rgb(var(--text-muted))] mt-1">Receive weekly summary of your progress</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer ml-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={preferences.weeklyDigest}
                                                        onChange={(e) => handlePreferenceChange('weeklyDigest', e.target.checked)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-[rgb(var(--border))] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[rgb(var(--accent))] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[rgb(var(--accent))]"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Localization */}
                                    <Card className="p-4 sm:p-6 bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))]">
                                        <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                                            <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-[rgb(var(--accent))]" />
                                            <span className="text-[rgb(var(--text-primary))]">Localization</span>
                                        </h3>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                                    Language
                                                </label>
                                                <select
                                                    value={preferences.language}
                                                    onChange={(e) => handlePreferenceChange('language', e.target.value)}
                                                    className="w-full px-4 py-3 border border-[rgb(var(--border-subtle))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent bg-[rgb(var(--bg-body))] text-[rgb(var(--text-primary))]"
                                                >
                                                    <option value="en">English</option>
                                                    <option value="es">Spanish</option>
                                                    <option value="fr">French</option>
                                                    <option value="de">German</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                                    Timezone
                                                </label>
                                                <input
                                                    type="text"
                                                    value={preferences.timezone}
                                                    readOnly
                                                    className="w-full px-4 py-3 border border-[rgb(var(--border-subtle))] rounded-lg bg-[rgb(var(--bg-body))]/30 cursor-not-allowed text-[rgb(var(--text-muted))]"
                                                />
                                            </div>
                                        </div>
                                    </Card>

                                    <div className="flex gap-3">
                                        <Button
                                            onClick={handleSavePreferences}
                                            disabled={loading}
                                            className="bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white shadow-lg shadow-[rgb(var(--accent))]/30"
                                        >
                                            {loading ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    <span>Saving...</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <Save className="w-4 h-4" />
                                                    <span>Save Preferences</span>
                                                </div>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'security' && (
                                <div className="space-y-6">
                                    {/* Password Security */}
                                    <Card className="p-4 sm:p-6 bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))]">
                                        <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                                            <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-[rgb(var(--accent))]" />
                                            <span className="text-[rgb(var(--text-primary))]">Password & Authentication</span>
                                        </h3>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between py-3 border-b border-[rgb(var(--border-subtle))]">
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-medium text-[rgb(var(--text-primary))]">Password</h4>
                                                    <p className="text-xs sm:text-sm text-[rgb(var(--text-muted))] mt-1">Last changed: Never</p>
                                                </div>
                                                <Button
                                                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-[rgb(var(--border))] bg-[rgb(var(--bg-body))] hover:bg-[rgb(var(--bg-body-alt))] text-[rgb(var(--text-primary))]"
                                                >
                                                    Change Password
                                                </Button>
                                            </div>

                                            <div className="flex items-center justify-between py-3">
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-medium text-[rgb(var(--text-primary))]">Two-Factor Authentication</h4>
                                                    <p className="text-xs sm:text-sm text-[rgb(var(--text-muted))] mt-1">Add an extra layer of security to your account</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-[rgb(var(--text-muted))]">
                                                        {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                                                    </span>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={twoFactorEnabled}
                                                            onChange={(e) => handleToggle2FA(e.target.checked)}
                                                            disabled={loadingSecurity}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-[rgb(var(--border))] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[rgb(var(--accent))] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[rgb(var(--accent))] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Active Sessions */}
                                    <Card className="p-4 sm:p-6 bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))]">
                                        <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                                            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[rgb(var(--accent))]" />
                                            <span className="text-[rgb(var(--text-primary))]">Active Sessions</span>
                                        </h3>

                                        {sessions.length > 0 ? (
                                            <div className="space-y-3">
                                                {sessions.map((session, index) => (
                                                    <div key={index} className="flex items-center justify-between p-4 bg-[rgb(var(--bg-body-alt))] rounded-lg">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="text-sm font-medium text-[rgb(var(--text-primary))]">
                                                                    {session.device || 'Unknown Device'}
                                                                </h4>
                                                                {session.current && (
                                                                    <span className="px-2 py-0.5 text-xs bg-[rgb(var(--accent))]/20 text-[rgb(var(--accent))] rounded-full">
                                                                        Current
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-[rgb(var(--text-muted))] mt-1">
                                                                {session.location || 'Unknown Location'} • Last active: {new Date(session.lastActive).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        {!session.current && (
                                                            <Button
                                                                onClick={() => handleRevokeSession(session.id)}
                                                                variant="ghost"
                                                                size="sm"
                                                                disabled={loadingSecurity}
                                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                            >
                                                                Revoke
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <Shield className="w-12 h-12 text-[rgb(var(--text-muted))] mx-auto mb-3" />
                                                <p className="text-[rgb(var(--text-secondary))]">No active sessions found</p>
                                            </div>
                                        )}
                                    </Card>

                                    {/* Danger Zone */}
                                    <Card className="p-4 sm:p-6 bg-[rgb(var(--bg-card))] border border-red-200">
                                        <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                                            <span className="text-red-600">Danger Zone</span>
                                        </h3>

                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-medium text-red-900">Delete Account</h4>
                                                    <p className="text-xs sm:text-sm text-red-700 mt-1">
                                                        Permanently delete your account and all associated data. This action cannot be undone.
                                                    </p>
                                                </div>
                                                <Button
                                                    onClick={handleDeleteAccount}
                                                    disabled={loadingSecurity}
                                                    className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 flex-shrink-0"
                                                >
                                                    {loadingSecurity ? (
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                    <span>Delete Account</span>
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Password Change Form (reused from profile tab) */}
                                    {showPasswordForm && (
                                        <Card className="p-6 bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))]">
                                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                                <Lock className="w-5 h-5 text-[rgb(var(--accent))]" />
                                                <span className="text-[rgb(var(--text-primary))]">Change Password</span>
                                            </h3>

                                            <div className="space-y-4 max-w-md">
                                                <div>
                                                    <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                                        Current Password
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type={showPasswords.current ? 'text' : 'password'}
                                                            value={passwordData.currentPassword}
                                                            onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                                                            className="w-full px-4 py-3 pr-12 border border-[rgb(var(--border-subtle))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent bg-[rgb(var(--bg-body))] text-[rgb(var(--text-primary))]"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))]"
                                                        >
                                                            {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                                        New Password
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type={showPasswords.new ? 'text' : 'password'}
                                                            value={passwordData.newPassword}
                                                            onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                                                            className="w-full px-4 py-3 pr-12 border border-[rgb(var(--border-subtle))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent bg-[rgb(var(--bg-body))] text-[rgb(var(--text-primary))]"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))]"
                                                        >
                                                            {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                                        Confirm New Password
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type={showPasswords.confirm ? 'text' : 'password'}
                                                            value={passwordData.confirmPassword}
                                                            onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                                                            className="w-full px-4 py-3 pr-12 border border-[rgb(var(--border-subtle))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent bg-[rgb(var(--bg-body))] text-[rgb(var(--text-primary))]"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))]"
                                                        >
                                                            {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3 pt-2">
                                                    <Button
                                                        onClick={handleChangePassword}
                                                        disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                                                        className="bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white shadow-lg shadow-[rgb(var(--accent))]/30"
                                                    >
                                                        {loading ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                                <span>Changing...</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <Check className="w-4 h-4" />
                                                                <span>Change Password</span>
                                                            </div>
                                                        )}
                                                    </Button>
                                                    <Button
                                                        onClick={() => setShowPasswordForm(false)}
                                                        variant="outline"
                                                        className="border-[rgb(var(--border))] bg-[rgb(var(--bg-body))] hover:bg-[rgb(var(--bg-body-alt))] text-[rgb(var(--text-primary))]"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
