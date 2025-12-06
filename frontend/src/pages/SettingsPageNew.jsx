// Complete working Settings Page with real backend integration
import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Bell,
    Moon,
    Sun,
    Globe,
    Shield,
    Save,
    Loader2
} from 'lucide-react';
import axios from '../utils/axiosInstance';
import { API } from '../utils/apiPaths';
import toast from 'react-hot-toast';

const SettingsPageNew = () => {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        notifications: {
            email: true,
            push: false,
            interviewReminders: true,
            weeklyReport: true,
            newFeatures: true,
            systemUpdates: true
        },
        privacy: {
            profileVisibility: 'public',
            showEmail: false,
            showStats: true
        },
        appearance: {
            theme: 'light',
            language: 'en'
        }
    });

    useEffect(() => {
        fetchSettings();
    }, [user]);

    const fetchSettings = async () => {
        if (!user?.email) return;

        try {
            const response = await axios.get(API.SETTINGS.GET(user.email));
            if (response.data.success) {
                setSettings(response.data.settings);
            }
        } catch (error) {
            console.error('Fetch settings error:', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSettingChange = async (category, setting, value) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [setting]: value
            }
        }));

        // Auto-save
        try {
            await axios.patch(API.SETTINGS.UPDATE_SPECIFIC(user.email, category, setting), { value });
            toast.success('Setting updated');
        } catch (error) {
            console.error('Update setting error:', error);
            toast.error('Failed to update setting');
        }
    };

    const handleSaveAll = async () => {
        setSaving(true);
        try {
            await axios.put(API.SETTINGS.UPDATE(user.email), settings);
            toast.success('All settings saved successfully!');
        } catch (error) {
            console.error('Save settings error:', error);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
                        <p className="text-gray-600 dark:text-gray-400">Manage your preferences</p>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Bell className="w-6 h-6 text-orange-500" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h2>
                    </div>

                    <div className="space-y-4">
                        {Object.entries(settings.notifications).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Receive notifications via {key === 'email' ? 'email' : 'push'}
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={value}
                                        onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Privacy Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className="w-6 h-6 text-orange-500" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Privacy</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Profile Visibility
                            </label>
                            <select
                                value={settings.privacy.profileVisibility}
                                onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="public">Public</option>
                                <option value="private">Private</option>
                                <option value="friends">Friends Only</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">Show Email</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Display email on your profile</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.privacy.showEmail}
                                    onChange={(e) => handleSettingChange('privacy', 'showEmail', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">Show Stats</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Display your statistics publicly</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.privacy.showStats}
                                    onChange={(e) => handleSettingChange('privacy', 'showStats', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Appearance Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        {settings.appearance.theme === 'dark' ? (
                            <Moon className="w-6 h-6 text-orange-500" />
                        ) : (
                            <Sun className="w-6 h-6 text-orange-500" />
                        )}
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Appearance</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Theme
                            </label>
                            <select
                                value={settings.appearance.theme}
                                onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                                <option value="auto">Auto</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Language
                            </label>
                            <select
                                value={settings.appearance.language}
                                onChange={(e) => handleSettingChange('appearance', 'language', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="en">English</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                                <option value="de">German</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSaveAll}
                        disabled={saving}
                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Save All Settings
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPageNew;
