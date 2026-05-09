import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Clock, FileQuestion, ChevronDown, CheckCircle, PenSquare, RotateCcw, X, Mail, Users, Loader2, Calendar } from 'lucide-react';
import axios from '../../../utils/axiosInstance';
import { API } from '../../../utils/apiPaths';
import toast from 'react-hot-toast';
import { Button } from '../../../components/ui/button';
import Pagination from '../../../components/common/Pagination';
import PracticeTestModal from './PracticeTestModal'; // Adjusted import path if needed, assuming sibling or check path

const PracticeTestsManagement = () => {
    const [practiceTests, setPracticeTests] = useState([]);
    const [practicePage, setPracticePage] = useState(1);
    const [practiceTotalPages, setPracticeTotalPages] = useState(1);
    const [practiceSearch, setPracticeSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const ITEMS_PER_PAGE = 10;

    // Modal State
    const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);
    const [selectedTest, setSelectedTest] = useState(null);

    // Reset Modal State
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetTestId, setResetTestId] = useState(null);

    // Analytics Modal State
    const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
    const [analyticsTest, setAnalyticsTest] = useState(null);
    const [analyticsData, setAnalyticsData] = useState([]);
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);
    // All-tests Analytics Modal State
    const [isAllAnalyticsOpen, setIsAllAnalyticsOpen] = useState(false);
    const [allAnalyticsData, setAllAnalyticsData] = useState(null);
    const [loadingAllAnalytics, setLoadingAllAnalytics] = useState(false);

    useEffect(() => {
        const fetchTests = async () => {
            setLoading(true);
            try {
                const practiceRes = await axios.get(API.MCQ.PRACTICE_LIST, {
                    params: {
                        page: practicePage,
                        limit: ITEMS_PER_PAGE,
                        search: practiceSearch
                    }
                });
                setPracticeTests(practiceRes.data.data || []);
                setPracticeTotalPages(practiceRes.data.pagination?.totalPages || 1);
            } catch (error) {
                console.error('Error fetching practice tests:', error);
                // toast.error('Failed to load practice tests');
            } finally {
                setLoading(false);
            }
        };
        fetchTests();
    }, [practicePage, practiceSearch]);

    const handleCreateTest = () => {
        setSelectedTest(null);
        setIsPracticeModalOpen(true);
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
            setIsPracticeModalOpen(false);
            // Refresh list
            const res = await axios.get(API.MCQ.PRACTICE_LIST, {
                params: { page: practicePage, limit: ITEMS_PER_PAGE, search: practiceSearch }
            });
            setPracticeTests(res.data.data || []);
        } catch (error) {
            console.error('Save failed:', error);
            toast.error('Failed to save test');
        }
    };

    const handleDeleteTest = async (id) => {
        if (!window.confirm('Are you sure you want to delete this test?')) return;
        try {
            await axios.delete(API.ADMIN.DELETE_PRACTICE_TEST(id));
            toast.success('Test deleted');
            setPracticeTests(practiceTests.filter(t => t._id !== id));
        } catch (error) {
            toast.error('Failed to delete test');
        }
    };

    const openResetModal = (id) => {
        setResetTestId(id);
        setResetEmail('');
        setIsResetModalOpen(true);
    };

    const submitResetAttempts = async () => {
        if (!resetEmail) {
            toast.error("Please enter the user's email address");
            return;
        }

        try {
            await axios.post(API.ADMIN.RESET_PRACTICE_ATTEMPTS(resetTestId), { email: resetEmail });
            toast.success(`Attempts reset successfully for ${resetEmail}`);
            setIsResetModalOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset attempts');
        }
    };

    const handleEditTest = async (id) => {
        try {
            const res = await axios.get(API.ADMIN.GET_PRACTICE_TEST(id));
            setSelectedTest(res.data);
            setIsPracticeModalOpen(true);
        } catch (error) {
            console.error('Error fetching test details:', error);
            toast.error('Failed to load test details for editing');
        }
    };

    const openAnalyticsModal = async (test) => {
        setAnalyticsTest(test);
        setIsAnalyticsModalOpen(true);
        setLoadingAnalytics(true);
        try {
            const res = await axios.get(API.ADMIN.GET_PRACTICE_ATTEMPTS(test._id));
            setAnalyticsData(res.data.data || []);
        } catch (err) {
            console.error('Error fetching analytics:', err);
            toast.error('Failed to load analytics');
            setAnalyticsData([]);
        } finally {
            setLoadingAnalytics(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">Practice Tests</h2>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center">
                    <div className="relative w-full sm:w-auto">
                        <Search className="w-5 h-5 absolute left-3 top-2.5 text-[rgb(var(--text-muted))]" />
                        <input
                            type="text"
                            placeholder="Search tests..."
                            value={practiceSearch}
                            onChange={(e) => setPracticeSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-lg text-sm text-[rgb(var(--text-primary))] focus:ring-[rgb(var(--accent))] focus:border-[rgb(var(--accent))] outline-none w-full sm:w-64"
                        />
                    </div>
                    <Button onClick={handleCreateTest} className="w-full sm:w-auto bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent))]/90 text-white">
                        <Plus className="w-4 h-4 mr-2" /> Create Test
                    </Button>
                    <Button onClick={async () => {
                        setIsAllAnalyticsOpen(true);
                        setLoadingAllAnalytics(true);
                        try {
                            const res = await axios.get(API.ADMIN.GET_PRACTICE_ANALYTICS);
                            setAllAnalyticsData(res.data);
                        } catch (err) {
                            console.error('Failed loading all analytics', err);
                            toast.error('Failed to load analytics');
                        } finally {
                            setLoadingAllAnalytics(false);
                        }
                    }} className="w-full sm:w-auto bg-[rgb(var(--bg-elevated))] hover:bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] border border-[rgb(var(--border))]">
                        <Users className="w-4 h-4 mr-2 text-purple-500" /> All Tests Analytics
                    </Button>
                </div>
            </div>

            {practiceTests.length === 0 ? (
                <div className="py-16 text-center text-[rgb(var(--text-muted))] bg-[rgb(var(--bg-elevated))]/50 rounded-2xl border-2 border-dashed border-[rgb(var(--border))]">
                    <FileQuestion className="mx-auto h-12 w-12 text-[rgb(var(--text-muted))]" />
                    <h3 className="mt-2 text-sm font-semibold text-[rgb(var(--text-primary))]">No practice tests found</h3>
                    <p className="text-xs mt-1">Create one to get started!</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {practiceTests.map((test) => (
                        <div key={test._id} className="bg-[rgb(var(--bg-main))] p-5 rounded-2xl border border-[rgb(var(--border))] hover:border-[rgb(var(--accent))]/30 transition-shadow shadow-sm group">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                <div className="flex-1 w-full">
                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                        <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">{test.title}</h3>
                                        <span className="px-2.5 py-0.5 rounded-full bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-secondary))] text-xs font-medium border border-[rgb(var(--border))] whitespace-nowrap">
                                            {test.questions?.length || 0} Questions
                                        </span>
                                    </div>
                                    <p className="text-sm text-[rgb(var(--text-secondary))] mb-3 line-clamp-2">{test.description}</p>

                                    <div className="flex items-center gap-4 text-xs text-[rgb(var(--text-muted))] flex-wrap">
                                        <div className="flex items-center gap-1.5 bg-[rgb(var(--bg-elevated))] px-2 py-1 rounded-md whitespace-nowrap">
                                            <Clock className="w-3.5 h-3.5" />
                                            {test.timeLimit || (test.questions?.length || 0) * 2} mins
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-[rgb(var(--bg-elevated))] px-2 py-1 rounded-md whitespace-nowrap">
                                            <Users className="w-3.5 h-3.5" />
                                            {test.attempts || 0} Attempts
                                        </div>
                                        {test.isTimeRestricted ? (
                                            <div className="flex items-center gap-1.5 bg-blue-500/10 px-2 py-1 rounded-md whitespace-nowrap text-blue-600 border border-blue-500/20">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {test.startTime ? new Date(test.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Anytime'}
                                                {' - '}
                                                {test.endTime ? new Date(test.endTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Forever'}
                                            </div>
                                        ) : (
                                            <span className="whitespace-nowrap">Created: {new Date(test.createdAt).toLocaleDateString()}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity w-full sm:w-auto justify-end mt-2 sm:mt-0">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => openResetModal(test._id)}
                                        className="h-9 px-2 rounded-lg border-[rgb(var(--border))] text-[rgb(var(--accent))] hover:bg-[rgb(var(--accent))]/10"
                                        title="Reset User Attempts"
                                    >
                                        <RotateCcw className="w-4 h-4 mr-1.5" />
                                        <span className="hidden md:inline">Reset User</span>
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => openAnalyticsModal(test)}
                                        className="h-9 px-2 rounded-lg border-[rgb(var(--border))] text-purple-500 hover:bg-purple-500/10"
                                        title="View Analytics & Attempts"
                                    >
                                        <Users className="w-4 h-4 mr-1.5" />
                                        <span className="hidden md:inline">Analytics</span>
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleEditTest(test._id)}
                                        className="h-9 w-9 p-0 rounded-lg border-[rgb(var(--border))]"
                                        title="Edit Test"
                                    >
                                        <PenSquare className="w-4 h-4 text-[rgb(var(--text-secondary))]" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleDeleteTest(test._id)}
                                        className="h-9 w-9 p-0 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600 border-0 shadow-none"
                                        title="Delete Test"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* All-tests Analytics Modal */}
            {isAllAnalyticsOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-[rgb(var(--bg-card))] rounded-2xl shadow-xl w-full max-w-5xl overflow-hidden border border-[rgb(var(--border-subtle))] max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-[rgb(var(--border))] flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-[rgb(var(--text-primary))] flex items-center gap-2">
                                    <Users className="w-5 h-5 text-purple-500" />
                                    All Practice Tests Analytics
                                </h3>
                                <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">Overview of tests, attempts and users</p>
                            </div>
                            <button onClick={() => setIsAllAnalyticsOpen(false)} className="p-2 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-body-alt))] rounded-lg transition-colors"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            {loadingAllAnalytics ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-3">
                                    <Loader2 className="w-8 h-8 text-[rgb(var(--accent))] animate-spin" />
                                    <p className="text-sm text-[rgb(var(--text-secondary))]">Loading analytics...</p>
                                </div>
                            ) : !allAnalyticsData ? (
                                <div className="text-center py-12 text-[rgb(var(--text-muted))]">No analytics data available.</div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="p-4 bg-[rgb(var(--bg-elevated))] rounded-lg text-sm">
                                            <div className="text-xs text-[rgb(var(--text-secondary))]">Total Tests</div>
                                            <div className="font-semibold text-[rgb(var(--text-primary))]">{allAnalyticsData.totals.totalTests}</div>
                                        </div>
                                        <div className="p-4 bg-[rgb(var(--bg-elevated))] rounded-lg text-sm">
                                            <div className="text-xs text-[rgb(var(--text-secondary))]">Total Attempts</div>
                                            <div className="font-semibold text-[rgb(var(--text-primary))]">{allAnalyticsData.totals.totalAttempts}</div>
                                        </div>
                                        <div className="p-4 bg-[rgb(var(--bg-elevated))] rounded-lg text-sm">
                                            <div className="text-xs text-[rgb(var(--text-secondary))]">Total Submissions</div>
                                            <div className="font-semibold text-[rgb(var(--text-primary))]">{allAnalyticsData.totals.totalSubmissions}</div>
                                        </div>
                                        <div className="p-4 bg-[rgb(var(--bg-elevated))] rounded-lg text-sm">
                                            <div className="text-xs text-[rgb(var(--text-secondary))]">Users Attended</div>
                                            <div className="font-semibold text-[rgb(var(--text-primary))]">{allAnalyticsData.totals.totalUsersAttended}</div>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto rounded-xl border border-[rgb(var(--border))]">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-secondary))] uppercase text-xs">
                                                <tr>
                                                    <th className="px-4 py-3 font-medium">Test</th>
                                                    <th className="px-4 py-3 font-medium">Topic</th>
                                                    <th className="px-4 py-3 font-medium">Attempts</th>
                                                    <th className="px-4 py-3 font-medium">Submissions</th>
                                                    <th className="px-4 py-3 font-medium">Unique Users</th>
                                                    <th className="px-4 py-3 font-medium">Avg Score</th>
                                                    <th className="px-4 py-3 font-medium">Last Attempt</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[rgb(var(--border))] bg-[rgb(var(--bg-card))]">
                                                {allAnalyticsData.perTest.map((t) => (
                                                    <tr key={t.testId} className="hover:bg-[rgb(var(--bg-elevated))]/50 transition-colors">
                                                        <td className="px-4 py-3 font-medium text-[rgb(var(--text-primary))]">{t.title}</td>
                                                        <td className="px-4 py-3 text-[rgb(var(--text-secondary))]">{t.topic}</td>
                                                        <td className="px-4 py-3">{t.attempts}</td>
                                                        <td className="px-4 py-3">{t.submissions}</td>
                                                        <td className="px-4 py-3">{t.uniqueUsers}</td>
                                                        <td className="px-4 py-3">{t.avgScore}%</td>
                                                        <td className="px-4 py-3 text-[rgb(var(--text-secondary))] text-xs">{t.lastAttempt ? new Date(t.lastAttempt).toLocaleString() : '—'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {practiceTests.length > 0 && (
                <Pagination
                    currentPage={practicePage}
                    totalPages={practiceTotalPages}
                    onPageChange={setPracticePage}
                />
            )}

            <PracticeTestModal
                isOpen={isPracticeModalOpen}
                onClose={() => setIsPracticeModalOpen(false)}
                onSave={handleSaveTest}
                testToEdit={selectedTest}
            />

            {/* Custom Reset Attempts Modal */}
            {isResetModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-[rgb(var(--bg-card))] rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-[rgb(var(--border-subtle))]">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-[rgb(var(--text-primary))] flex items-center gap-2">
                                    <RotateCcw className="w-5 h-5 text-[rgb(var(--accent))]" />
                                    Reset User Attempts
                                </h3>
                                <button
                                    onClick={() => setIsResetModalOpen(false)}
                                    className="p-2 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-body-alt))] rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <p className="text-[rgb(var(--text-secondary))] mb-6 text-sm">
                                Enter the email address of the user. This will delete all of their previous attempts for this practice test, allowing them to start fresh.
                            </p>

                            <div className="space-y-4">
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-5 w-5 text-[rgb(var(--text-muted))]" />
                                    <input
                                        type="email"
                                        placeholder="user@example.com"
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-[rgb(var(--bg-body-alt))] border border-[rgb(var(--border-subtle))] rounded-xl text-[rgb(var(--text-primary))] focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent outline-none transition-all"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8 justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsResetModalOpen(false)}
                                    className="border-[rgb(var(--border-subtle))] hover:bg-[rgb(var(--bg-body-alt))] text-[rgb(var(--text-primary))]"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={submitResetAttempts}
                                    className="bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white shadow-lg shadow-[rgb(var(--accent))]/20"
                                >
                                    Confirm Reset
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Analytics Modal */}
            {isAnalyticsModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-[rgb(var(--bg-card))] rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden border border-[rgb(var(--border-subtle))] max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-[rgb(var(--border))] flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-[rgb(var(--text-primary))] flex items-center gap-2">
                                    <Users className="w-5 h-5 text-purple-500" />
                                    Attempts Analytics
                                </h3>
                                <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">
                                    {analyticsTest?.title}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsAnalyticsModalOpen(false)}
                                className="p-2 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-body-alt))] rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            {loadingAnalytics ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-3">
                                    <Loader2 className="w-8 h-8 text-[rgb(var(--accent))] animate-spin" />
                                    <p className="text-sm text-[rgb(var(--text-secondary))]">Loading analytics...</p>
                                </div>
                            ) : analyticsData.length === 0 ? (
                                <div className="text-center py-12 text-[rgb(var(--text-muted))]">
                                    <Users className="mx-auto h-12 w-12 opacity-50 mb-3" />
                                    <p>No attempts recorded for this test yet.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-xl border border-[rgb(var(--border))]">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-secondary))] uppercase text-xs">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">User</th>
                                                <th className="px-4 py-3 font-medium">Score</th>
                                                <th className="px-4 py-3 font-medium">Status</th>
                                                <th className="px-4 py-3 font-medium">Time Spent</th>
                                                <th className="px-4 py-3 font-medium">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[rgb(var(--border))] bg-[rgb(var(--bg-card))]">
                                            {analyticsData.map((attempt) => (
                                                <tr key={attempt._id} className="hover:bg-[rgb(var(--bg-elevated))]/50 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium text-[rgb(var(--text-primary))]">
                                                            {attempt.userId?.fullName || attempt.userEmail || 'Unknown User'}
                                                        </div>
                                                        <div className="text-xs text-[rgb(var(--text-secondary))]">
                                                            {attempt.userEmail}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`font-bold ${attempt.score >= 70 ? 'text-emerald-500' : attempt.score >= 40 ? 'text-amber-500' : 'text-rose-500'}`}>
                                                            {attempt.score}%
                                                        </span>
                                                        <div className="text-xs text-[rgb(var(--text-muted))]">
                                                            {attempt.correctAnswers}/{attempt.totalQuestions} correct
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${attempt.testStatus === 'completed' ? 'bg-emerald-500/10 text-emerald-600' :
                                                                attempt.testStatus === 'auto-submitted' ? 'bg-rose-500/10 text-rose-600' :
                                                                    'bg-amber-500/10 text-amber-600'
                                                            }`}>
                                                            {attempt.testStatus}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-[rgb(var(--text-secondary))]">
                                                        {Math.floor(attempt.timeSpent / 60)}m {attempt.timeSpent % 60}s
                                                    </td>
                                                    <td className="px-4 py-3 text-[rgb(var(--text-secondary))] text-xs">
                                                        {new Date(attempt.createdAt).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PracticeTestsManagement;
