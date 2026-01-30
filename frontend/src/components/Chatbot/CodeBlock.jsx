import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeBlock = ({ inline, className, children, ...props }) => {
    const [copied, setCopied] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    const code = String(children).replace(/\n$/, '');

    // Detect dark mode
    useEffect(() => {
        const checkDarkMode = () => {
            const isDark = document.documentElement.classList.contains('dark');
            setIsDarkMode(isDark);
        };

        // Check initially
        checkDarkMode();

        // Watch for changes
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => observer.disconnect();
    }, []);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    };

    // Inline code
    if (inline) {
        return (
            <code
                className="px-1.5 py-0.5 rounded bg-[rgb(var(--bg-elevated-alt))] text-[rgb(var(--accent))] font-mono text-sm border border-[rgb(var(--border-subtle))]"
                {...props}
            >
                {children}
            </code>
        );
    }

    // Code block - always use dark theme for better readability
    return (
        <div className="relative group my-4 rounded-lg overflow-hidden border border-[rgb(var(--border-subtle))] shadow-sm bg-[#1e1e1e]">
            {/* Header with language badge and copy button */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-[#3d3d3d]">
                <div className="flex items-center space-x-2">
                    {language && (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded bg-[rgb(var(--accent))] text-white uppercase">
                            {language}
                        </span>
                    )}
                    <span className="text-xs text-gray-400">Code</span>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={copyToClipboard}
                    className="flex items-center space-x-1 px-2 py-1 text-xs rounded bg-[#3d3d3d] hover:bg-[#4d4d4d] border border-[#4d4d4d] transition-colors"
                    title="Copy code"
                >
                    {copied ? (
                        <>
                            <Check size={14} className="text-green-500" />
                            <span className="text-green-500">Copied!</span>
                        </>
                    ) : (
                        <>
                            <Copy size={14} className="text-gray-400" />
                            <span className="text-gray-300">Copy</span>
                        </>
                    )}
                </motion.button>
            </div>

            {/* Code content with syntax highlighting */}
            <div className="code-block-wrapper">
                <SyntaxHighlighter
                    style={oneDark}
                    language={language || 'text'}
                    PreTag="div"
                    showLineNumbers={true}
                    wrapLines={true}
                    lineNumberStyle={{
                        minWidth: '3em',
                        paddingRight: '1em',
                        color: '#6e7681',
                        opacity: 0.6,
                        userSelect: 'none',
                    }}
                    customStyle={{
                        margin: 0,
                        padding: '1rem',
                        background: '#1e1e1e',
                        fontSize: '0.875rem',
                        lineHeight: '1.6',
                    }}
                    codeTagProps={{
                        style: {
                            fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
                            color: '#e6edf3',
                        }
                    }}
                    {...props}
                >
                    {code}
                </SyntaxHighlighter>
            </div>
        </div>
    );
};

export default CodeBlock;
