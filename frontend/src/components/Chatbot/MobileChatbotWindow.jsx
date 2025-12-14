import React, { useContext, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    X,
    RotateCcw,
    Bot,
    User,
    Copy,
    Check,
    Sparkles
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { ChatbotContext } from '../../context/ChatBotContext';
import Icon3D from '../ui/Icon3D';

const MobileChatbotWindow = () => {
    const {
        isOpen,
        toggleChatbot,
        messages,
        isLoading,
        sendMessage,
        clearChat,
    } = useContext(ChatbotContext);

    const [inputMessage, setInputMessage] = useState('');
    const [copiedMessageId, setCopiedMessageId] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Quick start questions
    const quickQuestions = [
        "Help me prepare for a technical interview",
        "What are common behavioral interview questions?",
        "Explain system design interview basics",
        "Tips for salary negotiation",
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (message = inputMessage) => {
        if (!message.trim()) return;

        await sendMessage(message);
        setInputMessage('');

        // Focus input after sending
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const copyToClipboard = async (text, messageId) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedMessageId(messageId);
            setTimeout(() => setCopiedMessageId(null), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const formatTimestamp = (date) => {
        return new Date(date).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: '100%' }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: '100%' }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed inset-0 bg-[rgb(var(--bg-body))] z-50 flex flex-col md:hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-[rgb(var(--accent))] text-white shadow-lg">
                    <div className="flex items-center space-x-3">
                        <Icon3D size="sm" color="secondary" animated={false}>
                            <Bot size={20} />
                        </Icon3D>
                        <div>
                            <h3 className="font-semibold text-white">AI Interview Assistant</h3>
                            <p className="text-sm text-white/80 opacity-90">
                                {isLoading ? 'Thinking...' : 'Online'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={clearChat}
                            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                        >
                            <RotateCcw size={20} />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={toggleChatbot}
                            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                        >
                            <X size={20} />
                        </motion.button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[rgb(var(--bg-body))]">
                    {messages.length === 1 && (
                        <div className="space-y-4">
                            <div className="text-center text-[rgb(var(--text-muted))] mb-6">
                                <Sparkles className="inline-block w-5 h-5 mr-2" />
                                Quick start questions:
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                {quickQuestions.map((question, index) => (
                                    <motion.button
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleSendMessage(question)}
                                        className="p-4 text-left text-[rgb(var(--text-primary))] bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-lg hover:border-[rgb(var(--accent))]/50 transition-colors shadow-sm"
                                    >
                                        {question}
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                        >
                            <div className={`max-w-[85%] ${message.isBot ? 'order-2' : 'order-1'}`}>
                                <div
                                    className={`rounded-lg p-4 ${message.isBot
                                        ? 'bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] shadow-sm text-[rgb(var(--text-primary))]'
                                        : 'bg-[rgb(var(--accent))] text-white shadow-lg'
                                        } ${message.isError ? 'border-red-500 bg-red-50' : ''}`}
                                >
                                    {message.isBot ? (
                                        <div className="prose prose-sm max-w-none">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    code: ({ inline, className, children, ...props }) => {
                                                        const match = /language-(\w+)/.exec(className || '');
                                                        return !inline && match ? (
                                                            <SyntaxHighlighter
                                                                style={oneDark}
                                                                language={match[1]}
                                                                PreTag="div"
                                                                className="text-sm"
                                                                {...props}
                                                            >
                                                                {String(children).replace(/\n$/, '')}
                                                            </SyntaxHighlighter>
                                                        ) : (
                                                            <code className={className} {...props}>
                                                                {children}
                                                            </code>
                                                        );
                                                    },
                                                }}
                                            >
                                                {message.text}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <p>{message.text}</p>
                                    )}

                                    <div className="flex items-center justify-between mt-3">
                                        <span className="text-xs text-[rgb(var(--text-muted))] opacity-70">
                                            {formatTimestamp(message.timestamp)}
                                        </span>

                                        {message.isBot && (
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => copyToClipboard(message.text, message.id)}
                                                className="p-2 rounded-md hover:bg-[rgb(var(--bg-elevated-alt))] transition-colors"
                                            >
                                                {copiedMessageId === message.id ? (
                                                    <Check size={16} className="text-green-500" />
                                                ) : (
                                                    <Copy size={16} className="opacity-50" />
                                                )}
                                            </motion.button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className={`${message.isBot ? 'order-1 mr-3' : 'order-2 ml-3'} flex-shrink-0 self-end`}>
                                <Icon3D
                                    size="sm"
                                    color={message.isBot ? 'secondary' : 'primary'}
                                    animated={false}
                                    className="mb-2"
                                >
                                    {message.isBot ? <Bot size={16} /> : <User size={16} />}
                                </Icon3D>
                            </div>
                        </motion.div>
                    ))}

                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start"
                        >
                            <div className="flex items-center space-x-3">
                                <Icon3D size="sm" color="secondary" animated={false}>
                                    <Bot size={16} />
                                </Icon3D>
                                <div className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-lg p-4 shadow-sm">
                                    <div className="flex space-x-2">
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                                            className="w-3 h-3 bg-[rgb(var(--accent))] rounded-full"
                                        />
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                                            className="w-3 h-3 bg-[rgb(var(--accent))] rounded-full"
                                        />
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                                            className="w-3 h-3 bg-[rgb(var(--accent))] rounded-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-[rgb(var(--bg-card))] border-t border-[rgb(var(--border))] shadow-lg">
                    <div className="flex space-x-3">
                        <div className="flex-1 relative">
                            <textarea
                                ref={inputRef}
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask me anything about interviews..."
                                className="w-full p-4 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--bg-body))] text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] resize-none focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent transition-colors"
                                rows="2"
                                disabled={isLoading}
                            />
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSendMessage()}
                            disabled={!inputMessage.trim() || isLoading}
                            className="px-5 py-4 bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center self-end"
                        >
                            <Send size={20} />
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default MobileChatbotWindow;
