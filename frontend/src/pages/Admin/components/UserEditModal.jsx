import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, User, Mail, MapPin, Briefcase, Key } from 'lucide-react';
import { Button } from '../../../components/ui/button';

const UserEditModal = ({ user, isOpen, onClose, onSave, currentUserRole }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        role: 'user',
        bio: '',
        location: '',
        website: '',
        linkedin: '',
        github: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                email: user.email || '',
                role: user.role || 'user',
                bio: user.bio || '',
                location: user.location || '',
                website: user.website || '',
                linkedin: user.linkedin || '',
                github: user.github || ''
            });
        }
    }, [user]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(user._id, formData);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-2xl bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))]">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))]">Edit User</h2>
                                <p className="text-xs text-[rgb(var(--text-secondary))]">Update user profile and permissions</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-[rgb(var(--bg-elevated-alt))] rounded-full text-[rgb(var(--text-muted))] transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <form id="edit-user-form" onSubmit={handleSubmit} className="space-y-6">

                            {/* Core Info Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider flex items-center gap-1">
                                        <User className="w-3 h-3" /> Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-xl text-sm focus:ring-2 focus:ring-[rgb(var(--accent))]/20 focus:border-[rgb(var(--accent))] outline-none transition-all"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider flex items-center gap-1">
                                        <Mail className="w-3 h-3" /> Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-xl text-sm focus:ring-2 focus:ring-[rgb(var(--accent))]/20 focus:border-[rgb(var(--accent))] outline-none transition-all"
                                        placeholder="john@example.com"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider flex items-center gap-1">
                                        <Key className="w-3 h-3" /> Role & Permissions
                                    </label>
                                    {currentUserRole === 'owner' ? (
                                        <select
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-xl text-sm focus:ring-2 focus:ring-[rgb(var(--accent))]/20 focus:border-[rgb(var(--accent))] outline-none transition-all cursor-pointer"
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                            <option value="owner">Owner</option>
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            value={formData.role}
                                            disabled
                                            className="w-full px-4 py-2.5 bg-[rgb(var(--bg-elevated))]/50 border border-[rgb(var(--border))] rounded-xl text-sm text-[rgb(var(--text-muted))] cursor-not-allowed"
                                        />
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> Location
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-xl text-sm focus:ring-2 focus:ring-[rgb(var(--accent))]/20 focus:border-[rgb(var(--accent))] outline-none transition-all"
                                        placeholder="City, Country"
                                    />
                                </div>
                            </div>

                            {/* Bio Section */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider flex items-center gap-1">
                                    <Briefcase className="w-3 h-3" /> Bio
                                </label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-xl text-sm focus:ring-2 focus:ring-[rgb(var(--accent))]/20 focus:border-[rgb(var(--accent))] outline-none transition-all resize-none"
                                    placeholder="Tell us about the user..."
                                />
                            </div>

                            {/* Social Links Section */}
                            <div className="space-y-4 pt-4 border-t border-[rgb(var(--border))]">
                                <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))]">Social Profiles</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <input
                                        type="text"
                                        value={formData.website}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        className="w-full px-4 py-2 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-lg text-xs outline-none focus:border-[rgb(var(--accent))]"
                                        placeholder="Website URL"
                                    />
                                    <input
                                        type="text"
                                        value={formData.linkedin}
                                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                                        className="w-full px-4 py-2 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-lg text-xs outline-none focus:border-[rgb(var(--accent))]"
                                        placeholder="LinkedIn URL"
                                    />
                                    <input
                                        type="text"
                                        value={formData.github}
                                        onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                                        className="w-full px-4 py-2 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-lg text-xs outline-none focus:border-[rgb(var(--accent))]"
                                        placeholder="GitHub URL"
                                    />
                                </div>
                            </div>

                        </form>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] flex justify-end gap-3 rounded-b-2xl">
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" form="edit-user-form" className="bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent))]/90 text-white shadow-lg shadow-[rgb(var(--accent))]/20">
                            <Save className="w-4 h-4 mr-2" /> Save Changes
                        </Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default UserEditModal;
