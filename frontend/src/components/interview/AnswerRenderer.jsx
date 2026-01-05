import React, { useState, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import toast from 'react-hot-toast';
import { Copy, Check } from 'lucide-react';

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

const AnswerRenderer = ({ answer }) => {
    return useMemo(() => {
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
                            a: (props) => <a className="text-blue-600 dark:text-blue-400 hover:underline font-semibold break-all" target="_blank" rel="noopener noreferrer" {...props} />,
                            table: (props) => (
                                <div className="overflow-x-auto my-4 rounded-lg border border-[rgb(var(--border-subtle))]">
                                    <table className="min-w-full divide-y divide-[rgb(var(--border-subtle))] text-sm text-[rgb(var(--text-primary))]" {...props} />
                                </div>
                            ),
                            thead: (props) => <thead className="bg-[rgb(var(--bg-card-alt))]" {...props} />,
                            tbody: (props) => <tbody className="divide-y divide-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))]" {...props} />,
                            tr: (props) => <tr className="hover:bg-[rgb(var(--bg-card-alt))]/50 transition-colors" {...props} />,
                            th: (props) => <th className="px-4 py-3 text-left font-semibold text-[rgb(var(--text-primary))]" {...props} />,
                            td: (props) => <td className="px-4 py-3 align-top text-[rgb(var(--text-secondary))]" {...props} />
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                </div>
            );
        });
    }, [answer]);
};

export default AnswerRenderer;
