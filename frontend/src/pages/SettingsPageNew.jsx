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
            <div className="min-h-screen flex items-center justify-center bg-bg-body">
                <Loader2 className="w-8 h-8 animate-spin text-highlight" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-body py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-bg-card-alt rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-text-muted" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
                        <p className="text-text-secondary">Manage your preferences</p>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="bg-bg-card rounded-xl shadow-lg border border-border-subtle p-6 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Bell className="w-6 h-6 text-highlight" />
                        <h2 className="text-xl font-bold text-text-primary">Notifications</h2>
                    </div>

                    <div className="space-y-4">
                        {Object.entries(settings.notifications).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between py-3 border-b border-border-subtle last:border-0">
                                <div>
                                    <p className="font-medium text-text-primary capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </p>
                                    <p className="text-sm text-text-muted">
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
                                    <div className="w-11 h-6 bg-bg-body peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-highlight/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-highlight peer-checked:to-secondary"></div>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Privacy Settings */}
                <div className="bg-bg-card rounded-xl shadow-lg border border-border-subtle p-6 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className="w-6 h-6 text-secondary" />
                        <h2 className="text-xl font-bold text-text-primary">Privacy</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                Profile Visibility
                            </label>
                            <select
                                value={settings.privacy.profileVisibility}
                                onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
                                className="w-full px-4 py-2 border border-border-subtle rounded-lg bg-bg-body text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="public">Public</option>
                                <option value="private">Private</option>
                                <option value="friends">Friends Only</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-text-primary">Show Email</p>
                                <p className="text-sm text-text-muted">Display email on your profile</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.privacy.showEmail}
                                    onChange={(e) => handleSettingChange('privacy', 'showEmail', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-bg-body peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-highlight/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-highlight peer-checked:to-secondary"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-text-primary">Show Stats</p>
                                <p className="text-sm text-text-muted">Display your statistics publicly</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.privacy.showStats}
                                    onChange={(e) => handleSettingChange('privacy', 'showStats', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-bg-body peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-highlight/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-highlight peer-checked:to-secondary"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Appearance Settings */}
                <div className="bg-bg-card rounded-xl shadow-lg border border-border-subtle p-6 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        {settings.appearance.theme === 'dark' ? (
                            <Moon className="w-6 h-6 text-primary" />
                        ) : (
                            <Sun className="w-6 h-6 text-highlight" />
                        )}
                        <h2 className="text-xl font-bold text-text-primary">Appearance</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                Theme
                            </label>
                            <select
                                value={settings.appearance.theme}
                                onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
                                className="w-full px-4 py-2 border border-border-subtle rounded-lg bg-bg-body text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                                <option value="auto">Auto</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                Language
                            </label>
                            <select
                                value={settings.appearance.language}
                                onChange={(e) => handleSettingChange('appearance', 'language', e.target.value)}
                                className="w-full px-4 py-2 border border-border-subtle rounded-lg bg-bg-body text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent"
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
                        className="px-6 py-3 bg-gradient-to-r from-highlight to-pink-500 hover:from-highlight/90 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-medium shadow-lg shadow-highlight/30 transition-all duration-200 flex items-center gap-2"
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
