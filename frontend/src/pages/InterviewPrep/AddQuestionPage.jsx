
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Plus,
    Type,
    Code,
    Image as ImageIcon,
    List,
    Trash2,
    MoveUp,
    MoveDown,
    Heading,
    AlignLeft,
    CheckCircle,
    Eye,
    EyeOff,
    Monitor,
    Smartphone,
    GripVertical
} from 'lucide-react';
import axios from '../../utils/axiosInstance';
import { API } from '../../utils/apiPaths';
import toast, { Toaster } from 'react-hot-toast';
import { ButtonLoader } from '../../components/ui/Loader';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

// Block Types
const BLOCK_TYPES = {
    HEADING: 'heading',
    PARAGRAPH: 'paragraph',
    CODE: 'code',
    IMAGE: 'image',
    LIST: 'list'
};

const AddQuestionPage = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();

    // ==================== STATE ====================
    const [question, setQuestion] = useState('');
    const [sessionTitle, setSessionTitle] = useState(''); // New state for session title
    const [blocks, setBlocks] = useState([
        { id: '1', type: BLOCK_TYPES.PARAGRAPH, content: '' }
    ]);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'preview' for mobile
    const [showPreviewInfo, setShowPreviewInfo] = useState(true);

    // ==================== EFFECTS ====================
    // Fetch session details to show where we are adding questions
    useEffect(() => {
        const fetchSession = async () => {
            try {
                const res = await axios.get(API.INTERVIEW.GET_ONE(sessionId));
                setSessionTitle(res.data.title || 'Session');
            } catch (err) {
                console.error("Failed to fetch session:", err);
            }
        };
        if (sessionId) fetchSession();
    }, [sessionId]);

    // ==================== HANDLERS ====================

    const addBlock = (type) => {
        const newBlock = {
            id: crypto.randomUUID(),
            type,
            content: '',
            language: type === BLOCK_TYPES.CODE ? 'javascript' : undefined,
            items: type === BLOCK_TYPES.LIST ? [''] : undefined
        };
        setBlocks([...blocks, newBlock]);
        // Auto-switch to editor tab on mobile if adding block
        setActiveTab('editor');
    };

    const removeBlock = (id) => {
        if (blocks.length === 1) {
            toast.error("At least one block is required");
            return;
        }
        setBlocks(blocks.filter(b => b.id !== id));
    };

    const moveBlock = (index, direction) => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === blocks.length - 1) return;

        const newBlocks = [...blocks];
        const temp = newBlocks[index];
        newBlocks[index] = newBlocks[index + (direction === 'up' ? -1 : 1)];
        newBlocks[index + (direction === 'up' ? -1 : 1)] = temp;
        setBlocks(newBlocks);
    };

    const updateBlock = (id, field, value) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, [field]: value } : b));
    };

    const updateListItem = (blockId, itemIndex, value) => {
        setBlocks(blocks.map(b => {
            if (b.id !== blockId) return b;
            const newItems = [...b.items];
            newItems[itemIndex] = value;
            return { ...b, items: newItems };
        }));
    };

    const addListItem = (blockId) => {
        setBlocks(blocks.map(b => {
            if (b.id !== blockId) return b;
            return { ...b, items: [...b.items, ''] };
        }));
    };

    const removeListItem = (blockId, itemIndex) => {
        setBlocks(blocks.map(b => {
            if (b.id !== blockId) return b;
            if (b.items.length === 1) return b;
            return { ...b, items: b.items.filter((_, i) => i !== itemIndex) };
        }));
    };

    const handleSave = async () => {
        if (!question.trim()) {
            toast.error('Question title is required');
            return;
        }

        const isEmpty = blocks.every(b => {
            if (b.type === BLOCK_TYPES.LIST) return b.items.every(i => !i.trim());
            return !b.content.trim();
        });

        if (isEmpty) {
            toast.error('Please add some content to the answer');
            return;
        }

        setSaving(true);
        toast.loading('Saving question...', { id: 'save' });

        try {
            // Convert blocks to answerParts format
            const answerParts = blocks.map(block => {
                switch (block.type) {
                    case BLOCK_TYPES.HEADING:
                        return { type: 'text', content: `## ${block.content}` };
                    case BLOCK_TYPES.PARAGRAPH:
                        return { type: 'text', content: block.content };
                    case BLOCK_TYPES.CODE:
                        return { type: 'code', content: block.content, language: block.language };
                    case BLOCK_TYPES.IMAGE:
                        return { type: 'text', content: `![Image](${block.content})` };
                    case BLOCK_TYPES.LIST:
                        return { type: 'text', content: block.items.map(item => `- ${item}`).join('\n') };
                    default:
                        return null;
                }
            }).filter(Boolean);

            await axios.post(API.INTERVIEW.ADD_QUESTION(sessionId), {
                question,
                answerParts
            });

            toast.success('Question added successfully!', { id: 'save' });

            setTimeout(() => {
                navigate(`/interview-prep/${sessionId}`, {
                    state: { updated: true }
                });
            }, 1000);
        } catch (error) {
            toast.error('Failed to add question', { id: 'save' });
            console.error('Save error:', error);
        } finally {
            setSaving(false);
        }
    };

    // ==================== PREVIEW GENERATOR ====================
    const generatedMarkdown = useMemo(() => {
        return blocks.map(block => {
            switch (block.type) {
                case BLOCK_TYPES.HEADING:
                    return `## ${block.content || 'Heading'}`;
                case BLOCK_TYPES.PARAGRAPH:
                    return block.content || 'Start typing...';
                case BLOCK_TYPES.CODE:
                    return `\`\`\`${block.language || 'javascript'}\n${block.content || '// Code here'}\n\`\`\``;
                case BLOCK_TYPES.IMAGE:
                    return block.content ? `![Image](${block.content})` : '';
                case BLOCK_TYPES.LIST:
                    if (!block.items || block.items.length === 0) return '- List item';
                    return block.items.map(item => `- ${item || 'Item'}`).join('\n');
                default:
                    return '';
            }
        }).join('\n\n');
    }, [blocks]);

    // ==================== COMPONENT RENDERS ====================

    const renderBlockInput = (block, index) => {
        switch (block.type) {
            case BLOCK_TYPES.HEADING:
                return (
                    <input
                        type="text"
                        value={block.content}
                        onChange={(e) => updateBlock(block.id, 'content', e.target.value)}
                        placeholder="Heading Text"
                        className="w-full bg-transparent text-xl font-bold text-[rgb(var(--text-primary))] placeholder-[rgb(var(--text-muted))]/50 border-none outline-none focus:ring-0 px-0"
                    />
                );
            case BLOCK_TYPES.PARAGRAPH:
                return (
                    <textarea
                        value={block.content}
                        onChange={(e) => updateBlock(block.id, 'content', e.target.value)}
                        placeholder="Type your paragraph text here..."
                        className="w-full bg-transparent text-[rgb(var(--text-primary))] placeholder-[rgb(var(--text-muted))]/50 border-none outline-none focus:ring-0 resize-none min-h-[80px]"
                        style={{ height: 'auto', minHeight: '80px' }}
                    />
                );
            case BLOCK_TYPES.CODE:
                return (
                    <div className="space-y-2">
                        <div className="flex justify-end">
                            <select
                                value={block.language}
                                onChange={(e) => updateBlock(block.id, 'language', e.target.value)}
                                className="bg-[rgb(var(--bg-card-alt))] text-[rgb(var(--text-secondary))] text-xs rounded-md border border-[rgb(var(--border))] py-1 px-2 focus:ring-2 focus:ring-[rgb(var(--primary))]"
                            >
                                <option value="javascript">JavaScript</option>
                                <option value="python">Python</option>
                                <option value="java">Java</option>
                                <option value="cpp">C++</option>
                                <option value="html">HTML</option>
                                <option value="css">CSS</option>
                                <option value="sql">SQL</option>
                            </select>
                        </div>
                        <textarea
                            value={block.content}
                            onChange={(e) => updateBlock(block.id, 'content', e.target.value)}
                            placeholder="// Enter code here..."
                            className="w-full bg-[rgb(var(--bg-body-alt))] p-3 rounded-lg font-mono text-sm text-[rgb(var(--text-primary))] border border-[rgb(var(--border))] focus:border-[rgb(var(--accent))] outline-none resize-none min-h-[120px]"
                            spellCheck="false"
                        />
                    </div>
                );
            case BLOCK_TYPES.IMAGE:
                return (
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={block.content}
                                onChange={(e) => updateBlock(block.id, 'content', e.target.value)}
                                placeholder="Paste image URL here..."
                                className="flex-1 bg-[rgb(var(--bg-body-alt))] px-3 py-2 rounded-lg text-sm text-[rgb(var(--text-primary))] border border-[rgb(var(--border))] focus:outline-none focus:border-[rgb(var(--accent))]"
                            />
                        </div>
                        {block.content && (
                            <div className="relative aspect-video rounded-lg overflow-hidden bg-black/5 border border-[rgb(var(--border))]">
                                <img
                                    src={block.content}
                                    alt="Preview"
                                    className="w-full h-full object-contain"
                                    onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=Invalid+Image+URL'; }}
                                />
                            </div>
                        )}
                    </div>
                );
            case BLOCK_TYPES.LIST:
                return (
                    <div className="space-y-2">
                        {block.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 group/item">
                                <div className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--text-muted))]" />
                                <input
                                    type="text"
                                    value={item}
                                    onChange={(e) => updateListItem(block.id, idx, e.target.value)}
                                    placeholder="List item..."
                                    className="flex-1 bg-transparent text-[rgb(var(--text-primary))] border-b border-transparent focus:border-[rgb(var(--border))] outline-none py-1"
                                />
                                <button
                                    onClick={() => removeListItem(block.id, idx)}
                                    className="p-1 text-[rgb(var(--text-muted))] hover:text-red-500 transition-opacity"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={() => addListItem(block.id)}
                            className="text-xs text-[rgb(var(--accent))] font-medium hover:underline pl-4 flex items-center gap-1"
                        >
                            <Plus className="w-3 h-3" /> Add Item
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[rgb(var(--bg-body))] transition-colors duration-300">
            <Toaster position="top-right" />

            {/* Header */}
            <header className="sticky top-0 z-40 bg-[rgb(var(--bg-card))]/80 backdrop-blur-md border-b border-[rgb(var(--border))] shadow-sm">
                <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-[rgb(var(--bg-card-alt))] rounded-lg transition-colors text-[rgb(var(--text-secondary))]"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-lg font-bold text-[rgb(var(--text-primary))]">
                                    Add Question
                                </h1>
                                <p className="text-xs text-[rgb(var(--text-muted))] hidden sm:block">
                                    Adding to: <span className="font-semibold text-[rgb(var(--text-primary))]">{sessionTitle || 'Loading...'}</span>
                                </p>
                            </div>
                        </div>

                        {/* Mobile Tab Switcher */}
                        <div className="flex lg:hidden bg-[rgb(var(--bg-card-alt))] rounded-lg p-1 border border-[rgb(var(--border))]">
                            <button
                                onClick={() => setActiveTab('editor')}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'editor'
                                    ? 'bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-primary))] shadow-sm'
                                    : 'text-[rgb(var(--text-muted))]'
                                    }`}
                            >
                                Editor
                            </button>
                            <button
                                onClick={() => setActiveTab('preview')}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'preview'
                                    ? 'bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-primary))] shadow-sm'
                                    : 'text-[rgb(var(--text-muted))]'
                                    }`}
                            >
                                Preview
                            </button>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2 bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/90 text-white rounded-lg text-sm font-bold shadow-lg shadow-[rgb(var(--primary))]/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? <ButtonLoader text="Saving..." /> : <><Save className="w-4 h-4" /> <span className="hidden sm:inline">Save Question</span></>}
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* LEFT COLUMN: EDITOR */}
                    <div className={`space-y-6 ${activeTab === 'editor' ? 'block' : 'hidden lg:block'}`}>
                        {/* Question Title Input */}
                        <section className="bg-[rgb(var(--bg-card))] rounded-xl p-6 shadow-sm border border-[rgb(var(--border))]">
                            <label className="text-xs font-bold text-[rgb(var(--text-muted))] uppercase tracking-wider mb-2 block">
                                Question Title
                            </label>
                            <input
                                type="text"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="e.g., Explain the Event Loop in JavaScript"
                                className="w-full bg-transparent text-xl sm:text-2xl font-bold text-[rgb(var(--text-primary))] placeholder-[rgb(var(--text-muted))]/50 border-none outline-none focus:ring-0 px-0"
                                autoFocus
                            />
                        </section>

                        {/* Blocks List */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <span className="text-xs font-bold text-[rgb(var(--text-muted))] uppercase tracking-wider">Answer Blocks</span>
                                <span className="text-xs text-[rgb(var(--text-muted))]">{blocks.length} blocks</span>
                            </div>

                            <AnimatePresence mode='popLayout'>
                                {blocks.map((block, index) => (
                                    <motion.div
                                        key={block.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="group flex bg-[rgb(var(--bg-card))] rounded-xl border border-[rgb(var(--border))] shadow-sm hover:shadow-md transition-all overflow-hidden"
                                    >
                                        {/* Drag Handle / Controls (Left Sidebar) */}
                                        <div className="w-10 flex-none flex flex-col items-center justify-center gap-1 border-r border-[rgb(var(--border))] bg-[rgb(var(--bg-card-alt))]/50">
                                            <button
                                                onClick={() => moveBlock(index, 'up')}
                                                disabled={index === 0}
                                                className="p-1 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] disabled:opacity-20 transition-colors"
                                            >
                                                <MoveUp className="w-3 h-3" />
                                            </button>
                                            <div className="cursor-grab active:cursor-grabbing p-1">
                                                <GripVertical className="w-4 h-4 text-[rgb(var(--text-muted))]/50" />
                                            </div>
                                            <button
                                                onClick={() => moveBlock(index, 'down')}
                                                disabled={index === blocks.length - 1}
                                                className="p-1 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] disabled:opacity-20 transition-colors"
                                            >
                                                <MoveDown className="w-3 h-3" />
                                            </button>
                                        </div>

                                        {/* Content Area */}
                                        <div className="flex-1 p-5 sm:p-6 relative min-w-0" onClick={(e) => e.stopPropagation()}>

                                            {/* Delete Button (Top Right absolute within content area) */}
                                            <button
                                                onClick={() => removeBlock(block.id)}
                                                className="absolute top-2 right-2 p-1.5 text-[rgb(var(--text-muted))] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all z-10"
                                                title="Delete block"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>

                                            <div className="mb-3 flex items-center gap-2 select-none pr-8">
                                                <span className={`
                                                    inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border
                                                    ${block.type === BLOCK_TYPES.HEADING ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30' : ''}
                                                    ${block.type === BLOCK_TYPES.PARAGRAPH ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30' : ''}
                                                    ${block.type === BLOCK_TYPES.CODE ? 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30' : ''}
                                                    ${block.type === BLOCK_TYPES.IMAGE ? 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-500/20 dark:text-pink-300 dark:border-pink-500/30' : ''}
                                                    ${block.type === BLOCK_TYPES.LIST ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/30' : ''}
                                                `}>
                                                    {block.type === BLOCK_TYPES.HEADING && <Heading className="w-3 h-3" />}
                                                    {block.type === BLOCK_TYPES.PARAGRAPH && <AlignLeft className="w-3 h-3" />}
                                                    {block.type === BLOCK_TYPES.CODE && <Code className="w-3 h-3" />}
                                                    {block.type === BLOCK_TYPES.IMAGE && <ImageIcon className="w-3 h-3" />}
                                                    {block.type === BLOCK_TYPES.LIST && <List className="w-3 h-3" />}
                                                    {block.type}
                                                </span>
                                            </div>
                                            {renderBlockInput(block, index)}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: PREVIEW */}
                    <div className={`lg:block ${activeTab === 'preview' ? 'block' : 'hidden'}`}>
                        <div className="sticky top-24 space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <span className="text-xs font-bold text-[rgb(var(--text-muted))] uppercase tracking-wider flex items-center gap-2">
                                    <Monitor className="w-3 h-3" /> Live Preview
                                </span>
                                {question && <span className="text-xs text-[rgb(var(--text-muted))] truncate max-w-[200px]">{question}</span>}
                            </div>

                            <div className="bg-[rgb(var(--bg-card))] rounded-2xl shadow-xl border border-[rgb(var(--border))] overflow-hidden min-h-[500px] max-h-[calc(100vh-140px)] flex flex-col">
                                {/* Mock Window Header */}
                                <div className="bg-[rgb(var(--bg-card-alt))] px-4 py-2 border-b border-[rgb(var(--border))] flex items-center gap-2">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-400/80"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-400/80"></div>
                                    </div>
                                    <div className="flex-1 text-center">
                                        <span className="text-[10px] sm:text-xs font-medium text-[rgb(var(--text-muted))] bg-[rgb(var(--bg-elevated))] px-2 py-0.5 rounded-full">
                                            Preview Mode
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1 bg-[rgb(var(--bg-card))]">
                                    <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
                                        <h1 className="mb-6 text-[rgb(var(--text-primary))]"><span className={question ? "" : "opacity-50 text-[rgb(var(--text-muted))]"}>{question || "Question Title..."}</span></h1>

                                        <ReactMarkdown
                                            children={generatedMarkdown}
                                            remarkPlugins={[remarkGfm]}
                                            rehypePlugins={[rehypeHighlight]}
                                            components={{
                                                p: (props) => (
                                                    <p className="mb-4 leading-relaxed text-[rgb(var(--text-secondary))]" {...props} />
                                                ),
                                                h1: (props) => (
                                                    <h1 className="text-3xl font-extrabold mt-6 mb-4 text-[rgb(var(--text-primary))]" {...props} />
                                                ),
                                                h2: (props) => (
                                                    <h2 className="text-2xl font-bold mt-5 mb-3 text-[rgb(var(--text-primary))]" {...props} />
                                                ),
                                                h3: (props) => (
                                                    <h3 className="text-xl font-bold mt-4 mb-2 text-[rgb(var(--text-primary))]" {...props} />
                                                ),
                                                ul: (props) => (
                                                    <ul className="list-disc pl-6 mb-4 space-y-2 text-[rgb(var(--text-secondary))]" {...props} />
                                                ),
                                                ol: (props) => (
                                                    <ol className="list-decimal pl-6 mb-4 space-y-2 text-[rgb(var(--text-secondary))]" {...props} />
                                                ),
                                                li: (props) => (
                                                    <li className="text-[rgb(var(--text-secondary))] leading-relaxed" {...props} />
                                                ),
                                                strong: (props) => (
                                                    <strong className="font-extrabold text-[rgb(var(--text-primary))]" {...props} />
                                                ),
                                                code({ node, inline, className, children, ...props }) {
                                                    const match = /language-(\w+)/.exec(className || '')
                                                    return !inline && match ? (
                                                        <div className="relative group my-4 rounded-lg overflow-hidden border border-[rgb(var(--border))] shadow-sm">
                                                            <div className="bg-[#252526] px-4 py-2 text-xs font-mono font-semibold uppercase text-gray-400 flex justify-between items-center">
                                                                <span>{match[1]}</span>
                                                            </div>
                                                            <div className="p-4 bg-[#1e1e1e] overflow-x-auto">
                                                                <code className={className} {...props}>
                                                                    {children}
                                                                </code>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <code className="bg-[rgb(var(--bg-card-alt))] px-1.5 py-0.5 rounded text-sm font-mono font-semibold text-[rgb(var(--accent))]" {...props}>
                                                            {children}
                                                        </code>
                                                    )
                                                },
                                                blockquote: (props) => (
                                                    <blockquote className="border-l-4 border-[rgb(var(--accent))] bg-[rgb(var(--accent))]/5 pl-4 py-2 my-4 italic rounded-r-lg text-[rgb(var(--text-secondary))]" {...props} />
                                                ),
                                                img: (props) => (
                                                    <img {...props} className="rounded-lg border border-[rgb(var(--border))] shadow-sm max-h-[400px] object-contain bg-black/5" />
                                                )
                                            }}
                                        />

                                        {!generatedMarkdown && (
                                            <div className="flex flex-col items-center justify-center py-10 text-[rgb(var(--text-muted))] border-2 border-dashed border-[rgb(var(--border))] rounded-xl mt-4">
                                                <Eye className="w-8 h-8 mb-2 opacity-60" />
                                                <p className="text-sm font-medium opacity-70">Start adding blocks to see preview</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Add Block Toolbar (Floating at bottom center) */}
                <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 transition-transform duration-300 ${activeTab === 'preview' ? 'translate-y-32' : 'translate-y-0'}`}>
                    <div className="bg-[rgb(var(--bg-elevated))] dark:bg-[#1a1f2e] border border-[rgb(var(--border))] shadow-2xl shadow-black/20 rounded-2xl p-2 flex items-center gap-1.5 sm:gap-2 backdrop-blur-md">
                        <TooltipButton icon={Type} label="Text" color="text-blue-500" onClick={() => addBlock(BLOCK_TYPES.PARAGRAPH)} />
                        <div className="w-px h-8 bg-[rgb(var(--border))]" />
                        <TooltipButton icon={Heading} label="Header" color="text-purple-500" onClick={() => addBlock(BLOCK_TYPES.HEADING)} />
                        <div className="w-px h-8 bg-[rgb(var(--border))]" />
                        <TooltipButton icon={Code} label="Code" color="text-orange-500" onClick={() => addBlock(BLOCK_TYPES.CODE)} />
                        <div className="w-px h-8 bg-[rgb(var(--border))]" />
                        <TooltipButton icon={List} label="List" color="text-green-500" onClick={() => addBlock(BLOCK_TYPES.LIST)} />
                        <div className="w-px h-8 bg-[rgb(var(--border))]" />
                        <TooltipButton icon={ImageIcon} label="Image" color="text-pink-500" onClick={() => addBlock(BLOCK_TYPES.IMAGE)} />
                    </div>
                </div>
            </main>
        </div>
    );
};

const TooltipButton = ({ icon: Icon, label, color, onClick }) => (
    <button
        onClick={onClick}
        className="group relative p-2.5 sm:p-3 hover:bg-[rgb(var(--bg-card-alt))] rounded-xl transition-all flex flex-col items-center justify-center min-w-[50px] sm:min-w-[60px]"
    >
        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${color} mb-1 sm:mb-1.5 transition-transform group-hover:scale-110`} />
        <span className="text-[9px] sm:text-[10px] font-bold text-[rgb(var(--text-secondary))] group-hover:text-[rgb(var(--text-primary))]">{label}</span>
    </button>
);

export default AddQuestionPage;
