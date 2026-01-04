import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    FileText,
    ShieldAlert,
    CheckCircle,
    XCircle,
    Search,
    MoreVertical,
    Loader2,
    LayoutDashboard,
    ArrowUpRight,
    PenSquare,
    Trash2,
    Shield
} from 'lucide-react';
import axios from '../../utils/axiosInstance';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import UserEditModal from './components/UserEditModal';

const STATS_CARDS = [
    { title: 'Total Users', key: 'totalUsers', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Active Admins', key: 'activeAdmins', icon: Shield, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Banned Users', key: 'bannedUsers', icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-500/10' },
    { title: 'Pending Approvals', key: 'pendingApprovals', icon: FileText, color: 'text-amber-500', bg: 'bg-amber-500/10' },
];

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [qnaRequests, setQnaRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({ totalUsers: 0, activeAdmins: 0, bannedUsers: 0, pendingApprovals: 0 });

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    // Recalculate stats whenever data changes
    useEffect(() => {
        const totalUsers = users.length;
        const activeAdmins = users.filter(u => u.role === 'admin').length;
        const bannedUsers = users.filter(u => u.isBanned).length;
        const pendingApprovals = qnaRequests.length;
        setStats({ totalUsers, activeAdmins, bannedUsers, pendingApprovals });
    }, [users, qnaRequests]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, qnaRes] = await Promise.all([
                axios.get(API.ADMIN.GET_USERS),
                axios.get(API.ADMIN.GET_QNA_REQUESTS)
            ]);
            setUsers(usersRes.data);
            setQnaRequests(qnaRes.data);
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

    const filteredUsers = users.filter(user =>
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                            </div>
                            {/* Decorative background circle */}
                            <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full ${stat.bg} opacity-20 blur-2xl group-hover:scale-150 transition-transform duration-500`} />
                        </motion.div>
                    ))}
                </div>

                {/* Main Content Tabs & View */}
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar Navigation */}
                    <div className="lg:w-64 flex flex-col gap-2 shrink-0">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium transition-all ${activeTab === 'users'
                                    ? 'bg-[rgb(var(--accent))] text-white shadow-lg shadow-[rgb(var(--accent))]/20'
                                    : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-elevated))]'
                                }`}
                        >
                            <Users className="w-5 h-5" /> All Users
                        </button>
                        <button
                            onClick={() => setActiveTab('qna')}
                            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium transition-all ${activeTab === 'qna'
                                    ? 'bg-[rgb(var(--accent))] text-white shadow-lg shadow-[rgb(var(--accent))]/20'
                                    : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-elevated))]'
                                }`}
                        >
                            <FileText className="w-5 h-5" />
                            Approvals
                            {stats.pendingApprovals > 0 && (
                                <span className="ml-auto bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                                    {stats.pendingApprovals}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Active View Content */}
                    <div className="flex-1 min-h-[500px] bg-[rgb(var(--bg-card))] rounded-3xl border border-[rgb(var(--border))] shadow-sm overflow-hidden p-6 animate-in fade-in zoom-in duration-300">
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
                                            className="w-full pl-10 pr-4 py-2.5 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-xl text-sm focus:ring-2 focus:ring-[rgb(var(--accent))]/20 focus:border-[rgb(var(--accent))] outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="overflow-x-auto rounded-xl border border-[rgb(var(--border))]">
                                    <table className="w-full text-left">
                                        <thead className="bg-[rgb(var(--bg-elevated))]">
                                            <tr>
                                                <th className="py-4 px-6 text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider">User</th>
                                                <th className="py-4 px-6 text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider">Role</th>
                                                <th className="py-4 px-6 text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider">Status</th>
                                                <th className="py-4 px-6 text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider">Joined</th>
                                                <th className="py-4 px-6 text-right text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[rgb(var(--border))]">
                                            {filteredUsers.map((user) => (
                                                <tr key={user._id} className="group hover:bg-[rgb(var(--bg-elevated-alt))] transition-colors">
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative">
                                                                <img src={user.photo || '/default-avatar.jpg'} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-[rgb(var(--bg-main))]" />
                                                                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[rgb(var(--bg-card))] ${user.isBanned ? 'bg-red-500' : 'bg-green-500'}`} />
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-[rgb(var(--text-primary))]">{user.fullName}</div>
                                                                <div className="text-xs text-[rgb(var(--text-muted))]">{user.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${user.role === 'admin'
                                                            ? 'bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-900'
                                                            : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                                                            }`}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        {user.isBanned ? (
                                                            <span className="inline-flex items-center gap-1.5 text-red-600 font-medium text-sm">
                                                                <ShieldAlert className="w-4 h-4" /> Suspended
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 text-green-600 font-medium text-sm">
                                                                <CheckCircle className="w-4 h-4" /> Active
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-6 text-sm text-[rgb(var(--text-secondary))]">
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
                                                                        ? "bg-green-500/10 text-green-600 border-green-200 hover:bg-green-500/20"
                                                                        : "text-red-500 hover:bg-red-500/10"
                                                                        }`}
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
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">Content Approvals</h2>

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
                                            <motion.div
                                                layout
                                                key={req.qnaId}
                                                className="bg-[rgb(var(--bg-main))] p-5 rounded-2xl border border-[rgb(var(--border))] hover:border-[rgb(var(--accent))]/50 transition-colors shadow-sm"
                                            >
                                                <div className="flex flex-col md:flex-row gap-6">
                                                    <div className="flex-1 space-y-3">
                                                        <div className="flex items-center gap-3 text-xs">
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
                                                        <div>
                                                            <h3 className="text-base font-semibold text-[rgb(var(--text-primary))] mb-1.5 line-clamp-2">
                                                                {req.question}
                                                            </h3>
                                                            <div className="text-sm text-[rgb(var(--text-secondary))] bg-[rgb(var(--bg-elevated))] p-3 rounded-xl border border-[rgb(var(--border))] line-clamp-3">
                                                                {req.answerParts.map(p => p.content).join(' ').substring(0, 200)}...
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex md:flex-col gap-2 shrink-0 md:justify-center">
                                                        <Button
                                                            size="sm"
                                                            className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 border-hidden"
                                                            onClick={() => handleQnaAction(req.sessionId, req.qnaId, 'approve')}
                                                        >
                                                            <CheckCircle className="w-4 h-4 mr-2" /> Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            className="flex-1 md:flex-none shadow-lg shadow-red-600/20"
                                                            onClick={() => handleQnaAction(req.sessionId, req.qnaId, 'reject')}
                                                        >
                                                            <XCircle className="w-4 h-4 mr-2" /> Reject
                                                        </Button>
                                                    </div>
                                                </div>
                                            </motion.div>
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
        </div>
    );
};

export default AdminDashboard;
