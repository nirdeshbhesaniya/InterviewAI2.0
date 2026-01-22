import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ExternalLink, X, ArrowRight } from 'lucide-react';
import { Button } from './button';

const DuplicateContentModal = ({ isOpen, onClose, existingItem, type = 'resource', onView }) => {
    if (!existingItem) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
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
                        className="relative w-full max-w-md bg-[rgb(var(--bg-card))] border border-yellow-500/30 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-4">
                                    <AlertCircle className="w-8 h-8 text-yellow-500" />
                                </div>
                                <h3 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-2">
                                    Already Exists!
                                </h3>
                                <p className="text-[rgb(var(--text-secondary))] mb-6">
                                    This {type} link is already in our database. We've prevented the duplicate to keep things organized.
                                </p>

                                <div className="w-full bg-[rgb(var(--bg-body-alt))] p-4 rounded-xl border border-[rgb(var(--border-subtle))] mb-6 text-left">
                                    <h4 className="font-semibold text-[rgb(var(--text-primary))] mb-1 truncate">
                                        {existingItem.title}
                                    </h4>
                                    <p className="text-xs text-[rgb(var(--text-muted))] mb-3 line-clamp-2">
                                        {existingItem.description || 'No description available'}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-[rgb(var(--text-secondary))]">
                                        <span>Uploaded by: {existingItem.uploadedByName || existingItem.userName || 'Unknown'}</span>
                                        <span>{new Date(existingItem.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex gap-3 w-full">
                                    <Button
                                        onClick={onClose}
                                        variant="outline"
                                        className="flex-1 border-[rgb(var(--border))] text-[rgb(var(--text-secondary))]"
                                    >
                                        Close
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            onView(existingItem);
                                            onClose();
                                        }}
                                        className="flex-1 bg-[rgb(var(--accent))] text-white hover:bg-[rgb(var(--accent-hover))]"
                                    >
                                        View Existing
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DuplicateContentModal;
