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
    TrendingUp, BookOpen, ArrowLeft, Eye, Loader2, Trophy,
    Brain, Timer, BarChart3, Trash2, AlertTriangle, Copy
} from 'lucide-react';

const TestHistoryPage = () => {
    const navigate = useNavigate();
    const [testHistory, setTestHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [selectedHistoryTest, setSelectedHistoryTest] = useState(null);
    const [viewingDetails, setViewingDetails] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, testId: null, testTopic: '' });

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
                <code className="bg-white/10 text-gray-300 px-1.5 py-0.5 rounded text-sm font-mono border border-white/10" {...props}>
                    {cleanCode}
                </code>
            );
        },
        pre({ children }) {
            return <div className="overflow-x-auto rounded-lg">{children}</div>;
        },
        p({ children }) {
            return <p className="mb-2 md:mb-3 last:mb-0 leading-relaxed text-gray-300 text-xs md:text-sm">{children}</p>;
        },
        ul({ children }) {
            return <ul className="list-disc list-inside mb-3 md:mb-4 space-y-1.5 md:space-y-2 text-gray-300 pl-2 text-xs md:text-sm">{children}</ul>;
        },
        ol({ children }) {
            return <ol className="list-decimal list-inside mb-3 md:mb-4 space-y-1.5 md:space-y-2 text-gray-300 pl-2 text-xs md:text-sm">{children}</ol>;
        },
        li({ children }) {
            return <li className="leading-relaxed">{children}</li>;
        },
        blockquote({ children }) {
            return (
                <blockquote className="border-l-4 border-blue-500 pl-3 md:pl-4 py-2 md:py-3 my-3 md:my-4 bg-blue-500/10 rounded-r-lg">
                    <div className="text-gray-300 italic text-xs md:text-sm">
                        {children}
                    </div>
                </blockquote>
            );
        },
        strong({ children }) {
            return <strong className="font-semibold text-white">{children}</strong>;
        },
        em({ children }) {
            return <em className="italic text-gray-400">{children}</em>;
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
        if (score >= 90) return { label: 'Excellent', color: 'text-green-400', bg: 'bg-green-500/20' };
        if (score >= 75) return { label: 'Good', color: 'text-blue-400', bg: 'bg-blue-500/20' };
        if (score >= 60) return { label: 'Average', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
        return { label: 'Needs Improvement', color: 'text-red-400', bg: 'bg-red-500/20' };
    };

    const getStatusBadge = (status) => {
        const styles = {
            completed: { label: 'Completed', color: 'text-green-400', bg: 'bg-green-500/20' },
            'auto-submitted': { label: 'Auto-Submitted', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
            timeout: { label: 'Timeout', color: 'text-orange-400', bg: 'bg-orange-500/20' }
        };
        return styles[status] || styles.completed;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0B0F1A] via-[#151B2B] to-[#0B0F1A] py-8 px-4">
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
                            className="bg-white/5 border-white/10 hover:bg-white/10 text-white w-fit"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Test
                        </Button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2 md:gap-3">
                                <Trophy className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />
                                Test History
                            </h1>
                            <p className="text-sm md:text-base text-gray-400 mt-1">View your past test performance and progress</p>
                        </div>
                    </div>
                </motion.div>

                {/* Loading State */}
                {loadingHistory && !viewingDetails && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <span className="ml-3 text-gray-400">Loading history...</span>
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
                                <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-400 mb-2">No Test History</h3>
                                <p className="text-gray-500 mb-6">You haven't taken any tests yet</p>
                                <Button
                                    onClick={() => navigate('/mcq-test')}
                                    className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                                >
                                    Take Your First Test
                                </Button>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {testHistory.map((test, index) => {
                                    const performance = getPerformanceLevel(test.score);
                                    const status = getStatusBadge(test.testStatus);

                                    return (
                                        <motion.div
                                            key={test._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Card className="bg-gradient-to-br from-[#1a2332] to-[#141b28] border border-white/10 hover:border-primary/50 transition-all duration-300 group relative">
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

                                                <div className="p-6 cursor-pointer" onClick={() => viewHistoryTest(test._id)}>
                                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                                        {/* Left Section */}
                                                        <div className="flex-1">
                                                            <div className="flex items-start gap-4">
                                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                                                                    <Brain className="w-6 h-6 text-white" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-3 flex-wrap mb-2">
                                                                        <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors">
                                                                            {test.topic}
                                                                        </h3>
                                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${performance.bg} ${performance.color}`}>
                                                                            {performance.label}
                                                                        </span>
                                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                                                                            {status.label}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                                                                        <div className="flex items-center gap-1">
                                                                            <Calendar className="w-4 h-4" />
                                                                            {formatDate(test.completedAt || test.createdAt)}
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                            <Target className="w-4 h-4" />
                                                                            {test.experience}
                                                                        </div>
                                                                        {test.specialization && (
                                                                            <div className="flex items-center gap-1">
                                                                                <BookOpen className="w-4 h-4" />
                                                                                {test.specialization}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Right Section - Stats */}
                                                        <div className="w-full lg:w-auto">
                                                            <div className="grid grid-cols-4 gap-3 md:gap-4 lg:flex lg:gap-6">
                                                                <div className="text-center">
                                                                    <div className="text-lg md:text-2xl font-bold text-white mb-1">
                                                                        {test.score.toFixed(1)}%
                                                                    </div>
                                                                    <div className="text-xs text-gray-400">Score</div>
                                                                </div>
                                                                <div className="text-center">
                                                                    <div className="text-lg md:text-2xl font-bold text-green-400 mb-1">
                                                                        {test.correctAnswers}
                                                                    </div>
                                                                    <div className="text-xs text-gray-400">Correct</div>
                                                                </div>
                                                                <div className="text-center">
                                                                    <div className="text-lg md:text-2xl font-bold text-red-400 mb-1">
                                                                        {test.totalQuestions - test.correctAnswers}
                                                                    </div>
                                                                    <div className="text-xs text-gray-400">Wrong</div>
                                                                </div>
                                                                <div className="text-center">
                                                                    <div className="text-lg md:text-2xl font-bold text-blue-400 mb-1 flex items-center justify-center gap-1">
                                                                        <Timer className="w-4 h-4 md:w-5 md:h-5" />
                                                                        <span className="text-sm md:text-2xl">{Math.floor(test.timeSpent / 60)}m</span>
                                                                    </div>
                                                                    <div className="text-xs text-gray-400">Time</div>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="hidden lg:flex bg-white/5 border-white/10 hover:bg-primary/20 hover:border-primary text-white mt-0 lg:mt-0"
                                                            >
                                                                <Eye className="w-4 h-4 mr-2" />
                                                                View Details
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
                                                                        <span className="text-gray-400">
                                                                            {test.securityWarnings.fullscreenExits} fullscreen exit(s)
                                                                        </span>
                                                                    )}
                                                                    {test.securityWarnings.tabSwitches > 0 && (
                                                                        <span className="text-gray-400">
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
                                className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
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
                        <Card className="bg-gradient-to-br from-[#1a2332] to-[#141b28] border border-white/10 mb-6">
                            <div className="p-4 md:p-6 lg:p-8">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0 mb-6">
                                    <div className="flex-1">
                                        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2">{selectedHistoryTest.topic}</h2>
                                        <p className="text-sm md:text-base text-gray-400">Completed on {formatDate(selectedHistoryTest.completedAt || selectedHistoryTest.createdAt)}</p>
                                    </div>
                                    <div className="flex items-center gap-3 md:flex-col md:items-end">
                                        <div className="text-3xl md:text-4xl font-bold text-white">
                                            {selectedHistoryTest.score.toFixed(1)}%
                                        </div>
                                        <span className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium ${getPerformanceLevel(selectedHistoryTest.score).bg} ${getPerformanceLevel(selectedHistoryTest.score).color}`}>
                                            {getPerformanceLevel(selectedHistoryTest.score).label}
                                        </span>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                                    <div className="bg-white/5 rounded-lg p-3 md:p-4 border border-white/10">
                                        <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                                            <Award className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                                            <span className="text-gray-400 text-xs md:text-sm">Score</span>
                                        </div>
                                        <div className="text-lg md:text-2xl font-bold text-white">{selectedHistoryTest.score.toFixed(1)}%</div>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-3 md:p-4 border border-white/10">
                                        <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                                            <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
                                            <span className="text-gray-400 text-xs md:text-sm">Correct</span>
                                        </div>
                                        <div className="text-lg md:text-2xl font-bold text-green-400">{selectedHistoryTest.correctAnswers}</div>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-3 md:p-4 border border-white/10">
                                        <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                                            <XCircle className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
                                            <span className="text-gray-400 text-xs md:text-sm">Wrong</span>
                                        </div>
                                        <div className="text-lg md:text-2xl font-bold text-red-400">
                                            {selectedHistoryTest.totalQuestions - selectedHistoryTest.correctAnswers}
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-3 md:p-4 border border-white/10">
                                        <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                                            <Clock className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                                            <span className="text-gray-400 text-xs md:text-sm">Time Spent</span>
                                        </div>
                                        <div className="text-lg md:text-2xl font-bold text-blue-400">{formatDuration(selectedHistoryTest.timeSpent)}</div>
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
                                    <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
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
                                const isCorrect = userAnswer === q.correctAnswer;

                                return (
                                    <Card key={idx} className="bg-gradient-to-br from-[#1a2332] to-[#141b28] border border-white/10">
                                        <div className="p-4 md:p-6">
                                            <div className="flex items-start gap-3 md:gap-4 mb-4">
                                                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {isCorrect ? <CheckCircle className="w-5 h-5 md:w-6 md:h-6" /> : <XCircle className="w-5 h-5 md:w-6 md:h-6" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm md:text-base text-white font-medium mb-3">
                                                        Question {idx + 1}
                                                    </h4>
                                                    <div className="mb-3 md:mb-4 prose prose-sm prose-invert max-w-none">
                                                        <ReactMarkdown components={components}>
                                                            {q.question}
                                                        </ReactMarkdown>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {q.options?.map((option, optIdx) => {
                                                            const isUserAnswer = userAnswer === optIdx;
                                                            const isCorrectAnswer = q.correctAnswer === optIdx;

                                                            return (
                                                                <div
                                                                    key={optIdx}
                                                                    className={`p-2.5 md:p-3 rounded-lg border ${isCorrectAnswer
                                                                            ? 'bg-green-500/10 border-green-500/50 text-green-400'
                                                                            : isUserAnswer
                                                                                ? 'bg-red-500/10 border-red-500/50 text-red-400'
                                                                                : 'bg-white/5 border-white/10 text-gray-400'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-start md:items-center gap-2">
                                                                        <span className="font-medium text-sm md:text-base flex-shrink-0">{String.fromCharCode(65 + optIdx)}.</span>
                                                                        <span className="text-sm md:text-base flex-1">{option}</span>
                                                                        {isCorrectAnswer && (
                                                                            <span className="ml-auto text-xs font-medium flex-shrink-0">(Correct)</span>
                                                                        )}
                                                                        {isUserAnswer && !isCorrectAnswer && (
                                                                            <span className="ml-auto text-xs font-medium flex-shrink-0">(Your Answer)</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    {q.explanation && (
                                                        <div className="mt-3 md:mt-4 p-3 md:p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                                            <div className="flex items-start gap-2">
                                                                <Brain className="w-4 h-4 md:w-5 md:h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs md:text-sm font-medium text-blue-400 mb-1.5 md:mb-2">Explanation</p>
                                                                    <div className="prose prose-sm prose-invert max-w-none">
                                                                        <ReactMarkdown components={components}>
                                                                            {q.explanation}
                                                                        </ReactMarkdown>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirmation.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-br from-[#1a2332] to-[#141b28] rounded-2xl shadow-2xl border border-red-500/30 w-full max-w-md p-6"
                    >
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                <AlertTriangle className="w-6 h-6 text-red-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white mb-2">Delete Test History?</h3>
                                <p className="text-gray-400 text-sm mb-1">
                                    Are you sure you want to delete the test:
                                </p>
                                <p className="text-white font-semibold">"{deleteConfirmation.testTopic}"</p>
                                <p className="text-red-400 text-sm mt-2">
                                    This action cannot be undone.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button
                                onClick={() => setDeleteConfirmation({ show: false, testId: null, testTopic: '' })}
                                variant="outline"
                                className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 text-white"
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
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Deleting...
                                    </div>
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
            )}
        </div>
    );
};

export default TestHistoryPage;
