import React, { useState, useEffect } from 'react';
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
import { Loader } from '../components/ui/Loader';
import toast from 'react-hot-toast';
import axios from '../utils/axiosInstance';
import { API } from '../utils/apiPaths';
import { useUser } from '../context/UserContext';
import Pagination from '../components/common/Pagination';

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
            if (error.response?.status === 401 || error.response?.status === 403) {
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
        if (!window.confirm('Are you sure you want to delete this resource?')) {
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
        <div className="min-h-screen bg-[rgb(var(--bg-body))] py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 sm:mb-8"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[rgb(var(--text-primary))] mb-1 sm:mb-2">
                                📚 Academic Resources
                            </h1>
                            <p className="text-sm sm:text-base text-[rgb(var(--text-secondary))]">
                                Access study materials, notes, and resources for all engineering branches
                            </p>
                        </div>
                        <Button
                            onClick={() => setShowUploadModal(true)}
                            className="bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white w-full sm:w-auto flex-shrink-0"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">Upload Resource</span>
                            <span className="sm:hidden">Upload</span>
                        </Button>
                    </div>
                </motion.div>

                {/* Branch Selection */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 sm:mb-8"
                >
                    <h2 className="text-lg sm:text-xl font-semibold text-[rgb(var(--text-primary))] mb-3 sm:mb-4">Select Branch</h2>

                    {/* Mobile Dropdown */}
                    <div className="block sm:hidden">
                        <div className="relative">
                            <select
                                value={selectedBranch}
                                onChange={(e) => handleBranchChange(e.target.value)}
                                className="w-full px-4 py-3 bg-[rgb(var(--bg-card))] border-2 border-[rgb(var(--border-subtle))] rounded-xl text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-[rgb(var(--accent))] appearance-none"
                            >
                                {BRANCHES.map((branch) => (
                                    <option key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[rgb(var(--text-muted))] pointer-events-none" />
                        </div>
                        {/* Selected branch info card on mobile */}
                        {currentBranch && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-3 p-3 rounded-xl border-2 border-[rgb(var(--accent))] bg-gradient-to-br from-[rgb(var(--accent))]/10 to-[rgb(var(--accent))]/5"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg bg-gradient-to-br ${currentBranch.color}`}>
                                        <BranchIcon className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">
                                            {currentBranch.name}
                                        </h3>
                                        <p className="text-xs text-[rgb(var(--text-muted))] line-clamp-1">
                                            {currentBranch.description}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Desktop Grid */}
                    <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {BRANCHES.map((branch) => {
                            const Icon = branch.icon;
                            const isSelected = selectedBranch === branch.id;
                            return (
                                <motion.button
                                    key={branch.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleBranchChange(branch.id)}
                                    className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${isSelected
                                        ? 'border-[rgb(var(--accent))] bg-gradient-to-br from-[rgb(var(--accent))]/10 to-[rgb(var(--accent))]/5 shadow-lg'
                                        : 'border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] hover:border-[rgb(var(--accent))]/50'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg bg-gradient-to-br ${branch.color}`}>
                                            <Icon className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm mb-1 line-clamp-2">
                                                {branch.name}
                                            </h3>
                                            <p className="text-xs text-[rgb(var(--text-muted))] line-clamp-2">
                                                {branch.description}
                                            </p>
                                        </div>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Search and Filters */}
                <Card className="p-4 md:p-6 mb-6 bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))]">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[rgb(var(--text-muted))]" />
                            <input
                                type="text"
                                placeholder="Search resources, subjects, topics..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-[rgb(var(--bg-body))] border border-[rgb(var(--border-subtle))] rounded-lg text-[rgb(var(--text-primary))] placeholder-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
                            />
                        </div>

                        {/* Type Filter */}
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-4 py-3 bg-[rgb(var(--bg-body))] border border-[rgb(var(--border-subtle))] rounded-lg text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]]"
                        >
                            <option value="all">All Types</option>
                            <option value="pdf">PDF</option>
                            <option value="video">Video</option>
                            <option value="link">Links</option>
                        </select>

                        {/* Semester Filter */}
                        <select
                            value={filterSemester}
                            onChange={(e) => setFilterSemester(e.target.value)}
                            className="px-4 py-3 bg-[rgb(var(--bg-body))] border border-[rgb(var(--border-subtle))] rounded-lg text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]]"
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
                    </div>
                </Card>

                {/* Current Branch Info */}
                <Card className="p-4 sm:p-6 mb-4 sm:mb-6 bg-gradient-to-br from-[rgb(var(--bg-card))] to-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))]" ref={materialsRef}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3 sm:gap-4 flex-1">
                            <div className={`p-3 sm:p-4 rounded-xl bg-gradient-to-br ${currentBranch?.color}`}>
                                <BranchIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[rgb(var(--text-primary))] mb-1">
                                    {currentBranch?.name}
                                </h2>
                                <p className="text-sm sm:text-base text-[rgb(var(--text-secondary))] line-clamp-2">
                                    {currentBranch?.description}
                                </p>
                                <div className="flex items-center gap-2 sm:gap-4 mt-2">
                                    <span className="text-xs sm:text-sm text-[rgb(var(--text-muted))]">
                                        📄 {resources.length} Resources Available
                                    </span>
                                </div>
                            </div>
                        </div>
                        <Button
                            onClick={() => setShowUploadModal(true)}
                            className="bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white shrink-0"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Resource
                        </Button>
                    </div>
                </Card>

                {/* Resources List */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader size="lg" text="Loading resources..." />
                    </div>
                ) : (
                    <>
                        <div className="space-y-4">
                            {resources.length === 0 ? (
                                <Card className="p-8 sm:p-12 text-center bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))]">
                                    <Folder className="w-12 h-12 sm:w-16 sm:h-16 text-[rgb(var(--text-muted))] mx-auto mb-3 sm:mb-4" />
                                    <h3 className="text-lg sm:text-xl font-semibold text-[rgb(var(--text-primary))] mb-2">
                                        No Resources Found
                                    </h3>
                                    <p className="text-[rgb(var(--text-secondary))] mb-4">
                                        {searchQuery
                                            ? 'Try adjusting your search or filters'
                                            : 'Resources for this branch are being uploaded. Check back soon!'}
                                    </p>
                                    <Button
                                        onClick={() => setShowUploadModal(true)}
                                        className="bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white"
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        Be the First to Upload
                                    </Button>
                                </Card>
                            ) : (
                                resources.map((resource) => {
                                    const TypeIcon = getTypeIcon(resource.type);
                                    const isOwner = user?.userId === resource.uploadedBy?._id || user?.userId === resource.uploadedBy;

                                    return (
                                        <motion.div
                                            key={resource._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            <Card className="p-4 md:p-6 bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))] hover:border-[rgb(var(--accent))] transition-all duration-300">
                                                <div className="flex flex-col gap-4">
                                                    {/* Header with Icon and Title */}
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex-shrink-0">
                                                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[rgb(var(--accent))]/20 to-[rgb(var(--accent))]/10 flex items-center justify-center">
                                                                <TypeIcon className="w-6 h-6 text-[rgb(var(--accent))]" />
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-base sm:text-lg font-semibold text-[rgb(var(--text-primary))] mb-1 flex items-center gap-2 flex-wrap">
                                                                {resource.title}
                                                                {resource.status === 'pending' && (
                                                                    <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-[10px] uppercase font-bold rounded-full border border-yellow-200 dark:border-yellow-700 whitespace-nowrap">
                                                                        Pending
                                                                    </span>
                                                                )}
                                                            </h3>
                                                            {resource.description && (
                                                                <p className="text-xs sm:text-sm text-[rgb(var(--text-muted))] mb-2 line-clamp-2">
                                                                    {resource.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Content - Metadata */}
                                                    <div className="space-y-2">
                                                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-[rgb(var(--text-secondary))]">
                                                            <span className="flex items-center gap-1">
                                                                <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                <span className="truncate">{resource.subject}</span>
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Folder className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                <span className="truncate">{resource.semester}</span>
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <User className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                <span className="truncate">{resource.uploadedByName || resource.uploadedBy?.name || 'Anonymous'}</span>
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                {new Date(resource.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-[rgb(var(--text-muted))]">
                                                            <span className="flex items-center gap-1">
                                                                <Download className="w-3 h-3" />
                                                                {resource.downloads} downloads
                                                            </span>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1">
                                                                <Eye className="w-3 h-3" />
                                                                {resource.views} views
                                                            </span>
                                                            {resource.tags && resource.tags.length > 0 && (
                                                                <>
                                                                    <span>•</span>
                                                                    <div className="flex gap-1 flex-wrap">
                                                                        {resource.tags.slice(0, 3).map((tag, idx) => (
                                                                            <span
                                                                                key={idx}
                                                                                className="px-2 py-0.5 bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))] rounded text-xs font-medium"
                                                                            >
                                                                                {tag}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-[rgb(var(--border-subtle))] sm:border-0 sm:pt-0">
                                                        <Button
                                                            onClick={() => handleView(resource)}
                                                            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white flex-1 justify-center"
                                                        >
                                                            <ExternalLink className="w-4 h-4 mr-2" />
                                                            <span>View</span>
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleDownload(resource)}
                                                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white flex-1 justify-center"
                                                        >
                                                            <Download className="w-4 h-4 mr-2" />
                                                            <span className="hidden sm:inline">Download</span>
                                                            <span className="sm:hidden">Get</span>
                                                        </Button>
                                                        {(isOwner || user.role === 'admin' || user.role === 'owner') && (
                                                            <>
                                                                <Button
                                                                    onClick={() => handleDelete(resource._id)}
                                                                    className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white flex-1 sm:flex-none justify-center px-3"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                    <span className="sr-only sm:not-sr-only sm:ml-2">Delete</span>
                                                                </Button>
                                                                <Button
                                                                    onClick={() => handleEdit(resource)}
                                                                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white flex-1 sm:flex-none justify-center px-3"
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                    <span className="sr-only sm:not-sr-only sm:ml-2">Edit</span>
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                        {totalPages > 1 && (
                            <div className="mt-8 flex justify-center">
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
            </div>
        </div>
    );
};

export default ResourcesPage;
