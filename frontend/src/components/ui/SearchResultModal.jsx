import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Calendar, User, Eye, BookOpen, Video, FileText, ChevronRight, Download } from 'lucide-react';
import { Button } from './button';
import moment from 'moment';

const SearchResultModal = ({ isOpen, onClose, result, onAction }) => {
    if (!result) return null;

    // Helper to get icon based on type
    const getTypeIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'note': return FileText;
            case 'resource': return BookOpen;
            case 'video': return Video;
            case 'interview': return User; // Or similar
            default: return FileText;
        }
    };

    const TypeIcon = getTypeIcon(result.type);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-all"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-50 px-4"
                    >
                        <div className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))] rounded-2xl shadow-2xl overflow-hidden relative">

                            {/* Header Gradient */}
                            <div className="h-32 bg-gradient-to-r from-[rgb(var(--accent))] to-[#22D3EE] relative overflow-hidden">
                                <div className="absolute inset-0 bg-black/10" />
                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl" />
                                <div className="absolute top-4 right-4 z-10">
                                    <button
                                        onClick={onClose}
                                        className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="px-6 pb-6 -mt-12 relative">
                                {/* Type Badge */}
                                <div className="flex justify-between items-end mb-4">
                                    <div className="bg-[rgb(var(--bg-card))] p-1.5 rounded-xl shadow-lg inline-block">
                                        <div className="bg-[rgb(var(--accent))]/10 p-3 rounded-lg border border-[rgb(var(--accent))]/20">
                                            <TypeIcon className="w-8 h-8 text-[rgb(var(--accent))]" />
                                        </div>
                                    </div>

                                    {/* Action Buttons (Top Right for Desktop) */}
                                    <div className="hidden sm:flex gap-2">
                                        <Button
                                            onClick={() => onAction(result, 'view')}
                                            className="bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white"
                                        >
                                            <ExternalLink className="w-4 h-4 mr-2" />
                                            Open {result.type}
                                        </Button>
                                    </div>
                                </div>

                                {/* Title & Meta */}
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-0.5 rounded-full bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))] text-xs font-bold uppercase tracking-wider border border-[rgb(var(--accent))]/20">
                                                {result.type}
                                            </span>
                                            {result.status === 'pending' && (
                                                <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600 text-xs font-bold uppercase tracking-wider border border-yellow-500/20">
                                                    Pending
                                                </span>
                                            )}
                                        </div>
                                        <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))] leading-tight">
                                            {result.title}
                                        </h2>
                                    </div>

                                    {/* Location Path - Always Show */}
                                    <div className="flex items-center gap-2 text-sm bg-[rgb(var(--bg-elevated))] p-3 rounded-lg border border-[rgb(var(--border-subtle))]">
                                        <span className="text-[rgb(var(--text-muted))]">📍 Location:</span>
                                        <span className="font-medium text-[rgb(var(--text-primary))]">
                                            {result.locationPath || result.path?.replace('/', '') || 'Unknown'}
                                        </span>
                                    </div>

                                    {/* Context Path (Breadcrumbs) - Only for Notes/Resources */}
                                    {(result.branch || result.semester || result.subject) && (
                                        <div className="flex flex-wrap items-center gap-2 text-sm text-[rgb(var(--text-secondary))] bg-[rgb(var(--bg-body))] p-3 rounded-lg border border-[rgb(var(--border-subtle))]">
                                            {result.branch && (
                                                <span className="font-medium text-[rgb(var(--text-primary))] capitalize">
                                                    {Array.isArray(result.branch) ? result.branch.join(', ') : result.branch}
                                                </span>
                                            )}
                                            {result.semester && (
                                                <>
                                                    <ChevronRight className="w-4 h-4 text-[rgb(var(--text-muted))]" />
                                                    <span>{Array.isArray(result.semester) ? result.semester.join(', ') : result.semester}</span>
                                                </>
                                            )}
                                            {result.subject && (
                                                <>
                                                    <ChevronRight className="w-4 h-4 text-[rgb(var(--text-muted))]" />
                                                    <span className="text-[rgb(var(--accent))] font-medium">{result.subject}</span>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* Description */}
                                    <p className="text-[rgb(var(--text-secondary))] leading-relaxed text-sm sm:text-base">
                                        {result.desc || result.description || "No description available."}
                                    </p>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4 border-t border-[rgb(var(--border-subtle))]">
                                        <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))]">
                                            <User className="w-4 h-4 text-[rgb(var(--accent))]" />
                                            <span className="text-sm truncate">
                                                {result.uploadedByName || result.author || "Unknown"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))]">
                                            <Calendar className="w-4 h-4 text-[rgb(var(--accent))]" />
                                            <span className="text-sm">
                                                {result.createdAt ? moment(result.createdAt).format('MMM D, YYYY') : "Recently"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))]">
                                            <Eye className="w-4 h-4 text-[rgb(var(--accent))]" />
                                            <span className="text-sm">
                                                {result.views || 0} views
                                            </span>
                                        </div>
                                    </div>

                                    {/* Mobile Actions */}
                                    <div className="flex sm:hidden flex-col gap-3 pt-2">
                                        <Button
                                            onClick={() => onAction(result, 'view')}
                                            className="w-full bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white h-12 text-base"
                                        >
                                            <ExternalLink className="w-5 h-5 mr-2" />
                                            Open {result.type}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SearchResultModal;
