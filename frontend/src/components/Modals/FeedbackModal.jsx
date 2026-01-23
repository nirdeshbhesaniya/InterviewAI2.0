import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Send, Loader2 } from 'lucide-react';
import axios from '../../utils/axiosInstance';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';

const FeedbackModal = ({ isOpen, onClose }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }
        if (!comment.trim()) {
            toast.error('Please write a comment');
            return;
        }

        setLoading(true);
        try {
            await axios.post(API.FEEDBACK.CREATE, { rating, comment });
            toast.success('Thank you for your feedback! 🌟');
            setRating(0);
            setComment('');
            onClose();
        } catch (error) {
            toast.error('Failed to submit feedback');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-[rgb(var(--bg-card))] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-[rgb(var(--border))]"
                >
                    {/* Header */}
                    <div className="relative p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-2xl font-bold mb-1">Your Feedback Matters</h2>
                        <p className="text-white/80 text-sm">Help us improve your interview preparation experience</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Rating */}
                        <div className="text-center">
                            <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-3">
                                How would you rate your experience?
                            </label>
                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(star)}
                                        className="p-1 focus:outline-none transition-transform hover:scale-110"
                                    >
                                        <Star
                                            className={`w-8 h-8 ${star <= (hoverRating || rating)
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-300 dark:text-gray-600'
                                                } transition-colors duration-200`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <p className="text-sm font-medium text-[rgb(var(--accent))] mt-2 h-5">
                                {rating === 5 && "Excellent! 🎉"}
                                {rating === 4 && "Very Good! 👏"}
                                {rating === 3 && "Good 🙂"}
                                {rating === 2 && "Fair 😐"}
                                {rating === 1 && "Poor 😞"}
                            </p>
                        </div>

                        {/* Comment */}
                        <div>
                            <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-2">
                                Share your thoughts
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="What did you like? What can we improve?"
                                className="w-full px-4 py-3 rounded-xl bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] text-[rgb(var(--text-primary))] focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent outline-none transition-all resize-none h-32"
                                maxLength={500}
                            />
                            <div className="text-right text-xs text-[rgb(var(--text-muted))] mt-1">
                                {comment.length}/500
                            </div>
                        </div>

                        {/* Actions */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold font-[Urbanist] flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Submit Feedback
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default FeedbackModal;
