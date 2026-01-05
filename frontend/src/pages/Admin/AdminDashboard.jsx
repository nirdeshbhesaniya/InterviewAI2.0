import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle,
    Eye,
    Trash2,
    ShieldOff,
    ShieldCheck,
    Search,
    Filter,
    ArrowUpRight,
    MoreHorizontal,
    ShieldAlert,
    Clock,
    UserCheck,
    AlertCircle,
    BookOpen,
    XCircle,
    Users,
    Shield,
    FileText,
    ExternalLink,
    FileIcon,
    Loader2,
    PenSquare,
    ChevronDown
} from 'lucide-react';
import axios from '../../utils/axiosInstance';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import UserEditModal from './components/UserEditModal';
import AnswerRenderer from '../../components/interview/AnswerRenderer';
import Pagination from '../../components/common/Pagination';

const STATS_CARDS = [
    { title: 'Total Users', key: 'totalUsers', icon: Users, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'Active Admins', key: 'activeAdmins', icon: Shield, color: 'text-purple-500 dark:text-purple-400', bg: 'bg-purple-500/10' },
    { title: 'Banned Users', key: 'bannedUsers', icon: ShieldAlert, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-500/10' },
    { title: 'Pending Approvals', key: 'pendingApprovals', icon: FileText, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-500/10' },
];

const ApprovalItem = ({ req, onApprove, onReject }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <motion.div
            layout
            className="bg-[rgb(var(--bg-main))] rounded-2xl border border-[rgb(var(--border))] hover:border-[rgb(var(--accent))]/50 transition-colors shadow-sm overflow-hidden"
        >
            <div className="p-5">
                <div className="flex flex-col gap-4">
                    {/* Header: Meta info */}
                    <div className="flex items-center gap-3 text-xs flex-wrap">
                        <span className="px-2.5 py-1 rounded-md bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))] font-medium border border-[rgb(var(--accent))]/20">
                            {req.category}
                        </span>
                        <span className="text-[rgb(var(--text-muted))]">
                            Requested by <span className="text-[rgb(var(--text-primary))] font-medium">{req.requestedBy.fullName || 'Unknown'}</span>
                        </span>
                        <span className="w-1 h-1 rounded-full bg-[rgb(var(--text-muted))]" />
                        <span className="text-[rgb(var(--text-muted))]">
                            {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                    </div>

                    {/* Question & Actions */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-[rgb(var(--text-primary))] mb-2">
                                <a
                                    href={`/interview-prep/${req.sessionId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-[rgb(var(--accent))] hover:underline flex items-center gap-2 transition-colors break-words"
                                >
                                    {req.question}
                                    <ExternalLink className="w-3.5 h-3.5 inline-block opacity-50 shrink-0" />
                                </a>
                            </h3>
                        </div>

                        <div className="flex gap-2 shrink-0 w-full md:w-auto">
                            <Button
                                size="sm"
                                className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 border-hidden"
                                onClick={() => onApprove(req.sessionId, req.qnaId)}
                            >
                                <CheckCircle className="w-4 h-4 mr-2" /> Approve
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                className="flex-1 md:flex-none shadow-lg shadow-red-600/20"
                                onClick={() => onReject(req.sessionId, req.qnaId)}
                            >
                                <XCircle className="w-4 h-4 mr-2" /> Reject
                            </Button>
                        </div>
                    </div>

                    {/* Expand Toggle */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-2 text-xs font-medium text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--accent))] transition-colors w-fit"
                    >
                        {isExpanded ? 'Hide Answer' : 'View Answer'}
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Expanded Answer Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="px-5 pb-5 border-t border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))]/30">
                            <div className="pt-4">
                                <AnswerRenderer answer={req.answerParts} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [qnaRequests, setQnaRequests] = useState([]);
    const [pendingNotes, setPendingNotes] = useState([]);
    const [pendingResources, setPendingResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({ totalUsers: 0, activeAdmins: 0, bannedUsers: 0, pendingApprovals: 0 });

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    // Recalculate stats whenever data changes
    useEffect(() => {
        const totalUsers = users.length;
        const activeAdmins = users.filter(u => u.role === 'admin').length;
        const bannedUsers = users.filter(u => u.isBanned).length;
        const pendingApprovals = qnaRequests.length + pendingNotes.length + pendingResources.length;
        setStats({ totalUsers, activeAdmins, bannedUsers, pendingApprovals });
    }, [users, qnaRequests, pendingNotes, pendingResources]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, qnaRes, notesRes, resourcesRes] = await Promise.all([
                axios.get(API.ADMIN.GET_USERS),
                axios.get(API.ADMIN.GET_QNA_REQUESTS),
                axios.get(API.NOTES.ADMIN_PENDING),
                axios.get(API.RESOURCES.ADMIN_PENDING)
            ]);
            setUsers(usersRes.data);
            setQnaRequests(qnaRes.data);
            setPendingNotes(notesRes.data.notes || []);
            setPendingResources(resourcesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleBanToggle = async (userId, currentStatus) => {
        try {
            const res = await axios.patch(API.ADMIN.BAN_USER(userId), {
                isBanned: !currentStatus
            });
            toast.success(res.data.message);
            setUsers(users.map(u => u._id === userId ? { ...u, isBanned: !currentStatus } : u));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update user status');
        }
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleSaveUser = async (userId, updatedData) => {
        try {
            const res = await axios.put(API.ADMIN.UPDATE_USER(userId), updatedData);
            toast.success('User profile updated successfully');

            // Update local state
            setUsers(users.map(u => u._id === userId ? { ...u, ...updatedData } : u));
            setIsEditModalOpen(false);
        } catch (error) {
            console.error('Update failed:', error);
            toast.error(error.response?.data?.message || 'Failed to update user');
        }
    };

    const handleQnaAction = async (sessionId, qnaId, action) => {
        try {
            if (action === 'approve') {
                await axios.patch(API.ADMIN.APPROVE_QNA(sessionId, qnaId));
                toast.success('Question approved');
            } else {
                await axios.patch(API.ADMIN.REJECT_QNA(sessionId, qnaId));
                toast.success('Question rejected');
            }
            setQnaRequests(qnaRequests.filter(q => q.qnaId !== qnaId));
        } catch (error) {
            toast.error('Failed to process request');
        }
    };

    const handleApproveAll = async () => {
        if (!window.confirm('Are you sure you want to approve ALL pending questions? This cannot be undone.')) {
            return;
        }

        try {
            const response = await axios.post(API.ADMIN.APPROVE_ALL_QNA);
            toast.success(response.data.message);
            // Refresh data
            const qnaRes = await axios.get(API.ADMIN.GET_QNA_REQUESTS);
            setQnaRequests(qnaRes.data);
        } catch (error) {
            console.error('Error approving all:', error);
            toast.error('Failed to approve all requests');
        }
    };

    const handleNoteAction = async (noteId, status) => {
        try {
            await axios.patch(API.NOTES.UPDATE_STATUS(noteId), { status });
            toast.success(`Note ${status}`);
            setPendingNotes(pendingNotes.filter(n => n._id !== noteId));
        } catch (error) {
            toast.error('Failed to update note status');
        }
    };

    const handleResourceAction = async (resourceId, status) => {
        try {
            await axios.patch(API.RESOURCES.UPDATE_STATUS(resourceId), { status });
            toast.success(`Resource ${status}`);
            setPendingResources(pendingResources.filter(r => r._id !== resourceId));
        } catch (error) {
            toast.error('Failed to update resource status');
        }
    };

    const filteredUsers = users.filter(user =>
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Logic for Users
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (
        <div className="min-h-screen bg-[rgb(var(--bg-main))] p-4 sm:p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-[rgb(var(--text-primary))] to-[rgb(var(--text-secondary))] bg-clip-text text-transparent">
                            Admin Dashboard
                        </h1>
                        <p className="text-[rgb(var(--text-secondary))] mt-1"> Overview of system performance and user management</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {STATS_CARDS.map((stat, index) => (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-[rgb(var(--bg-card))] p-6 rounded-2xl border border-[rgb(var(--border))] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                        >
                            <div className="relative z-10 flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-[rgb(var(--text-muted))]">{stat.title}</p>
                                    <h3 className="text-3xl font-bold text-[rgb(var(--text-primary))] mt-2">{stats[stat.key]}</h3>
                                </div>
                                <div className={`p - 3 rounded - xl ${stat.bg} ${stat.color} `}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                            </div>
                            {/* Decorative background circle */}
                            <div className={`absolute - bottom - 4 - right - 4 w - 24 h - 24 rounded - full ${stat.bg} opacity - 20 blur - 2xl group - hover: scale - 150 transition - transform duration - 500`} />
                        </motion.div>
                    ))}
                </div>

                {/* Main Content Tabs & View */}
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar Navigation */}
                    <div className="w-full lg:w-64 flex flex-row lg:flex-col gap-2 shrink-0 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`flex-none lg:w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium transition-all whitespace-nowrap ${activeTab === 'users'
                                ? 'bg-[rgb(var(--accent))] text-white shadow-lg shadow-[rgb(var(--accent))]/20'
                                : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-elevated))]'
                                } `}
                        >
                            <Users className="w-5 h-5" /> All Users
                        </button>
                        <button
                            onClick={() => setActiveTab('qna')}
                            className={`flex-none lg:w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium transition-all whitespace-nowrap ${activeTab === 'qna'
                                ? 'bg-[rgb(var(--accent))] text-white shadow-lg shadow-[rgb(var(--accent))]/20'
                                : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-elevated))]'
                                } `}
                        >
                            <FileText className="w-5 h-5" />
                            Approvals
                            {(qnaRequests.length > 0) && (
                                <span className="ml-auto bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                                    {qnaRequests.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('notes')}
                            className={`flex-none lg:w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium transition-all whitespace-nowrap ${activeTab === 'notes'
                                ? 'bg-[rgb(var(--accent))] text-white shadow-lg shadow-[rgb(var(--accent))]/20'
                                : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-elevated))]'
                                } `}
                        >
                            <FileIcon className="w-5 h-5" />
                            Notes
                            {pendingNotes.length > 0 && (
                                <span className="ml-auto bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                                    {pendingNotes.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('resources')}
                            className={`flex-none lg:w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium transition-all whitespace-nowrap ${activeTab === 'resources'
                                ? 'bg-[rgb(var(--accent))] text-white shadow-lg shadow-[rgb(var(--accent))]/20'
                                : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-elevated))]'
                                } `}
                        >
                            <BookOpen className="w-5 h-5" />
                            Resources
                            {pendingResources.length > 0 && (
                                <span className="ml-auto bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                                    {pendingResources.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Active View Content */}
                    <div className="flex-1 min-h-[500px] bg-[rgb(var(--bg-card))] rounded-3xl border border-[rgb(var(--border))] shadow-sm overflow-hidden p-4 sm:p-6 animate-in fade-in zoom-in duration-300">
                        {loading ? (
                            <div className="flex items-center justify-center h-full min-h-[400px]">
                                <Loader2 className="w-10 h-10 text-[rgb(var(--accent))] animate-spin" />
                            </div>
                        ) : activeTab === 'users' ? (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center gap-4 flex-wrap">
                                    <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">User Management</h2>
                                    <div className="relative w-full max-w-sm">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--text-muted))]" />
                                        <input
                                            type="text"
                                            placeholder="Search by name or email..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-xl text-sm text-[rgb(var(--text-primary))] focus:ring-2 focus:ring-[rgb(var(--accent))]/20 focus:border-[rgb(var(--accent))] outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Mobile View: User Cards */}
                                <div className="md:hidden space-y-4">
                                    {currentUsers.map((user) => (
                                        <div key={user._id} className="bg-[rgb(var(--bg-elevated))] p-4 rounded-xl border border-[rgb(var(--border))] shadow-sm active:scale-[0.99] transition-transform">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <img src={user.photo || '/default-avatar.jpg'} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-[rgb(var(--bg-main))]" />
                                                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[rgb(var(--bg-elevated))] ${user.isBanned ? 'bg-red-500' : 'bg-green-500'}`} />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-[rgb(var(--text-primary))]">{user.fullName}</div>
                                                        <div className="text-xs text-[rgb(var(--text-muted))]">{user.email}</div>
                                                    </div>
                                                </div>
                                                {user.isBanned ? (
                                                    <span className="inline-flex items-center gap-1.5 text-red-600 dark:text-red-400 font-medium text-xs bg-red-500/10 px-2 py-1 rounded-full">
                                                        <ShieldAlert className="w-3 h-3" /> Suspended
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-green-600 dark:text-green-400 font-medium text-xs bg-green-500/10 px-2 py-1 rounded-full">
                                                        <CheckCircle className="w-3 h-3" /> Active
                                                    </span>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-[rgb(var(--border))]">
                                                <div>
                                                    <span className="text-xs text-[rgb(var(--text-muted))] block mb-1">Role</span>
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${user.role === 'admin'
                                                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900'
                                                        : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                                                        }`}>
                                                        {user.role}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-[rgb(var(--text-muted))] block mb-1">Joined</span>
                                                    <span className="text-sm text-[rgb(var(--text-primary))]">
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-end gap-2">
                                                <Button size="sm" variant="outline" onClick={() => handleEditUser(user)} className="h-8 text-xs">
                                                    <PenSquare className="w-3 h-3 mr-1.5" /> Edit
                                                </Button>
                                                {user.role !== 'admin' && (
                                                    <Button
                                                        size="sm"
                                                        variant={user.isBanned ? "outline" : "ghost"}
                                                        onClick={() => handleBanToggle(user._id, user.isBanned)}
                                                        className={`h-8 text-xs ${user.isBanned
                                                            ? "bg-green-500/10 text-green-600 hover:bg-green-500/20 shadow-none border-green-200"
                                                            : "text-red-500 hover:bg-red-500/10 hover:text-red-600"
                                                            }`}
                                                    >
                                                        {user.isBanned ? (
                                                            <> <CheckCircle className="w-3 h-3 mr-1.5" /> Unban </>
                                                        ) : (
                                                            <> <ShieldAlert className="w-3 h-3 mr-1.5" /> Ban </>
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <div className="py-12 text-center text-[rgb(var(--text-muted))] bg-[rgb(var(--bg-elevated))] rounded-xl border border-[rgb(var(--border))]">
                                            No users found.
                                        </div>
                                    )}
                                </div>

                                {/* Desktop View: Table */}
                                <div className="hidden md:block overflow-x-auto rounded-xl border border-[rgb(var(--border))]">
                                    <table className="w-full text-left">
                                        <thead className="bg-[rgb(var(--bg-elevated))]">
                                            <tr>
                                                <th className="py-4 px-6 text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider">User</th>
                                                <th className="hidden md:table-cell py-4 px-6 text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider">Role</th>
                                                <th className="py-4 px-6 text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider">Status</th>
                                                <th className="hidden lg:table-cell py-4 px-6 text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider">Joined</th>
                                                <th className="py-4 px-6 text-right text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[rgb(var(--border))]">
                                            {currentUsers.map((user) => (
                                                <tr key={user._id} className="group hover:bg-[rgb(var(--bg-elevated-alt))] transition-colors">
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative">
                                                                <img src={user.photo || '/default-avatar.jpg'} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-[rgb(var(--bg-main))]" />
                                                                <span className={`absolute bottom - 0 right - 0 w - 3 h - 3 rounded - full border - 2 border - [rgb(var(--bg - card))] ${user.isBanned ? 'bg-red-500' : 'bg-green-500'} `} />
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-[rgb(var(--text-primary))]">{user.fullName}</div>
                                                                <div className="text-xs text-[rgb(var(--text-muted))]">{user.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="hidden md:table-cell py-4 px-6">
                                                        <span className={`inline - flex items - center px - 2.5 py - 1 rounded - full text - xs font - medium border ${user.role === 'admin'
                                                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900'
                                                            : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                                                            } `}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        {user.isBanned ? (
                                                            <span className="inline-flex items-center gap-1.5 text-red-600 dark:text-red-400 font-medium text-sm">
                                                                <ShieldAlert className="w-4 h-4" /> Suspended
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 text-green-600 dark:text-green-400 font-medium text-sm">
                                                                <CheckCircle className="w-4 h-4" /> Active
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="hidden lg:table-cell py-4 px-6 text-sm text-[rgb(var(--text-secondary))]">
                                                        {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </td>
                                                    <td className="py-4 px-6 text-right">
                                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleEditUser(user)}
                                                                className="h-8 w-8 p-0 rounded-full border-[rgb(var(--border))]"
                                                                title="Edit User"
                                                            >
                                                                <PenSquare className="w-4 h-4 text-[rgb(var(--text-secondary))]" />
                                                            </Button>

                                                            {user.role !== 'admin' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant={user.isBanned ? "outline" : "ghost"}
                                                                    onClick={() => handleBanToggle(user._id, user.isBanned)}
                                                                    className={`h-8 w-8 p-0 rounded-full ${user.isBanned
                                                                        ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 hover:bg-green-500/20"
                                                                        : "text-red-500 dark:text-red-400 hover:bg-red-500/10"
                                                                        } `}
                                                                    title={user.isBanned ? "Unban User" : "Ban User"}
                                                                >
                                                                    {user.isBanned ? <CheckCircle className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredUsers.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="py-12 text-center text-[rgb(var(--text-muted))]">
                                                        No users found matching your search.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        ) : activeTab === 'qna' ? (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">Content Approvals</h2>
                                    {qnaRequests.length > 0 && (
                                        <button
                                            onClick={handleApproveAll}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors font-medium shadow-sm"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            Approve All ({qnaRequests.length})
                                        </button>
                                    )}
                                </div>

                                {qnaRequests.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-[rgb(var(--border))] rounded-2xl bg-[rgb(var(--bg-elevated))]/30">
                                        <div className="p-4 bg-green-500/10 rounded-full mb-4">
                                            <CheckCircle className="w-12 h-12 text-green-500" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">All caught up!</h3>
                                        <p className="text-[rgb(var(--text-secondary))] max-w-xs mx-auto mt-2">There are no pending QA requests requiring your attention right now.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {qnaRequests.map((req) => (
                                            <ApprovalItem
                                                key={req.qnaId}
                                                req={req}
                                                onApprove={(sid, qid) => handleQnaAction(sid, qid, 'approve')}
                                                onReject={(sid, qid) => handleQnaAction(sid, qid, 'reject')}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : activeTab === 'notes' ? (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">Pending Notes</h2>
                                {pendingNotes.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-[rgb(var(--border))] rounded-2xl bg-[rgb(var(--bg-elevated))]/30">
                                        <div className="p-4 bg-blue-500/10 rounded-full mb-4">
                                            <CheckCircle className="w-12 h-12 text-blue-500" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">No pending notes</h3>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {pendingNotes.map((note) => (
                                            <div key={note._id} className="bg-[rgb(var(--bg-main))] p-5 rounded-2xl border border-[rgb(var(--border))] shadow-sm">
                                                <div className="flex flex-col md:flex-row gap-6">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-lg text-[rgb(var(--text-primary))]">{note.title}</h3>
                                                        <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">{note.description}</p>
                                                        <div className="flex gap-2 mt-2 text-xs text-[rgb(var(--text-muted))]">
                                                            <span>By: {note.userName}</span>
                                                            <span>Type: {note.type}</span>
                                                            <a href={note.link} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                                                                View Link <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 items-center">
                                                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleNoteAction(note._id, 'approved')}>
                                                            Approve
                                                        </Button>
                                                        <Button size="sm" variant="destructive" onClick={() => handleNoteAction(note._id, 'rejected')}>
                                                            Reject
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">Pending Resources</h2>
                                {pendingResources.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-[rgb(var(--border))] rounded-2xl bg-[rgb(var(--bg-elevated))]/30">
                                        <div className="p-4 bg-purple-500/10 rounded-full mb-4">
                                            <CheckCircle className="w-12 h-12 text-purple-500" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">No pending resources</h3>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {pendingResources.map((res) => (
                                            <div key={res._id} className="bg-[rgb(var(--bg-main))] p-5 rounded-2xl border border-[rgb(var(--border))] shadow-sm">
                                                <div className="flex flex-col md:flex-row gap-6">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-lg text-[rgb(var(--text-primary))]">{res.title}</h3>
                                                        <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">{res.description}</p>
                                                        <div className="flex flex-wrap gap-2 mt-2 text-xs text-[rgb(var(--text-muted))]">
                                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">{res.branch}</span>
                                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">Sem {res.semester}</span>
                                                            <span>By: {res.uploadedByName}</span>
                                                            <a href={res.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                                                                View <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 items-center">
                                                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleResourceAction(res._id, 'approved')}>
                                                            Approve
                                                        </Button>
                                                        <Button size="sm" variant="destructive" onClick={() => handleResourceAction(res._id, 'rejected')}>
                                                            Reject
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit User Modal */}
            <UserEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={selectedUser}
                onSave={handleSaveUser}
            />
        </div >
    );
};

export default AdminDashboard;
