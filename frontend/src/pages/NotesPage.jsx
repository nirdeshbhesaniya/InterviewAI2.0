import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import axios from 'axios';
import { API } from '../utils/apiPaths';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    Youtube,
    Plus,
    Trash2,
    ExternalLink,
    Heart,
    Eye,
    Filter,
    X,
    Search,
    Calendar,
    User,
    Tag
} from 'lucide-react';
import toast from 'react-hot-toast';
import moment from 'moment';

const NotesPage = () => {
    const { user } = useContext(UserContext);
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pdf, youtube, my-notes
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        type: 'pdf',
        title: '',
        description: '',
        link: '',
        tags: ''
    });

    useEffect(() => {
        fetchNotes();
    }, [filter]);

    const fetchNotes = async () => {
        try {
            setLoading(true);
            let params = {};

            if (filter === 'pdf' || filter === 'youtube') {
                params.type = filter;
            } else if (filter === 'my-notes') {
                params.userId = user.email;
            }

            if (searchQuery) {
                params.search = searchQuery;
            }

            const response = await axios.get(API.NOTES.GET_ALL, { params });

            if (response.data.success) {
                setNotes(response.data.notes);
            }
        } catch (error) {
            console.error('Error fetching notes:', error);
            toast.error('Failed to fetch notes');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchNotes();
    };

    const handleAddNote = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(API.NOTES.CREATE, {
                userId: user.email,
                userName: user.name || 'Anonymous',
                userEmail: user.email,
                type: formData.type,
                title: formData.title,
                description: formData.description,
                link: formData.link,
                tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
            });

            if (response.data.success) {
                toast.success('Note added successfully!');
                setNotes([response.data.note, ...notes]);
                setShowAddModal(false);
                setFormData({
                    type: 'pdf',
                    title: '',
                    description: '',
                    link: '',
                    tags: ''
                });
            }
        } catch (error) {
            console.error('Error adding note:', error);
            toast.error(error.response?.data?.message || 'Failed to add note');
        }
    };

    const handleDeleteNote = async (noteId) => {
        if (!window.confirm('Are you sure you want to delete this note?')) {
            return;
        }

        try {
            const response = await axios.delete(API.NOTES.DELETE(noteId), {
                data: { userId: user.email }
            });

            if (response.data.success) {
                toast.success('Note deleted successfully!');
                setNotes(notes.filter(note => note._id !== noteId));
            }
        } catch (error) {
            console.error('Error deleting note:', error);
            toast.error(error.response?.data?.message || 'Failed to delete note');
        }
    };

    const handleLikeNote = async (noteId) => {
        try {
            const response = await axios.post(API.NOTES.LIKE(noteId), {
                userId: user.email,
                userName: user.name || 'Anonymous'
            });

            if (response.data.success) {
                setNotes(notes.map(note =>
                    note._id === noteId ? response.data.note : note
                ));
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            toast.error('Failed to toggle like');
        }
    };

    const openLink = async (link, noteId) => {
        try {
            // Track view count (only increments once per user)
            await axios.post(API.NOTES.VIEW(noteId), {
                userId: user.email
            });

            // Update local state to reflect new view count
            const response = await axios.get(API.NOTES.GET_ONE(noteId));
            if (response.data.success) {
                setNotes(notes.map(note =>
                    note._id === noteId ? response.data.note : note
                ));
            }
        } catch (error) {
            console.error('Error tracking view:', error);
        }

        // Open link in new tab
        window.open(link, '_blank', 'noopener,noreferrer');
    };

    const isLikedByUser = (note) => {
        return note.likes.some(like => like.userId === user.email);
    };

    const filterButtons = [
        { id: 'all', label: 'All Notes', icon: FileText },
        { id: 'pdf', label: 'PDFs', icon: FileText },
        { id: 'youtube', label: 'Videos', icon: Youtube },
        { id: 'my-notes', label: 'My Notes', icon: User }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-6">
            {/* Header */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
                                Shared Notes
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                                Share and discover study materials from the community
                            </p>
                        </div>

                        <button
                            onClick={() => setShowAddModal(true)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                        >
                            <Plus size={20} />
                            <span>Add Note</span>
                        </button>
                    </div>

                    {/* Search and Filters */}
                    <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search notes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                            />
                        </div>

                        <button
                            onClick={handleSearch}
                            className="w-full sm:w-auto px-6 py-2 sm:py-2.5 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors text-sm sm:text-base"
                        >
                            Search
                        </button>
                    </div>

                    {/* Filter Tabs */}
                    <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
                        {filterButtons.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setFilter(id)}
                                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold transition-all text-xs sm:text-sm ${filter === id
                                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                                <span>{label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Notes Grid */}
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
                    </div>
                ) : notes.length === 0 ? (
                    <div className="text-center py-12 sm:py-20 px-4">
                        <FileText size={48} className="sm:w-16 sm:h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-lg sm:text-xl font-bold text-gray-600 dark:text-gray-400 mb-2">
                            No notes found
                        </h3>
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-500">
                            {filter === 'my-notes'
                                ? 'You haven\'t added any notes yet. Click "Add Note" to get started!'
                                : 'Be the first to share a note with the community!'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        <AnimatePresence>
                            {notes.map((note) => (
                                <motion.div
                                    key={note._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
                                >
                                    {/* Card Header */}
                                    <div className={`p-3 sm:p-4 ${note.type === 'pdf'
                                            ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                                            : 'bg-gradient-to-r from-red-500 to-red-600'
                                        }`}>
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2 text-white">
                                                {note.type === 'pdf' ? (
                                                    <FileText size={20} className="sm:w-6 sm:h-6" />
                                                ) : (
                                                    <Youtube size={20} className="sm:w-6 sm:h-6" />
                                                )}
                                                <span className="font-bold text-xs sm:text-sm uppercase tracking-wide">
                                                    {note.type}
                                                </span>
                                            </div>

                                            {note.userId === user.email && (
                                                <button
                                                    onClick={() => handleDeleteNote(note._id)}
                                                    className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} className="sm:w-[18px] sm:h-[18px] text-white" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-4 sm:p-5">
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                                            {note.title}
                                        </h3>

                                        {note.description && (
                                            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3">
                                                {note.description}
                                            </p>
                                        )}

                                        {/* Tags */}
                                        {note.tags && note.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                                                {note.tags.map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-0.5 sm:py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs rounded-full font-semibold"
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Meta Info */}
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
                                            <div className="flex items-center gap-1">
                                                <User size={12} className="sm:w-[14px] sm:h-[14px]" />
                                                <span className="truncate max-w-[120px] sm:max-w-none">{note.userName}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar size={12} className="sm:w-[14px] sm:h-[14px]" />
                                                <span>{moment(note.createdAt).fromNow()}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-3 sm:gap-4">
                                                <button
                                                    onClick={() => handleLikeNote(note._id)}
                                                    className={`flex items-center gap-1 transition-colors ${isLikedByUser(note)
                                                            ? 'text-red-500'
                                                            : 'text-gray-500 hover:text-red-500'
                                                        }`}
                                                >
                                                    <Heart
                                                        size={16}
                                                        className="sm:w-[18px] sm:h-[18px]"
                                                        fill={isLikedByUser(note) ? 'currentColor' : 'none'}
                                                    />
                                                    <span className="text-xs sm:text-sm font-semibold">
                                                        {note.likes.length}
                                                    </span>
                                                </button>

                                                <div className="flex items-center gap-1 text-gray-500">
                                                    <Eye size={16} className="sm:w-[18px] sm:h-[18px]" />
                                                    <span className="text-xs sm:text-sm font-semibold">{note.views}</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => openLink(note.link, note._id)}
                                                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:shadow-md transition-all text-xs sm:text-sm"
                                            >
                                                <span>Open</span>
                                                <ExternalLink size={14} className="sm:w-4 sm:h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Add Note Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 p-4 sm:p-6 flex items-center justify-between">
                                <h2 className="text-xl sm:text-2xl font-extrabold text-white">Add New Note</h2>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <X size={20} className="sm:w-6 sm:h-6 text-white" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleAddNote} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                                {/* Type Selection */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Note Type *
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: 'pdf' })}
                                            className={`flex items-center justify-center gap-2 p-3 sm:p-4 rounded-lg border-2 transition-all ${formData.type === 'pdf'
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                                }`}
                                        >
                                            <FileText size={20} className="sm:w-6 sm:h-6" />
                                            <span className="font-bold text-sm sm:text-base">PDF (Google Drive)</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: 'youtube' })}
                                            className={`flex items-center justify-center gap-2 p-3 sm:p-4 rounded-lg border-2 transition-all ${formData.type === 'youtube'
                                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                                }`}
                                        >
                                            <Youtube size={20} className="sm:w-6 sm:h-6" />
                                            <span className="font-bold text-sm sm:text-base">YouTube Video</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Enter a descriptive title"
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                                    />
                                </div>

                                {/* Link */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        {formData.type === 'pdf' ? 'Google Drive Link *' : 'YouTube Link *'}
                                    </label>
                                    <input
                                        type="url"
                                        required
                                        value={formData.link}
                                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                        placeholder={
                                            formData.type === 'pdf'
                                                ? 'https://drive.google.com/...'
                                                : 'https://www.youtube.com/watch?v=...'
                                        }
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                                    />
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        {formData.type === 'pdf'
                                            ? 'Make sure the Google Drive file is set to "Anyone with the link can view"'
                                            : 'Paste the full YouTube video URL'}
                                    </p>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Description (Optional)
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Add a brief description of the content..."
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm sm:text-base"
                                    />
                                </div>

                                {/* Tags */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Tags (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.tags}
                                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                        placeholder="javascript, react, tutorial (comma-separated)"
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                                    />
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Separate multiple tags with commas
                                    </p>
                                </div>

                                {/* Submit Button */}
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all text-sm sm:text-base"
                                    >
                                        Add Note
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotesPage;
