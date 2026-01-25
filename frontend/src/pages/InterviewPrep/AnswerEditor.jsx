/**
 * Full-Page Answer Editor with Advanced Features
 * - Split-screen markdown and preview
 * - Side-by-side code block editing
 * - Syntax highlighting
 * - Real-time preview
 * - Auto-save functionality
 */

import React, { useState, useEffect, useCallback, useMemo, useRef, useContext } from 'react';
import { UserContext } from '../../context/UserContext'; // Import UserContext
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Eye,
    EyeOff,
    Code,
    FileText,
    Check,
    X,
    AlertCircle,
    Maximize2,
    Minimize2,
    RotateCcw,
    Copy,
    BookOpen,
    Lightbulb,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import axios from '../../utils/axiosInstance';
import { API } from '../../utils/apiPaths';
import toast, { Toaster } from 'react-hot-toast';
import { ButtonLoader } from '../../components/ui/Loader';
import { motion } from 'framer-motion';
const AnswerEditor = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Get question data from navigation state
    const { question, answer, category: initialCategory, index } = location.state || {};

    const [editedContent, setEditedContent] = useState('');
    const [originalContent, setOriginalContent] = useState('');
    const [category, setCategory] = useState(initialCategory || 'General'); // New state
    const [originalCategory, setOriginalCategory] = useState(initialCategory || 'General'); // New state
    const [showPreview, setShowPreview] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [showGuide, setShowGuide] = useState(false);
    const [copied, setCopied] = useState(false);
    const [guideAnimated, setGuideAnimated] = useState(false);
    const [darkMode] = useState(() => {
        return localStorage.getItem('interviewPrepTheme') === 'dark';
    });
    const guideRef = useRef(null);

    useEffect(() => {
        if (!question || !answer || index === undefined || index === null) {
            console.error('Invalid editor state:', { question, answer, index, state: location.state });
            toast.error('Invalid editor state - Missing data');
            navigate(-1);
            return;
        }

        // Convert answerParts to editable text
        const answerText = answer
            .map(part => {
                if (part.type === 'code') {
                    return `\`\`\`${part.language || 'javascript'}\n${part.content}\n\`\`\``;
                }
                return part.content;
            })
            .join('\n\n');

        setEditedContent(answerText);
        setOriginalContent(answerText);
    }, [question, answer, index, navigate]);

    useEffect(() => {
        // Apply dark mode
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    useEffect(() => {
        setHasChanges(editedContent !== originalContent || category !== originalCategory);
    }, [editedContent, originalContent, category, originalCategory]);

    // Parse edited content into answerParts format
    const parseEditedContent = useCallback((text) => {
        const lines = text.split('\n');
        const parts = [];
        let current = { type: 'text', content: '' };
        let isInCodeBlock = false;
        let codeLang = '';

        for (const line of lines) {
            const codeBlockMatch = line.trim().match(/^```(\w+)?/);

            if (codeBlockMatch) {
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
    }, []);

    const { user } = useContext(UserContext); // Get user context
    const isCreator = location.state?.isCreator; // Pass this from previous page or fetch
    const isAdmin = user?.role === 'admin';
    const isOwner = user?.role === 'owner';
    // Assume creator check might need session data if not passed in state, but simpler if passed or we check session again.
    // Ideally pass isCreator via location state from InterviewPrepModern.

    const canDirectEdit = isAdmin || isOwner || isCreator;

    const handleSave = async () => {
        if (!hasChanges) {
            toast.success('No changes to save');
            return;
        }

        setSaving(true);
        const toastId = toast.loading(canDirectEdit ? 'Saving changes...' : 'Requesting update...');

        try {
            const answerParts = parseEditedContent(editedContent);

            await axios.patch(API.INTERVIEW.EDIT(sessionId, index), {
                answerParts,
                category
            });

            setOriginalContent(editedContent);
            setOriginalCategory(category);
            setHasChanges(false);

            toast.success(canDirectEdit ? 'Answer saved successfully!' : 'Update requested successfully!', { id: toastId });

            // Navigate back after short delay
            setTimeout(() => {
                navigate(`/interview-prep/${sessionId}`, {
                    state: { updated: true, index }
                });
            }, 1000);
        } catch (error) {
            toast.error('Failed to save changes', { id: toastId });
            console.error('Save error:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        if (window.confirm('Are you sure you want to reset all changes?')) {
            setEditedContent(originalContent);
            toast.success('Changes reset');
        }
    };

    const handleCancel = () => {
        if (hasChanges) {
            if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                navigate(-1);
            }
        } else {
            navigate(-1);
        }
    };

    const handleCopyMarkdown = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(editedContent);
            setCopied(true);
            toast.success('Markdown copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Failed to copy markdown');
        }
    }, [editedContent]);

    const handleToggleGuide = useCallback(() => {
        if (!showGuide) {
            setShowGuide(true);
            // Scroll to guide section after it renders
            setTimeout(() => {
                if (guideRef.current) {
                    guideRef.current.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest'
                    });
                    // Trigger animation effect
                    setGuideAnimated(true);
                    setTimeout(() => setGuideAnimated(false), 2000);
                }
            }, 100);
        } else {
            setShowGuide(false);
        }
    }, [showGuide]);

    const wordCount = editedContent.trim() ? editedContent.trim().split(/\s+/).length : 0;
    const charCount = editedContent.length;

    // Code block component for preview
    const CodeBlock = ({ language, content }) => (
        <div className="relative group my-4">
            <div className="bg-[#1e1e1e] dark:bg-[#0d1117] rounded-lg border border-gray-700 dark:border-[rgb(var(--border))] shadow-lg overflow-hidden">
                <div className="bg-[#252526] dark:bg-[#161b22] px-4 py-2 border-b border-gray-700 dark:border-[rgb(var(--border))] flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-gray-400 dark:text-[rgb(var(--text-muted))] uppercase tracking-wide">
                        {language}
                    </span>
                </div>
                <div className="p-4 bg-[#1e1e1e] dark:bg-[#0d1117] overflow-x-auto">
                    <ReactMarkdown
                        children={`\`\`\`${language}\n${content}\n\`\`\``}
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                        components={{
                            pre: ({ ...props }) => <pre className="!bg-[#1e1e1e] dark:!bg-[#0d1117] !p-0 !m-0 text-sm leading-relaxed font-mono" {...props} />,
                            code: ({ ...props }) => <code className="!bg-[#1e1e1e] dark:!bg-[#0d1117] font-mono text-sm text-gray-100 dark:text-[rgb(var(--text-secondary))]" {...props} />
                        }}
                    />
                </div>
            </div>
        </div>
    );

    // Parse content for preview
    const previewContent = useMemo(() => {
        const parts = parseEditedContent(editedContent);

        return parts.map((part, idx) => {
            if (part.type === 'code') {
                return <CodeBlock key={idx} language={part.language || 'javascript'} content={part.content} />;
            }
            return (
                <div key={idx} className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            h1: (props) => <h1 className="text-2xl font-extrabold mt-6 mb-4 text-[rgb(var(--text-primary))]" {...props} />,
                            h2: (props) => <h2 className="text-xl font-bold mt-5 mb-3 text-[rgb(var(--text-primary))]" {...props} />,
                            h3: (props) => <h3 className="text-lg font-bold mt-4 mb-2 text-[rgb(var(--text-primary))]" {...props} />,
                            p: (props) => <p className="mb-4 leading-relaxed text-[rgb(var(--text-secondary))]" {...props} />,
                            ul: (props) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                            ol: (props) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                            li: (props) => <li className="text-[rgb(var(--text-secondary))] leading-relaxed" {...props} />,
                            strong: (props) => <strong className="font-extrabold text-[rgb(var(--text-primary))]" {...props} />,
                            blockquote: (props) => (
                                <blockquote className="border-l-4 border-[rgb(var(--accent))] bg-[rgb(var(--accent))]/10 pl-4 py-3 my-4 italic rounded-r-lg text-[rgb(var(--text-secondary))]" {...props} />
                            ),
                            code: (props) => (
                                <code className="bg-[rgb(var(--bg-card-alt))] px-1.5 py-0.5 rounded text-sm font-mono font-semibold text-[rgb(var(--accent))]" {...props} />
                            ),
                        }}
                    >
                        {part.content}
                    </ReactMarkdown>
                </div>
            );
        });
    }, [editedContent, parseEditedContent]);

    return (
        <div className={darkMode ? 'dark' : ''}>
            <Toaster position="top-right" />

            <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-[rgb(var(--bg-body))] dark:via-[rgb(var(--bg-elevated))] dark:to-[rgb(var(--bg-body))] ${isFullscreen ? 'fixed inset-0 z-50 overflow-y-auto' : ''}`}>
                {/* Header */}
                <div className="top-0 z-40 bg-[rgb(var(--bg-card))] border-b border-[rgb(var(--border))] shadow-lg">
                    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                            {/* Left: Back and Title */}
                            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 w-full sm:w-auto">
                                <button
                                    onClick={handleCancel}
                                    className="p-2 hover:bg-[rgb(var(--bg-card-alt))] dark:hover:bg-[rgb(var(--bg-elevated))] rounded-lg transition-colors flex-shrink-0"
                                    aria-label="Go back"
                                >
                                    <ArrowLeft className="w-5 h-5 text-[rgb(var(--text-secondary))]" />
                                </button>
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-base sm:text-lg md:text-xl font-bold text-[rgb(var(--text-primary))] truncate">
                                        Edit Answer
                                    </h1>
                                    <p className="text-xs sm:text-sm text-[rgb(var(--text-muted))] truncate">
                                        Question {(index !== undefined && index !== null) ? index + 1 : ''}
                                    </p>
                                </div>
                            </div>

                            {/* Right: Action Buttons */}
                            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
                                <button
                                    onClick={handleCopyMarkdown}
                                    className="px-3 py-2 bg-purple-100 dark:bg-purple-500/20 hover:bg-purple-200 dark:hover:bg-purple-500/30 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 border border-transparent dark:border-purple-500/30"
                                    title="Copy markdown to clipboard"
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
                                </button>

                                <button
                                    onClick={handleToggleGuide}
                                    className="px-3 py-2 bg-blue-100 dark:bg-blue-500/20 hover:bg-blue-200 dark:hover:bg-blue-500/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 border border-transparent dark:border-blue-500/30"
                                    title="Toggle markdown guide"
                                >
                                    <BookOpen className="w-4 h-4" />
                                    <span className="hidden sm:inline">{showGuide ? 'Hide' : 'Show'} Guide</span>
                                </button>

                                <button
                                    onClick={() => setShowPreview(!showPreview)}
                                    className="px-3 py-2 bg-[rgb(var(--bg-card-alt))] dark:bg-[rgb(var(--bg-elevated))] hover:bg-[rgb(var(--bg-card-alt))]/80 dark:hover:bg-[rgb(var(--bg-elevated-alt))] text-[rgb(var(--text-secondary))] rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                                >
                                    {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    <span className="hidden sm:inline">{showPreview ? 'Hide' : 'Show'} Preview</span>
                                </button>

                                <button
                                    onClick={() => setIsFullscreen(!isFullscreen)}
                                    className="p-2 bg-[rgb(var(--bg-card-alt))] dark:bg-[rgb(var(--bg-elevated))] hover:bg-[rgb(var(--bg-card-alt))]/80 dark:hover:bg-[rgb(var(--bg-elevated-alt))] text-[rgb(var(--text-secondary))] rounded-lg transition-all duration-200"
                                    aria-label="Toggle fullscreen"
                                >
                                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                </button>

                                {hasChanges && (
                                    <button
                                        onClick={handleReset}
                                        className="px-3 py-2 bg-orange-100 dark:bg-orange-500/20 hover:bg-orange-200 dark:hover:bg-orange-500/30 text-orange-700 dark:text-orange-300 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 border border-transparent dark:border-orange-500/30"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        <span className="hidden sm:inline">Reset</span>
                                    </button>
                                )}

                                <button
                                    onClick={handleSave}
                                    disabled={!hasChanges || saving}
                                    className="px-4 py-2 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 hover:from-purple-700 hover:via-pink-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium shadow-lg transition-all duration-200 flex items-center gap-2"
                                >
                                    {saving ? (
                                        <ButtonLoader text="Saving..." />
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            <span>{canDirectEdit ? 'Save' : 'Request Update'}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Status Bar with Stats */}
                        <div className="mt-3 flex items-center justify-between gap-4 text-sm flex-wrap">
                            <div className="flex items-center gap-4">
                                {hasChanges && (
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-orange-500" />
                                        <span className="text-[rgb(var(--text-muted))]">
                                            Unsaved changes
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-4 text-[rgb(var(--text-muted))]">
                                <span>{wordCount} words</span>
                                <span>{charCount} characters</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Question Display */}
                    <div className="bg-gradient-to-r from-white via-blue-50/50 to-purple-50/50 dark:from-[rgb(var(--bg-card))] dark:via-[rgb(var(--bg-elevated))] dark:to-[rgb(var(--bg-card))] rounded-xl shadow-xl border-2 border-blue-200/50 dark:border-[rgb(var(--border))] p-4 sm:p-6 mb-6">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-lg">
                                {index + 1}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-base sm:text-lg font-semibold text-[rgb(var(--text-primary))] leading-relaxed mb-3">
                                    {question}
                                </h2>
                                <div className="mt-2 pt-2 border-t border-[rgb(var(--border))]/50">
                                    <label className="text-xs font-bold text-[rgb(var(--text-muted))] uppercase tracking-wider mb-1 block">
                                        Category / Topic
                                    </label>
                                    <input
                                        type="text"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="bg-transparent text-[rgb(var(--text-secondary))] text-sm font-medium w-full focus:bg-[rgb(var(--bg-card-alt))] rounded px-2 py-1 -ml-2 transition-colors outline-none border border-transparent focus:border-[rgb(var(--accent))]/30"
                                        placeholder="Category..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Editor Area */}
                    <div className={`grid ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-6`}>
                        {/* Editor */}
                        <div className="bg-white dark:bg-[rgb(var(--bg-card))] rounded-xl shadow-xl border-2 border-blue-200/50 dark:border-[rgb(var(--border))] overflow-hidden hover:shadow-2xl transition-shadow">
                            <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-[rgb(var(--bg-card-alt))] dark:to-[rgb(var(--bg-elevated))] px-4 py-3 border-b-2 border-blue-200/50 dark:border-[rgb(var(--border))] flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600 dark:text-[rgb(var(--accent))]" />
                                <h3 className="font-semibold text-gray-800 dark:text-[rgb(var(--text-primary))]">Editor</h3>
                                <span className="ml-auto text-xs text-gray-600 dark:text-[rgb(var(--text-muted))]">
                                    Markdown supported
                                </span>
                            </div>
                            <textarea
                                value={editedContent}
                                onChange={(e) => setEditedContent(e.target.value)}
                                className="w-full h-[calc(100vh-320px)] min-h-[500px] px-4 py-4 bg-gray-50 dark:bg-[rgb(var(--bg-body))] text-gray-900 dark:text-[rgb(var(--text-primary))] font-mono text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-[rgb(var(--accent))]/50"
                                placeholder="Enter your answer here... Use ```language for code blocks"
                                spellCheck="false"
                            />
                        </div>

                        {/* Preview */}
                        {showPreview && (
                            <div className="bg-white dark:bg-[rgb(var(--bg-card))] rounded-xl shadow-xl border-2 border-purple-200/50 dark:border-[rgb(var(--border))] overflow-hidden hover:shadow-2xl transition-shadow">
                                <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-[rgb(var(--bg-card-alt))] dark:to-[rgb(var(--bg-elevated))] px-4 py-3 border-b-2 border-purple-200/50 dark:border-[rgb(var(--border))] flex items-center gap-2">
                                    <Eye className="w-5 h-5 text-purple-600 dark:text-[rgb(var(--accent))]" />
                                    <h3 className="font-semibold text-gray-800 dark:text-[rgb(var(--text-primary))]">Live Preview</h3>
                                </div>
                                <div className="px-4 py-4 h-[calc(100vh-320px)] min-h-[500px] overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-[rgb(var(--bg-body))]">
                                    {editedContent.trim() ? (
                                        previewContent
                                    ) : (
                                        <p className="text-[rgb(var(--text-muted))] italic text-center py-8">
                                            Start typing to see preview...
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Comprehensive Markdown Guide */}
                    {showGuide && (
                        <motion.div
                            ref={guideRef}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mt-6"
                        >
                            <div className={`bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 border-2 rounded-xl shadow-lg overflow-hidden transition-all duration-500 ${guideAnimated
                                ? 'border-blue-500 dark:border-blue-400 ring-4 ring-blue-300/50 dark:ring-blue-500/50 scale-[1.01]'
                                : 'border-blue-200 dark:border-blue-500/30'
                                }`}>
                                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                        <h3 className="text-base sm:text-lg font-bold text-white">Markdown Formatting Guide</h3>
                                    </div>
                                    <button
                                        onClick={() => setShowGuide(false)}
                                        className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors"
                                        aria-label="Close guide"
                                    >
                                        <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    </button>
                                </div>

                                <div className="px-4 sm:px-6 py-4 sm:py-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                    {/* Headings */}
                                    <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                                                <span className="text-blue-600 dark:text-blue-400 font-bold">#</span>
                                            </div>
                                            <h4 className="font-bold text-gray-900 dark:text-gray-100">Headings</h4>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div>
                                                <code className="block bg-gray-100 dark:bg-gray-900/50 px-2 py-1 rounded text-xs font-mono mb-1 text-gray-800 dark:text-gray-200"># Heading 1</code>
                                                <code className="block bg-gray-100 dark:bg-gray-900/50 px-2 py-1 rounded text-xs font-mono mb-1 text-gray-800 dark:text-gray-200">## Heading 2</code>
                                                <code className="block bg-gray-100 dark:bg-gray-900/50 px-2 py-1 rounded text-xs font-mono text-gray-800 dark:text-gray-200">### Heading 3</code>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Text Formatting */}
                                    <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                                                <span className="text-purple-600 dark:text-purple-400 font-bold">B</span>
                                            </div>
                                            <h4 className="font-bold text-gray-900 dark:text-gray-100">Text Formatting</h4>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div>
                                                <code className="block bg-gray-100 dark:bg-gray-900/50 px-2 py-1 rounded text-xs font-mono mb-1 text-gray-800 dark:text-gray-200">**Bold text**</code>
                                                <code className="block bg-gray-100 dark:bg-gray-900/50 px-2 py-1 rounded text-xs font-mono mb-1 text-gray-800 dark:text-gray-200">*Italic text*</code>
                                                <code className="block bg-gray-100 dark:bg-gray-900/50 px-2 py-1 rounded text-xs font-mono mb-1 text-gray-800 dark:text-gray-200">***Bold & Italic***</code>
                                                <code className="block bg-gray-100 dark:bg-gray-900/50 px-2 py-1 rounded text-xs font-mono text-gray-800 dark:text-gray-200">`inline code`</code>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Lists */}
                                    <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                                                <span className="text-green-600 dark:text-green-400 font-bold">•</span>
                                            </div>
                                            <h4 className="font-bold text-gray-900 dark:text-gray-100">Lists</h4>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div>
                                                <p className="text-gray-600 dark:text-gray-300 text-xs mb-1 font-medium">Unordered:</p>
                                                <code className="block bg-gray-100 dark:bg-gray-900/50 px-2 py-1 rounded text-xs font-mono mb-2 text-gray-800 dark:text-gray-200">- Item 1<br />- Item 2</code>
                                                <p className="text-gray-600 dark:text-gray-300 text-xs mb-1 font-medium">Ordered:</p>
                                                <code className="block bg-gray-100 dark:bg-gray-900/50 px-2 py-1 rounded text-xs font-mono text-gray-800 dark:text-gray-200">1. First<br />2. Second</code>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Code Blocks */}
                                    <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
                                                <Code className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                            </div>
                                            <h4 className="font-bold text-gray-900 dark:text-gray-100">Code Blocks</h4>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <code className="block bg-gray-100 dark:bg-gray-900/50 px-2 py-1 rounded text-xs font-mono whitespace-pre text-gray-800 dark:text-gray-200">```javascript{'\n'}function hello() {'{'}
                                                console.log("Hi!");
                                                {'}'}{'\n'}```</code>
                                        </div>
                                    </div>

                                    {/* Links & Images */}
                                    <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-500/20 flex items-center justify-center">
                                                <span className="text-cyan-600 dark:text-cyan-400 font-bold">🔗</span>
                                            </div>
                                            <h4 className="font-bold text-gray-900 dark:text-gray-100">Links</h4>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <code className="block bg-gray-100 dark:bg-gray-900/50 px-2 py-1 rounded text-xs font-mono text-gray-800 dark:text-gray-200">[Link text](url)</code>
                                        </div>
                                    </div>

                                    {/* Quotes & Highlights */}
                                    <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-500/20 flex items-center justify-center">
                                                <span className="text-pink-600 dark:text-pink-400 font-bold">"</span>
                                            </div>
                                            <h4 className="font-bold text-gray-900 dark:text-gray-100">Quotes</h4>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <code className="block bg-gray-100 dark:bg-gray-900/50 px-2 py-1 rounded text-xs font-mono text-gray-800 dark:text-gray-200">&gt; Quote text</code>
                                        </div>
                                    </div>

                                    {/* Pro Tips */}
                                    <div className="sm:col-span-2 lg:col-span-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-4 border-2 border-yellow-300 dark:border-yellow-500/30">
                                        <div className="flex flex-col sm:flex-row items-start gap-3">
                                            <Lightbulb className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Pro Tips for Best Answers</h4>
                                                <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                                    <li>✓ <strong>Structure:</strong> Start with a brief overview, then dive into details</li>
                                                    <li>✓ <strong>Code Examples:</strong> Always specify the language for syntax highlighting (```javascript, ```python, etc.)</li>
                                                    <li>✓ <strong>Clarity:</strong> Use headings (###) to organize long answers into sections</li>
                                                    <li>✓ <strong>Emphasis:</strong> Use **bold** for key concepts and *italic* for terminology</li>
                                                    <li>✓ <strong>Lists:</strong> Break down complex topics into bullet points for readability</li>
                                                    <li>✓ <strong>Examples:</strong> Include practical examples to illustrate concepts</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnswerEditor;
