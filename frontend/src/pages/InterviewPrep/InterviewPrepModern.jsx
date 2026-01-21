/**
 * ==================== INTERVIEW PREP - MODERN UI ====================
 * 
 * DEPENDENCIES CHECKLIST:
 * ✅ tailwindcss@^4.1.0
 * ✅ framer-motion@^11.0.0
 * ✅ lucide-react@^0.400.0
 * ✅ react-markdown@^9.0.0
 * ✅ remark-gfm@^4.0.0
 * ✅ rehype-highlight@^7.0.0
 * ✅ highlight.js@^11.9.0
 * ✅ react-hot-toast@^2.4.1
 * ✅ moment@^2.30.0
 * 
 * INSTALLATION:
 * npm install framer-motion lucide-react react-markdown remark-gfm rehype-highlight highlight.js react-hot-toast moment
 * 
 * FEATURES:
 * ✅ Responsive two-column layout (desktop) / single-column (mobile)
 * ✅ Accessible accordion cards with full ARIA support
 * ✅ Dark mode with localStorage persistence
 * ✅ Copy-to-clipboard for code blocks and answers
 * ✅ Important/starred questions filter
 * ✅ Expand/collapse all questions
 * ✅ Lazy loading for performance
 * ✅ Framer Motion animations
 * ✅ Export to Markdown
 * ✅ Share functionality
 * ✅ Keyboard navigation support
 */

import React, { useEffect, useState, useCallback, useMemo, useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from '../../utils/axiosInstance';
import { API } from '../../utils/apiPaths';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown,
    Copy,
    Moon,
    Sun,
    RefreshCcw,
    PlusCircle,
    Star,
    Share2,
    Download,
    Edit2,
    AlertCircle,
    Maximize2,
    Minimize2,
    ExternalLink,
    Sparkles,
    Bot,
    Filter,
    Trash2
} from 'lucide-react';
import { ButtonLoader } from '../../components/ui/Loader';
import toast, { Toaster } from 'react-hot-toast';
import moment from 'moment';
import AnswerRenderer from '../../components/interview/AnswerRenderer';

// ==================== CONSTANTS ====================
const ITEMS_PER_PAGE = 10;
const ANIMATION_VARIANTS = {
    container: {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    },
    item: {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    }
};

// ==================== SUB-COMPONENTS ====================



/**
 * Question Accordion Card Component
 */
const QuestionCard = ({
    question,
    answer,
    category, // 👈 Added category prop
    index,
    displayNumber, // 👈 Added display number prop
    isStarred,
    isExpanded,
    onToggleStar,
    onRegenerate,
    onEdit,
    onCopyAnswer,
    onDelete,
    canDelete,
    onShare,
    status,
    isCreator,
    onApprove,
    onReject
}) => {
    const [isOpen, setIsOpen] = useState(isExpanded);

    useEffect(() => {
        setIsOpen(isExpanded);
    }, [isExpanded]);

    return (
        <motion.div
            variants={ANIMATION_VARIANTS.item}
            className="group"
        >
            <div className="bg-[rgb(var(--bg-card))] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-[rgb(var(--border))] overflow-hidden">
                {/* Question Header */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full px-4 sm:px-5 md:px-6 py-3 sm:py-4 md:py-5 bg-[rgb(var(--bg-body-alt))] hover:bg-[rgb(var(--bg-card-alt))] transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))] focus:ring-inset"
                    aria-expanded={isOpen}
                    aria-controls={`answer-${index}`}
                >
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3">
                                {/* Question Number Badge */}
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[rgb(var(--accent))] text-white text-sm font-bold shadow-md flex-shrink-0">
                                    {displayNumber || index + 1}
                                </span>

                                {/* Category Badge & Question Text */}
                                <div className="flex-1 min-w-0">
                                    {category && category !== 'General' && (
                                        <span className="inline-block px-2 py-0.5 mb-2 text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--accent))] bg-[rgb(var(--accent))]/10 rounded border border-[rgb(var(--accent))]/20">
                                            {category}
                                        </span>
                                    )}
                                    <h3 className="text-base sm:text-lg font-bold text-[rgb(var(--text-primary))] leading-relaxed break-words">
                                        {question}
                                    </h3>
                                    {/* Mobile: Show truncated answer preview when collapsed */}
                                    {!isOpen && (
                                        <p className="mt-1 text-xs text-[rgb(var(--text-muted))] line-clamp-1 sm:hidden">
                                            Tap to view answer...
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Chevron Icon */}
                        <ChevronDown
                            className={`w-5 h-5 text-[rgb(var(--text-muted))] transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                        />
                    </div>
                </button>

                {/* Pending Status Banner */}
                {status === 'pending' && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/10 px-4 py-2 border-y border-yellow-100 dark:border-yellow-900/30 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400 text-sm font-medium">
                            <Bot className="w-4 h-4" />
                            <span>Pending Approval</span>
                        </div>
                        {isCreator && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onApprove(index);
                                    }}
                                    className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded shadow-sm transition-colors"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onReject(index);
                                    }}
                                    className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded shadow-sm transition-colors"
                                >
                                    Reject
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Answer Content */}
                <AnimatePresence initial={false}>
                    {isOpen && (
                        <motion.div
                            id={`answer-${index}`}
                            initial="collapsed"
                            animate="open"
                            exit="collapsed"
                            variants={{
                                open: { opacity: 1, height: "auto" },
                                collapsed: { opacity: 0, height: 0 }
                            }}
                            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                        >
                            <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 bg-[rgb(var(--bg-card))] border-t border-[rgb(var(--border-subtle))]">
                                <AnswerRenderer answer={answer} />

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-2 pt-4 border-t border-[rgb(var(--border-subtle))]">
                                    {/* Star/Unstar */}
                                    <button
                                        onClick={() => onToggleStar(index)}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${isStarred
                                            ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-500/30 border border-transparent dark:border-yellow-500/30'
                                            : 'bg-[rgb(var(--bg-card-alt))] text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-card-alt))]/80 dark:hover:bg-[rgb(var(--bg-elevated))]'
                                            }`}
                                        aria-label={isStarred ? 'Unmark as important' : 'Mark as important'}
                                    >
                                        <Star className={`w-4 h-4 ${isStarred ? 'fill-current' : ''}`} />
                                        <span className="hidden sm:inline">{isStarred ? 'Starred' : 'Star'}</span>
                                    </button>

                                    {/* Regenerate */}
                                    <button
                                        onClick={() => onRegenerate(index)}
                                        className="px-3 py-2 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-500/30 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 border border-transparent dark:border-blue-500/30"
                                        aria-label="Regenerate answer"
                                    >
                                        <RefreshCcw className="w-4 h-4" />
                                        <span className="hidden sm:inline">Regenerate</span>
                                    </button>

                                    {/* Edit */}
                                    <button
                                        onClick={() => onEdit(index)}
                                        className="px-3 py-2 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-500/30 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 border border-transparent dark:border-purple-500/30"
                                        aria-label="Edit answer"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        <span className="hidden sm:inline">Edit</span>
                                    </button>

                                    {/* Copy Answer */}
                                    <button
                                        onClick={() => onCopyAnswer(index)}
                                        className="px-3 py-2 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-500/30 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 border border-transparent dark:border-green-500/30"
                                        aria-label="Copy answer"
                                    >
                                        <Copy className="w-4 h-4" />
                                        <span className="hidden sm:inline">Copy</span>
                                    </button>

                                    {/* Delete Button (Admin/Creator only) */}
                                    {canDelete && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(index);
                                            }}
                                            className="px-3 py-2 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-500/30 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 border border-transparent dark:border-red-500/30"
                                            aria-label="Delete question"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span className="hidden sm:inline">Delete</span>
                                        </button>
                                    )}

                                    {/* Share */}
                                    <button
                                        onClick={() => onShare(index)}
                                        className="px-3 py-2 bg-[rgb(var(--bg-card-alt))] text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-card-alt))]/80 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ml-auto"
                                        aria-label="Share question"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        <span className="hidden sm:inline">Share</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div >
    );
};

/**
 * Delete Confirmation Modal Component
 */
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, isDeleting }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-[rgb(var(--bg-card))] w-full max-w-md rounded-xl shadow-2xl border border-[rgb(var(--border))]"
                >
                    <div className="p-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-2">Delete Question?</h3>
                        <p className="text-[rgb(var(--text-secondary))] mb-6">
                            Are you sure you want to delete this question? This action cannot be undone.
                        </p>

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={onClose}
                                disabled={isDeleting}
                                className="px-5 py-2.5 rounded-lg font-medium text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-body-alt))] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={isDeleting}
                                className="px-5 py-2.5 rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20 transition-all flex items-center gap-2"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Deleting...</span>
                                    </>
                                ) : (
                                    <span>Delete</span>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

// ==================== MAIN COMPONENT ====================

const InterviewPrepModern = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useContext(UserContext);

    // ==================== STATE ====================
    const [session, setSession] = useState(null);
    const isCreator = session?.creatorEmail === user?.email;
    const [loading, setLoading] = useState(true);
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('interviewPrepTheme') === 'dark';
    });
    const [expandedAll, setExpandedAll] = useState(false);
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
    const [importantOnly, setImportantOnly] = useState(false);
    const [starredQuestions, setStarredQuestions] = useState(() => {
        const stored = localStorage.getItem(`starred-${sessionId}`);
        return stored ? JSON.parse(stored) : {};
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, index: null });
    const [generateModal, setGenerateModal] = useState({ isOpen: false, topic: '' }); // 👈 New state for generate modal
    const [isDeleting, setIsDeleting] = useState(false);

    // ==================== EFFECTS ====================
    useEffect(() => {
        // Apply dark mode
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('interviewPrepTheme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('interviewPrepTheme', 'light');
        }
    }, [darkMode]);

    useEffect(() => {
        // Fetch session data
        const fetchSession = async () => {
            try {
                const response = await axios.get(API.INTERVIEW.GET_ONE(sessionId));
                setSession(response.data);

                // Show success message if coming back from editor
                if (location.state?.updated) {
                    toast.success('Answer updated successfully!');
                    window.history.replaceState({}, document.title);
                }

                // Handle deep linking to question
                const params = new URLSearchParams(location.search);
                const qnaId = params.get('qnaId');
                if (qnaId && response.data?.qna) {
                    // Filter out pending questions to find correct index
                    const approvedQuestions = response.data.qna.filter(q => q.status !== 'pending');
                    const index = approvedQuestions.findIndex(q => q._id === qnaId);

                    if (index !== -1) {
                        setExpandedAll(true);
                        // Ensure it's scrolled to
                        setTimeout(() => {
                            const el = document.getElementById(`answer-${index}`);
                            if (el) {
                                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                        }, 500);
                    }
                }

            } catch (error) {
                toast.error('Failed to load interview session');
                console.error('Fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSession();
    }, [sessionId, location.state, location.search]);

    // ==================== HANDLERS ====================
    const handleToggleStar = useCallback((index) => {
        setStarredQuestions(prev => {
            const updated = { ...prev, [index]: !prev[index] };
            localStorage.setItem(`starred-${sessionId}`, JSON.stringify(updated));
            return updated;
        });
        toast.success(starredQuestions[index] ? 'Removed from starred' : 'Added to starred');
    }, [sessionId, starredQuestions]);

    const handleRegenerate = useCallback(async (index) => {
        if (!session) return;

        const question = session.qna[index];
        toast.loading('Regenerating answer...', { id: `regen-${index}` });

        try {
            const response = await axios.post(API.INTERVIEW.ASK_AI, {
                question: question.question,
                title: session.title,
                tag: session.tag,
                experience: session.experience,
                sessionId,
                index
            });

            setSession(prev => {
                const updated = { ...prev };
                updated.qna[index].answerParts = response.data.answerParts;
                return updated;
            });

            toast.success('Answer regenerated!', { id: `regen-${index}` });
        } catch (error) {
            toast.error('Failed to regenerate answer', { id: `regen-${index}` });
            console.error('Regenerate error:', error);
        }
    }, [session, sessionId]);

    const handleEdit = useCallback((index) => {
        if (!session?.qna[index]) return;

        // Navigate to full-page editor
        navigate(`/interview-prep/${sessionId}/edit`, {
            state: {
                question: session.qna[index].question,
                answer: session.qna[index].answerParts,
                category: session.qna[index].category,
                index,
                originalAnswer: session.qna[index].answerParts
            }
        });
    }, [session, sessionId, navigate]);

    const handleShare = useCallback((index) => {
        const url = `${window.location.origin}/interview-prep/${sessionId}#q${index + 1}`;
        navigator.clipboard.writeText(url);
        toast.success('Question link copied to clipboard!');
    }, [sessionId]);

    const handleCopyAnswer = useCallback((index) => {
        if (!session?.qna[index]) return;

        const answerText = session.qna[index].answerParts
            .map(part => part.content)
            .join('\n\n');

        navigator.clipboard.writeText(answerText);
        toast.success('Answer copied to clipboard!');
    }, [session]);

    const handleExport = useCallback(() => {
        if (!session) return;

        const markdown = `# ${session.title}\n\n` +
            `**Tags:** ${session.tag}\n` +
            `**Experience Level:** ${session.experience}\n` +
            `**Created:** ${moment(session.createdAt).format('MMMM DD, YYYY')}\n\n` +
            `---\n\n` +
            session.qna.map((qa, i) =>
                `## ${i + 1}. ${qa.question}\n\n` +
                qa.answerParts.map(part => part.content).join('\n\n') +
                '\n\n---\n\n'
            ).join('');

        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${session.title.replace(/\s+/g, '-')}-interview-prep.md`;
        a.click();
        URL.revokeObjectURL(url);

        toast.success('Session exported!');
    }, [session]);

    const handleShareSession = useCallback(() => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        toast.success('Session link copied!');
    }, []);

    const handleGenerateMore = useCallback(() => {
        setGenerateModal({ isOpen: true, topic: '' });
    }, []);

    const confirmGenerateMore = useCallback(async () => {
        setIsGenerating(true);
        const loadingId = toast.loading('Generating more questions...', { id: 'generate-more' });
        setGenerateModal({ isOpen: false, topic: '' });

        try {
            const response = await axios.post(API.INTERVIEW.GENERATE_MORE(sessionId), {
                topic: generateModal.topic // Pass specific topic
            });
            setSession(prev => ({
                ...prev,
                qna: [...prev.qna, ...(response.data.qna || [])]
            }));
            toast.success('Generated more questions!', { id: loadingId });
        } catch (error) {
            toast.error('Failed to generate questions', { id: loadingId });
            console.error('Generate error:', error);
        } finally {
            setIsGenerating(false);
        }
    }, [sessionId, generateModal.topic]);

    const handleLoadMore = useCallback(() => {
        setVisibleCount(prev => prev + ITEMS_PER_PAGE);
    }, []);

    const handleDelete = useCallback((index) => {
        setDeleteModal({ isOpen: true, index });
    }, []);

    const confirmDelete = useCallback(async () => {
        const { index } = deleteModal;
        if (index === null || !session || !session.qna[index]) return;

        const questionToDelete = session.qna[index];
        setIsDeleting(true);
        const loadingId = toast.loading('Deleting question...');

        try {
            await axios.delete(API.INTERVIEW.DELETE_QUESTION(sessionId, questionToDelete._id));

            // Update local state
            setSession(prev => {
                const updatedQna = [...prev.qna];
                updatedQna.splice(index, 1);
                return { ...prev, qna: updatedQna };
            });

            toast.success('Question deleted successfully', { id: loadingId });
            setDeleteModal({ isOpen: false, index: null });
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete question', { id: loadingId });
        } finally {
            setIsDeleting(false);
        }
    }, [deleteModal, session, sessionId]);

    const handleApprove = useCallback(async (index) => {
        if (!session?.qna[index]) return;
        const questionId = session.qna[index]._id;
        const toastId = toast.loading('Approving question...');
        try {
            await axios.patch(API.ADMIN.APPROVE_QNA(sessionId, questionId));
            toast.success('Question approved', { id: toastId });
            setSession(prev => {
                const updatedQna = [...prev.qna];
                updatedQna[index] = { ...updatedQna[index], status: 'approved' };
                return { ...prev, qna: updatedQna };
            });
        } catch (error) {
            console.error('Error approving question:', error);
            toast.error('Failed to approve question', { id: toastId });
        }
    }, [session, sessionId]);

    const handleReject = useCallback(async (index) => {
        if (!session?.qna[index]) return;
        if (!window.confirm('Are you sure you want to reject this question?')) return;

        const questionId = session.qna[index]._id;
        const toastId = toast.loading('Rejecting question...');
        try {
            await axios.patch(API.ADMIN.REJECT_QNA(sessionId, questionId));
            toast.success('Question rejected', { id: toastId });
            setSession(prev => {
                const updatedQna = [...prev.qna];
                updatedQna[index] = { ...updatedQna[index], status: 'rejected' };
                return { ...prev, qna: updatedQna };
            });
        } catch (error) {
            console.error('Error rejecting question:', error);
            toast.error('Failed to reject question', { id: toastId });
        }
    }, [session, sessionId]);

    // ==================== COMPUTED VALUES ====================
    const filteredQuestions = useMemo(() => {
        if (!session?.qna) return [];

        // Filter out pending questions for non-creators and non-requesters
        let questions = session.qna.filter(q => {
            if (q.status === 'pending') {
                const isRequester = user && (q.requestedBy === user._id || q.requestedBy === user.userId || q.requestedBy === user.id);
                return isCreator || isRequester;
            }
            return q.status !== 'rejected';
        });

        if (importantOnly) {
            questions = questions.filter((_, i) => starredQuestions[i]);
        }
        return questions;
    }, [session, importantOnly, starredQuestions]);

    const visibleQuestions = useMemo(() => {
        return filteredQuestions.slice(0, visibleCount);
    }, [filteredQuestions, visibleCount]);

    const hasMore = visibleQuestions.length < filteredQuestions.length;

    // ==================== LOADING STATE ====================
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--bg-body))] px-4">
                <div className="text-center space-y-6">
                    <div className="flex justify-center gap-2">
                        {[0, 1, 2].map(i => (
                            <div
                                key={i}
                                className="w-4 h-4 rounded-full bg-orange-500 animate-bounce"
                                style={{ animationDelay: `${i * 0.1}s` }}
                            />
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <Bot className="w-8 h-8 text-[rgb(var(--accent))]" />
                        <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]">
                            Loading Interview Session...
                        </h1>
                    </div>
                </div>
            </div>
        );
    }

    // ==================== ERROR STATE ====================
    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
                <div className="text-center space-y-6 max-w-md">
                    <div className="text-6xl">❌</div>
                    <h1 className="text-2xl font-bold text-[rgb(var(--danger))]">
                        Session Not Found
                    </h1>
                    <p className="text-[rgb(var(--text-secondary))]">
                        The interview session you're looking for doesn't exist or may have been deleted.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white rounded-lg font-medium transition-colors"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // ==================== MAIN RENDER ====================
    return (
        <div className={darkMode ? 'dark' : ''}>
            <Toaster position="top-right" />

            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, index: null })}
                onConfirm={confirmDelete}
                isDeleting={isDeleting}
            />

            {/* Generate More Modal */}
            <AnimatePresence>
                {generateModal.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[rgb(var(--bg-card))] w-full max-w-md rounded-xl shadow-2xl border border-[rgb(var(--border))]"
                        >
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-[rgb(var(--text-primary))]">Generate Questions</h3>
                                        <p className="text-xs text-[rgb(var(--text-muted))]">AI will create new questions for you</p>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="text-xs font-bold text-[rgb(var(--text-muted))] uppercase tracking-wider mb-2 block">
                                            Specific Topic (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={generateModal.topic}
                                            onChange={(e) => setGenerateModal(prev => ({ ...prev, topic: e.target.value }))}
                                            placeholder="e.g. React Hooks, System Design, SQL Joins..."
                                            className="w-full bg-[rgb(var(--bg-body-alt))] border border-[rgb(var(--border))] rounded-lg px-4 py-2.5 text-sm text-[rgb(var(--text-primary))] focus:ring-2 focus:ring-[rgb(var(--accent))]/50 outline-none"
                                            autoFocus
                                        />
                                        <p className="mt-2 text-[10px] text-[rgb(var(--text-muted))]">
                                            Leave empty to generate random questions based on the session main title.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3 justify-end">
                                    <button
                                        onClick={() => setGenerateModal({ isOpen: false, topic: '' })}
                                        className="px-4 py-2 rounded-lg text-sm font-medium text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-body-alt))] transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmGenerateMore}
                                        className="px-4 py-2 rounded-lg text-sm font-medium bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white shadow-lg shadow-[rgb(var(--accent))]/20 transition-all flex items-center gap-2"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Generate
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="min-h-screen bg-[rgb(var(--bg-body))]">
                <div className="w-full py-4 sm:py-6">
                    {/* ==================== HEADER SECTION ==================== */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-[rgb(var(--bg-card))] rounded-2xl shadow-xl border border-[rgb(var(--border))] px-4 sm:px-6 md:px-8 py-4 sm:py-6 lg:py-8 mb-4 sm:mb-6 mx-3 sm:mx-4 md:mx-6 lg:mx-8"
                    >
                        {/* Title and Metadata */}
                        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 mb-6">
                            {/* Left: Title and Description */}
                            <div className="flex-1 space-y-4">
                                <div className="flex items-start gap-3">
                                    <Bot className="w-8 h-8 text-[rgb(var(--accent))] flex-shrink-0 mt-1" />
                                    <div className="flex-1 min-w-0">
                                        <h1 className="text-3xl lg:text-4xl font-bold text-[rgb(var(--text-primary))] break-words leading-tight">
                                            {session.title}
                                        </h1>
                                    </div>
                                </div>

                                <p className="text-base text-[rgb(var(--text-secondary))] leading-relaxed">
                                    {session.desc}
                                </p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2">
                                    {session.tag?.split(',').map((tag, i) => (
                                        <span
                                            key={i}
                                            className="px-3 py-1 bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-500/20 dark:to-purple-500/20 text-pink-800 dark:text-pink-300 text-xs font-medium rounded-full border border-pink-200 dark:border-pink-500/30"
                                        >
                                            {tag.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Right: Metadata Card */}
                            <div className="lg:w-64 bg-[rgb(var(--bg-card-alt))]/60 dark:bg-[rgb(var(--bg-elevated))]/80 rounded-xl p-4 border border-[rgb(var(--border-subtle))]/50 dark:border-[rgb(var(--border))] backdrop-blur-sm space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-[rgb(var(--text-secondary))]">
                                        Experience:
                                    </span>
                                    <span className="px-2 py-1 bg-orange-100 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300 text-xs font-medium rounded-md border border-transparent dark:border-orange-500/30">
                                        {session.experience}
                                    </span>
                                </div>

                                <div className="text-sm text-[rgb(var(--text-muted))]">
                                    <span className="font-medium">Created:</span>{' '}
                                    {moment(session.createdAt).format('MMM DD, YYYY')}
                                </div>

                                <div className="text-sm text-[rgb(var(--text-muted))]">
                                    <span className="font-medium">Questions:</span>{' '}
                                    {session.qna?.length || 0}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 pt-6 border-t border-[rgb(var(--border-subtle))]/50">
                            {/* Left Side Controls */}
                            <div className="flex flex-wrap gap-2 flex-1">
                                <button
                                    onClick={() => setImportantOnly(!importantOnly)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${importantOnly
                                        ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border border-transparent dark:border-yellow-500/30'
                                        : 'bg-[rgb(var(--bg-card-alt))]/80 dark:bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-card-alt))] dark:hover:bg-[rgb(var(--bg-elevated-alt))]'
                                        }`}
                                    aria-pressed={importantOnly}
                                >
                                    <Filter className="w-4 h-4" />
                                    <span>{importantOnly ? 'Show All' : 'Important Only'}</span>
                                </button>

                                <button
                                    onClick={() => setExpandedAll(!expandedAll)}
                                    className="px-4 py-2 bg-[rgb(var(--bg-card-alt))]/80 dark:bg-[rgb(var(--bg-elevated))] hover:bg-[rgb(var(--bg-card-alt))] dark:hover:bg-[rgb(var(--bg-elevated-alt))] text-[rgb(var(--text-secondary))] rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                                    aria-label={expandedAll ? 'Collapse all questions' : 'Expand all questions'}
                                >
                                    {expandedAll ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                    <span>{expandedAll ? 'Collapse All' : 'Expand All'}</span>
                                </button>
                            </div>

                            {/* Right Side Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => navigate(`/interview-prep/${sessionId}/add`)}
                                    className="px-4 py-2 bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/90 text-white rounded-lg text-sm font-medium shadow-lg transition-all duration-200 flex items-center gap-2"
                                    aria-label="Add new question"
                                >
                                    <PlusCircle className="w-4 h-4" />
                                    <span>Add Q&A</span>
                                </button>

                                <button
                                    onClick={handleExport}
                                    className="px-4 py-2 bg-blue-100 dark:bg-blue-500/20 hover:bg-blue-200 dark:hover:bg-blue-500/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 border border-transparent dark:border-blue-500/30"
                                    aria-label="Export session"
                                >
                                    <Download className="w-4 h-4" />
                                    <span className="hidden sm:inline">Export</span>
                                </button>

                                <button
                                    onClick={handleShareSession}
                                    className="px-4 py-2 bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white rounded-lg text-sm font-medium shadow-lg transition-all duration-200 flex items-center gap-2"
                                    aria-label="Share session"
                                >
                                    <Share2 className="w-4 h-4" />
                                    <span>Share</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* ==================== PENDING APPROVALS (CREATOR ONLY) ==================== */}


                    {/* ==================== DISCLAIMER ==================== */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="bg-[rgb(var(--warning-bg))] border border-[rgb(var(--warning-border))] rounded-xl px-4 sm:px-5 md:px-6 py-4 sm:py-5 mb-4 sm:mb-6 shadow-md mx-3 sm:mx-4 md:mx-6 lg:mx-8"
                        role="alert"
                    >
                        <div className="flex gap-4">
                            <AlertCircle className="w-6 h-6 text-[rgb(var(--warning))] flex-shrink-0" />
                            <div>
                                <h4 className="font-bold text-[rgb(var(--warning))] mb-1">
                                    AI-Generated Content Disclaimer
                                </h4>
                                <p className="text-sm text-[rgb(var(--text-secondary))]">
                                    Answers are AI-generated. Please review and verify before using in actual interviews.
                                    Feel free to regenerate or edit as needed.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* ==================== QUESTIONS LIST ==================== */}
                    {/* ==================== QUESTIONS LIST (GROUPED) ==================== */}
                    <motion.div
                        variants={ANIMATION_VARIANTS.container}
                        initial="hidden"
                        animate="show"
                        className="space-y-6 px-3 sm:px-4 md:px-6"
                    >
                        {(() => {
                            let questionCounter = 0;
                            return Object.entries(
                                visibleQuestions.reduce((acc, qa) => {
                                    const category = qa.category || 'General';
                                    if (!acc[category]) acc[category] = [];
                                    acc[category].push(qa);
                                    return acc;
                                }, {})
                            ).map(([category, questions], groupIndex) => {
                                // Filter out pending questions for general view (unless owner or requester)
                                const displayQuestions = questions.filter(q => {
                                    if (q.status === 'pending') {
                                        const isRequester = user && (q.requestedBy === user._id || q.requestedBy === user.userId || q.requestedBy === user.id);
                                        return isCreator || isRequester;
                                    }
                                    return q.status !== 'rejected';
                                });
                                if (displayQuestions.length === 0) return null;

                                return (
                                    <div key={groupIndex} className="space-y-3 sm:space-y-4">
                                        <div className="flex items-center gap-2 pb-2 border-b border-[rgb(var(--border-subtle))]">
                                            <h2 className="text-xl font-bold text-[rgb(var(--accent))]">
                                                {category}
                                            </h2>
                                            <span className="text-sm text-[rgb(var(--text-muted))]">
                                                ({displayQuestions.length})
                                            </span>
                                        </div>
                                        {displayQuestions.map((qa, index) => {
                                            // Calculate global index for correct state tracking
                                            const globalIndex = session.qna.indexOf(qa);
                                            questionCounter++; // Increment counter for display

                                            return (
                                                <QuestionCard
                                                    key={globalIndex}
                                                    question={qa.question}
                                                    answer={qa.answerParts}
                                                    category={qa.category}
                                                    index={globalIndex}
                                                    displayNumber={questionCounter} // 👈 Pass sequential number
                                                    isStarred={starredQuestions[globalIndex]}
                                                    isExpanded={expandedAll}
                                                    onToggleStar={handleToggleStar}
                                                    onRegenerate={handleRegenerate}
                                                    onEdit={handleEdit}
                                                    onShare={handleShare}
                                                    onCopyAnswer={handleCopyAnswer}
                                                    onDelete={handleDelete}
                                                    canDelete={isCreator || user?.role === 'admin' || user?.role === 'owner'}
                                                    status={qa.status}
                                                    isCreator={isCreator}
                                                    onApprove={handleApprove}
                                                    onReject={handleReject}
                                                />
                                            );
                                        })}
                                    </div>
                                );
                            });
                        })()}
                    </motion.div>

                    {/* ==================== LOAD MORE / GENERATE MORE ==================== */}
                    <div className="mt-6 sm:mt-8 px-3 sm:px-4 md:px-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                        {hasMore && (
                            <button
                                onClick={handleLoadMore}
                                className="px-6 py-3 bg-[rgb(var(--bg-card-alt))] hover:bg-[rgb(var(--bg-card-alt))]/80 text-[rgb(var(--text-primary))] rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2">
                                <ChevronDown className="w-5 h-5" />
                                Load More Questions
                            </button>
                        )}

                        {(user?.role === 'admin' || user?.email === session?.creatorEmail) && (
                            <button
                                onClick={handleGenerateMore}
                                disabled={isGenerating}
                                className="px-6 py-3 bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] disabled:bg-gray-400 text-white rounded-lg font-medium shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed">

                                {isGenerating ? (
                                    <ButtonLoader text="Generating..." />
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        Generate More Questions
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    {/* ==================== FLOATING ACTION BUTTON (Mobile) ==================== */}
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 }}
                        onClick={handleShareSession}
                        className="fixed bottom-6 right-6 lg:hidden w-14 h-14 bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white rounded-full shadow-2xl flex items-center justify-center z-50 focus:outline-none focus:ring-4 focus:ring-[rgb(var(--accent))]/30"
                        aria-label="Share session"
                    >
                        <Share2 className="w-6 h-6" />
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default InterviewPrepModern;
