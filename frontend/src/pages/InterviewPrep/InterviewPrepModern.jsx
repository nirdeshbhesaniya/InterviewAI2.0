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

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    Filter,
    Loader2
} from 'lucide-react';
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
                className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 bg-gray-800/90 dark:bg-gray-700/90 hover:bg-gray-900 dark:hover:bg-gray-600 text-white px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm rounded-lg shadow-lg transition-all duration-200 flex items-center gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-orange-500 backdrop-blur-sm"
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
            <div className="bg-gray-900 dark:bg-gray-950 rounded-lg sm:rounded-xl border border-gray-700 dark:border-gray-600 shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gray-800/95 dark:bg-gray-900/95 px-3 sm:px-4 py-2 sm:py-2.5 border-b border-gray-700 dark:border-gray-600 flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex gap-1 sm:gap-1.5">
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
                        </div>
                        <span className="text-[10px] sm:text-xs font-mono font-semibold text-gray-300 dark:text-gray-400 uppercase tracking-wide">
                            {language}
                        </span>
                    </div>
                </div>

                {/* Code Content */}
                <div className="p-3 sm:p-4 bg-gray-900 dark:bg-gray-950 overflow-x-auto scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500">
                    <ReactMarkdown
                        children={`\`\`\`${language}\n${content}\n\`\`\``}
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                        components={{
                            pre: ({ ...props }) => <pre className="!bg-gray-900 dark:!bg-gray-950 !p-0 !m-0 text-xs sm:text-sm leading-relaxed font-mono" {...props} />,
                            code: ({ ...props }) => <code className="!bg-gray-900 dark:!bg-gray-950 font-mono font-medium text-xs sm:text-sm text-gray-100 dark:text-gray-200" {...props} />
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
    isEditing,
    editedContent,
    onToggleStar,
    onRegenerate,
    onEdit,
    onSaveEdit,
    onCancelEdit,
    onShare,
    onCopyAnswer,
    onEditContentChange
}) => {
    const [isOpen, setIsOpen] = useState(isExpanded);

    useEffect(() => {
        setIsOpen(isExpanded);
    }, [isExpanded]);

    const formattedAnswer = useMemo(() => {
        if (!answer?.length) {
            return <p className="text-sm italic text-gray-500 dark:text-gray-400 py-4">No answer available.</p>;
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
                            h1: (props) => <h1 className="text-xl sm:text-2xl font-extrabold mt-4 sm:mt-6 mb-3 sm:mb-4 break-words text-gray-900 dark:text-white" {...props} />,
                            h2: (props) => <h2 className="text-lg sm:text-xl font-bold mt-4 sm:mt-5 mb-2 sm:mb-3 break-words text-gray-800 dark:text-gray-100" {...props} />,
                            h3: (props) => <h3 className="text-base sm:text-lg font-bold mt-3 sm:mt-4 mb-2 break-words text-gray-800 dark:text-gray-100" {...props} />,
                            p: (props) => <p className="mb-3 sm:mb-4 leading-relaxed break-words text-gray-700 dark:text-gray-300" {...props} />,
                            ul: (props) => <ul className="list-disc pl-4 sm:pl-6 mb-3 sm:mb-4 space-y-1.5 sm:space-y-2 break-words" {...props} />,
                            ol: (props) => <ol className="list-decimal pl-4 sm:pl-6 mb-3 sm:mb-4 space-y-1.5 sm:space-y-2 break-words" {...props} />,
                            li: (props) => <li className="text-gray-700 dark:text-gray-300 leading-relaxed" {...props} />,
                            strong: (props) => <strong className="font-extrabold text-gray-900 dark:text-white" {...props} />,
                            em: (props) => <em className="italic text-gray-800 dark:text-gray-200" {...props} />,
                            blockquote: (props) => (
                                <blockquote className="border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/20 pl-3 sm:pl-4 py-2 sm:py-3 my-3 sm:my-4 italic rounded-r-lg break-words font-medium text-gray-800 dark:text-gray-200" {...props} />
                            ),
                            code: (props) => (
                                <code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono font-semibold break-all text-orange-600 dark:text-orange-400" {...props} />
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Question Header */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full px-4 sm:px-5 md:px-6 py-3 sm:py-4 md:py-5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 hover:from-orange-50 hover:to-orange-100 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-inset"
                    aria-expanded={isOpen}
                    aria-controls={`answer-${index}`}
                >
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3">
                                {/* Question Number Badge */}
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white text-sm font-bold shadow-md flex-shrink-0">
                                    {index + 1}
                                </span>

                                {/* Question Text */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base md:text-lg leading-relaxed break-words overflow-wrap-anywhere">
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
                            className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''
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
                            <div className="px-4 sm:px-5 md:px-6 py-4 sm:py-5 border-t border-gray-200 dark:border-gray-700">
                                {/* Answer */}
                                <div className="mb-4 sm:mb-6 overflow-hidden break-words">
                                    {isEditing ? (
                                        <div className="space-y-3">
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                Edit Answer:
                                            </label>
                                            <textarea
                                                value={editedContent}
                                                onChange={(e) => onEditContentChange(e.target.value)}
                                                className="w-full min-h-[300px] px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-y font-mono text-sm leading-relaxed"
                                                placeholder="Enter your answer here..."
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => onSaveEdit(index)}
                                                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-md"
                                                >
                                                    <Check className="w-4 h-4" />
                                                    Save Changes
                                                </button>
                                                <button
                                                    onClick={onCancelEdit}
                                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                                                >
                                                    <X className="w-4 h-4" />
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        formattedAnswer
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    {/* Star/Unstar */}
                                    <button
                                        onClick={() => onToggleStar(index)}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${isStarred
                                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                        aria-label={isStarred ? 'Unmark as important' : 'Mark as important'}
                                    >
                                        <Star className={`w-4 h-4 ${isStarred ? 'fill-current' : ''}`} />
                                        <span className="hidden sm:inline">{isStarred ? 'Starred' : 'Star'}</span>
                                    </button>

                                    {/* Regenerate */}
                                    <button
                                        onClick={() => onRegenerate(index)}
                                        className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                                        aria-label="Regenerate answer"
                                    >
                                        <RefreshCcw className="w-4 h-4" />
                                        <span className="hidden sm:inline">Regenerate</span>
                                    </button>

                                    {/* Edit */}
                                    <button
                                        onClick={() => onEdit(index)}
                                        className="px-3 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                                        aria-label="Edit answer"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        <span className="hidden sm:inline">Edit</span>
                                    </button>

                                    {/* Copy Answer */}
                                    <button
                                        onClick={() => onCopyAnswer(index)}
                                        className="px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                                        aria-label="Copy answer"
                                    >
                                        <Copy className="w-4 h-4" />
                                        <span className="hidden sm:inline">Copy</span>
                                    </button>

                                    {/* Share */}
                                    <button
                                        onClick={() => onShare(index)}
                                        className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ml-auto"
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
    const [editingIndex, setEditingIndex] = useState(null);
    const [editedContent, setEditedContent] = useState('');

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
            } catch (error) {
                toast.error('Failed to load interview session');
                console.error('Fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSession();
    }, [sessionId]);

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

        // Convert answerParts to editable text, preserving code blocks with markdown formatting
        const answerText = session.qna[index].answerParts
            .map(part => {
                if (part.type === 'code') {
                    // Preserve code blocks with triple backticks and language
                    return `\`\`\`${part.language || 'javascript'}\n${part.content}\n\`\`\``;
                }
                return part.content;
            })
            .join('\n\n');

        setEditedContent(answerText);
        setEditingIndex(index);
    }, [session]);

    const handleSaveEdit = useCallback(async (index) => {
        if (!session || !editedContent.trim()) return;

        toast.loading('Saving changes...', { id: `save-${index}` });

        try {
            // Parse the edited content to detect code blocks
            const parseEditedContent = (text) => {
                const lines = text.split('\n');
                const parts = [];
                let current = { type: 'text', content: '' };
                let isInCodeBlock = false;
                let codeLang = '';

                for (const line of lines) {
                    const codeBlockMatch = line.trim().match(/^```(\w+)?/);

                    if (codeBlockMatch) {
                        // Toggle code block
                        if (isInCodeBlock) {
                            // End code block
                            if (current.content.trim()) {
                                parts.push({
                                    type: 'code',
                                    content: current.content.trim(),
                                    language: codeLang || 'javascript',
                                });
                            }
                            current = { type: 'text', content: '' };
                            codeLang = '';
                        } else {
                            // Start code block
                            if (current.content.trim()) {
                                parts.push({
                                    type: 'text',
                                    content: current.content.trim(),
                                });
                            }
                            current = { type: 'code', content: '' };
                            codeLang = codeBlockMatch[1] || 'javascript';
                        }
                        isInCodeBlock = !isInCodeBlock;
                    } else {
                        current.content += line + '\n';
                    }
                }

                if (current.content.trim()) {
                    parts.push({
                        type: isInCodeBlock ? 'code' : 'text',
                        content: current.content.trim(),
                        ...(isInCodeBlock && { language: codeLang || 'javascript' }),
                    });
                }

                return parts.length > 0 ? parts : [{ type: 'text', content: text.trim() }];
            };

            const answerParts = parseEditedContent(editedContent);

            const response = await axios.patch(API.INTERVIEW.EDIT(sessionId, index), {
                answerParts
            });

            setSession(prev => {
                const updated = { ...prev };
                updated.qna[index].answerParts = response.data.answerParts || answerParts;
                return updated;
            });

            setEditingIndex(null);
            setEditedContent('');
            toast.success('Answer updated!', { id: `save-${index}` });
        } catch (error) {
            toast.error('Failed to save changes', { id: `save-${index}` });
            console.error('Save edit error:', error);
        }
    }, [session, sessionId, editedContent]);

    const handleCancelEdit = useCallback(() => {
        setEditingIndex(null);
        setEditedContent('');
    }, []);

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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
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
                        <Bot className="w-8 h-8 text-orange-600" />
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
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
                    <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">
                        Session Not Found
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        The interview session you're looking for doesn't exist or may have been deleted.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
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

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="w-full py-4 sm:py-6">
                    {/* ==================== HEADER SECTION ==================== */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-700 rounded-2xl shadow-xl border border-blue-200/50 dark:border-gray-600/50 px-4 sm:px-6 md:px-8 py-4 sm:py-6 lg:py-8 mb-4 sm:mb-6 mx-3 sm:mx-4 md:mx-6 lg:mx-8"
                    >
                        {/* Title and Metadata */}
                        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 mb-6">
                            {/* Left: Title and Description */}
                            <div className="flex-1 space-y-4">
                                <div className="flex items-start gap-3">
                                    <Bot className="w-8 h-8 text-orange-600 flex-shrink-0 mt-1" />
                                    <div className="flex-1 min-w-0">
                                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white break-words leading-tight">
                                            {session.title}
                                        </h1>
                                    </div>
                                </div>

                                <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {session.desc}
                                </p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2">
                                    {session.tag?.split(',').map((tag, i) => (
                                        <span
                                            key={i}
                                            className="px-3 py-1 bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 text-pink-800 dark:text-pink-200 text-xs font-medium rounded-full border border-pink-200 dark:border-pink-800/30"
                                        >
                                            {tag.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Right: Metadata Card */}
                            <div className="lg:w-64 bg-white/60 dark:bg-gray-800/60 rounded-xl p-4 border border-gray-200/50 dark:border-gray-600/50 backdrop-blur-sm space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Experience:
                                    </span>
                                    <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 text-xs font-medium rounded-md">
                                        {session.experience}
                                    </span>
                                </div>

                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">Created:</span>{' '}
                                    {moment(session.createdAt).format('MMM DD, YYYY')}
                                </div>

                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">Questions:</span>{' '}
                                    {session.qna?.length || 0}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200/50 dark:border-gray-600/50">
                            {/* Left Side Controls */}
                            <div className="flex flex-wrap gap-2 flex-1">
                                <button
                                    onClick={() => setImportantOnly(!importantOnly)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${importantOnly
                                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                                        : 'bg-white/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300'
                                        }`}
                                    aria-pressed={importantOnly}
                                >
                                    <Filter className="w-4 h-4" />
                                    <span>{importantOnly ? 'Show All' : 'Important Only'}</span>
                                </button>

                                <button
                                    onClick={() => setExpandedAll(!expandedAll)}
                                    className="px-4 py-2 bg-white/80 dark:bg-gray-700/80 hover:bg-white dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                                    aria-label={expandedAll ? 'Collapse all questions' : 'Expand all questions'}
                                >
                                    {expandedAll ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                    <span>{expandedAll ? 'Collapse All' : 'Expand All'}</span>
                                </button>

                                <button
                                    onClick={() => setDarkMode(!darkMode)}
                                    className="px-4 py-2 bg-white/80 dark:bg-gray-700/80 hover:bg-white dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                                    aria-label="Toggle dark mode"
                                >
                                    {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                    <span className="hidden sm:inline">{darkMode ? 'Light' : 'Dark'}</span>
                                </button>
                            </div>

                            {/* Right Side Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={handleExport}
                                    className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                                    aria-label="Export session"
                                >
                                    <Download className="w-4 h-4" />
                                    <span className="hidden sm:inline">Export</span>
                                </button>

                                <button
                                    onClick={handleShareSession}
                                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg text-sm font-medium shadow-lg transition-all duration-200 flex items-center gap-2"
                                    aria-label="Share session"
                                >
                                    <Share2 className="w-4 h-4" />
                                    <span>Share</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* ==================== DISCLAIMER ==================== */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="bg-gradient-to-r from-orange-50 via-yellow-50 to-orange-50 dark:from-orange-900/10 dark:via-yellow-900/10 dark:to-orange-900/10 border border-orange-200 dark:border-orange-800/50 rounded-xl px-4 sm:px-5 md:px-6 py-4 sm:py-5 mb-4 sm:mb-6 shadow-md mx-3 sm:mx-4 md:mx-6 lg:mx-8"
                        role="alert"
                    >
                        <div className="flex gap-4">
                            <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                            <div>
                                <h4 className="font-bold text-orange-800 dark:text-orange-300 mb-1">
                                    AI-Generated Content Disclaimer
                                </h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    Answers are AI-generated. Please review and verify before using in actual interviews.
                                    Feel free to regenerate or edit as needed.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* ==================== QUESTIONS LIST ==================== */}
                    <motion.div
                        variants={ANIMATION_VARIANTS.container}
                        initial="hidden"
                        animate="show"
                        className="space-y-3 sm:space-y-4 px-3 sm:px-4 md:px-6"
                    >
                        {visibleQuestions.map((qa, index) => (
                            <QuestionCard
                                key={index}
                                question={qa.question}
                                answer={qa.answerParts}
                                index={index}
                                isStarred={starredQuestions[index]}
                                isExpanded={expandedAll}
                                isEditing={editingIndex === index}
                                editedContent={editedContent}
                                onToggleStar={handleToggleStar}
                                onRegenerate={handleRegenerate}
                                onEdit={handleEdit}
                                onSaveEdit={handleSaveEdit}
                                onCancelEdit={handleCancelEdit}
                                onShare={handleShare}
                                onCopyAnswer={handleCopyAnswer}
                                onEditContentChange={setEditedContent}
                            />
                        ))}
                    </motion.div>

                    {/* ==================== LOAD MORE / GENERATE MORE ==================== */}
                    <div className="mt-6 sm:mt-8 px-3 sm:px-4 md:px-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                        {hasMore && (
                            <button
                                onClick={handleLoadMore}
                                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                <ChevronDown className="w-5 h-5" />
                                Load More Questions
                            </button>
                        )}

                        <button
                            onClick={handleGenerateMore}
                            disabled={isGenerating}
                            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-medium shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Generating...
                                </>
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
                        className="fixed bottom-6 right-6 lg:hidden w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 focus:outline-none focus:ring-4 focus:ring-orange-300"
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
