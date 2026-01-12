import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Link as LinkIcon, FileText, Video, AlertCircle, ChevronRight, ChevronLeft, Check, Layers, BookOpen, Calendar, Edit2 } from 'lucide-react';
import { Button } from './button';
import toast from 'react-hot-toast';
import { BRANCHES } from '../../utils/constants';

const UploadResourceModal = ({ isOpen, onClose, onUpload, selectedBranch, initialData, isEditing = false }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'pdf',
        url: '',
        subject: '',
        semester: [],
        branch: [],
        tags: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setErrors({});
            if (isEditing && initialData) {
                // Edit Mode: Pre-fill data and go to Step 3
                setFormData({
                    title: initialData.title || '',
                    description: initialData.description || '',
                    type: initialData.type || 'pdf',
                    url: initialData.url || '',
                    subject: initialData.subject || '',
                    semester: Array.isArray(initialData.semester) ? initialData.semester : (initialData.semester ? [initialData.semester] : []),
                    branch: Array.isArray(initialData.branch) ? initialData.branch : (initialData.branch ? [initialData.branch] : []),
                    tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : (initialData.tags || '')
                });
                setStep(3);
            } else {
                // Upload Mode
                setFormData({
                    title: '', description: '', type: 'pdf', url: '',
                    subject: '', semester: [], branch: selectedBranch ? (selectedBranch === 'all' ? ['all'] : [selectedBranch]) : [], tags: ''
                });

                // If branch is pre-selected, skip to Step 2
                if (selectedBranch) {
                    setStep(2);
                } else {
                    setStep(1);
                }
            }
        }
    }, [isOpen, selectedBranch, initialData, isEditing]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateStep1 = () => {
        if (formData.branch.length === 0) {
            setErrors({ branch: 'Please select at least one branch' });
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        if (formData.semester.length === 0) {
            setErrors({ semester: 'Please select at least one semester' });
            return false;
        }
        return true;
    };

    const validateStep3 = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.url.trim()) newErrors.url = 'URL is required';
        else {
            if (formData.type === 'video') {
                const isYouTube = formData.url.includes('youtube.com') || formData.url.includes('youtu.be');
                if (!isYouTube) newErrors.url = 'Please provide a valid YouTube URL';
            } else if (formData.type === 'pdf') {
                const isGoogleDrive = formData.url.includes('drive.google.com');
                if (!isGoogleDrive) newErrors.url = 'Please provide a valid Google Drive URL';
            }
        }
        if (!formData.subject.trim()) newErrors.subject = 'Subject is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (step === 1 && validateStep1()) setStep(2);
        else if (step === 2 && validateStep2()) setStep(3);
    };

    const handleBack = () => {
        // If editing, maybe prevent going back or handle gracefully? 
        // For now allowing navigation back to change branch/sem if needed.
        // If uploading with pre-selected branch, prevent going to step 1?
        if (step === 2 && selectedBranch && !isEditing) {
            // If we started at step 2 because of selectedBranch, we technically shouldn't go back to 1
            // But user might want to change branch to 'all'? Let's allow it but warn or simple allow.
            // Request said: "only show select semester and than detail no need to select branch"
            // So if selectedBranch exists, back from step 2 should probably close or do nothing?
            // Let's assume we can go back to allow changing to 'all' if they want.
            setStep(1);
        } else if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep3()) return;

        setIsSubmitting(true);
        try {
            const tagsArray = formData.tags
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);

            await onUpload({
                ...formData,
                _id: initialData?._id, // Pass ID if editing
                tags: tagsArray
            });

            // Reset handled by effect or parent logic usually
        } catch (error) {
            console.error('Submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getUrlPlaceholder = () => {
        switch (formData.type) {
            case 'video': return 'https://youtube.com/watch?v=...';
            case 'pdf': return 'https://drive.google.com/file/d/...';
            default: return 'Enter URL';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))] rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="border-b border-[rgb(var(--border-subtle))] p-4 sm:p-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[rgb(var(--accent))] rounded-lg">
                                    {isEditing ? <Edit2 className="w-5 h-5 text-white" /> : <Upload className="w-5 h-5 text-white" />}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">
                                        {isEditing ? 'Edit Resource' : 'Upload Resource'}
                                    </h2>
                                    <p className="text-sm text-[rgb(var(--text-muted))]">Step {step} of 3</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-[rgb(var(--bg-elevated))] rounded-lg transition-colors">
                                <X className="w-5 h-5 text-[rgb(var(--text-secondary))]" />
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-1 bg-[rgb(var(--border-subtle))] w-full">
                            <motion.div
                                className="h-full bg-[rgb(var(--accent))]"
                                initial={{ width: '33%' }}
                                animate={{ width: `${step * 33.33}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                            {step === 1 && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4 flex items-center gap-2">
                                        <Layers className="w-5 h-5 text-[rgb(var(--accent))]" />
                                        Select Branch
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {/* All Branches Option */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData(prev => {
                                                    const isAllSelected = prev.branch.includes('all');
                                                    if (isAllSelected) {
                                                        return { ...prev, branch: [] }; // Deselect
                                                    } else {
                                                        return { ...prev, branch: ['all'] }; // Select only all
                                                    }
                                                });
                                                setErrors(prev => ({ ...prev, branch: '' }));
                                            }}
                                            className={`p-4 border-2 rounded-xl text-left transition-all ${formData.branch.includes('all')
                                                ? 'border-[rgb(var(--accent))] bg-[rgb(var(--accent))]/10'
                                                : 'border-[rgb(var(--border-subtle))] hover:border-[rgb(var(--accent))]/50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg bg-gradient-to-br from-gray-500 to-gray-700`}>
                                                    <Layers className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-[rgb(var(--text-primary))]">All Branches</h4>
                                                    <p className="text-xs text-[rgb(var(--text-muted))]">For common subjects</p>
                                                </div>
                                                {formData.branch.includes('all') && <Check className="w-5 h-5 text-[rgb(var(--accent))] ml-auto" />}
                                            </div>
                                        </button>

                                        {BRANCHES.map(branch => {
                                            const Icon = branch.icon;
                                            const isSelected = formData.branch.includes(branch.id);
                                            return (
                                                <button
                                                    key={branch.id}
                                                    type="button"
                                                    disabled={formData.branch.includes('all')}
                                                    onClick={() => {
                                                        setFormData(prev => {
                                                            const newBranches = isSelected
                                                                ? prev.branch.filter(b => b !== branch.id)
                                                                : [...prev.branch, branch.id];
                                                            return { ...prev, branch: newBranches };
                                                        });
                                                        setErrors(prev => ({ ...prev, branch: '' }));
                                                    }}
                                                    className={`p-4 border-2 rounded-xl text-left transition-all ${isSelected
                                                        ? 'border-[rgb(var(--accent))] bg-[rgb(var(--accent))]/10'
                                                        : 'border-[rgb(var(--border-subtle))] hover:border-[rgb(var(--accent))]/50'
                                                        } ${formData.branch.includes('all') ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg bg-gradient-to-br ${branch.color}`}>
                                                            <Icon className="w-5 h-5 text-white" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-[rgb(var(--text-primary))]">{branch.name}</h4>
                                                            <p className="text-xs text-[rgb(var(--text-muted))] line-clamp-1">{branch.description}</p>
                                                        </div>
                                                        {isSelected && <Check className="w-5 h-5 text-[rgb(var(--accent))] ml-auto" />}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {errors.branch && <p className="text-red-500 text-sm mt-2">{errors.branch}</p>}
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4 flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-[rgb(var(--accent))]" />
                                        Select Semester
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => {
                                            const semValue = `Semester ${sem}`;
                                            const isSelected = formData.semester.includes(semValue);
                                            return (
                                                <button
                                                    key={sem}
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData(prev => {
                                                            const newSemesters = isSelected
                                                                ? prev.semester.filter(s => s !== semValue)
                                                                : [...prev.semester, semValue];
                                                            return { ...prev, semester: newSemesters };
                                                        });
                                                        setErrors(prev => ({ ...prev, semester: '' }));
                                                    }}
                                                    className={`p-4 border-2 rounded-xl text-center transition-all ${isSelected
                                                        ? 'border-[rgb(var(--accent))] bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))] font-bold'
                                                        : 'border-[rgb(var(--border-subtle))] hover:border-[rgb(var(--accent))]/50 text-[rgb(var(--text-primary))]'
                                                        }`}
                                                >
                                                    <span className="text-lg">Sem {sem}</span>
                                                    {isSelected && <Check className="w-4 h-4 mx-auto mt-1" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {errors.semester && <p className="text-red-500 text-sm mt-2">{errors.semester}</p>}
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4 flex items-center gap-2">
                                        <BookOpen className="w-5 h-5 text-[rgb(var(--accent))]" />
                                        Resource Details
                                    </h3>

                                    {/* Type Selection */}
                                    <div className="flex gap-4 mb-6">
                                        {[
                                            { value: 'pdf', label: 'PDF', icon: FileText },
                                            { value: 'video', label: 'Video', icon: Video },
                                            { value: 'link', label: 'Link', icon: LinkIcon }
                                        ].map(type => {
                                            const Icon = type.icon;
                                            return (
                                                <button
                                                    key={type.value}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                                                    className={`flex-1 p-3 rounded-lg border flex items-center justify-center gap-2 transition-all ${formData.type === type.value
                                                        ? 'bg-[rgb(var(--accent))] text-white border-[rgb(var(--accent))]'
                                                        : 'border-[rgb(var(--border-subtle))] hover:bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-primary))]'
                                                        }`}
                                                >
                                                    <Icon className="w-4 h-4" />
                                                    {type.label}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-[rgb(var(--text-primary))]">Title *</label>
                                            <input
                                                type="text"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleChange}
                                                className={`w-full mt-1 px-4 py-2 bg-[rgb(var(--bg-body))] border rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] ${errors.title ? 'border-red-500' : 'border-[rgb(var(--border-subtle))]'}`}
                                                placeholder="e.g. Advanced Java Notes"
                                            />
                                            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-[rgb(var(--text-primary))]">Subject *</label>
                                            <input
                                                type="text"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                className={`w-full mt-1 px-4 py-2 bg-[rgb(var(--bg-body))] border rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] ${errors.subject ? 'border-red-500' : 'border-[rgb(var(--border-subtle))]'}`}
                                                placeholder="e.g. Java Programming"
                                            />
                                            {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-[rgb(var(--text-primary))]">URL *</label>
                                            <input
                                                type="url"
                                                name="url"
                                                value={formData.url}
                                                onChange={handleChange}
                                                className={`w-full mt-1 px-4 py-2 bg-[rgb(var(--bg-body))] border rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] ${errors.url ? 'border-red-500' : 'border-[rgb(var(--border-subtle))]'}`}
                                                placeholder={getUrlPlaceholder()}
                                            />
                                            {errors.url && <p className="text-red-500 text-xs mt-1">{errors.url}</p>}
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-[rgb(var(--text-primary))]">Description</label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                rows={3}
                                                className="w-full mt-1 px-4 py-2 bg-[rgb(var(--bg-body))] border border-[rgb(var(--border-subtle))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))]"
                                                placeholder="Optional details..."
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-[rgb(var(--text-primary))]">Tags</label>
                                            <input
                                                type="text"
                                                name="tags"
                                                value={formData.tags}
                                                onChange={handleChange}
                                                className="w-full mt-1 px-4 py-2 bg-[rgb(var(--bg-body))] border border-[rgb(var(--border-subtle))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))]"
                                                placeholder="comma, separated, tags"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Buttons */}
                        <div className="p-4 sm:p-6 border-t border-[rgb(var(--border-subtle))] flex justify-between gap-3">
                            <div className="flex gap-2">
                                {/* Only show back button if not on Step 1. */}
                                {/* Also if on Step 2 AND selectedBranch was passed, and not editing? 
                                    If we allow going back to select 'all', then just show back button always when step > 1 */}
                                {step > 1 && (
                                    <Button onClick={handleBack} variant="outline" className="border-[rgb(var(--border))] text-[rgb(var(--text-primary))]">
                                        <ChevronLeft className="w-4 h-4 mr-2" />
                                        Back
                                    </Button>
                                )}
                            </div>

                            {step < 3 ? (
                                <Button onClick={handleNext} className="bg-[rgb(var(--accent))] text-white hover:bg-[rgb(var(--accent-hover))]">
                                    Next
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            ) : (
                                <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-[rgb(var(--accent))] text-white hover:bg-[rgb(var(--accent-hover))]">
                                    {isSubmitting ? (isEditing ? 'Updating...' : 'Uploading...') : (isEditing ? 'Update Resource' : 'Submit Resource')}
                                </Button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default UploadResourceModal;
