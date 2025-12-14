import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Link as LinkIcon, FileText, Video, AlertCircle } from 'lucide-react';
import { Button } from './button';
import toast from 'react-hot-toast';

const UploadResourceModal = ({ isOpen, onClose, onUpload, selectedBranch }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'pdf',
        url: '',
        subject: '',
        semester: 'Semester 1',
        tags: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.url.trim()) {
            newErrors.url = 'URL is required';
        } else {
            // Validate URL based on type
            if (formData.type === 'video') {
                const isYouTube = formData.url.includes('youtube.com') || formData.url.includes('youtu.be');
                if (!isYouTube) {
                    newErrors.url = 'Please provide a valid YouTube URL';
                }
            } else if (formData.type === 'pdf') {
                const isGoogleDrive = formData.url.includes('drive.google.com');
                if (!isGoogleDrive) {
                    newErrors.url = 'Please provide a valid Google Drive URL';
                }
            }
        }

        if (!formData.subject.trim()) {
            newErrors.subject = 'Subject is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setIsSubmitting(true);

        try {
            const tagsArray = formData.tags
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);

            await onUpload({
                ...formData,
                branch: selectedBranch,
                tags: tagsArray
            });

            // Reset form
            setFormData({
                title: '',
                description: '',
                type: 'pdf',
                url: '',
                subject: '',
                semester: 'Semester 1',
                tags: ''
            });
            setErrors({});
        } catch (error) {
            console.error('Upload error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getUrlPlaceholder = () => {
        switch (formData.type) {
            case 'video':
                return 'https://youtube.com/watch?v=...';
            case 'pdf':
                return 'https://drive.google.com/file/d/...';
            case 'link':
                return 'https://example.com/resource';
            default:
                return 'Enter URL';
        }
    };

    const getUrlHelp = () => {
        switch (formData.type) {
            case 'video':
                return 'Enter a YouTube video URL';
            case 'pdf':
                return 'Enter a Google Drive shareable link';
            case 'link':
                return 'Enter any valid URL';
            default:
                return '';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))] rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-[rgb(var(--bg-card))] border-b border-[rgb(var(--border-subtle))] p-4 sm:p-6 flex items-center justify-between z-10">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="p-1.5 sm:p-2 bg-[rgb(var(--accent))] rounded-lg">
                                    <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg sm:text-xl font-bold text-[rgb(var(--text-primary))]">Upload Resource</h2>
                                    <p className="text-xs sm:text-sm text-[rgb(var(--text-muted))]">Share study materials with your peers</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-[rgb(var(--bg-elevated))] rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-[rgb(var(--text-secondary))]" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g., Data Structures Notes PDF"
                                    className={`w-full px-4 py-3 bg-[rgb(var(--bg-body))] border ${errors.title ? 'border-red-500' : 'border-[rgb(var(--border-subtle))]'
                                        } rounded-lg text-[rgb(var(--text-primary))] placeholder-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]`}
                                />
                                {errors.title && (
                                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Brief description of the resource..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-[rgb(var(--bg-body))] border border-[rgb(var(--border-subtle))] rounded-lg text-[rgb(var(--text-primary))] placeholder-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))] resize-none"
                                />
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                    Resource Type <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {[
                                        { value: 'pdf', label: 'PDF Document', icon: FileText },
                                        { value: 'video', label: 'Video', icon: Video },
                                        { value: 'link', label: 'External Link', icon: LinkIcon }
                                    ].map((typeOption) => {
                                        const TypeIcon = typeOption.icon;
                                        return (
                                            <button
                                                key={typeOption.value}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, type: typeOption.value }))}
                                                className={`p-4 border-2 rounded-lg transition-all ${formData.type === typeOption.value
                                                        ? 'border-[rgb(var(--accent))] bg-[rgb(var(--accent))]/10'
                                                        : 'border-[rgb(var(--border-subtle))] hover:border-[rgb(var(--accent))]/50'
                                                    }`}
                                            >
                                                <TypeIcon className={`w-6 h-6 mx-auto mb-2 ${formData.type === typeOption.value ? 'text-[rgb(var(--accent))]' : 'text-[rgb(var(--text-muted))]'
                                                    }`} />
                                                <p className={`text-sm font-medium ${formData.type === typeOption.value ? 'text-[rgb(var(--accent))]' : 'text-[rgb(var(--text-secondary))]'
                                                    }`}>
                                                    {typeOption.label}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* URL */}
                            <div>
                                <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                    URL <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="url"
                                    name="url"
                                    value={formData.url}
                                    onChange={handleChange}
                                    placeholder={getUrlPlaceholder()}
                                    className={`w-full px-4 py-3 bg-[rgb(var(--bg-body))] border ${errors.url ? 'border-red-500' : 'border-[rgb(var(--border-subtle))]'
                                        } rounded-lg text-[rgb(var(--text-primary))] placeholder-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]`}
                                />
                                <p className="mt-1 text-xs text-[rgb(var(--text-muted))]">{getUrlHelp()}</p>
                                {errors.url && (
                                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.url}
                                    </p>
                                )}
                            </div>

                            {/* Subject and Semester */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                        Subject <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder="e.g., Data Structures"
                                        className={`w-full px-4 py-3 bg-[rgb(var(--bg-body))] border ${errors.subject ? 'border-red-500' : 'border-[rgb(var(--border-subtle))]'
                                            } rounded-lg text-[rgb(var(--text-primary))] placeholder-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]`}
                                    />
                                    {errors.subject && (
                                        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.subject}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                        Semester <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="semester"
                                        value={formData.semester}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-[rgb(var(--bg-body))] border border-[rgb(var(--border-subtle))] rounded-lg text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                            <option key={sem} value={`Semester ${sem}`}>
                                                Semester {sem}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                    Tags (Optional)
                                </label>
                                <input
                                    type="text"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    placeholder="e.g., arrays, sorting, algorithms (comma separated)"
                                    className="w-full px-4 py-3 bg-[rgb(var(--bg-body))] border border-[rgb(var(--border-subtle))] rounded-lg text-[rgb(var(--text-primary))] placeholder-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
                                />
                                <p className="mt-1 text-xs text-[rgb(var(--text-muted))]">Separate tags with commas</p>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <Button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 bg-[rgb(var(--bg-elevated))] hover:bg-[rgb(var(--bg-body))] text-[rgb(var(--text-primary))] border border-[rgb(var(--border-subtle))] order-2 sm:order-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white order-1 sm:order-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                                            />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4 mr-2" />
                                            Upload Resource
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default UploadResourceModal;
