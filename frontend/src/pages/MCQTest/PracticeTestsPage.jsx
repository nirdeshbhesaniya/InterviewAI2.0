import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileQuestion, Clock, ArrowRight, BookOpen, ChevronLeft, ChevronRight, Calendar, AlertCircle, BarChart2 } from 'lucide-react';
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
        <div className="min-h-screen pt-24 px-6 pb-12 bg-background">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4 relative">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold bg-gradient-to-r from-[rgb(var(--accent))] to-purple-500 bg-clip-text text-transparent flex justify-center items-center gap-2"
                    >
                        <span>Practice Tests</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-[rgb(var(--text-secondary))] text-lg max-w-2xl mx-auto"
                    >
                        Challenge yourself with curated practice tests created by experts for {BRANCHES.find(b => b.id === selectedBranch)?.name || 'Computer Engineering'}.
                    </motion.p>
                    <div className="flex justify-center mt-4">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                setShowBranchModal(true);
                            }}
                            className="text-sm px-4 py-2 bg-[rgb(var(--bg-card))]/80 hover:bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))] rounded-lg text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent))] hover:border-[rgb(var(--accent))]/30 transition-all flex items-center gap-1.5 shadow-sm"
                        >
                            Change Branch
                        </button>
                    </div>
                </div>

                {/* Tests Grid */}
                {tests.length === 0 ? (
                    <EmptyState
                        title="No Practice Tests Available"
                        description="Check back later for new tests."
                        icon={FileQuestion}
                    />
                ) : (
                    <div className="space-y-8">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {tests.map((test, index) => (
                                <motion.div
                                    key={test._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-[rgb(var(--bg-card))] rounded-2xl border border-[rgb(var(--border))] overflow-hidden hover:shadow-lg transition-all hover:border-[rgb(var(--accent))]/50 group"
                                >
                                    <div className="p-6 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="px-3 py-1 bg-[rgb(var(--bg-elevated))] rounded-full text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider">
                                                {test.topic}
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize 
                                            ${test.difficulty === 'easy' ? 'bg-green-500/10 text-green-500' :
                                                    test.difficulty === 'hard' ? 'bg-red-500/10 text-red-500' :
                                                        'bg-yellow-500/10 text-yellow-500'}`}>
                                                {test.difficulty}
                                            </span>
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-bold text-[rgb(var(--text-primary))] group-hover:text-[rgb(var(--accent))] transition-colors">
                                                {test.title}
                                            </h3>
                                            <p className="text-[rgb(var(--text-secondary))] text-sm mt-2 line-clamp-2">
                                                {test.description}
                                            </p>
                                        </div>

                                        <div className="pt-4 border-t border-[rgb(var(--border))] flex items-center justify-between text-sm text-[rgb(var(--text-secondary))] mb-2">
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="w-4 h-4 text-primary" />
                                                <span>{test.questionCount || 0} Questions</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-accent" />
                                                <span>{test.timeLimit || 30} Mins</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center text-sm text-[rgb(var(--text-secondary))] mb-4">
                                            <div className="flex items-center gap-2">
                                                <BarChart2 className="w-4 h-4 text-orange-500" />
                                                <span>Total Hits: {test.attempts || 0}</span>
                                            </div>
                                            <div className="font-medium text-[rgb(var(--text-primary))]">
                                                Max Attempts: {test.maxAttempts || 1}
                                            </div>
                                        </div>

                                        {(test.isTimeRestricted || test.startTime || test.endTime) && (
                                            <div className="bg-[rgb(var(--bg-elevated))] p-3 rounded-xl border border-[rgb(var(--border-subtle))] mb-4">
                                                <div className="flex items-center gap-2 text-xs font-semibold text-[rgb(var(--accent))] mb-1 uppercase tracking-wider">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    Scheduled Window
                                                </div>
                                                <div className="text-[10px] sm:text-xs text-[rgb(var(--text-secondary))] space-y-1">
                                                    <div className="flex justify-between">
                                                        <span>Start:</span>
                                                        <span className="font-medium text-[rgb(var(--text-primary))]">
                                                            {test.startTime ? new Date(test.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Immediate'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>End:</span>
                                                        <span className="font-medium text-[rgb(var(--text-primary))]">
                                                            {test.endTime ? new Date(test.endTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'No Expiry'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {(() => {
                                            const now = new Date();
                                            const start = test.startTime ? new Date(test.startTime) : null;
                                            const end = test.endTime ? new Date(test.endTime) : null;

                                            let status = 'available';
                                            // Consider explicit start/end even if isTimeRestricted flag wasn't set
                                            if (test.isTimeRestricted || start || end) {
                                                if (start && now < start) status = 'upcoming';
                                                else if (end && now > end) status = 'ended';
                                            }

                                            return (
                                                <Button
                                                    onClick={() => handleStartTest(test._id)}
                                                    disabled={status !== 'available'}
                                                    className={`w-full transition-all group-hover:shadow-lg ${status === 'available'
                                                        ? 'bg-[rgb(var(--bg-elevated))] hover:bg-[rgb(var(--accent))] hover:text-white text-[rgb(var(--text-primary))] group-hover:shadow-[rgb(var(--accent))]/20'
                                                        : 'bg-gray-500/10 text-gray-500 cursor-not-allowed border-gray-500/20'
                                                        }`}
                                                >
                                                    {status === 'upcoming' ? (
                                                        <><Clock className="w-4 h-4 mr-2" /> Not Started</>
                                                    ) : status === 'ended' ? (
                                                        <><AlertCircle className="w-4 h-4 mr-2" /> Test Ended</>
                                                    ) : (
                                                        <>Start Practice <ArrowRight className="w-4 h-4 ml-2" /></>
                                                    )}
                                                </Button>
                                            );
                                        })()}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 pt-8">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="h-10 w-10 border-[rgb(var(--border))] hover:bg-[rgb(var(--accent))] hover:text-white disabled:opacity-50 transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </Button>

                                <div className="flex items-center gap-2">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors
                                                ${currentPage === page
                                                    ? 'bg-[rgb(var(--accent))] text-white shadow-lg shadow-[rgb(var(--accent))]/25'
                                                    : 'bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-card))] hover:text-[rgb(var(--text-primary))]'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="h-10 w-10 border-[rgb(var(--border))] hover:bg-[rgb(var(--accent))] hover:text-white disabled:opacity-50 transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <BranchModal 
                isOpen={showBranchModal} 
                onClose={() => setShowBranchModal(false)}
                onSelectBranch={(branchId) => {
                    setSelectedBranch(branchId);
                    setShowBranchModal(false);
                    setCurrentPage(1); // Reset to first page on branch change
                }}
                currentBranch={selectedBranch}
            />
        </div>
    );
};

export default PracticeTestsPage;
