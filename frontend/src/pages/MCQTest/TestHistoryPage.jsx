import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { API } from '../../utils/apiPaths';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import {
    Clock, CheckCircle, XCircle, Award, Calendar, Target,
    TrendingUp, BookOpen, ArrowLeft, Eye, Trophy,
    Brain, Timer, BarChart3, Trash2, AlertTriangle, Copy
} from 'lucide-react';
import { Loader, ButtonLoader } from '../../components/ui/Loader';
import Pagination from '../../components/common/Pagination';

const TestHistoryPage = () => {
    const navigate = useNavigate();
    const [testHistory, setTestHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [selectedHistoryTest, setSelectedHistoryTest] = useState(null);
    const [viewingDetails, setViewingDetails] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, testId: null, testTopic: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // Markdown components for rendering code blocks and formatted content
    const components = {
        code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';

            const cleanCode = String(children)
                .replace(/\n$/, '')
                .replace(/```\?/g, '')
                .replace(/```$/g, '')
                .replace(/^```\w*\n?/g, '')
                .trim();

            if (!inline && (language || cleanCode.includes('\n') || cleanCode.length > 50)) {
                return (
                    <div className="relative group my-3 md:my-4 bg-[#1a1a1a] rounded-lg border border-white/10 overflow-hidden">
                        <div className="flex items-center justify-between bg-[#252525] text-gray-400 px-3 md:px-4 py-2 md:py-2.5 border-b border-white/10">
                            <div className="flex items-center gap-2 md:gap-3">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500"></div>
                                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500"></div>
                                </div>
                                <span className="text-xs font-medium uppercase tracking-wide">
                                    {language || 'code'}
                                </span>
                            </div>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(cleanCode);
                                    toast.success('Code copied to clipboard!');
                                }}
                                className="flex items-center gap-1.5 px-2 md:px-2.5 py-1 bg-[#252525] hover:bg-[#2a2a2a] rounded text-xs transition-colors opacity-0 group-hover:opacity-100 font-medium"
                                title="Copy code"
                            >
                                <Copy className="w-3 h-3" />
                                <span className="hidden md:inline">Copy</span>
                            </button>
                        </div>
                        <div className="overflow-x-auto bg-[#1a1a1a]">
                            <SyntaxHighlighter
                                style={tomorrow}
                                language={language || 'text'}
                                PreTag="div"
                                className="!mt-0 !rounded-none !bg-transparent"
                                customStyle={{
                                    margin: 0,
                                    padding: '0.75rem 1rem',
                                    fontSize: '0.813rem',
                                    lineHeight: '1.6',
                                    backgroundColor: 'transparent',
                                    borderRadius: 0
                                }}
                                {...props}
                            >
                                {cleanCode}
                            </SyntaxHighlighter>
                        </div>
                    </div>
                );
            }

            return (
                <code className="bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))] px-1.5 py-0.5 rounded text-sm font-mono border border-[rgb(var(--accent))]/20 font-semibold" {...props}>
                    {cleanCode}
                </code>
            );
        },
        pre({ children }) {
            return <div className="overflow-x-auto rounded-lg">{children}</div>;
        },
        p({ children }) {
            return <p className="mb-2 md:mb-3 last:mb-0 leading-relaxed text-[rgb(var(--text-secondary))] text-xs md:text-sm">{children}</p>;
        },
        ul({ children }) {
            return <ul className="list-disc list-inside mb-3 md:mb-4 space-y-1.5 md:space-y-2 text-[rgb(var(--text-secondary))] pl-2 text-xs md:text-sm">{children}</ul>;
        },
        ol({ children }) {
            return <ol className="list-decimal list-inside mb-3 md:mb-4 space-y-1.5 md:space-y-2 text-[rgb(var(--text-secondary))] pl-2 text-xs md:text-sm">{children}</ol>;
        },
        li({ children }) {
            return <li className="leading-relaxed">{children}</li>;
        },
        blockquote({ children }) {
            return (
                <blockquote className="border-l-4 border-blue-500 pl-3 md:pl-4 py-2 md:py-3 my-3 md:my-4 bg-blue-500/10 rounded-r-lg">
                    <div className="text-[rgb(var(--text-secondary))] italic text-xs md:text-sm">
                        {children}
                    </div>
                </blockquote>
            );
        },
        strong({ children }) {
            return <strong className="font-semibold text-[rgb(var(--text-primary))]">{children}</strong>;
        },
        em({ children }) {
            return <em className="italic text-[rgb(var(--text-muted))]">{children}</em>;
        }
    };

    useEffect(() => {
        fetchTestHistory();
    }, []);

    // Fetch test history
    const fetchTestHistory = async () => {
        setLoadingHistory(true);
        try {
            const response = await axiosInstance.get(API.MCQ.HISTORY);
            if (response.data.success) {
                setTestHistory(response.data.data.history || []);
            }
        } catch (error) {
            console.error('Error fetching test history:', error);
            toast.error('Failed to load test history');
        } finally {
            setLoadingHistory(false);
        }
    };

    // View specific test from history
    const viewHistoryTest = async (testId) => {
        try {
            setLoadingHistory(true);
            const response = await axiosInstance.get(API.MCQ.GET_TEST(testId));
            if (response.data.success) {
                setSelectedHistoryTest(response.data.data);
                setViewingDetails(true);
            }
        } catch (error) {
            console.error('Error fetching test details:', error);
            toast.error('Failed to load test details');
        } finally {
            setLoadingHistory(false);
        }
    };

    // Delete test from history
    const handleDeleteTest = async (testId) => {
        try {
            setLoadingHistory(true);
            const response = await axiosInstance.delete(API.MCQ.DELETE_TEST(testId));
            if (response.data.success) {
                toast.success('Test deleted successfully');
                // Remove from local state
                setTestHistory(prev => prev.filter(test => test._id !== testId));
                // If viewing details of deleted test, go back to list
                if (selectedHistoryTest?._id === testId) {
                    setViewingDetails(false);
                    setSelectedHistoryTest(null);
                }
            }
        } catch (error) {
            console.error('Error deleting test:', error);
            toast.error(error.response?.data?.message || 'Failed to delete test');
        } finally {
            setLoadingHistory(false);
            setDeleteConfirmation({ show: false, testId: null, testTopic: '' });
        }
    };

    const confirmDelete = (testId, testTopic) => {
        setDeleteConfirmation({ show: true, testId, testTopic });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    const getPerformanceLevel = (score) => {
        if (score >= 90) return { label: 'Excellent', color: 'text-[rgb(var(--accent))]', bg: 'bg-[rgb(var(--accent))]/20' };
        if (score >= 75) return { label: 'Good', color: 'text-[rgb(var(--text-primary))]', bg: 'bg-[rgb(var(--text-primary))]/20' };
        if (score >= 60) return { label: 'Average', color: 'text-[rgb(var(--text-secondary))]', bg: 'bg-[rgb(var(--text-secondary))]/20' };
        return { label: 'Needs Improvement', color: 'text-[rgb(var(--text-muted))]', bg: 'bg-[rgb(var(--text-muted))]/20' };
    };

    const getStatusBadge = (status) => {
        const styles = {
            completed: { label: 'Completed', color: 'text-[rgb(var(--accent))]', bg: 'bg-[rgb(var(--accent))]/20' },
            'auto-submitted': { label: 'Auto-Submitted', color: 'text-[rgb(var(--text-secondary))]', bg: 'bg-[rgb(var(--text-secondary))]/20' },
            timeout: { label: 'Timeout', color: 'text-[rgb(var(--text-muted))]', bg: 'bg-[rgb(var(--text-muted))]/20' }
        };
        return styles[status] || styles.completed;
    };

    // Pagination Logic
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentHistory = testHistory.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(testHistory.length / ITEMS_PER_PAGE);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-[rgb(var(--bg-body))] py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 md:mb-8"
                >
                    <div className="flex flex-col gap-4">
                        <Button
                            onClick={() => navigate('/mcq-test')}
                            variant="outline"
                            className="bg-[rgb(var(--bg-card))] border-[rgb(var(--border-subtle))] hover:bg-[rgb(var(--bg-body-alt))] text-[rgb(var(--text-primary))] w-fit"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Test
                        </Button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-[rgb(var(--text-primary))] flex items-center gap-2 md:gap-3">
                                <Trophy className="w-6 h-6 md:w-8 md:h-8 text-[rgb(var(--accent))]" />
                                Test History
                            </h1>
                            <p className="text-sm md:text-base text-[rgb(var(--text-secondary))] mt-1">View your past test performance and progress</p>
                        </div>
                    </div>
                </motion.div>

                {/* Loading State */}
                {loadingHistory && !viewingDetails && (
                    <div className="flex items-center justify-center py-20">
                        <Loader size="lg" text="Loading test history..." />
                    </div>
                )}

                {/* Test History List */}
                {!viewingDetails && !loadingHistory && (
                    <AnimatePresence mode="wait">
                        {testHistory.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-20"
                            >
                                <BookOpen className="w-16 h-16 text-[rgb(var(--text-muted))] mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-[rgb(var(--text-secondary))] mb-2">No Test History</h3>
                                <p className="text-[rgb(var(--text-muted))] mb-6">You haven't taken any tests yet</p>
                                <Button
                                    onClick={() => navigate('/mcq-test')}
                                    className="bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))]"
                                >
                                    Take Your First Test
                                </Button>
                            </motion.div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 gap-4">
                                    {currentHistory.map((test, index) => {
                                        const performance = getPerformanceLevel(test.score);
                                        const status = getStatusBadge(test.testStatus);

                                        return (
                                            <motion.div
                                                key={test._id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <Card className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))] hover:border-[rgb(var(--accent))]/50 transition-all duration-300 group relative">
                                                    {/* Delete Button */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            confirmDelete(test._id, test.topic);
                                                        }}
                                                        className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 text-red-400 transition-all"
                                                        title="Delete test"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>

                                                    <div className="p-5 sm:p-6 cursor-pointer" onClick={() => viewHistoryTest(test._id)}>
                                                        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                                                            {/* Left Section - Test Info */}
                                                            <div className="flex items-start gap-4 min-w-0">
                                                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[rgb(var(--accent))]/10 flex items-center justify-center flex-shrink-0 border border-[rgb(var(--accent))]/20">
                                                                    <Brain className="w-6 h-6 sm:w-7 sm:h-7 text-[rgb(var(--accent))]" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                                                                        <h3 className="text-lg sm:text-xl font-bold text-[rgb(var(--text-primary))] group-hover:text-[rgb(var(--accent))] transition-colors truncate">
                                                                            {test.topic}
                                                                        </h3>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${performance.bg} ${performance.color} border-current opacity-90`}>
                                                                                {performance.label}
                                                                            </span>
                                                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.bg} ${status.color} border-current opacity-90`}>
                                                                                {status.label}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-1 gap-x-4 text-xs sm:text-sm text-[rgb(var(--text-secondary))]">
                                                                        <div className="flex items-center gap-1.5">
                                                                            <Calendar className="w-3.5 h-3.5 text-[rgb(var(--text-muted))]" />
                                                                            <span className="truncate">{formatDate(test.completedAt || test.createdAt)}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1.5">
                                                                            <Target className="w-3.5 h-3.5 text-[rgb(var(--text-muted))]" />
                                                                            <span className="capitalize">{test.experience}</span>
                                                                        </div>
                                                                        {test.specialization && (
                                                                            <div className="flex items-center gap-1.5">
                                                                                <BookOpen className="w-3.5 h-3.5 text-[rgb(var(--text-muted))]" />
                                                                                <span className="truncate">{test.specialization}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Right Section - Stats */}
                                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 xl:gap-8 border-t xl:border-t-0 border-[rgb(var(--border-subtle))] pt-4 xl:pt-0 mt-2 xl:mt-0 w-full xl:w-auto">
                                                                <div className="grid grid-cols-4 gap-4 w-full sm:w-auto flex-1">
                                                                    <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-[rgb(var(--bg-body-alt))] border border-[rgb(var(--border-subtle))]">
                                                                        <span className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wider font-semibold mb-1">Score</span>
                                                                        <span className="text-lg font-bold text-[rgb(var(--text-primary))]">{test.score.toFixed(0)}%</span>
                                                                    </div>
                                                                    <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-green-500/5 border border-green-500/10">
                                                                        <span className="text-xs text-green-500/80 uppercase tracking-wider font-semibold mb-1">Correct</span>
                                                                        <span className="text-lg font-bold text-green-500">{test.correctAnswers}</span>
                                                                    </div>
                                                                    <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                                                                        <span className="text-xs text-red-500/80 uppercase tracking-wider font-semibold mb-1">Wrong</span>
                                                                        <span className="text-lg font-bold text-red-500">{test.totalQuestions - test.correctAnswers}</span>
                                                                    </div>
                                                                    <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
                                                                        <span className="text-xs text-blue-500/80 uppercase tracking-wider font-semibold mb-1">Time</span>
                                                                        <span className="text-lg font-bold text-blue-500">{Math.floor(test.timeSpent / 60)}m</span>
                                                                    </div>
                                                                </div>

                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="hidden sm:flex text-[rgb(var(--accent))] hover:text-[rgb(var(--accent-hover))] hover:bg-[rgb(var(--accent))]/10 shrink-0"
                                                                >
                                                                    View Details <Eye className="w-4 h-4 ml-2" />
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        {/* Security Warnings */}
                                                        {(test.securityWarnings?.fullscreenExits > 0 || test.securityWarnings?.tabSwitches > 0) && (
                                                            <div className="mt-4 pt-4 border-t border-white/10">
                                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                                                                    <span className="text-yellow-400 font-medium">Security Warnings:</span>
                                                                    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                                                                        {test.securityWarnings.fullscreenExits > 0 && (
                                                                            <span className="text-[rgb(var(--text-muted))]">
                                                                                {test.securityWarnings.fullscreenExits} fullscreen exit(s)
                                                                            </span>
                                                                        )}
                                                                        {test.securityWarnings.tabSwitches > 0 && (
                                                                            <span className="text-[rgb(var(--text-muted))]">
                                                                                {test.securityWarnings.tabSwitches} tab switch(es)
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </Card>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </>
                        )}
                    </AnimatePresence>
                )}

                {/* Detailed Test View */}
                {viewingDetails && selectedHistoryTest && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="mb-6 flex items-center justify-between gap-4">
                            <Button
                                onClick={() => {
                                    setViewingDetails(false);
                                    setSelectedHistoryTest(null);
                                }}
                                variant="outline"
                                className="bg-[rgb(var(--bg-card))] border-[rgb(var(--border-subtle))] hover:bg-[rgb(var(--bg-body-alt))] text-[rgb(var(--text-primary))]"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to History
                            </Button>
                            <Button
                                onClick={() => confirmDelete(selectedHistoryTest._id, selectedHistoryTest.topic)}
                                variant="outline"
                                className="bg-red-500/10 border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 text-red-400"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Test
                            </Button>
                        </div>

                        {/* Test Header */}
                        <Card className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))] mb-6">
                            <div className="p-4 md:p-6 lg:p-8">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0 mb-6">
                                    <div className="flex-1">
                                        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-[rgb(var(--text-primary))] mb-2">{selectedHistoryTest.topic}</h2>
                                        <p className="text-sm md:text-base text-[rgb(var(--text-secondary))]">Completed on {formatDate(selectedHistoryTest.completedAt || selectedHistoryTest.createdAt)}</p>
                                    </div>
                                    <div className="flex items-center gap-3 md:flex-col md:items-end">
                                        <div className="text-3xl md:text-4xl font-bold text-[rgb(var(--text-primary))]">
                                            {selectedHistoryTest.score.toFixed(1)}%
                                        </div>
                                        <span className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium ${getPerformanceLevel(selectedHistoryTest.score).bg} ${getPerformanceLevel(selectedHistoryTest.score).color}`}>
                                            {getPerformanceLevel(selectedHistoryTest.score).label}
                                        </span>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                                    <div className="bg-[rgb(var(--bg-card))] rounded-lg p-3 md:p-4 border border-[rgb(var(--border-subtle))]">
                                        <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                                            <Award className="w-4 h-4 md:w-5 md:h-5 text-[rgb(var(--accent))]" />
                                            <span className="text-[rgb(var(--text-muted))] text-xs md:text-sm">Score</span>
                                        </div>
                                        <div className="text-lg md:text-2xl font-bold text-[rgb(var(--text-primary))]">{selectedHistoryTest.score.toFixed(1)}%</div>
                                    </div>
                                    <div className="bg-[rgb(var(--bg-card))] rounded-lg p-3 md:p-4 border border-[rgb(var(--border-subtle))]">
                                        <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                                            <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                                            <span className="text-[rgb(var(--text-muted))] text-xs md:text-sm">Correct</span>
                                        </div>
                                        <div className="text-lg md:text-2xl font-bold text-green-600">{selectedHistoryTest.correctAnswers}</div>
                                    </div>
                                    <div className="bg-[rgb(var(--bg-card))] rounded-lg p-3 md:p-4 border border-[rgb(var(--border-subtle))]">
                                        <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                                            <XCircle className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
                                            <span className="text-[rgb(var(--text-muted))] text-xs md:text-sm">Wrong</span>
                                        </div>
                                        <div className="text-lg md:text-2xl font-bold text-red-600">
                                            {selectedHistoryTest.totalQuestions - selectedHistoryTest.correctAnswers}
                                        </div>
                                    </div>
                                    <div className="bg-[rgb(var(--bg-card))] rounded-lg p-3 md:p-4 border border-[rgb(var(--border-subtle))]">
                                        <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                                            <Clock className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
                                            <span className="text-[rgb(var(--text-muted))] text-xs md:text-sm">Time Spent</span>
                                        </div>
                                        <div className="text-lg md:text-2xl font-bold text-blue-600">{formatDuration(selectedHistoryTest.timeSpent)}</div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* AI Disclaimer */}
                        <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30">
                            <div className="p-4 md:p-5 flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <h4 className="text-sm md:text-base font-semibold text-yellow-400 mb-1">AI-Generated Results Disclaimer</h4>
                                    <p className="text-xs md:text-sm text-[rgb(var(--text-secondary))] leading-relaxed">
                                        The answers and explanations are verified by AI and may occasionally contain mistakes.
                                        If you're not satisfied with the AI's answer, we recommend verifying it yourself through additional resources.
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* Questions Review */}
                        <div className="space-y-4">
                            {selectedHistoryTest.questionsWithAnswers?.map((q, idx) => {
                                const userAnswer = selectedHistoryTest.userAnswers?.[idx];
                                // Check correctness with normalized logic
                                let correctIndex = q.correctAnswer;
                                if (typeof q.correctAnswer === 'string' && q.correctAnswer.length === 1) {
                                    correctIndex = q.correctAnswer.toUpperCase().charCodeAt(0) - 65;
                                }
                                const isCorrect = userAnswer === correctIndex;

                                return (
                                    <Card key={idx} className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))] overflow-hidden">
                                        {/* Question Header */}
                                        <div className="p-4 sm:p-5 border-b border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body-alt))] flex items-center justify-between gap-4">
                                            <h4 className="font-semibold text-[rgb(var(--text-primary))] flex items-center gap-2">
                                                <span className="flex items-center justify-center w-6 h-6 rounded bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))] text-xs font-bold">
                                                    {idx + 1}
                                                </span>
                                                Question
                                            </h4>

                                            <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${isCorrect
                                                ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                                : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                                {isCorrect ? (
                                                    <><CheckCircle className="w-3.5 h-3.5" /> Correct</>
                                                ) : (
                                                    <><XCircle className="w-3.5 h-3.5" /> Incorrect</>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-4 sm:p-6">
                                            {/* Question Text */}
                                            <div className="mb-6 prose prose-invert max-w-none text-[rgb(var(--text-primary))]">
                                                <ReactMarkdown components={components}>
                                                    {q.question}
                                                </ReactMarkdown>
                                            </div>

                                            {/* Options Grid */}
                                            {/* Options Grid */}
                                            <div className="grid grid-cols-1 gap-3 mb-6">
                                                {q.options?.map((option, optIdx) => {
                                                    // Normalize correct answer to index if it's a letter (A, B, C, D)
                                                    let correctIndex = q.correctAnswer;
                                                    if (typeof q.correctAnswer === 'string' && q.correctAnswer.length === 1) {
                                                        // A=65, so 'A'.charCodeAt(0) - 65 = 0
                                                        correctIndex = q.correctAnswer.toUpperCase().charCodeAt(0) - 65;
                                                    }

                                                    const isUserAnswer = userAnswer === optIdx;
                                                    const isCorrectAnswer = correctIndex === optIdx;

                                                    // Determine styles based on state
                                                    let containerStyle = "border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body-alt))]/50 hover:bg-[rgb(var(--bg-body-alt))]";
                                                    let icon = null;
                                                    let statusText = null;

                                                    if (isCorrectAnswer) {
                                                        containerStyle = "border-green-500/50 bg-green-500/10 text-green-100 ring-1 ring-green-500/20";
                                                        icon = <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />;
                                                        statusText = <span className="text-xs font-semibold text-green-500 ml-2">Correct Answer</span>;
                                                    } else if (isUserAnswer && !isCorrectAnswer) {
                                                        containerStyle = "border-red-500/50 bg-red-500/10 text-red-100 ring-1 ring-red-500/20";
                                                        icon = <XCircle className="w-4 h-4 text-red-500 shrink-0" />;
                                                        statusText = <span className="text-xs font-semibold text-red-500 ml-2">Your Answer</span>;
                                                    }

                                                    return (
                                                        <div
                                                            key={optIdx}
                                                            className={`relative p-3 sm:p-4 rounded-lg border transition-all ${containerStyle} flex items-start gap-3`}
                                                        >
                                                            <div className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs font-medium 
                                                                ${isCorrectAnswer ? 'border-green-500 text-green-500' :
                                                                    (isUserAnswer ? 'border-red-500 text-red-500' : 'border-[rgb(var(--text-muted))] text-[rgb(var(--text-muted))]')}`}>
                                                                {String.fromCharCode(65 + optIdx)}
                                                            </div>
                                                            <div className="flex-1 text-sm sm:text-base leading-relaxed overflow-hidden">
                                                                {/* Use ReactMarkdown for options too, but strip outer paragraph margins if needed via components or CSS */}
                                                                <div className="prose prose-sm prose-invert max-w-none [&>p]:mb-0 [&>p]:mt-0">
                                                                    <ReactMarkdown components={components}>
                                                                        {option}
                                                                    </ReactMarkdown>
                                                                </div>
                                                            </div>
                                                            {icon && (
                                                                <div className="flex flex-col items-end shrink-0 ml-2 gap-1">
                                                                    {icon}
                                                                </div>
                                                            )}
                                                            {statusText && (
                                                                <div className="absolute top-2 right-2 md:static md:ml-auto">
                                                                    {/* Simple indicator on mobile, detailed on desktop if needed, currently using icon mainly */}
                                                                </div>
                                                            )}
                                                            {/* Desktop status label */}
                                                            {(isCorrectAnswer || isUserAnswer) && (
                                                                <div className="hidden sm:block shrink-0">
                                                                    {statusText}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Explanation */}
                                            {q.explanation && (
                                                <div className="mt-6 pt-5 border-t border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-body-alt))]/30 -mx-4 sm:-mx-6 px-4 sm:px-6 pb-2">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                                            <Brain className="w-4 h-4 text-blue-400" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h5 className="text-sm font-semibold text-blue-400 mb-2">Explanation</h5>
                                                            <div className="prose prose-sm prose-invert max-w-none text-[rgb(var(--text-secondary))]">
                                                                <ReactMarkdown components={components}>
                                                                    {q.explanation}
                                                                </ReactMarkdown>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {
                deleteConfirmation.show && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-[rgb(var(--bg-card))] rounded-2xl shadow-2xl border border-red-500/30 w-full max-w-md p-6"
                        >
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                    <AlertTriangle className="w-6 h-6 text-red-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-2">Delete Test History?</h3>
                                    <p className="text-[rgb(var(--text-secondary))] text-sm mb-1">
                                        Are you sure you want to delete the test:
                                    </p>
                                    <p className="text-[rgb(var(--text-primary))] font-semibold">"{deleteConfirmation.testTopic}"</p>
                                    <p className="text-red-400 text-sm mt-2">
                                        This action cannot be undone.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <Button
                                    onClick={() => setDeleteConfirmation({ show: false, testId: null, testTopic: '' })}
                                    variant="outline"
                                    className="flex-1 bg-[rgb(var(--bg-card))] border-[rgb(var(--border-subtle))] hover:bg-[rgb(var(--bg-body-alt))] text-[rgb(var(--text-primary))]"
                                    disabled={loadingHistory}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => handleDeleteTest(deleteConfirmation.testId)}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                                    disabled={loadingHistory}
                                >
                                    {loadingHistory ? (
                                        <ButtonLoader text="Deleting..." />
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                        </>
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )
            }
        </div >
    );
};

export default TestHistoryPage;
