import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Shield,
    ShieldAlert,
    FileText,
    FileIcon,
    BookOpen,
    Cpu,
    FileQuestion,
    Bell,
    Loader2
} from 'lucide-react';
import axios from '../../utils/axiosInstance';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';

// Import extracted components
import UserManagement from './components/UserManagement';
import ContentApprovals from './components/ContentApprovals';
import PendingNotes from './components/PendingNotes';
import PendingResources from './components/PendingResources';
import PracticeTestsManagement from './components/PracticeTestsManagement';
import NotificationCenter from './components/NotificationCenter';
import AIServicePanel from './components/AIServicePanel';

const STATS_CARDS = [
    { title: 'Total Users', key: 'totalUsers', icon: Users, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'Active Admins', key: 'activeAdmins', icon: Shield, color: 'text-purple-500 dark:text-purple-400', bg: 'bg-purple-500/10' },
    { title: 'Banned Users', key: 'bannedUsers', icon: ShieldAlert, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-500/10' },
    { title: 'Pending Approvals', key: 'pendingApprovals', icon: FileText, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-500/10' },
];

const AdminDashboard = () => {
    // State for separate sections
    const [activeTab, setActiveTab] = useState('users');
    const [stats, setStats] = useState({ totalUsers: 0, activeAdmins: 0, bannedUsers: 0, pendingApprovals: 0 });
    const [loading, setLoading] = useState(true);

    // Initial Load & Stats
    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            // Stats fetching logic - assuming we still want a global overview.
            // Some of this might duplicate calls in sub-components if they also fetch on mount,
            // but stats are usually lightweight.
            // Using same endpoints to get counts.
            const [usersRes, qnaRes] = await Promise.all([
                axios.get(API.ADMIN.GET_USERS),
                axios.get(API.ADMIN.GET_QNA_REQUESTS)
            ]);

            const totalUsers = usersRes.data.length;
            const activeAdmins = usersRes.data.filter(u => u.role === 'admin').length;
            const bannedUsers = usersRes.data.filter(u => u.isBanned).length;

            // QnA pagination result handling
            const pendingApprovals = qnaRes.data.pagination?.totalRequests || qnaRes.data.totalRequests || 0;

            setStats({ totalUsers, activeAdmins, bannedUsers, pendingApprovals });
        } catch (error) {
            console.error('Error fetching stats:', error);
            // toast.error('Failed to load dashboard stats');
        } finally {
            setLoading(false);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'users':
                return <UserManagement />;
            case 'qna':
                return <ContentApprovals />;
            case 'notes':
                return <PendingNotes />;
            case 'resources':
                return <PendingResources />;
            case 'ai':
                return <AIServicePanel />;
            case 'practice':
                return <PracticeTestsManagement />;
            case 'notifications':
                return <NotificationCenter />;
            default:
                return <UserManagement />;
        }
    };

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
                    <div className="w-full lg:w-64 flex flex-row lg:flex-col gap-2 shrink-0 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`flex-none lg:w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium transition-all whitespace-nowrap ${activeTab === 'users'
                                ? 'bg-[rgb(var(--accent))] text-white shadow-lg shadow-[rgb(var(--accent))]/20'
                                : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-elevated))]'
                                }`}
                        >
                            <Users className="w-5 h-5" /> All Users
                        </button>
                        <button
                            onClick={() => setActiveTab('qna')}
                            className={`flex-none lg:w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium transition-all whitespace-nowrap ${activeTab === 'qna'
                                ? 'bg-[rgb(var(--accent))] text-white shadow-lg shadow-[rgb(var(--accent))]/20'
                                : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-elevated))]'
                                }`}
                        >
                            <FileText className="w-5 h-5" />
                            Approvals
                            {(stats.pendingApprovals > 0) && (
                                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${activeTab === 'qna'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))]'
                                    }`}>
                                    {stats.pendingApprovals}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('notes')}
                            className={`flex-none lg:w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium transition-all whitespace-nowrap ${activeTab === 'notes'
                                ? 'bg-[rgb(var(--accent))] text-white shadow-lg shadow-[rgb(var(--accent))]/20'
                                : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-elevated))]'
                                }`}
                        >
                            <FileIcon className="w-5 h-5" />
                            Notes
                        </button>
                        <button
                            onClick={() => setActiveTab('resources')}
                            className={`flex-none lg:w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium transition-all whitespace-nowrap ${activeTab === 'resources'
                                ? 'bg-[rgb(var(--accent))] text-white shadow-lg shadow-[rgb(var(--accent))]/20'
                                : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-elevated))]'
                                }`}
                        >
                            <BookOpen className="w-5 h-5" />
                            Resources
                        </button>
                        <button
                            onClick={() => setActiveTab('ai')}
                            className={`flex-none lg:w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium transition-all whitespace-nowrap ${activeTab === 'ai'
                                ? 'bg-[rgb(var(--accent))] text-white shadow-lg shadow-[rgb(var(--accent))]/20'
                                : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-elevated))]'
                                }`}
                        >
                            <Cpu className="w-5 h-5" />
                            AI Control
                        </button>
                        <button
                            onClick={() => setActiveTab('practice')}
                            className={`flex-none lg:w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium transition-all whitespace-nowrap ${activeTab === 'practice'
                                ? 'bg-[rgb(var(--accent))] text-white shadow-lg shadow-[rgb(var(--accent))]/20'
                                : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-elevated))]'
                                }`}
                        >
                            <FileQuestion className="w-5 h-5" />
                            Practice Tests
                        </button>

                        <button
                            onClick={() => setActiveTab('notifications')}
                            className={`flex-none lg:w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium transition-all whitespace-nowrap ${activeTab === 'notifications'
                                ? 'bg-[rgb(var(--accent))] text-white shadow-lg shadow-[rgb(var(--accent))]/20'
                                : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-elevated))]'
                                }`}
                        >
                            <Bell className="w-5 h-5" />
                            Notifications
                        </button>
                    </div>

                    {/* Active View Content */}
                    <motion.div
                        key={activeTab} // Key forces re-mount of content container on tab change, but components inside are fresh
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex-1 min-h-[500px] bg-[rgb(var(--bg-card))] rounded-3xl border border-[rgb(var(--border))] shadow-sm overflow-hidden p-4 sm:p-6"
                    >
                        {loading && !stats.totalUsers ? ( // Initial loading only
                            <div className="flex items-center justify-center h-full min-h-[400px]">
                                <Loader2 className="w-10 h-10 text-[rgb(var(--accent))] animate-spin" />
                            </div>
                        ) : (
                            renderContent()
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
