import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
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
    Trash2
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
        }
    }, [user]);

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

    const handleChangePassword = async () => {
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
            {/* Profile Header */}
            <Card className="p-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    {/* Profile Picture */}
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-r from-orange-400 to-pink-400 p-1">
                            <img
                                src={user?.photo || '/default-avatar.jpg'}
                                alt="Profile"
                                className="w-full h-full rounded-full object-cover bg-white"
                            />
                        </div>
                        <label className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                className="hidden"
                                disabled={uploadingPhoto}
                            />
                            {uploadingPhoto ? (
                                <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Camera className="w-5 h-5 text-gray-600" />
                            )}
                        </label>
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1 text-center sm:text-left">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {user?.fullName || user?.email?.split('@')[0]}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
                        <p className="text-sm text-gray-500 mt-2">
                            Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', {
                                month: 'long',
                                year: 'numeric'
                            })}
                        </p>

                        <div className="flex flex-wrap gap-3 mt-4 justify-center sm:justify-start">
                            <Button
                                onClick={() => setIsEditing(!isEditing)}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <Edit3 className="w-4 h-4" />
                                {isEditing ? 'Cancel' : 'Edit Profile'}
                            </Button>
                            <Button
                                onClick={() => setShowPasswordForm(!showPasswordForm)}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <Lock className="w-4 h-4" />
                                Change Password
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Profile Form */}
            <Card className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                    Personal Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="sm:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={profileData.fullName}
                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                            disabled={!isEditing}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                        />
                    </div>

                    <div className="sm:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={profileData.email}
                            disabled
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 cursor-not-allowed text-gray-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Bio
                        </label>
                        <textarea
                            value={profileData.bio}
                            onChange={(e) => handleInputChange('bio', e.target.value)}
                            disabled={!isEditing}
                            rows={3}
                            placeholder="Tell us about yourself..."
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white disabled:bg-gray-50 disabled:cursor-not-allowed resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Location
                        </label>
                        <input
                            type="text"
                            value={profileData.location}
                            onChange={(e) => handleInputChange('location', e.target.value)}
                            disabled={!isEditing}
                            placeholder="City, Country"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Website
                        </label>
                        <input
                            type="url"
                            value={profileData.website}
                            onChange={(e) => handleInputChange('website', e.target.value)}
                            disabled={!isEditing}
                            placeholder="https://yourwebsite.com"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            LinkedIn
                        </label>
                        <input
                            type="url"
                            value={profileData.linkedin}
                            onChange={(e) => handleInputChange('linkedin', e.target.value)}
                            disabled={!isEditing}
                            placeholder="https://linkedin.com/in/username"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            GitHub
                        </label>
                        <input
                            type="url"
                            value={profileData.github}
                            onChange={(e) => handleInputChange('github', e.target.value)}
                            disabled={!isEditing}
                            placeholder="https://github.com/username"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                        />
                    </div>
                </div>

                {isEditing && (
                    <div className="flex gap-3 mt-6">
                        <Button
                            onClick={handleSaveProfile}
                            disabled={loading}
                            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
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
                        >
                            Cancel
                        </Button>
                    </div>
                )}
            </Card>

            {/* Password Change Form */}
            {showPasswordForm && (
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-blue-500" />
                        Change Password
                    </h3>

                    <div className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Current Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.current ? 'text' : 'password'}
                                    value={passwordData.currentPassword}
                                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.new ? 'text' : 'password'}
                                    value={passwordData.newPassword}
                                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.confirm ? 'text' : 'password'}
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button
                                onClick={handleChangePassword}
                                disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                                className="bg-blue-500 hover:bg-blue-600"
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors hover:scale-105 active:scale-95"
                        >
                            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                    {/* Sidebar - Mobile: Horizontal scroll, Desktop: Vertical */}
                    <div className="lg:col-span-1">
                        <Card className="p-3 sm:p-4">
                            {/* Mobile: Horizontal navigation */}
                            <nav className="lg:space-y-2">
                                <div className="flex lg:flex-col gap-2 lg:gap-0 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
                                    <button
                                        onClick={() => setActiveTab('profile')}
                                        className={`flex-shrink-0 lg:w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-left transition-colors text-sm sm:text-base ${activeTab === 'profile'
                                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        <User className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span className="whitespace-nowrap">Profile</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('preferences')}
                                        className={`flex-shrink-0 lg:w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-left transition-colors text-sm sm:text-base ${activeTab === 'preferences'
                                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span className="whitespace-nowrap">Preferences</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('security')}
                                        className={`flex-shrink-0 lg:w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-left transition-colors text-sm sm:text-base ${activeTab === 'security'
                                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
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
                                <Card className="p-4 sm:p-6">
                                    <h3 className="text-lg font-semibold mb-4">Preferences</h3>
                                    <p className="text-gray-600">Preferences settings coming soon...</p>
                                </Card>
                            )}
                            {activeTab === 'security' && (
                                <Card className="p-4 sm:p-6">
                                    <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
                                    <p className="text-gray-600">Security settings coming soon...</p>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
