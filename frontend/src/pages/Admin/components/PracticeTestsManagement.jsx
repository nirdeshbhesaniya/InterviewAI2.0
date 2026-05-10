import React, { useState, useEffect, useCallback } from 'react';
import { 
    Search, Plus, Trash2, Clock, FileQuestion, 
    ChevronDown, CheckCircle, PenSquare, RotateCcw, 
    X, Mail, Users, Loader2, Calendar, 
    BarChart2, MoreVertical, Eye, EyeOff,
    TrendingUp, Award, Activity
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../../../utils/axiosInstance';
import { API } from '../../../utils/apiPaths';
import toast from 'react-hot-toast';
import { Button } from '../../../components/ui/button';
import Pagination from '../../../components/common/Pagination';
import PracticeTestModal from './PracticeTestModal';

const PracticeTestsManagement = () => {
    // List State
    const [practiceTests, setPracticeTests] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalTests: 0
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const ITEMS_PER_PAGE = 8;

    // Summary Stats
    const [summaryStats, setSummaryStats] = useState({
        totalTests: 0,
        totalAttempts: 0,
        totalSubmissions: 0,
        activeUsers: 0
    });

    // Modal States
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const [selectedTest, setSelectedTest] = useState(null);
    
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetTargetId, setResetTargetId] = useState(null);

    const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
    const [analyticsTest, setAnalyticsTest] = useState(null);
    const [analyticsData, setAnalyticsData] = useState([]);
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);

    // Fetch Tests
    const fetchTests = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const res = await axios.get(API.ADMIN.GET_PRACTICE_TESTS, {
                params: {
                    page,
                    limit: ITEMS_PER_PAGE,
                    search: searchQuery
                }
            });
            
            if (res.data.success) {
                setPracticeTests(res.data.data);
                setPagination({
                    currentPage: res.data.pagination.currentPage,
                    totalPages: res.data.pagination.totalPages,
                    totalTests: res.data.pagination.totalTests
                });
            }
        } catch (error) {
            console.error('Error fetching tests:', error);
            toast.error('Failed to load practice tests');
        } finally {
            setLoading(false);
        }
    }, [searchQuery]);

    // Fetch Summary Stats
    const fetchSummaryStats = async () => {
        try {
            const res = await axios.get(API.ADMIN.GET_PRACTICE_ANALYTICS);
            if (res.data.success) {
                setSummaryStats({
                    totalTests: res.data.totals.totalTests,
                    totalAttempts: res.data.totals.totalAttempts,
                    totalSubmissions: res.data.totals.totalSubmissions,
                    activeUsers: res.data.totals.totalUsersAttended
                });
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    useEffect(() => {
        fetchTests(pagination.currentPage);
    }, [fetchTests, pagination.currentPage]);

    useEffect(() => {
        fetchSummaryStats();
    }, []);

    // Handlers
    const handleCreateTest = () => {
        setSelectedTest(null);
        setIsTestModalOpen(true);
    };

    const handleEditTest = async (id) => {
        try {
            const res = await axios.get(API.ADMIN.GET_PRACTICE_TEST(id));
            setSelectedTest(res.data);
            setIsTestModalOpen(true);
        } catch (error) {
            toast.error('Failed to load test details');
        }
    };

    const handleSaveTest = async (id, data) => {
        try {
            if (id) {
                await axios.put(API.ADMIN.UPDATE_PRACTICE_TEST(id), data);
                toast.success('Test updated successfully');
            } else {
                await axios.post(API.ADMIN.CREATE_PRACTICE_TEST, data);
                toast.success('Test created successfully');
            }
            setIsTestModalOpen(false);
            fetchTests(pagination.currentPage);
            fetchSummaryStats();
        } catch (error) {
            toast.error('Failed to save test');
        }
    };

    const handleDeleteTest = async (id) => {
        if (!window.confirm('Delete this practice test? All related attempt data will be orphaned.')) return;
        try {
            await axios.delete(API.ADMIN.DELETE_PRACTICE_TEST(id));
            toast.success('Test deleted');
            fetchTests(pagination.currentPage);
            fetchSummaryStats();
        } catch (error) {
            toast.error('Failed to delete test');
        }
    };

    const togglePublishStatus = async (test) => {
        try {
            await axios.put(API.ADMIN.UPDATE_PRACTICE_TEST(test._id), {
                isPublished: !test.isPublished
            });
            toast.success(`Test ${!test.isPublished ? 'published' : 'unpublished'}`);
            setPracticeTests(prev => prev.map(t => t._id === test._id ? { ...t, isPublished: !t.isPublished } : t));
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const openResetModal = (id) => {
        setResetTargetId(id);
        setResetEmail('');
        setIsResetModalOpen(true);
    };

    const handleResetAttempts = async () => {
        if (!resetEmail) return toast.error('Enter user email');
        try {
            await axios.post(API.ADMIN.RESET_PRACTICE_ATTEMPTS(resetTargetId), { email: resetEmail });
            toast.success('User attempts reset');
            setIsResetModalOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Reset failed');
        }
    };

    const viewAnalytics = async (test) => {
        setAnalyticsTest(test);
        setIsAnalyticsModalOpen(true);
        setLoadingAnalytics(true);
        try {
            const res = await axios.get(API.ADMIN.GET_PRACTICE_ATTEMPTS(test._id));
            setAnalyticsData(res.data.data || []);
        } catch (err) {
            toast.error('Failed to load analytics');
        } finally {
            setLoadingAnalytics(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-2">
                <div className="space-y-1.5">
                    <h1 className="text-3xl font-extrabold tracking-tight text-[rgb(var(--text-primary))]">Practice Test Management</h1>
                    <p className="text-[rgb(var(--text-secondary))] text-sm max-w-lg leading-relaxed">Create, manage and analyze expert-curated practice exams to drive student success.</p>
                </div>
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:flex-none group">
                        <Search className="w-4.5 h-4.5 absolute left-4 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))] group-focus-within:text-[rgb(var(--accent))] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search tests..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchTests(1)}
                            className="h-12 pl-11 pr-4 bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-2xl text-sm focus:ring-4 focus:ring-[rgb(var(--accent))]/10 focus:border-[rgb(var(--accent))] outline-none w-full lg:w-72 transition-all shadow-sm group-hover:border-[rgb(var(--accent))]/30"
                        />
                    </div>
                    <Button 
                        onClick={handleCreateTest} 
                        className="h-12 px-5 sm:px-6 bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white rounded-2xl shadow-xl shadow-[rgb(var(--accent))]/25 flex items-center justify-center gap-2 font-bold transition-all hover:scale-[1.02] active:scale-95 shrink-0"
                    >
                        <Plus className="w-5 h-5 stroke-[2.5]" /> 
                        <span className="hidden sm:inline">New Test</span>
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {[
                    { label: 'Total Tests', value: summaryStats.totalTests, icon: FileQuestion, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Total Hits', value: summaryStats.totalAttempts, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'Submissions', value: summaryStats.totalSubmissions, icon: CheckCircle, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                    { label: 'Unique Users', value: summaryStats.activeUsers, icon: Users, color: 'text-orange-500', bg: 'bg-orange-500/10' }
                ].map((stat, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label} 
                        className="bg-[rgb(var(--bg-card))] p-6 rounded-3xl border border-[rgb(var(--border))] shadow-sm hover:shadow-md transition-all duration-300 group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl transition-transform group-hover:scale-110 duration-300`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-bold text-[rgb(var(--text-muted))] uppercase tracking-[0.15em] bg-[rgb(var(--bg-body-alt))] px-2.5 py-1 rounded-full">Overview</span>
                        </div>
                        <div className="space-y-0.5">
                            <div className="text-3xl font-black text-[rgb(var(--text-primary))] tracking-tight">{stat.value}</div>
                            <div className="text-sm font-medium text-[rgb(var(--text-secondary))]">{stat.label}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Test List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-10 h-10 text-[rgb(var(--accent))] animate-spin" />
                    <p className="text-[rgb(var(--text-secondary))] animate-pulse">Fetching practice library...</p>
                </div>
            ) : practiceTests.length === 0 ? (
                <div className="bg-[rgb(var(--bg-card))] rounded-[2rem] border-2 border-dashed border-[rgb(var(--border))] py-20 text-center">
                    <div className="bg-[rgb(var(--bg-elevated))] w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-[rgb(var(--border))]">
                        <FileQuestion className="w-10 h-10 text-[rgb(var(--text-muted))] opacity-40" />
                    </div>
                    <h3 className="text-xl font-bold text-[rgb(var(--text-primary))]">No tests found</h3>
                    <p className="text-[rgb(var(--text-secondary))] mb-8 max-w-sm mx-auto">Start building your expert test library to provide students with high-quality practice exams.</p>
                    <Button onClick={handleCreateTest} className="rounded-2xl h-12 px-8 bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white shadow-lg shadow-[rgb(var(--accent))]/20">
                        Create Your First Test
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AnimatePresence mode='popLayout'>
                        {practiceTests.map((test, i) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2, delay: i * 0.05 }}
                                key={test._id}
                                className="bg-[rgb(var(--bg-card))] rounded-[2rem] border border-[rgb(var(--border))] hover:border-[rgb(var(--accent))]/30 transition-all group p-6 shadow-sm hover:shadow-xl hover:shadow-[rgb(var(--accent))]/5 overflow-hidden flex flex-col"
                            >
                                <div className="flex justify-between items-start gap-4 mb-6">
                                    <div className="space-y-2 flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className={`text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-lg ${
                                                test.isPublished ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                                            }`}>
                                                {test.isPublished ? 'Live' : 'Draft'}
                                            </span>
                                            <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-lg bg-[rgb(var(--bg-body-alt))] text-[rgb(var(--text-muted))]">
                                                {test.topic}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-[rgb(var(--text-primary))] truncate group-hover:text-[rgb(var(--accent))] transition-colors leading-tight">
                                            {test.title}
                                        </h3>
                                        <p className="text-sm text-[rgb(var(--text-secondary))] line-clamp-2 leading-relaxed opacity-80">
                                            {test.description}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button 
                                            onClick={() => togglePublishStatus(test)}
                                            className={`p-3 rounded-2xl transition-all ${test.isPublished ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-amber-500 hover:bg-amber-500/10'} bg-[rgb(var(--bg-body-alt))]`}
                                            title={test.isPublished ? 'Unpublish' : 'Publish'}
                                        >
                                            {test.isPublished ? <Eye className="w-5.5 h-5.5" /> : <EyeOff className="w-5.5 h-5.5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-3 mb-6 p-4 bg-[rgb(var(--bg-body-alt))]/50 rounded-[1.25rem] border border-[rgb(var(--border-subtle))]">
                                    <div className="text-center border-r border-[rgb(var(--border))] pr-1">
                                        <div className="text-sm font-black text-[rgb(var(--text-primary))]">{test.questionCount || 0}</div>
                                        <div className="text-[10px] text-[rgb(var(--text-muted))] font-bold uppercase tracking-tighter">Quest</div>
                                    </div>
                                    <div className="text-center border-r border-[rgb(var(--border))] pr-1">
                                        <div className="text-sm font-black text-[rgb(var(--text-primary))]">{test.timeLimit}m</div>
                                        <div className="text-[10px] text-[rgb(var(--text-muted))] font-bold uppercase tracking-tighter">Mins</div>
                                    </div>
                                    <div className="text-center border-r border-[rgb(var(--border))] pr-1">
                                        <div className="text-sm font-black text-[rgb(var(--text-primary))]">{test.attempts || 0}</div>
                                        <div className="text-[10px] text-[rgb(var(--text-muted))] font-bold uppercase tracking-tighter">Hits</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm font-black text-emerald-500">{test.submissions || 0}</div>
                                        <div className="text-[10px] text-[rgb(var(--text-muted))] font-bold uppercase tracking-tighter">Done</div>
                                    </div>
                                </div>

                                <div className="mt-auto flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => viewAnalytics(test)}
                                            className="h-10 px-4 bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 rounded-xl text-xs font-bold transition-all"
                                        >
                                            <BarChart2 className="w-4 h-4 mr-2" /> Analytics
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => openResetModal(test._id)}
                                            className="h-10 px-4 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 rounded-xl text-xs font-bold transition-all"
                                        >
                                            <RotateCcw className="w-4 h-4 mr-2" /> Reset
                                        </Button>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <button 
                                            onClick={() => handleEditTest(test._id)}
                                            className="p-2.5 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent))] hover:bg-[rgb(var(--accent))]/10 rounded-xl transition-all"
                                        >
                                            <PenSquare className="w-5 h-5" />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteTest(test._id)}
                                            className="p-2.5 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-center pt-6">
                    <Pagination 
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={(p) => setPagination(prev => ({ ...prev, currentPage: p }))}
                    />
                </div>
            )}

            {/* Test Creation/Edit Modal */}
            <PracticeTestModal 
                isOpen={isTestModalOpen}
                onClose={() => setIsTestModalOpen(false)}
                onSave={handleSaveTest}
                testToEdit={selectedTest}
            />

            {/* Reset Modal */}
            {createPortal(
                <AnimatePresence>
                    {isResetModalOpen && (
                        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsResetModalOpen(false)}
                                className="absolute inset-0 bg-black/60 backdrop-blur-md" 
                            />
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative bg-[rgb(var(--bg-card))] rounded-3xl p-8 w-full max-w-md border border-[rgb(var(--border))] shadow-2xl"
                            >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="bg-blue-500/10 p-3 rounded-2xl">
                                    <RotateCcw className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-[rgb(var(--text-primary))]">Reset User Progress</h3>
                                    <p className="text-xs text-[rgb(var(--text-secondary))]">Clear attempt history for a specific student</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[rgb(var(--text-muted))] uppercase px-1">User Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[rgb(var(--text-muted))] group-focus-within:text-blue-500 transition-colors" />
                                        <input 
                                            type="email" 
                                            placeholder="student@example.com"
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            className="w-full h-12 pl-11 pr-4 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <Button variant="ghost" onClick={() => setIsResetModalOpen(false)} className="flex-1 rounded-2xl h-12 font-bold hover:bg-red-500/5 hover:text-red-500 transition-all">Cancel</Button>
                                    <Button onClick={handleResetAttempts} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-12 font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95">Confirm Reset</Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
                </AnimatePresence>,
                document.body
            )}

            {/* Analytics & Analysis Modal */}
            {createPortal(
                <AnimatePresence>
                    {isAnalyticsModalOpen && (
                        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsAnalyticsModalOpen(false)}
                                className="absolute inset-0 bg-black/60 backdrop-blur-md" 
                            />
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 40 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 40 }}
                                className="relative bg-[rgb(var(--bg-card))] rounded-[2rem] w-full max-w-5xl max-h-[85vh] border border-[rgb(var(--border))] shadow-2xl flex flex-col overflow-hidden"
                            >
                            <div className="p-8 border-b border-[rgb(var(--border))] flex items-center justify-between bg-gradient-to-r from-purple-500/5 to-transparent">
                                <div className="flex items-center gap-4">
                                    <div className="bg-purple-500/10 p-3 rounded-2xl">
                                        <Activity className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-[rgb(var(--text-primary))]">{analyticsTest?.title}</h3>
                                        <p className="text-xs text-[rgb(var(--text-secondary))] flex items-center gap-2">
                                            <TrendingUp className="w-3 h-3" /> In-depth attempt analysis and student performance
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setIsAnalyticsModalOpen(false)} className="p-3 hover:bg-[rgb(var(--bg-elevated))] rounded-2xl transition-all">
                                    <X className="w-5 h-5 text-[rgb(var(--text-muted))]" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8">
                                {loadingAnalytics ? (
                                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                                        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                                        <p className="text-sm text-[rgb(var(--text-secondary))]">Analyzing student data...</p>
                                    </div>
                                ) : analyticsData.length === 0 ? (
                                    <div className="text-center py-20">
                                        <div className="bg-[rgb(var(--bg-elevated))] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-[rgb(var(--border))]">
                                            <Users className="w-8 h-8 text-[rgb(var(--text-muted))] opacity-30" />
                                        </div>
                                        <h4 className="text-[rgb(var(--text-primary))] font-semibold">No data yet</h4>
                                        <p className="text-sm text-[rgb(var(--text-secondary))]">Wait for students to participate in this exam.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        {/* Simple Analysis Header */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="bg-[rgb(var(--bg-elevated))] p-6 rounded-3xl border border-[rgb(var(--border))] shadow-sm group">
                                                <div className="text-[10px] font-black text-[rgb(var(--text-muted))] uppercase tracking-widest mb-3">Average Score</div>
                                                <div className="text-4xl font-black text-[rgb(var(--accent))] tracking-tighter">
                                                    {Math.round(analyticsData.reduce((acc, curr) => acc + curr.score, 0) / analyticsData.length)}%
                                                </div>
                                                <p className="text-[11px] text-[rgb(var(--text-secondary))] mt-2 font-medium opacity-70">Based on {analyticsData.length} total attempts</p>
                                            </div>
                                            <div className="bg-[rgb(var(--bg-elevated))] p-6 rounded-3xl border border-[rgb(var(--border))] shadow-sm group">
                                                <div className="text-[10px] font-black text-[rgb(var(--text-muted))] uppercase tracking-widest mb-3">Highest Score</div>
                                                <div className="text-4xl font-black text-emerald-500 tracking-tighter">
                                                    {Math.max(...analyticsData.map(d => d.score))}%
                                                </div>
                                                <p className="text-[11px] text-[rgb(var(--text-secondary))] mt-2 font-medium opacity-70">Exceptional performance recorded</p>
                                            </div>
                                            <div className="bg-[rgb(var(--bg-elevated))] p-6 rounded-3xl border border-[rgb(var(--border))] shadow-sm group">
                                                <div className="text-[10px] font-black text-[rgb(var(--text-muted))] uppercase tracking-widest mb-3">Success Rate</div>
                                                <div className="text-4xl font-black text-purple-500 tracking-tighter">
                                                    {Math.round((analyticsData.filter(d => d.score >= 40).length / analyticsData.length) * 100)}%
                                                </div>
                                                <p className="text-[11px] text-[rgb(var(--text-secondary))] mt-2 font-medium opacity-70">Students scoring above 40%</p>
                                            </div>
                                        </div>

                                        <div className="overflow-hidden rounded-2xl border border-[rgb(var(--border))]">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="bg-[rgb(var(--bg-elevated))] text-[10px] uppercase font-bold tracking-widest text-[rgb(var(--text-muted))] border-b border-[rgb(var(--border))]">
                                                        <th className="px-6 py-4">Student</th>
                                                        <th className="px-6 py-4">Performance</th>
                                                        <th className="px-6 py-4">Status</th>
                                                        <th className="px-6 py-4">Time Engagement</th>
                                                        <th className="px-6 py-4">Timestamp</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[rgb(var(--border))]">
                                                    {analyticsData.map((attempt) => (
                                                        <tr key={attempt._id} className="hover:bg-[rgb(var(--bg-elevated))]/30 transition-colors">
                                                            <td className="px-6 py-5">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-9 h-9 rounded-xl bg-[rgb(var(--accent))]/10 flex items-center justify-center text-[rgb(var(--accent))] font-bold text-xs border border-[rgb(var(--accent))]/20">
                                                                        {attempt.userId?.fullName?.charAt(0) || attempt.userEmail?.charAt(0).toUpperCase() || '?'}
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-sm font-bold text-[rgb(var(--text-primary))]">{attempt.userId?.fullName || 'External User'}</div>
                                                                        <div className="text-[10px] text-[rgb(var(--text-secondary))]">{attempt.userEmail}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-5">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="flex-1 w-20 h-1.5 bg-[rgb(var(--border))] rounded-full overflow-hidden hidden sm:block">
                                                                        <div className={`h-full rounded-full ${
                                                                            attempt.score >= 70 ? 'bg-emerald-500' : attempt.score >= 40 ? 'bg-amber-500' : 'bg-red-500'
                                                                        }`} style={{ width: `${attempt.score}%` }} />
                                                                    </div>
                                                                    <div className="text-sm font-black text-[rgb(var(--text-primary))]">{attempt.score}%</div>
                                                                </div>
                                                                <div className="text-[10px] text-[rgb(var(--text-secondary))] mt-0.5">{attempt.correctAnswers} / {attempt.totalQuestions} questions</div>
                                                            </td>
                                                            <td className="px-6 py-5">
                                                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                                                                    attempt.testStatus === 'completed' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                                                                    attempt.testStatus === 'auto-submitted' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                                                                    'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                                                }`}>
                                                                    {attempt.testStatus?.toUpperCase()}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-5">
                                                                <div className="flex items-center gap-1.5 text-xs text-[rgb(var(--text-primary))] font-medium">
                                                                    <Clock className="w-3.5 h-3.5 text-[rgb(var(--text-muted))]" />
                                                                    {Math.floor(attempt.timeSpent / 60)}m {attempt.timeSpent % 60}s
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-5 text-[10px] text-[rgb(var(--text-secondary))] whitespace-nowrap">
                                                                {new Date(attempt.createdAt).toLocaleDateString()} at {new Date(attempt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

export default PracticeTestsManagement;
