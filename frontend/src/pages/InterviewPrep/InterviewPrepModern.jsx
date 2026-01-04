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
    Check,
    X,
    AlertCircle,
    Maximize2,
    Minimize2,
    ExternalLink,
    Sparkles,
    Bot,
    Filter
} from 'lucide-react';
import { ButtonLoader } from '../../components/ui/Loader';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import toast, { Toaster } from 'react-hot-toast';
import moment from 'moment';

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
 * Code Block Component with copy functionality
 */
const CodeBlock = ({ language = 'javascript', content }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        toast.success('Code copied!', { duration: 2000 });
        setTimeout(() => setCopied(false), 2000);
    }, [content]);

    return (
        <div className="relative group my-3 sm:my-4">
            {/* Copy Button - Always visible on mobile, hover on desktop */}
            <button
                onClick={handleCopy}
                className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 bg-gray-700/95 dark:bg-gray-800/95 hover:bg-gray-800 dark:hover:bg-gray-700 text-white px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm rounded-lg shadow-lg transition-all duration-200 flex items-center gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))] backdrop-blur-sm"
                aria-label="Copy code to clipboard"
            >
                {copied ? (
                    <>
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="font-medium">Copied!</span>
                    </>
                ) : (
                    <>
                        <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="font-medium">Copy</span>
                    </>
                )}
            </button>

            {/* Code Container */}
            <div className="bg-[#1e1e1e] dark:bg-[#0d1117] rounded-lg sm:rounded-xl border border-gray-700 dark:border-[rgb(var(--border))] shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-[#252526] dark:bg-[#161b22] px-3 sm:px-4 py-2 sm:py-2.5 border-b border-gray-700 dark:border-[rgb(var(--border))] flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex gap-1 sm:gap-1.5">
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-400 dark:bg-red-500"></div>
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-400 dark:bg-yellow-500"></div>
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-400 dark:bg-green-500"></div>
                        </div>
                        <span className="text-[10px] sm:text-xs font-mono font-semibold text-gray-400 dark:text-[rgb(var(--text-muted))] uppercase tracking-wide">
                            {language}
                        </span>
                    </div>
                </div>

                {/* Code Content */}
                <div className="p-3 sm:p-4 bg-[#1e1e1e] dark:bg-[#0d1117] overflow-x-auto scrollbar-thin scrollbar-track-gray-800 dark:scrollbar-track-[rgb(var(--bg-card))] scrollbar-thumb-gray-600 dark:scrollbar-thumb-[rgb(var(--border-strong))] hover:scrollbar-thumb-gray-500 dark:hover:scrollbar-thumb-[rgb(var(--accent))]">
                    <ReactMarkdown
                        children={`\`\`\`${language}\n${content}\n\`\`\``}
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                        components={{
                            pre: ({ ...props }) => <pre className="!bg-[#1e1e1e] dark:!bg-[#0d1117] !p-0 !m-0 text-xs sm:text-sm leading-relaxed font-mono" {...props} />,
                            code: ({ ...props }) => <code className="!bg-[#1e1e1e] dark:!bg-[#0d1117] font-mono font-medium text-xs sm:text-sm text-gray-100 dark:text-[rgb(var(--text-secondary))]" {...props} />
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

/**
 * Question Accordion Card Component
 */
const QuestionCard = ({
    question,
    answer,
    index,
    isStarred,
    isExpanded,
    onToggleStar,
    onRegenerate,
    onEdit,
    onShare,
    onCopyAnswer
}) => {
    const [isOpen, setIsOpen] = useState(isExpanded);

    useEffect(() => {
        setIsOpen(isExpanded);
    }, [isExpanded]);

    const formattedAnswer = useMemo(() => {
        if (!answer?.length) {
            return <p className="text-sm italic text-[rgb(var(--text-muted))] py-4">No answer available.</p>;
        }

        return answer.map((part, idx) => {
            const content = part.content?.trim();
            if (!content) return null;

            if (part.type === 'code') {
                return <CodeBlock key={idx} language={part.language || 'javascript'} content={content} />;
            }

            return (
                <div key={idx} className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            h1: (props) => <h1 className="text-xl sm:text-2xl font-extrabold mt-4 sm:mt-6 mb-3 sm:mb-4 break-words text-[rgb(var(--text-primary))]" {...props} />,
                            h2: (props) => <h2 className="text-lg sm:text-xl font-bold mt-4 sm:mt-5 mb-2 sm:mb-3 break-words text-[rgb(var(--text-primary))]" {...props} />,
                            h3: (props) => <h3 className="text-base sm:text-lg font-bold mt-3 sm:mt-4 mb-2 break-words text-[rgb(var(--text-primary))]" {...props} />,
                            p: (props) => <p className="mb-3 sm:mb-4 leading-relaxed break-words text-[rgb(var(--text-secondary))]" {...props} />,
                            ul: (props) => <ul className="list-disc pl-4 sm:pl-6 mb-3 sm:mb-4 space-y-1.5 sm:space-y-2 break-words" {...props} />,
                            ol: (props) => <ol className="list-decimal pl-4 sm:pl-6 mb-3 sm:mb-4 space-y-1.5 sm:space-y-2 break-words" {...props} />,
                            li: (props) => <li className="text-[rgb(var(--text-secondary))] leading-relaxed" {...props} />,
                            strong: (props) => <strong className="font-extrabold text-[rgb(var(--text-primary))]" {...props} />,
                            em: (props) => <em className="italic text-[rgb(var(--text-primary))]" {...props} />,
                            blockquote: (props) => (
                                <blockquote className="border-l-4 border-[rgb(var(--accent))] bg-[rgb(var(--accent))]/10 pl-3 sm:pl-4 py-2 sm:py-3 my-3 sm:my-4 italic rounded-r-lg break-words font-medium text-[rgb(var(--text-secondary))]" {...props} />
                            ),
                            code: (props) => (
                                <code className="bg-[rgb(var(--bg-card-alt))] px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono font-semibold break-all text-[rgb(var(--accent))]" {...props} />
                            ),
                            a: (props) => <a className="text-blue-600 dark:text-blue-400 hover:underline font-semibold break-all" target="_blank" rel="noopener noreferrer" {...props} />
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                </div>
            );
        });
    }, [answer]);

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
                                    {index + 1}
                                </span>

                                {/* Question Text */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm sm:text-base md:text-lg leading-relaxed break-words overflow-wrap-anywhere">
                                        {question}
                                    </h3>

                                    {/* Starred Badge */}
                                    {isStarred && (
                                        <div className="flex items-center gap-1.5 mt-2">
                                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                            <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
                                                Important
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Expand/Collapse Icon */}
                        <ChevronDown
                            className={`w-5 h-5 text-[rgb(var(--text-muted))] transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''
                                }`}
                        />
                    </div>
                </button>

                {/* Answer Content */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            id={`answer-${index}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="px-4 sm:px-5 md:px-6 py-4 sm:py-5 border-t border-[rgb(var(--border))]">
                                {/* Answer */}
                                <div className="mb-4 sm:mb-6 overflow-hidden break-words">
                                    {formattedAnswer}
                                </div>

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
        </motion.div>
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
                    // Clear the state
                    window.history.replaceState({}, document.title);
                }
            } catch (error) {
                toast.error('Failed to load interview session');
                console.error('Fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSession();
    }, [sessionId, location.state]);

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

    const handleGenerateMore = useCallback(async () => {
        setIsGenerating(true);
        toast.loading('Generating more questions...', { id: 'generate-more' });

        try {
            const response = await axios.post(API.INTERVIEW.GENERATE_MORE(sessionId));
            setSession(prev => ({
                ...prev,
                qna: [...prev.qna, ...(response.data.qna || [])]
            }));
            toast.success('Generated more questions!', { id: 'generate-more' });
        } catch (error) {
            toast.error('Failed to generate questions', { id: 'generate-more' });
            console.error('Generate error:', error);
        } finally {
            setIsGenerating(false);
        }
    }, [sessionId]);

    const handleLoadMore = useCallback(() => {
        setVisibleCount(prev => prev + ITEMS_PER_PAGE);
    }, []);

    // ==================== COMPUTED VALUES ====================
    const filteredQuestions = useMemo(() => {
        if (!session?.qna) return [];
        if (!importantOnly) return session.qna;
        return session.qna.filter((_, i) => starredQuestions[i]);
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
                    {session?.userId === user?.id && session.qna.some(q => q.status === 'pending') && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-700/30 rounded-xl p-6 mb-8 mx-3 sm:mx-4 md:mx-6 lg:mx-8"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <ShieldAlert className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
                                <h3 className="text-lg font-bold text-yellow-700 dark:text-yellow-400">
                                    Pending Approval Requests ({session.qna.filter(q => q.status === 'pending').length})
                                </h3>
                            </div>

                            <div className="space-y-4">
                                {session.qna.map((qa, idx) => {
                                    if (qa.status !== 'pending') return null;
                                    return (
                                        <div key={idx} className="bg-[rgb(var(--bg-card))] p-4 rounded-lg border border-[rgb(var(--border))] shadow-sm">
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    <p className="font-semibold text-[rgb(var(--text-primary))] mb-2">{qa.question}</p>
                                                    <p className="text-xs text-[rgb(var(--text-muted))] mb-2">Requested by: <span className="font-medium">{qa.requestedBy || 'Unknown User'}</span></p>
                                                    <div className="text-sm text-[rgb(var(--text-secondary))] line-clamp-2">
                                                        {qa.answerParts?.[0]?.content}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 shrink-0">
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await axios.patch(API.ADMIN.APPROVE_QNA(sessionId, qa._id));
                                                                toast.success('Question approved!');
                                                                // Refresh session
                                                                const res = await axios.get(API.INTERVIEW.GET_ONE(sessionId));
                                                                setSession(res.data);
                                                            } catch (err) {
                                                                toast.error('Failed to approve');
                                                            }
                                                        }}
                                                        className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                                                    >
                                                        <Check className="w-3 h-3" /> Approve
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await axios.patch(API.ADMIN.REJECT_QNA(sessionId, qa._id));
                                                                toast.success('Question rejected');
                                                                // Refresh session
                                                                const res = await axios.get(API.INTERVIEW.GET_ONE(sessionId));
                                                                setSession(res.data);
                                                            } catch (err) {
                                                                toast.error('Failed to reject');
                                                            }
                                                        }}
                                                        className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                                                    >
                                                        <X className="w-3 h-3" /> Reject
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

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
                        {Object.entries(
                            visibleQuestions.reduce((acc, qa) => {
                                const category = qa.category || 'General';
                                if (!acc[category]) acc[category] = [];
                                acc[category].push(qa);
                                return acc;
                            }, {})
                        ).map(([category, questions], groupIndex) => {
                            // Filter out pending questions for general view (unless owner)
                            const displayQuestions = questions.filter(q => q.status !== 'pending' && q.status !== 'rejected');
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
                                        return (
                                            <QuestionCard
                                                key={globalIndex}
                                                question={qa.question}
                                                answer={qa.answerParts}
                                                index={globalIndex}
                                                isStarred={starredQuestions[globalIndex]}
                                                isExpanded={expandedAll}
                                                onToggleStar={handleToggleStar}
                                                onRegenerate={handleRegenerate}
                                                onEdit={handleEdit}
                                                onShare={handleShare}
                                                onCopyAnswer={handleCopyAnswer}
                                            />
                                        );
                                    })}
                                </div>
                            );
                        })}
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
