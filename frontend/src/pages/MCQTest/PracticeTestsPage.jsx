import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileQuestion, Clock, ArrowRight, BookOpen, ChevronLeft, ChevronRight, Calendar, AlertCircle, BarChart2, Filter } from 'lucide-react';
import axios from '../../utils/axiosInstance';
import { API } from '../../utils/apiPaths';
import { Button } from '../../components/ui/button';
import toast from 'react-hot-toast';
import BranchModal from '../../components/BranchModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { BRANCHES } from '../../utils/constants';

const PracticeTestsPage = () => {
    const navigate = useNavigate();
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const TESTS_PER_PAGE = 9;

    const [selectedBranch, setSelectedBranch] = useState(
        localStorage.getItem('dashboard_branch') || 'computer'
    );
    const [showBranchModal, setShowBranchModal] = useState(!localStorage.getItem('dashboard_branch'));

    useEffect(() => {
        if (selectedBranch) {
            localStorage.setItem('dashboard_branch', selectedBranch);
        }
    }, [selectedBranch]);

    useEffect(() => {
        const fetchTests = async () => {
            setLoading(true); // Ensure loading state shows on page change
            try {
                const res = await axios.get(`${API.MCQ.PRACTICE_LIST}?page=${currentPage}&limit=${TESTS_PER_PAGE}&branch=${selectedBranch}`);
                // Debug: log API response to inspect time restriction fields
                console.debug('Practice tests API response:', res.data);

                const rawTests = res.data.data || [];
                // Normalize fields to ensure consistent shape
                const normalized = rawTests.map((t) => ({
                    ...t,
                    isTimeRestricted: t.isTimeRestricted ?? false,
                    startTime: t.startTime ?? null,
                    endTime: t.endTime ?? null,
                }));

                if (res.data.pagination) {
                    setTests(normalized);
                    setTotalPages(res.data.pagination.totalPages);
                } else {
                    // Fallback for non-paginated response (if any)
                    setTests(normalized);
                }
            } catch (error) {
                console.error('Error fetching practice tests:', error);
                toast.error('Failed to load practice tests');
            } finally {
                setLoading(false);
            }
        };
        fetchTests();
    }, [currentPage, selectedBranch]); // Re-fetch when page or branch changes

    const handleStartTest = (testId) => {
        navigate(`/mcq-test/practice/${testId}`);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 px-6 flex justify-center">
                <div className="w-8 h-8 border-4 border-[rgb(var(--accent))] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[rgb(var(--bg-body))] pb-12">
            {/* 1. Hero / Header Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[rgb(var(--bg-card))] to-[rgb(var(--bg-body))] border-b border-[rgb(var(--border-subtle))] py-12 sm:py-20 mb-10">
                {/* Background Decorative Elements */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-[rgb(var(--accent))]/5 blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-purple-500/5 blur-3xl pointer-events-none"></div>
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-4 z-10 max-w-2xl">
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border-subtle))] text-xs font-semibold text-[rgb(var(--accent))] uppercase tracking-wider mb-2"
                            >
                                <BookOpen className="w-4 h-4" />
                                Skill Assessment
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-4xl sm:text-5xl font-extrabold text-[rgb(var(--text-primary))] flex flex-wrap items-center gap-3"
                            >
                                Practice <span className="bg-clip-text text-transparent bg-gradient-to-r from-[rgb(var(--accent))] to-purple-500">Tests</span>
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-[rgb(var(--text-secondary))] text-lg leading-relaxed"
                            >
                                Challenge yourself with curated practice tests created by experts for <span className="font-semibold text-[rgb(var(--text-primary))]">{BRANCHES.find(b => b.id === selectedBranch)?.name || 'Computer Engineering'}</span>.
                            </motion.p>
                        </div>
                        
                        <div className="flex items-center gap-3 z-10 flex-wrap">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/mcq-test/history', { state: { filterType: 'practice' } })}
                                className="px-5 py-3.5 bg-[rgb(var(--bg-elevated))]/80 backdrop-blur-md border border-[rgb(var(--border-subtle))] rounded-xl text-[rgb(var(--text-primary))] hover:border-[rgb(var(--accent))]/50 transition-all flex items-center justify-center gap-2 shadow-sm font-medium"
                            >
                                <Clock className="w-5 h-5 text-[rgb(var(--accent))]" /> 
                                Test History
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowBranchModal(true)}
                                className="px-5 py-3.5 bg-[rgb(var(--bg-elevated))]/80 backdrop-blur-md border border-[rgb(var(--border-subtle))] rounded-xl text-[rgb(var(--text-primary))] hover:border-[rgb(var(--accent))]/50 transition-all flex items-center justify-center gap-2 shadow-sm font-medium"
                            >
                                <Filter className="w-5 h-5 text-[rgb(var(--accent))]" /> 
                                Change Branch
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                {/* 2. Tests Grid */}
                {tests.length === 0 ? (
                    <EmptyState
                        title="No Practice Tests Available"
                        description="Check back later for new tests."
                        icon={FileQuestion}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {tests.map((test, index) => (
                            <motion.div
                                key={test._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-[rgb(var(--bg-card))]/60 backdrop-blur-md rounded-3xl border border-[rgb(var(--border-subtle))] overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1 hover:border-[rgb(var(--accent))]/40 group flex flex-col h-full"
                            >
                                <div className="p-6 sm:p-8 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-6 gap-3">
                                        <div className="px-3 py-1.5 bg-[rgb(var(--bg-elevated))] rounded-lg text-xs font-bold text-[rgb(var(--accent))] uppercase tracking-widest border border-[rgb(var(--border-subtle))]">
                                            {test.topic}
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider 
                                        ${test.difficulty === 'easy' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                                test.difficulty === 'hard' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                                    'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                                            {test.difficulty}
                                        </span>
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-xl sm:text-2xl font-bold text-[rgb(var(--text-primary))] group-hover:text-[rgb(var(--accent))] transition-colors mb-3 line-clamp-2">
                                            {test.title}
                                        </h3>
                                        <p className="text-[rgb(var(--text-secondary))] text-sm leading-relaxed line-clamp-3 mb-6">
                                            {test.description}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-[rgb(var(--border-subtle))] mb-6">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-[rgb(var(--text-muted))] uppercase font-semibold">Questions</span>
                                            <div className="flex items-center gap-1.5 text-[rgb(var(--text-primary))] font-medium">
                                                <BookOpen className="w-4 h-4 text-[rgb(var(--accent))]" />
                                                {test.questionCount || 0}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-[rgb(var(--text-muted))] uppercase font-semibold">Duration</span>
                                            <div className="flex items-center gap-1.5 text-[rgb(var(--text-primary))] font-medium">
                                                <Clock className="w-4 h-4 text-purple-500" />
                                                {test.timeLimit || 30} mins
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center text-sm text-[rgb(var(--text-secondary))] mb-6">
                                        <div className="flex items-center gap-2">
                                            <BarChart2 className="w-4 h-4 text-orange-500" />
                                            <span className="font-medium">Hits: {test.attempts || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-2 font-medium">
                                            <AlertCircle className="w-4 h-4 text-blue-500" />
                                            Max Attempts: {test.maxAttempts || 1}
                                        </div>
                                    </div>

                                    {(test.isTimeRestricted || test.startTime || test.endTime) && (
                                        <div className="bg-[rgb(var(--bg-elevated))]/80 p-4 rounded-xl border border-[rgb(var(--border-subtle))] mb-6 relative overflow-hidden">
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[rgb(var(--accent))] to-purple-500"></div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-[rgb(var(--text-primary))] mb-2 uppercase tracking-wider pl-2">
                                                <Calendar className="w-4 h-4 text-[rgb(var(--accent))]" />
                                                Scheduled Window
                                            </div>
                                            <div className="text-xs text-[rgb(var(--text-secondary))] space-y-1.5 pl-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[rgb(var(--text-muted))]">Starts:</span>
                                                    <span className="font-medium text-[rgb(var(--text-primary))]">
                                                        {test.startTime ? new Date(test.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Immediate'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[rgb(var(--text-muted))]">Ends:</span>
                                                    <span className="font-medium text-[rgb(var(--text-primary))]">
                                                        {test.endTime ? new Date(test.endTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'No Expiry'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* 3. Call to Action Button */}
                                    <div className="mt-auto">
                                        {(() => {
                                            const now = new Date();
                                            const start = test.startTime ? new Date(test.startTime) : null;
                                            const end = test.endTime ? new Date(test.endTime) : null;

                                            let status = 'available';
                                            if (test.isTimeRestricted || start || end) {
                                                if (start && now < start) status = 'upcoming';
                                                else if (end && now > end) status = 'ended';
                                            }

                                            return (
                                                <Button
                                                    onClick={() => handleStartTest(test._id)}
                                                    disabled={status !== 'available'}
                                                    className={`w-full py-6 rounded-xl font-bold transition-all text-base ${status === 'available'
                                                        ? 'bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white shadow-[0_0_15px_rgba(var(--accent),0.3)] hover:shadow-[0_0_25px_rgba(var(--accent),0.5)] transform hover:-translate-y-0.5'
                                                        : 'bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-muted))] cursor-not-allowed border border-[rgb(var(--border-subtle))]'
                                                        }`}
                                                >
                                                    {status === 'upcoming' ? (
                                                        <><Clock className="w-5 h-5 mr-2" /> Not Started</>
                                                    ) : status === 'ended' ? (
                                                        <><AlertCircle className="w-5 h-5 mr-2" /> Test Ended</>
                                                    ) : (
                                                        <>Start Practice <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" /></>
                                                    )}
                                                </Button>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* 4. Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 pt-10 pb-6">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="h-12 w-12 rounded-full border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--accent))] hover:border-[rgb(var(--accent))] hover:text-white disabled:opacity-50 disabled:hover:bg-[rgb(var(--bg-elevated))] disabled:hover:text-[rgb(var(--text-primary))] disabled:hover:border-[rgb(var(--border-subtle))] transition-all shadow-sm"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        
                        <div className="flex items-center gap-2">
                            <span className="px-4 py-2 rounded-xl bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border-subtle))] font-medium text-[rgb(var(--text-primary))] shadow-inner">
                                Page {currentPage} <span className="text-[rgb(var(--text-muted))] font-normal">of {totalPages}</span>
                            </span>
                        </div>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="h-12 w-12 rounded-full border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--accent))] hover:border-[rgb(var(--accent))] hover:text-white disabled:opacity-50 disabled:hover:bg-[rgb(var(--bg-elevated))] disabled:hover:text-[rgb(var(--text-primary))] disabled:hover:border-[rgb(var(--border-subtle))] transition-all shadow-sm"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                    </div>
                )}
            </div>
            
            {showBranchModal && (
                <BranchModal
                    isOpen={showBranchModal}
                    onClose={() => setShowBranchModal(false)}
                    onSelect={(branchId) => {
                        setSelectedBranch(branchId);
                        setCurrentPage(1); // Reset to first page when branch changes
                        setShowBranchModal(false);
                    }}
                    currentBranch={selectedBranch}
                />
            )}
        </div>
    );
};

export default PracticeTestsPage;
