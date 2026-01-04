import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Link as LinkIcon, Linkedin, Github, User, Globe } from 'lucide-react';

const CreatorInfoModal = ({ isOpen, onClose, creator }) => {
    if (!creator) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="w-full max-w-md bg-[rgb(var(--bg-card))] rounded-2xl shadow-xl border border-[rgb(var(--border))] overflow-hidden"
                    >
                        {/* Header with Cover & Avatar */}
                        <div className="relative h-24 bg-gradient-to-r from-[rgb(var(--accent))] to-purple-600">
                            <button
                                onClick={onClose}
                                className="absolute top-3 right-3 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            <div className="absolute -bottom-10 left-6">
                                <div className="w-20 h-20 rounded-full border-4 border-[rgb(var(--bg-card))] bg-[rgb(var(--bg-card-alt))] shadow-lg flex items-center justify-center overflow-hidden">
                                    {creator.photo ? (
                                        <img src={creator.photo} alt={creator.fullName} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-10 h-10 text-[rgb(var(--text-muted))]" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="pt-12 px-6 pb-6">
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">
                                    {creator.fullName || 'Unknown Creator'}
                                </h2>
                                <div className="flex items-center gap-2 mt-1 text-sm text-[rgb(var(--text-muted))]">
                                    {creator.location && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5" />
                                            {creator.location}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Bio */}
                            {creator.bio && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))] mb-2">About</h3>
                                    <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed">
                                        {creator.bio}
                                    </p>
                                </div>
                            )}

                            {/* Social Links */}
                            <div className="space-y-3">
                                {creator.website && (
                                    <a
                                        href={creator.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-xl bg-[rgb(var(--bg-card-alt))]/50 hover:bg-[rgb(var(--bg-card-alt))] transition-colors border border-[rgb(var(--border-subtle))]"
                                    >
                                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                            <Globe className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-[rgb(var(--text-primary))]">Website</p>
                                            <p className="text-xs text-[rgb(var(--text-muted))] truncate">{creator.website}</p>
                                        </div>
                                        <LinkIcon className="w-4 h-4 text-[rgb(var(--text-muted))]" />
                                    </a>
                                )}

                                {creator.linkedin && (
                                    <a
                                        href={creator.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-xl bg-[rgb(var(--bg-card-alt))]/50 hover:bg-[rgb(var(--bg-card-alt))] transition-colors border border-[rgb(var(--border-subtle))]"
                                    >
                                        <div className="p-2 bg-blue-600/10 rounded-lg text-blue-600">
                                            <Linkedin className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-[rgb(var(--text-primary))]">LinkedIn</p>
                                            <p className="text-xs text-[rgb(var(--text-muted))] truncate">View Profile</p>
                                        </div>
                                        <LinkIcon className="w-4 h-4 text-[rgb(var(--text-muted))]" />
                                    </a>
                                )}

                                {creator.github && (
                                    <a
                                        href={creator.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-xl bg-[rgb(var(--bg-card-alt))]/50 hover:bg-[rgb(var(--bg-card-alt))] transition-colors border border-[rgb(var(--border-subtle))]"
                                    >
                                        <div className="p-2 bg-gray-800/10 dark:bg-white/10 rounded-lg text-gray-800 dark:text-white">
                                            <Github className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-[rgb(var(--text-primary))]">GitHub</p>
                                            <p className="text-xs text-[rgb(var(--text-muted))] truncate">View Profile</p>
                                        </div>
                                        <LinkIcon className="w-4 h-4 text-[rgb(var(--text-muted))]" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CreatorInfoModal;
