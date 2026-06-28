import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Download, FileText, Video, Link as LinkIcon,
    Search, Filter, ChevronDown, ChevronRight, Upload,
    Folder, File, Star, Clock, User, Eye, Heart, Trash2, Edit,
    Cpu, Wrench, Building, Zap, Radio, Gauge, Battery,
    Database, Code, Cloud, FlaskConical, Briefcase, ExternalLink
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import UploadResourceModal from '../components/ui/UploadResourceModal';
import DuplicateContentModal from '../components/ui/DuplicateContentModal';
import { Loader } from '../components/ui/Loader';
import { EmptyState } from '@/components/ui/EmptyState';
import toast from 'react-hot-toast';
import axios from '../utils/axiosInstance';
import { API } from '../utils/apiPaths';
import { useUser } from '../context/UserContext';
import Pagination from '../components/common/Pagination';
import { useConfirm } from '../context/ConfirmContext';

import { BRANCHES } from '../utils/constants';

// Branch configurations removed - imported from utils/constants


// Sample resource structure
const SAMPLE_RESOURCES = {
    computer: [
        {
            id: 1,
            title: 'Data Structures and Algorithms',
            type: 'pdf',
            semester: 'Semester 3',
            subject: 'DSA',
            uploadedBy: 'Prof. Kumar',
            uploadDate: '2024-01-15',
            downloads: 1250,
            size: '5.2 MB',
            url: '#'
        },
        {
            id: 2,
            title: 'Operating Systems - Complete Notes',
            type: 'pdf',
            semester: 'Semester 4',
            subject: 'OS',
            uploadedBy: 'Dr. Sharma',
            uploadDate: '2024-02-20',
            downloads: 980,
            size: '8.7 MB',
            url: '#'
        },
        {
            id: 3,
            title: 'Database Management System Video Lectures',
            type: 'video',
            semester: 'Semester 5',
            subject: 'DBMS',
            uploadedBy: 'Prof. Patel',
            uploadDate: '2024-03-10',
            downloads: 750,
            size: '1.2 GB',
            url: '#'
        }
    ]
};

const ResourcesPage = () => {
    const { user } = useUser();
    const { confirm } = useConfirm();
    const [selectedBranch, setSelectedBranch] = useState('computer');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterSemester, setFilterSemester] = useState('all');
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [editingResource, setEditingResource] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_PER_PAGE = 12;

    const currentBranch = BRANCHES.find(b => b.id === selectedBranch);
    const BranchIcon = currentBranch?.icon || BookOpen;

    // Ref for materials section
    const materialsRef = React.useRef(null);

    // Handle branch selection with auto-scroll
    const handleBranchChange = (branchId) => {
        setSelectedBranch(branchId);
        setCurrentPage(1); // Reset page on branch change
        // Scroll to materials section after a brief delay to allow state update
        setTimeout(() => {
            materialsRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Fetch resources when branch, filters, or search changes
    const fetchResources = React.useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                branch: selectedBranch,
                ...(filterType !== 'all' && { type: filterType }),
                ...(filterSemester !== 'all' && { semester: filterSemester }),
                ...(searchQuery && { search: searchQuery }),
                page: currentPage,
                limit: ITEMS_PER_PAGE
            });

            const response = await axios.get(`${API.RESOURCES.GET_ALL}?${params}`);
            if (response.data.success) {
                setResources(response.data.resources);
                setTotalPages(response.data.totalPages);
            }
        } catch (error) {
            console.error('Error fetching resources:', error);
            toast.error('Failed to load resources');
        } finally {
            setLoading(false);
        }
    }, [selectedBranch, filterType, filterSemester, searchQuery, currentPage]);

    useEffect(() => {
        setCurrentPage(1); // Reset page when filters or search change
        fetchResources();
    }, [selectedBranch, filterType, filterSemester, searchQuery]);

    useEffect(() => {
        fetchResources();
    }, [fetchResources]);

    // Handle Search Highlight (Robust for Pagination)
    const location = useLocation();
    const [highlightId, setHighlightId] = useState(null);

    // Effect 1: Handle Initial Navigation & Page Switching
    useEffect(() => {
        const handleDeepLink = async () => {
            if (location.state?.highlightId && !loading && resources.length > 0) {
                const targetId = location.state.highlightId;
                const fromSearch = location.state.fromSearch;

                // 1. Check if already on page
                if (document.getElementById(targetId)) {
                    setHighlightId(targetId);
                    return; // Will be handled by scrolling effect
                }

                // 2. If from search and NOT found, find correct page
                if (fromSearch) {
                    try {
                        console.log("📍 Finding page for resource:", targetId);
                        const res = await axios.get(API.PUBLIC.FIND_PAGE('Resource', targetId, ITEMS_PER_PAGE));
                        if (res.data.success) {
                            console.log("📄 Resource is on page:", res.data.page);
                            if (res.data.page !== currentPage) {
                                setCurrentPage(res.data.page);
                                // The new page fetch will trigger the scrolling effect
                                setHighlightId(targetId);
                            }
                        }
                    } catch (err) {
                        console.error("Failed to find page:", err);
                    }
                }
            }
        };

        if (!loading) {
            handleDeepLink();
        }
    }, [location.state, loading, resources.length]); // Re-run when resources load

    // Effect 2: Scrolling & Highlighting (Runs whenever highlightId or resources change)
    useEffect(() => {
        if (highlightId && !loading) {
            const el = document.getElementById(highlightId);
            if (el) {
                console.log("📜 Scrolling to target:", highlightId);
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('highlight-pulse');

                // Cleanup
                const timer = setTimeout(() => {
                    setHighlightId(null);
                    el.classList.remove('highlight-pulse');
                }, 4000);
                return () => clearTimeout(timer);
            }
        }
    }, [highlightId, resources, loading]);

    const handleUpload = async (formData) => {
        try {
            // Check if user is logged in
            if (!user) {
                toast.error('Please login to upload resources');
                setShowUploadModal(false);
                return;
            }

            // Get token from user object or localStorage
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            const token = storedUser.token || user.token;

            if (!token) {
                toast.error('Session expired. Please logout and login again to upload resources.');
                setShowUploadModal(false);
                return;
            }

            await axios.post(API.RESOURCES.CREATE, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            toast.success('Resource uploaded successfully!');
            setShowUploadModal(false);
            fetchResources(); // Refresh list
        } catch (error) {
            console.error('Error uploading resource:', error);
            if (error.response?.status === 409) {
                // Duplicate found
                setDuplicateResource(error.response.data.resource);
                setShowDuplicateModal(true);
                // setShowUploadModal(false); // Optional: keep upload modal open or close it. User said "not add it", implies flow stop.
                // Converting user request: "show existing notes and resorces with view option... and show message due to exite already"
                // The modal handles the view and message.
            } else if (error.response?.status === 401 || error.response?.status === 403) {
                toast.error('Authentication failed. Please logout and login again.');
            } else {
                toast.error(error.response?.data?.message || 'Failed to upload resource');
            }
        }
    };

    const handleEdit = (resource) => {
        setEditingResource(resource);
        setShowUploadModal(true);
    };

    const handleUpdateResource = async (formData) => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            const token = storedUser.token || user?.token;

            if (!token) {
                toast.error('Session expired. Please logout and login again.');
                return;
            }

            // Exclude non-modifiable fields
            const { _id, uploadedBy, views, downloads, likes, createdAt, updatedAt, __v, ...updateData } = formData;

            await axios.put(API.RESOURCES.UPDATE(_id), updateData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            toast.success('Resource updated successfully!');
            setShowUploadModal(false);
            setEditingResource(null);
            fetchResources();
        } catch (error) {
            console.error('Error updating resource:', error);
            toast.error(error.response?.data?.message || 'Failed to update resource');
        }
    };

    const [showDuplicateModal, setShowDuplicateModal] = useState(false);
    const [duplicateResource, setDuplicateResource] = useState(null);


    const handleView = (resource) => {
        // Increment view count
        axios.get(API.RESOURCES.GET_ONE(resource._id)).catch(console.error);

        // Open URL based on type
        const url = resource.url;

        if (resource.type === 'video') {
            // YouTube URL - open directly
            window.open(url, '_blank', 'noopener,noreferrer');
        } else if (resource.type === 'pdf') {
            // Google Drive - convert to preview link if needed
            let viewUrl = url;
            if (url.includes('/file/d/')) {
                // Extract file ID and create preview link
                const fileIdMatch = url.match(/\/file\/d\/([^/]+)/);
                if (fileIdMatch) {
                    viewUrl = `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
                }
            }
            window.open(viewUrl, '_blank', 'noopener,noreferrer');
        } else {
            // Other links - open directly
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    const handleDownload = async (resource) => {
        try {
            // Increment download count
            await axios.post(API.RESOURCES.DOWNLOAD(resource._id));

            // Open the resource
            handleView(resource);

            toast.success(`Viewing: ${resource.title}`);
        } catch (error) {
            console.error('Error tracking download:', error);
            // Still open the resource even if tracking fails
            handleView(resource);
        }
    };

    const handleDelete = async (resourceId) => {
        if (!await confirm('Are you sure you want to delete this resource?')) {
            return;
        }

        try {
            // Get token from user object or localStorage
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            const token = storedUser.token || user?.token;

            if (!token) {
                toast.error('Session expired. Please logout and login again.');
                return;
            }

            if (user.role === 'admin' || user.role === 'owner') {
                await axios.delete(API.ADMIN.DELETE_RESOURCE(resourceId), {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } else {
                await axios.delete(API.RESOURCES.DELETE(resourceId), {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            }

            toast.success('Resource deleted successfully');
            fetchResources();
        } catch (error) {
            console.error('Error deleting resource:', error);
            toast.error(error.response?.data?.message || 'Failed to delete resource');
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'pdf': return FileText;
            case 'video': return Video;
            case 'link': return LinkIcon;
            default: return File;
        }
    };

    return (
        <div className="min-h-screen bg-[rgb(var(--bg-body))] relative overflow-hidden flex flex-col pb-12">
            {/* Background Decorative Glow */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[rgb(var(--accent))]/10 rounded-full blur-[120px] -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] -z-10 pointer-events-none -translate-x-1/3 translate-y-1/3"></div>

            {/* 1. Immersive Hero Section & Header */}
            <div className="bg-[rgb(var(--bg-card))]/80 backdrop-blur-xl border-b border-[rgb(var(--border-subtle))] sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                        <div className="flex-1">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gradient-to-br from-[rgb(var(--accent))] to-emerald-600 rounded-xl shadow-[0_0_15px_rgba(var(--accent),0.3)]">
                                    <BookOpen className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[rgb(var(--text-primary))] to-[rgb(var(--accent))]">
                                        Academic Resources
                                    </h1>
                                    <p className="text-[rgb(var(--text-secondary))] mt-1 text-sm sm:text-base font-medium">
                                        Access and share study materials across engineering branches
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={() => setShowUploadModal(true)}
                            className="hidden md:flex items-center gap-2 px-6 py-6 bg-gradient-to-r from-[rgb(var(--accent))] to-emerald-600 hover:from-[rgb(var(--accent-hover))] hover:to-emerald-500 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(var(--accent),0.3)] hover:shadow-[0_0_30px_rgba(var(--accent),0.5)] transition-all hover:-translate-y-0.5 group border-0"
                        >
                            <Upload size={20} className="group-hover:-translate-y-1 transition-transform duration-300" />
                            <span className="text-base">Upload Resource</span>
                        </Button>
                    </div>

                    {/* Mobile Add Button */}
                    <Button
                        onClick={() => setShowUploadModal(true)}
                        className="md:hidden mt-4 w-full flex items-center justify-center gap-2 px-6 py-6 bg-gradient-to-r from-[rgb(var(--accent))] to-emerald-600 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(var(--accent),0.3)] transition-all border-0"
                    >
                        <Upload size={20} />
                        <span className="text-base">Upload Resource</span>
                    </Button>
                </div>
            </div>

            <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                {/* 2. Sleek Branch Selection */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h2 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-4 flex items-center gap-2">
                        <BranchIcon className="w-5 h-5 text-[rgb(var(--accent))]" />
                        Select Branch
                    </h2>

                    {/* Mobile Dropdown */}
                    <div className="block sm:hidden">
                        <div className="relative">
                            <select
                                value={selectedBranch}
                                onChange={(e) => handleBranchChange(e.target.value)}
                                className="w-full pl-4 pr-10 py-3.5 bg-[rgb(var(--bg-elevated))]/80 backdrop-blur-md border border-[rgb(var(--border-subtle))] rounded-xl text-[rgb(var(--text-primary))] font-semibold focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/50 appearance-none shadow-inner"
                            >
                                {BRANCHES.map((branch) => (
                                    <option key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[rgb(var(--text-muted))] pointer-events-none" />
                        </div>
                    </div>

                    {/* Desktop Grid */}
                    <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {BRANCHES.map((branch) => {
                            const Icon = branch.icon;
                            const isSelected = selectedBranch === branch.id;
                            return (
                                <motion.button
                                    key={branch.id}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleBranchChange(branch.id)}
                                    className={`p-4 rounded-2xl border transition-all duration-300 text-left relative overflow-hidden group ${isSelected
                                        ? 'border-[rgb(var(--accent))] bg-[rgb(var(--accent))]/10 shadow-[0_0_20px_rgba(var(--accent),0.15)]'
                                        : 'border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))]/60 backdrop-blur-sm hover:border-[rgb(var(--accent))]/50 hover:bg-[rgb(var(--bg-card))]'
                                        }`}
                                >
                                    {isSelected && (
                                        <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--accent))]/5 to-transparent pointer-events-none"></div>
                                    )}
                                    <div className="flex items-start gap-3 relative z-10">
                                        <div className={`p-2.5 rounded-xl bg-gradient-to-br shadow-sm ${isSelected ? branch.color : 'from-[rgb(var(--bg-elevated))] to-[rgb(var(--bg-elevated))] border border-[rgb(var(--border-subtle))] group-hover:' + branch.color}`}>
                                            <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-[rgb(var(--text-secondary))] group-hover:text-white transition-colors'}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className={`font-bold text-sm mb-1 line-clamp-2 transition-colors ${isSelected ? 'text-[rgb(var(--accent))]' : 'text-[rgb(var(--text-primary))]'}`}>
                                                {branch.name}
                                            </h3>
                                            <p className="text-xs text-[rgb(var(--text-muted))] line-clamp-2 font-medium">
                                                {branch.description}
                                            </p>
                                        </div>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* 3. Advanced Search & Filter Engine */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-1.5 bg-[rgb(var(--bg-card))]/60 backdrop-blur-md border border-[rgb(var(--border-subtle))] rounded-2xl mb-8 flex flex-col md:flex-row gap-2 shadow-lg"
                >
                    {/* Search */}
                    <div className="flex-1 relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-[rgb(var(--text-muted))] group-focus-within:text-[rgb(var(--accent))] transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search resources, subjects, topics..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-transparent text-[rgb(var(--text-primary))] placeholder-[rgb(var(--text-muted))] focus:outline-none font-medium"
                        />
                    </div>
                    
                    <div className="hidden md:block w-px bg-[rgb(var(--border-subtle))] my-2"></div>

                    {/* Filters Container */}
                    <div className="flex flex-col sm:flex-row gap-2 md:min-w-[400px]">
                        <div className="relative flex-1">
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full px-4 py-3.5 bg-[rgb(var(--bg-elevated))]/50 md:bg-transparent rounded-xl md:rounded-none text-[rgb(var(--text-primary))] focus:outline-none font-medium appearance-none cursor-pointer hover:bg-[rgb(var(--bg-elevated))] transition-colors"
                            >
                                <option value="all">All Types</option>
                                <option value="pdf">PDF</option>
                                <option value="video">Video</option>
                                <option value="link">Links</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[rgb(var(--text-muted))] pointer-events-none" />
                        </div>
                        
                        <div className="hidden sm:block w-px bg-[rgb(var(--border-subtle))] my-2"></div>

                        <div className="relative flex-1">
                            <select
                                value={filterSemester}
                                onChange={(e) => setFilterSemester(e.target.value)}
                                className="w-full px-4 py-3.5 bg-[rgb(var(--bg-elevated))]/50 md:bg-transparent rounded-xl md:rounded-none text-[rgb(var(--text-primary))] focus:outline-none font-medium appearance-none cursor-pointer hover:bg-[rgb(var(--bg-elevated))] transition-colors"
                            >
                                <option value="all">All Semesters</option>
                                <option value="Semester 1">Semester 1</option>
                                <option value="Semester 2">Semester 2</option>
                                <option value="Semester 3">Semester 3</option>
                                <option value="Semester 4">Semester 4</option>
                                <option value="Semester 5">Semester 5</option>
                                <option value="Semester 6">Semester 6</option>
                                <option value="Semester 7">Semester 7</option>
                                <option value="Semester 8">Semester 8</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[rgb(var(--text-muted))] pointer-events-none" />
                        </div>
                    </div>
                </motion.div>

                {/* 4. Current Branch Info summary */}
                <div className="flex items-center justify-between mb-6 px-2" ref={materialsRef}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${currentBranch?.color}`}>
                            <BranchIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">
                                {currentBranch?.name} Resources
                            </h2>
                            <p className="text-sm text-[rgb(var(--text-muted))] font-medium">
                                Showing {resources.length} items
                            </p>
                        </div>
                    </div>
                </div>

                {/* 5. Resources Grid */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader size="lg" text="Loading resources..." />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {resources.length === 0 ? (
                                <div className="col-span-full">
                                    <EmptyState
                                        title="No Resources Found"
                                        description={searchQuery
                                            ? 'Try adjusting your search or filters'
                                            : 'Resources for this branch are being uploaded. Check back soon!'}
                                        icon={Folder}
                                        isSearch={!!searchQuery}
                                        actionButton={
                                            <Button
                                                onClick={() => setShowUploadModal(true)}
                                                className="bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white border-0"
                                            >
                                                <Upload className="w-4 h-4 mr-2" />
                                                Be the First to Upload
                                            </Button>
                                        }
                                    />
                                </div>
                            ) : (
                                <AnimatePresence>
                                    {resources.map((resource) => {
                                        const TypeIcon = getTypeIcon(resource.type);
                                        const isOwner = user?.userId === resource.uploadedBy?._id || user?.userId === resource.uploadedBy;
                                        
                                        // Determine gradient based on resource type
                                        let gradientColors = 'from-gray-500 to-gray-400';
                                        let iconColor = 'text-gray-500';
                                        let badgeColors = 'bg-gray-500/10 text-gray-500 border-gray-500/20';
                                        
                                        if (resource.type === 'pdf') {
                                            gradientColors = 'from-blue-500 to-cyan-400';
                                            iconColor = 'text-blue-500';
                                            badgeColors = 'bg-blue-500/10 text-blue-500 border-blue-500/20';
                                        } else if (resource.type === 'video') {
                                            gradientColors = 'from-red-500 to-orange-400';
                                            iconColor = 'text-red-500';
                                            badgeColors = 'bg-red-500/10 text-red-500 border-red-500/20';
                                        } else if (resource.type === 'link') {
                                            gradientColors = 'from-emerald-500 to-green-400';
                                            iconColor = 'text-emerald-500';
                                            badgeColors = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
                                        }

                                        return (
                                            <motion.div
                                                key={resource._id}
                                                id={resource._id}
                                                initial={{ opacity: 0, y: 30 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className={`bg-[rgb(var(--bg-card))]/60 backdrop-blur-md rounded-3xl border ${highlightId === resource._id ? 'border-[rgb(var(--accent))] ring-2 ring-[rgb(var(--accent))] shadow-[0_0_30px_rgba(var(--accent),0.4)] transform scale-[1.02]' : 'border-[rgb(var(--border-subtle))]'} shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col group hover:-translate-y-1 hover:border-[rgb(var(--accent))]/40`}
                                            >
                                                {/* Subtle Header Line */}
                                                <div className={`h-1.5 w-full bg-gradient-to-r ${gradientColors}`}></div>
                                                
                                                <div className="p-6 flex-1 flex flex-col">
                                                    {/* Top Meta */}
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${badgeColors}`}>
                                                            <TypeIcon size={14} />
                                                            {resource.type}
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            {resource.status === 'pending' && (
                                                                <span className="px-2.5 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[10px] uppercase font-bold rounded-lg">
                                                                    Pending
                                                                </span>
                                                            )}
                                                            {(isOwner || user.role === 'admin' || user.role === 'owner') && (
                                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button onClick={() => handleEdit(resource)} className="p-1.5 text-[rgb(var(--text-muted))] hover:text-amber-500 hover:bg-amber-500/10 rounded-md transition-colors" title="Edit">
                                                                        <Edit size={16} />
                                                                    </button>
                                                                    <button onClick={() => handleDelete(resource._id)} className="p-1.5 text-[rgb(var(--text-muted))] hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors" title="Delete">
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Title & Description */}
                                                    <div className="flex-1 mb-4">
                                                        <h3 className="text-xl font-bold text-[rgb(var(--text-primary))] group-hover:text-[rgb(var(--accent))] transition-colors mb-2 line-clamp-2 leading-snug">
                                                            {resource.title}
                                                        </h3>
                                                        {resource.description && (
                                                            <p className="text-[rgb(var(--text-secondary))] text-sm line-clamp-2 leading-relaxed">
                                                                {resource.description}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Context Pills */}
                                                    <div className="flex flex-wrap gap-2 mb-5">
                                                        <span className="px-2.5 py-1 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border-subtle))] text-[rgb(var(--text-secondary))] text-xs rounded-md font-medium flex items-center gap-1.5">
                                                            <BookOpen size={12} className={iconColor} />
                                                            <span className="truncate max-w-[120px]">{resource.subject}</span>
                                                        </span>
                                                        <span className="px-2.5 py-1 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border-subtle))] text-[rgb(var(--text-secondary))] text-xs rounded-md font-medium flex items-center gap-1.5">
                                                            <Folder size={12} className={iconColor} />
                                                            {Array.isArray(resource.semester) ? resource.semester[0] : resource.semester}
                                                        </span>
                                                    </div>

                                                    <div className="h-px w-full bg-[rgb(var(--border-subtle))] mb-4"></div>

                                                    {/* Bottom Meta & Actions */}
                                                    <div className="flex flex-col gap-4">
                                                        <div className="flex items-center justify-between text-xs text-[rgb(var(--text-muted))] font-medium">
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[rgb(var(--accent))] to-purple-500 flex items-center justify-center text-white font-bold text-[10px]">
                                                                    {(resource.uploadedByName || resource.uploadedBy?.name || 'A')[0].toUpperCase()}
                                                                </div>
                                                                <span className="truncate max-w-[100px]">{resource.uploadedByName || resource.uploadedBy?.name || 'Anonymous'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <Clock size={14} />
                                                                <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between mt-1">
                                                            <div className="flex items-center gap-3 text-[rgb(var(--text-secondary))] font-medium text-xs">
                                                                <div className="flex items-center gap-1" title="Downloads">
                                                                    <Download size={14} className={iconColor} />
                                                                    <span>{resource.downloads}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1" title="Views">
                                                                    <Eye size={14} className={iconColor} />
                                                                    <span>{resource.views}</span>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    onClick={() => handleDownload(resource)}
                                                                    className="h-9 w-9 rounded-xl border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--accent))] hover:text-white hover:border-[rgb(var(--accent))] transition-all"
                                                                    title="Download"
                                                                >
                                                                    <Download size={16} />
                                                                </Button>
                                                                <Button
                                                                    onClick={() => handleView(resource)}
                                                                    className="h-9 px-4 rounded-xl bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border-subtle))] text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--accent))] hover:text-white hover:border-[rgb(var(--accent))] transition-all text-sm font-semibold group/btn"
                                                                >
                                                                    <span>View</span>
                                                                    <ExternalLink size={14} className="ml-1.5 group-hover/btn:-mt-1 group-hover/btn:translate-x-0.5 transition-transform" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            )}
                        </div>
                        {totalPages > 1 && (
                            <div className="mt-12 flex justify-center">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </>
                )}

                {/* Upload/Edit Modal */}
                <UploadResourceModal
                    isOpen={showUploadModal}
                    onClose={() => {
                        setShowUploadModal(false);
                        setEditingResource(null);
                    }}
                    onUpload={editingResource ? handleUpdateResource : handleUpload}
                    selectedBranch={selectedBranch}
                    initialData={editingResource}
                    isEditing={!!editingResource}
                />

                <DuplicateContentModal
                    isOpen={showDuplicateModal}
                    onClose={() => {
                        setShowDuplicateModal(false);
                        setDuplicateResource(null);
                    }}
                    existingItem={duplicateResource}
                    type="resource"
                    onView={handleView}
                />
            </div>
        </div>
    );
};

export default ResourcesPage;
