import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Check, X, Eye, EyeOff, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from '../../../utils/axiosInstance';
import { API } from '../../../utils/apiPaths';
import toast from 'react-hot-toast';
import { Badge } from '@/components/ui/badge';

const FeedbackManagement = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchFeedbacks(page);
    }, [page]);

    const fetchFeedbacks = async (currentPage) => {
        setLoading(true);
        try {
            const res = await axios.get(API.FEEDBACK.ADMIN_GET_ALL, {
                params: { page: currentPage, limit: 10 }
            });
            // Handle both structure types for backward compatibility safety or direct new structure
            if (res.data.pagination) {
                setFeedbacks(res.data.feedbacks);
                setTotalPages(res.data.pagination.pages);
            } else {
                setFeedbacks(res.data); // Fallback if backend reverts
            }
        } catch (error) {
            console.error('Failed to fetch feedback:', error);
            toast.error('Failed to load feedback');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFeature = async (id, currentStatus) => {
        try {
            await axios.patch(API.FEEDBACK.ADMIN_UPDATE(id), { isFeatured: !currentStatus });
            setFeedbacks(prev => prev.map(f => f._id === id ? { ...f, isFeatured: !currentStatus } : f));
            toast.success(currentStatus ? 'Removed from featured' : 'Marked as featured');
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleToggleVisibility = async (id, currentStatus) => {
        try {
            await axios.patch(API.FEEDBACK.ADMIN_UPDATE(id), { isVisible: !currentStatus });
            setFeedbacks(prev => prev.map(f => f._id === id ? { ...f, isVisible: !currentStatus } : f));
            toast.success(currentStatus ? 'Hidden from public' : 'Visible to public');
        } catch (error) {
            toast.error('Failed to update visibility');
        }
    };

    // Calculate stats
    const totalFeedback = feedbacks.length;
    const avgRating = totalFeedback ? (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / totalFeedback).toFixed(1) : 0;
    const featuredCount = feedbacks.filter(f => f.isFeatured).length;

    if (loading) {
        return <div className="flex justify-center p-8">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[rgb(var(--bg-card))] p-4 rounded-xl border border-[rgb(var(--border))] shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm text-[rgb(var(--text-secondary))]">Total Reviews</p>
                            <h3 className="text-2xl font-bold text-[rgb(var(--text-primary))]">{totalFeedback}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-[rgb(var(--bg-card))] p-4 rounded-xl border border-[rgb(var(--border))] shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                            <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-sm text-[rgb(var(--text-secondary))]">Average Rating</p>
                            <h3 className="text-2xl font-bold text-[rgb(var(--text-primary))]">{avgRating}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-[rgb(var(--bg-card))] p-4 rounded-xl border border-[rgb(var(--border))] shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm text-[rgb(var(--text-secondary))]">Featured Reviews</p>
                            <h3 className="text-2xl font-bold text-[rgb(var(--text-primary))]">{featuredCount}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                <AnimatePresence>
                    {feedbacks.map((feedback) => (
                        <motion.div
                            key={feedback._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-[rgb(var(--bg-card))] p-4 sm:p-6 rounded-xl border border-[rgb(var(--border))] hover:shadow-md transition-shadow"
                        >
                            <div className="flex flex-col sm:flex-row justify-between gap-4">
                                {/* User Info & Content */}
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <img
                                            src={feedback.user?.photo || `https://ui-avatars.com/api/?name=${feedback.user?.fullName || 'User'}&background=random`}
                                            alt={feedback.user?.fullName}
                                            className="w-10 h-10 rounded-full object-cover border border-[rgb(var(--border))]"
                                        />
                                        <div>
                                            <h4 className="font-semibold text-[rgb(var(--text-primary))]">
                                                {feedback.user?.fullName || 'Unknown User'}
                                            </h4>
                                            <div className="flex items-center gap-2 text-xs text-[rgb(var(--text-muted))]">
                                                <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span className="flex items-center text-yellow-500">
                                                    {feedback.rating} <Star className="w-3 h-3 ml-0.5 fill-current" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[rgb(var(--text-secondary))] leading-relaxed">
                                        "{feedback.comment}"
                                    </p>
                                </div>

                                {/* Controls */}
                                <div className="flex sm:flex-col items-center gap-2 border-t sm:border-t-0 sm:border-l border-[rgb(var(--border))] pt-4 sm:pt-0 sm:pl-4">
                                    <button
                                        onClick={() => handleToggleFeature(feedback._id, feedback.isFeatured)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors w-full ${feedback.isFeatured
                                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                            : 'bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'
                                            }`}
                                    >
                                        <Star className={`w-4 h-4 ${feedback.isFeatured ? 'fill-current' : ''}`} />
                                        {feedback.isFeatured ? 'Featured' : 'Feature'}
                                    </button>

                                    <button
                                        onClick={() => handleToggleVisibility(feedback._id, feedback.isVisible)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors w-full ${feedback.isVisible
                                            ? 'bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'
                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            }`}
                                    >
                                        {feedback.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        {feedback.isVisible ? 'Visible' : 'Hidden'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {feedbacks.length === 0 && !loading && (
                    <div className="text-center py-12 text-[rgb(var(--text-muted))]">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No feedback received yet</p>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8 py-4">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 rounded-lg border border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-elevated))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-[rgb(var(--text-secondary))]" />
                    </button>

                    <span className="text-sm font-medium text-[rgb(var(--text-secondary))]">
                        Page {page} of {totalPages}
                    </span>

                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-2 rounded-lg border border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-elevated))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 text-[rgb(var(--text-secondary))]" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default FeedbackManagement;
