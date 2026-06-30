import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import axios from '../utils/axiosInstance';
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
    Tag,
    Edit2,
    Loader2,
    ChevronUp,
    ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import moment from 'moment';
import Pagination from '../components/common/Pagination';
import DuplicateContentModal from '../components/ui/DuplicateContentModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { BRANCHES } from '../utils/constants';
import { Loader } from '../components/ui/Loader';
import { useConfirm } from '../context/ConfirmContext';

const NotesPage = () => {
    const { user } = useContext(UserContext);
    const { confirm } = useConfirm();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 9;
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [headerExpanded, setHeaderExpanded] = useState(true);
    const [editingNote, setEditingNote] = useState(null);
    const [formData, setFormData] = useState({
        type: 'pdf',
        title: '',
        description: '',
        link: '',
        tags: '',
        branch: localStorage.getItem('dashboard_branch') || 'computer'
    });
    
    const [currentBranch, setCurrentBranch] = useState(
        () => localStorage.getItem('dashboard_branch') || 'computer'
    );

    // Listen for branch changes from Navbar
    useEffect(() => {
        const handleStorageChange = () => {
            const branch = localStorage.getItem('dashboard_branch') || 'computer';
            setCurrentBranch(branch);
        };
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('branchChanged', handleStorageChange); // Custom event often used in this app
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('branchChanged', handleStorageChange);
        };
    }, []);

    const [totalNotes, setTotalNotes] = useState(0);
    const [showDuplicateModal, setShowDuplicateModal] = useState(false);
    const [duplicateNote, setDuplicateNote] = useState(null);

    useEffect(() => {
        setCurrentPage(1);
        fetchNotes(1);
    }, [filter, searchQuery, currentBranch]);

    useEffect(() => {
        fetchNotes(currentPage);
    }, [currentPage]);

    // Handle Search Highlight (Robust for Pagination)
    const location = useLocation();
    const [highlightId, setHighlightId] = useState(null);

    useEffect(() => {
        console.log("📄 NotesPage Mounted. Location State:", location.state);
        const handleDeepLink = async () => {
            if (location.state?.highlightId && !loading) {
                const targetId = location.state.highlightId;
                console.log("🎯 Handling Deep Link for ID:", targetId);
                setHighlightId(targetId);

                // 1. Try finding in current list
                const existingElement = document.getElementById(targetId);
                if (existingElement) {
                    console.log("✅ Found in current list, scrolling...");
                    existingElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(() => setHighlightId(null), 3000);
                    return;
                }

                // 2. Not found? Fetch specifically (it might be on another page)
                try {
                    console.log("🌍 Not found locally, fetching...");
                    const res = await axios.get(API.NOTES.GET_ONE(targetId));
                    if (res.data.success && res.data.note) {
                        const targetNote = res.data.note;
                        console.log("📦 Fetched note:", targetNote);
                        // Prepend to list (avoid duplicates)
                        setNotes(prev => {
                            if (prev.some(n => n._id === targetId)) return prev;
                            return [targetNote, ...prev];
                        });

                        // Wait for render, then scroll (Polling to ensure element exists)
                        let attempts = 0;
                        const scrollInterval = setInterval(() => {
                            const el = document.getElementById(targetId);
                            if (el) {
                                console.log(`📜 Scrolling to fetched note (Attempt ${attempts + 1})...`);
                                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                el.classList.add('highlight-pulse'); // Add CSS class for animation
                                clearInterval(scrollInterval);
                                setTimeout(() => {
                                    setHighlightId(null);
                                    el.classList.remove('highlight-pulse');
                                }, 4000);
                            } else {
                                attempts++;
                                if (attempts > 20) { // Stop after 2 seconds
                                    console.warn("⚠️ Element still not found after polling.");
                                    clearInterval(scrollInterval);
                                }
                            }
                        }, 100);
                    } else {
                        console.warn("⚠️ API success but no note data found.");
                    }
                } catch (err) {
                    console.error("Failed to load highlighted note:", err);
                }
            }
        };

        // Execute only after main loading finishes
        if (!loading) {
            handleDeepLink();
        }
    }, [location.state, loading]);

    const fetchNotes = async (page = 1) => {
        try {
            setLoading(true);
            let params = {
                limit: ITEMS_PER_PAGE,
                skip: (page - 1) * ITEMS_PER_PAGE
            };

            if (filter === 'pdf' || filter === 'youtube') {
                params.type = filter;
            } else if (filter === 'my-notes') {
                params.userId = user.email;
            }

            if (searchQuery) {
                params.search = searchQuery;
            }
            params.branch = currentBranch;

            const response = await axios.get(API.NOTES.GET_ALL, { params });

            if (response.data.success) {
                setNotes(response.data.notes);
                setTotalNotes(response.data.totalCount || 0);
            }
        } catch (error) {
            console.error('Error fetching notes:', error);
            toast.error('Failed to fetch notes');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        fetchNotes(1);
    };

    // Pagination Logic
    const totalPages = Math.ceil(totalNotes / ITEMS_PER_PAGE);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleAddNote = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(API.NOTES.CREATE, {
                userId: user.email,
                userName: user.fullName,
                userEmail: user.email,
                type: formData.type,
                title: formData.title,
                description: formData.description,
                link: formData.link,
                tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
                branch: formData.branch
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
                    tags: '',
                    branch: currentBranch
                });
            }
        } catch (error) {
            console.error('Error adding note:', error);
            if (error.response?.status === 409) {
                setDuplicateNote(error.response.data.note);
                setShowDuplicateModal(true);
            } else {
                toast.error(error.response?.data?.message || 'Failed to add note');
            }
        }
    };

    const handleDeleteNote = async (noteId) => {
        if (!await confirm('Are you sure you want to delete this note?')) {
            return;
        }

        try {
            if (user.role === 'admin' || user.role === 'owner') {
                await axios.delete(API.ADMIN.DELETE_NOTE(noteId));
            } else {
                await axios.delete(API.NOTES.DELETE(noteId), {
                    data: { userId: user.email }
                });
            }

            // Note: The response handling assumes standard success format. 
            // Admin route returns simple json, need to ensure UI updates seamlessly.
            // Both returns should be treated as success if no error thrown.
            toast.success('Note deleted successfully!');
            setNotes(notes.filter(note => note._id !== noteId));
        } catch (error) {
            console.error('Error deleting note:', error);
            toast.error(error.response?.data?.message || 'Failed to delete note');
        }
    };

    const handleLikeNote = async (noteId) => {
        try {
            const response = await axios.post(API.NOTES.LIKE(noteId), {
                userId: user.email,
                userName: user.fullName
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

    const handleEditNote = (note) => {
        setEditingNote(note);
        setFormData({
            type: note.type,
            title: note.title,
            description: note.description || '',
            link: note.link,
            tags: note.tags ? note.tags.join(', ') : '',
            branch: note.branch || 'computer'
        });
        setShowAddModal(true);
    };

    const handleUpdateNote = async (e) => {
        e.preventDefault();
        try {
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            const token = storedUser.token || user?.token;

            if (!token) {
                toast.error('Session expired');
                return;
            }

            await axios.put(API.NOTES.UPDATE(editingNote._id), {
                userId: user.email,
                ...formData,
                tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
            },
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

            toast.success('Note updated successfully!');
            setEditingNote(null);
            setShowAddModal(false);
            setFormData({
                type: 'pdf', title: '', description: '', link: '', tags: '', branch: currentBranch
            });
            fetchNotes(); // Refresh list
        } catch (error) {
            console.error('Error updating note:', error);
            toast.error(error.response?.data?.message || 'Failed to update note');
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
        <div className="min-h-screen bg-[rgb(var(--bg-body))] relative overflow-hidden flex flex-col">
            {/* Background Decorative Glow */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[rgb(var(--accent))]/10 rounded-full blur-[120px] -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] -z-10 pointer-events-none -translate-x-1/3 translate-y-1/3"></div>

            {/* 1. Immersive Hero Banner & Header */}
            <div className="bg-[rgb(var(--bg-card))]/80 backdrop-blur-xl border-b border-[rgb(var(--border-subtle))] sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                        <div className="flex-1">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gradient-to-br from-[rgb(var(--accent))] to-purple-600 rounded-xl shadow-[0_0_15px_rgba(var(--accent),0.3)]">
                                    <FileText className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[rgb(var(--text-primary))] to-[rgb(var(--accent))]">
                                        Community Notes
                                    </h1>
                                    <p className="text-[rgb(var(--text-secondary))] mt-1 text-sm sm:text-base font-medium">
                                        Discover and share high-quality study materials
                                    </p>
                                </div>
                                <button
                                    onClick={() => setHeaderExpanded(!headerExpanded)}
                                    className="ml-auto md:hidden p-2 bg-[rgb(var(--bg-elevated))] hover:bg-[rgb(var(--bg-body-alt))] rounded-xl transition-all border border-[rgb(var(--border-subtle))]"
                                    aria-label="Toggle filters"
                                >
                                    {headerExpanded ? <ChevronUp className="w-5 h-5 text-[rgb(var(--text-primary))]" /> : <ChevronDown className="w-5 h-5 text-[rgb(var(--text-primary))]" />}
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setEditingNote(null);
                                setFormData({
                                    type: 'pdf', title: '', description: '', link: '', tags: '', branch: currentBranch
                                });
                                setShowAddModal(true);
                            }}
                            className="hidden md:flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[rgb(var(--accent))] to-purple-600 hover:from-[rgb(var(--accent-hover))] hover:to-purple-500 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(var(--accent),0.3)] hover:shadow-[0_0_30px_rgba(var(--accent),0.5)] transition-all hover:-translate-y-0.5 group"
                        >
                            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                            <span>Share Note</span>
                        </button>
                    </div>

                    {/* 2. Sleek Search & Filtering Engine */}
                    <AnimatePresence>
                        {headerExpanded && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="flex flex-col lg:flex-row gap-4">
                                    {/* Search Bar */}
                                    <div className="flex-1 relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Search className="h-5 w-5 text-[rgb(var(--text-muted))] group-focus-within:text-[rgb(var(--accent))] transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Search by title, tags, or description..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                            className="w-full pl-11 pr-4 py-3.5 bg-[rgb(var(--bg-elevated))]/60 border border-[rgb(var(--border-subtle))] rounded-2xl text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:ring-2 focus:ring-[rgb(var(--accent))]/50 focus:border-[rgb(var(--accent))] outline-none transition-all shadow-inner"
                                        />
                                        <button
                                            onClick={handleSearch}
                                            className="absolute inset-y-2 right-2 px-4 bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white font-semibold rounded-xl transition-colors shadow-md"
                                        >
                                            Search
                                        </button>
                                    </div>

                                    {/* Filter Controls */}
                                    <div className="flex flex-col sm:flex-row gap-3 overflow-hidden">
                                        <div className="flex p-1.5 bg-[rgb(var(--bg-elevated))]/60 border border-[rgb(var(--border-subtle))] rounded-2xl shadow-inner overflow-x-auto scrollbar-hide">
                                            {filterButtons.map(({ id, label, icon: Icon }) => (
                                                <button
                                                    key={id}
                                                    onClick={() => setFilter(id)}
                                                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap shrink-0 flex-1 sm:flex-none ${filter === id
                                                        ? 'bg-[rgb(var(--accent))] text-white shadow-md shadow-[rgb(var(--accent))]/30'
                                                        : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-card))]'
                                                        }`}
                                                >
                                                    <Icon size={16} className="shrink-0" />
                                                    <span className="hidden sm:inline">{label}</span>
                                                    <span className="sm:hidden">{label.split(' ')[0]}</span>
                                                </button>
                                            ))}
                                        </div>
                                        
                                        <div className="relative flex-1 sm:flex-none sm:min-w-[180px]">
                                            <select
                                                value={currentBranch}
                                                onChange={(e) => setCurrentBranch(e.target.value)}
                                                className="w-full pl-4 pr-10 py-3.5 bg-[rgb(var(--bg-elevated))]/60 border border-[rgb(var(--border-subtle))] rounded-2xl text-[rgb(var(--text-primary))] font-semibold focus:ring-2 focus:ring-[rgb(var(--accent))]/50 outline-none appearance-none cursor-pointer shadow-inner hover:border-[rgb(var(--accent))]/50 transition-colors"
                                            >
                                                {BRANCHES.map(branch => (
                                                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[rgb(var(--text-muted))] pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Mobile Add Button */}
                    <button
                        onClick={() => {
                            setEditingNote(null);
                            setFormData({ type: 'pdf', title: '', description: '', link: '', tags: '', branch: currentBranch });
                            setShowAddModal(true);
                        }}
                        className="md:hidden mt-4 w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[rgb(var(--accent))] to-purple-600 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(var(--accent),0.3)] transition-all"
                    >
                        <Plus size={20} />
                        <span>Share Note</span>
                    </button>
                </div>
            </div>

            {/* 3. Notes Grid */}
            <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader size="lg" text="Loading Knowledge Base..." />
                    </div>
                ) : notes.length === 0 ? (
                    <EmptyState
                        title={searchQuery ? 'No notes found' : 'Knowledge base is empty'}
                        description={filter === 'my-notes'
                            ? "You haven't added any notes yet. Click \"Share Note\" to contribute!"
                            : 'Be the first to share a note with the community for this branch!'}
                        icon={FileText}
                        isSearch={!!searchQuery}
                    />
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            <AnimatePresence>
                                {notes.map((note) => (
                                    <motion.div
                                        key={note._id}
                                        id={note._id}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className={`bg-[rgb(var(--bg-card))]/60 backdrop-blur-md rounded-3xl border ${highlightId === note._id ? 'border-[rgb(var(--accent))] ring-2 ring-[rgb(var(--accent))] shadow-[0_0_30px_rgba(var(--accent),0.4)] transform scale-[1.02]' : 'border-[rgb(var(--border-subtle))]'} shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col group hover:-translate-y-1 hover:border-[rgb(var(--accent))]/40`}
                                    >
                                        {/* Card Header (Subtle Gradient Line) */}
                                        <div className={`h-1.5 w-full ${note.type === 'pdf' ? 'bg-gradient-to-r from-blue-500 to-cyan-400' : 'bg-gradient-to-r from-red-500 to-orange-400'}`}></div>
                                        
                                        <div className="p-5 sm:p-6 flex-1 flex flex-col">
                                            {/* Top Meta */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${note.type === 'pdf' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                    {note.type === 'pdf' ? <FileText size={14} /> : <Youtube size={14} />}
                                                    {note.type}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {note.status === 'pending' && (
                                                        <span className="px-2.5 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[10px] uppercase font-bold rounded-lg">
                                                            Pending Review
                                                        </span>
                                                    )}
                                                    {(note.userId === user.email || user.role === 'admin' || user.role === 'owner') && (
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => handleEditNote(note)} className="p-1.5 text-[rgb(var(--text-muted))] hover:text-blue-500 hover:bg-blue-500/10 rounded-md transition-colors" title="Edit">
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button onClick={() => handleDeleteNote(note._id)} className="p-1.5 text-[rgb(var(--text-muted))] hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors" title="Delete">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Title & Description */}
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-[rgb(var(--text-primary))] group-hover:text-[rgb(var(--accent))] transition-colors mb-2 line-clamp-2 leading-snug">
                                                    {note.title}
                                                </h3>
                                                {note.description && (
                                                    <p className="text-[rgb(var(--text-secondary))] text-sm mb-4 line-clamp-3 leading-relaxed">
                                                        {note.description}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Tags */}
                                            {note.tags && note.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {note.tags.map((tag, index) => (
                                                        <span key={index} className="px-2.5 py-1 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border-subtle))] text-[rgb(var(--text-secondary))] text-xs rounded-md font-medium">
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="h-px w-full bg-[rgb(var(--border-subtle))] mb-4"></div>

                                            {/* Bottom Meta & Actions */}
                                            <div className="flex flex-col gap-4">
                                                <div className="flex items-center justify-between text-xs text-[rgb(var(--text-muted))] font-medium">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[rgb(var(--accent))] to-purple-500 flex items-center justify-center text-white font-bold text-[10px]">
                                                            {note.userName.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="truncate max-w-[100px]">{note.userName}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar size={14} />
                                                        <span>{moment(note.createdAt).fromNow()}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <button
                                                            onClick={() => handleLikeNote(note._id)}
                                                            className={`flex items-center gap-1.5 transition-colors font-semibold text-sm ${isLikedByUser(note) ? 'text-pink-500 hover:text-pink-600' : 'text-[rgb(var(--text-secondary))] hover:text-pink-500'}`}
                                                        >
                                                            <Heart size={18} fill={isLikedByUser(note) ? 'currentColor' : 'none'} className={isLikedByUser(note) ? 'animate-pulse' : ''} />
                                                            <span>{note.likes.length}</span>
                                                        </button>
                                                        <div className="flex items-center gap-1.5 text-[rgb(var(--text-secondary))] font-semibold text-sm">
                                                            <Eye size={18} />
                                                            <span>{note.views}</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => openLink(note.link, note._id)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--bg-elevated))] hover:bg-[rgb(var(--accent))] text-[rgb(var(--text-primary))] hover:text-white border border-[rgb(var(--border-subtle))] hover:border-[rgb(var(--accent))] rounded-xl font-semibold transition-all text-sm group/btn shadow-sm"
                                                    >
                                                        <span>Open</span>
                                                        <ExternalLink size={16} className="group-hover/btn:-mt-1 group-hover/btn:translate-x-0.5 transition-transform" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Pagination */}
                        {!loading && notes.length > 0 && totalPages > 1 && (
                            <div className="mt-12 pb-6 flex justify-center">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* 4. Modernized Modal Form */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowAddModal(false)}
                        ></motion.div>

                        {/* Modal Content */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-[rgb(var(--bg-card))]/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[rgb(var(--border-subtle))] relative z-10 custom-scrollbar"
                        >
                            <div className="sticky top-0 bg-[rgb(var(--bg-card))]/90 backdrop-blur-md p-6 border-b border-[rgb(var(--border-subtle))] flex items-center justify-between z-20">
                                <h2 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[rgb(var(--text-primary))] to-[rgb(var(--accent))]">
                                    {editingNote ? 'Edit Knowledge Base Note' : 'Contribute to Knowledge Base'}
                                </h2>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="p-2 bg-[rgb(var(--bg-elevated))] hover:bg-red-500/10 text-[rgb(var(--text-secondary))] hover:text-red-500 rounded-xl transition-colors border border-[rgb(var(--border-subtle))]"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={editingNote ? handleUpdateNote : handleAddNote} className="p-6 space-y-6">
                                {/* Type Selection (Cards) */}
                                <div>
                                    <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-3 uppercase tracking-wider">
                                        Resource Type *
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: 'pdf' })}
                                            className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${formData.type === 'pdf'
                                                ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                                : 'border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-elevated))]/50 hover:border-blue-500/50'
                                                }`}
                                        >
                                            <div className={`p-3 rounded-xl ${formData.type === 'pdf' ? 'bg-blue-500 text-white' : 'bg-[rgb(var(--bg-card))] text-blue-500 shadow-sm'}`}>
                                                <FileText size={24} />
                                            </div>
                                            <div>
                                                <h4 className={`font-bold ${formData.type === 'pdf' ? 'text-blue-500' : 'text-[rgb(var(--text-primary))]'}`}>PDF Document</h4>
                                                <p className="text-xs text-[rgb(var(--text-muted))] mt-1">Google Drive link</p>
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: 'youtube' })}
                                            className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${formData.type === 'youtube'
                                                ? 'border-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                                                : 'border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-elevated))]/50 hover:border-red-500/50'
                                                }`}
                                        >
                                            <div className={`p-3 rounded-xl ${formData.type === 'youtube' ? 'bg-red-500 text-white' : 'bg-[rgb(var(--bg-card))] text-red-500 shadow-sm'}`}>
                                                <Youtube size={24} />
                                            </div>
                                            <div>
                                                <h4 className={`font-bold ${formData.type === 'youtube' ? 'text-red-500' : 'text-[rgb(var(--text-primary))]'}`}>YouTube Video</h4>
                                                <p className="text-xs text-[rgb(var(--text-muted))] mt-1">Video tutorial link</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] uppercase tracking-wider">Branch *</label>
                                        <div className="relative">
                                            <select
                                                value={formData.branch}
                                                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                                                className="w-full px-4 py-3.5 bg-[rgb(var(--bg-elevated))]/60 border border-[rgb(var(--border-subtle))] rounded-xl text-[rgb(var(--text-primary))] font-medium focus:ring-2 focus:ring-[rgb(var(--accent))]/50 outline-none appearance-none cursor-pointer"
                                            >
                                                {BRANCHES.map(branch => (
                                                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[rgb(var(--text-muted))] pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] uppercase tracking-wider">Tags</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <Tag className="h-5 w-5 text-[rgb(var(--text-muted))]" />
                                            </div>
                                            <input
                                                type="text"
                                                value={formData.tags}
                                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                                placeholder="react, tutorial, pdf"
                                                className="w-full pl-11 pr-4 py-3.5 bg-[rgb(var(--bg-elevated))]/60 border border-[rgb(var(--border-subtle))] rounded-xl text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:ring-2 focus:ring-[rgb(var(--accent))]/50 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] uppercase tracking-wider">Title *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Enter a descriptive title for this resource"
                                        className="w-full px-4 py-3.5 bg-[rgb(var(--bg-elevated))]/60 border border-[rgb(var(--border-subtle))] rounded-xl text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:ring-2 focus:ring-[rgb(var(--accent))]/50 outline-none transition-all font-semibold"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] uppercase tracking-wider">
                                        {formData.type === 'pdf' ? 'Google Drive Link *' : 'YouTube Link *'}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <ExternalLink className="h-5 w-5 text-[rgb(var(--text-muted))]" />
                                        </div>
                                        <input
                                            type="url"
                                            required
                                            value={formData.link}
                                            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                            placeholder={formData.type === 'pdf' ? 'https://drive.google.com/...' : 'https://www.youtube.com/watch?v=...'}
                                            className="w-full pl-11 pr-4 py-3.5 bg-[rgb(var(--bg-elevated))]/60 border border-[rgb(var(--border-subtle))] rounded-xl text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:ring-2 focus:ring-[rgb(var(--accent))]/50 outline-none transition-all"
                                        />
                                    </div>
                                    <p className="text-xs text-[rgb(var(--text-muted))] mt-1.5 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                                        {formData.type === 'pdf' ? 'Ensure PDF link access is set to "Anyone with the link can view".' : 'Paste the full YouTube video URL.'}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] uppercase tracking-wider">Description (Optional)</label>
                                    <textarea
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Add a brief summary of what this resource covers..."
                                        className="w-full px-4 py-3.5 bg-[rgb(var(--bg-elevated))]/60 border border-[rgb(var(--border-subtle))] rounded-xl text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:ring-2 focus:ring-[rgb(var(--accent))]/50 outline-none transition-all resize-none custom-scrollbar"
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-[rgb(var(--border-subtle))]">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="w-full sm:w-1/3 px-6 py-3.5 bg-[rgb(var(--bg-elevated))] hover:bg-[rgb(var(--bg-body-alt))] text-[rgb(var(--text-primary))] border border-[rgb(var(--border-subtle))] rounded-xl font-bold transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="w-full sm:w-2/3 px-6 py-3.5 bg-gradient-to-r from-[rgb(var(--accent))] to-purple-600 hover:from-[rgb(var(--accent-hover))] hover:to-purple-500 text-white rounded-xl font-bold shadow-[0_0_15px_rgba(var(--accent),0.3)] hover:shadow-[0_0_25px_rgba(var(--accent),0.5)] transition-all flex justify-center items-center gap-2"
                                    >
                                        {editingNote ? <Edit2 size={18} /> : <Plus size={18} />}
                                        {editingNote ? 'Update Note' : 'Publish Note'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <DuplicateContentModal
                isOpen={showDuplicateModal}
                onClose={() => {
                    setShowDuplicateModal(false);
                    setDuplicateNote(null);
                }}
                existingItem={duplicateNote}
                type="note"
                onView={(item) => openLink(item.link, item._id)}
            />
        </div>
    );
};

export default NotesPage;
