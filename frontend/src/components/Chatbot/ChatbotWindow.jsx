import React, { useContext, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    Minimize2,
    Maximize2,
    RotateCcw,
    Bot,
    User,
    Sparkles,
    X
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatbotContext } from '../../context/ChatBotContext';
import Icon3D from '../ui/Icon3D';
import CodeBlock from './CodeBlock';
import MessageActions from './MessageActions';

const ChatbotWindow = () => {
    const {
        isOpen,
        messages,
        isLoading,
        sendMessage,
        clearChat,
        isMinimized,
        minimizeChatbot,
        expandChatbot,
        closeChatbot,
    } = useContext(ChatbotContext);

    const [inputMessage, setInputMessage] = useState('');
    const [copiedMessageId, setCopiedMessageId] = useState(null);
    const [feedback, setFeedback] = useState({});
    const [isFullScreen, setIsFullScreen] = useState(false);
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

    const handleFeedback = (messageId, type) => {
        setFeedback(prev => ({
            ...prev,
            [messageId]: prev[messageId] === type ? null : type
        }));
    };

    const handleRegenerate = async (messageId) => {
        // Find the user message before this bot message
        const messageIndex = messages.findIndex(m => m.id === messageId);
        if (messageIndex > 0) {
            const previousUserMessage = messages[messageIndex - 1];
            if (!previousUserMessage.isBot) {
                await sendMessage(previousUserMessage.text);
            }
        }
    };

    const formatTimestamp = (date) => {
        const now = new Date();
        const messageDate = new Date(date);
        const diffInSeconds = Math.floor((now - messageDate) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;

        return messageDate.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
        if (isMinimized) expandChatbot();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    y: isFullScreen ? 0 : 0,
                    x: isFullScreen ? 0 : 0,
                    height: isFullScreen ? '100vh' : (isMinimized ? '60px' : '600px'),
                    width: isFullScreen ? '100vw' : (window.innerWidth < 768 ? 'calc(100vw - 2rem)' : '420px'),
                    borderRadius: isFullScreen ? 0 : '0.75rem',
                    bottom: isFullScreen ? 0 : (window.innerWidth < 640 ? '1rem' : '1.5rem'),
                    right: isFullScreen ? 0 : (window.innerWidth < 640 ? '1rem' : '1.5rem'),
                }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={`fixed z-50 flex flex-col overflow-hidden bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))] shadow-2xl ${!isFullScreen && 'rounded-xl'}`}
                style={{
                    maxHeight: isFullScreen ? '100vh' : '80vh',
                    minHeight: isMinimized ? '60px' : '400px',
                    maxWidth: isFullScreen ? '100vw' : (window.innerWidth < 768 ? 'calc(100vw - 2rem)' : '420px')
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 chatbot-header-gradient text-white">
                    <div className="flex items-center space-x-3">
                        <Icon3D size="sm" color="secondary" animated={false}>
                            <Bot size={16} />
                        </Icon3D>
                        <div>
                            <h3 className="font-semibold text-sm !text-white">AI Interview Assistant</h3>
                            <p className="text-xs !text-white/90">
                                {isLoading ? 'Thinking...' : 'Online'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* Full Screen Toggle (Desktop Only) */}
                        <div className="hidden md:block">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={toggleFullScreen}
                                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors mr-1"
                                title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                            >
                                {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                            </motion.button>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={isMinimized ? expandChatbot : minimizeChatbot}
                            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                            title={isMinimized ? "Expand" : "Minimize"}
                        >
                            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={clearChat}
                            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                            title="Clear Chat"
                        >
                            <RotateCcw size={16} />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={closeChatbot}
                            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors hover:bg-red-500/20"
                            title="Close"
                        >
                            <X size={16} />
                        </motion.button>
                    </div>
                </div>

                {!isMinimized && (
                    <>
                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[rgb(var(--bg-body))] chatbot-messages-container">
                            {messages.length === 0 && (
                                <div className="space-y-3">
                                    <div className="text-center text-sm font-medium text-[rgb(var(--text-secondary))] mb-4 flex items-center justify-center gap-2">
                                        <Sparkles className="w-4 h-4 text-[rgb(var(--accent))]" />
                                        <span>Quick start questions:</span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        {quickQuestions.map((question, index) => (
                                            <motion.button
                                                key={index}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleSendMessage(question)}
                                                className="chatbot-quick-question p-3 text-left text-sm font-medium bg-[rgb(var(--bg-card))] border-2 border-[rgb(var(--border))] rounded-xl hover:border-[rgb(var(--accent))] hover:shadow-md transition-all duration-200 text-[rgb(var(--text-primary))]"
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
                                    className={`chatbot-message flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                                >
                                    <div className={`max-w-[85%] ${message.isBot ? 'order-2' : 'order-1'} ${isFullScreen && 'text-lg'}`}>
                                        <div
                                            className={`rounded-xl p-4 ${message.isBot
                                                    ? 'bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border-subtle))] text-[rgb(var(--text-primary))] shadow-sm'
                                                    : 'bg-[rgb(var(--accent))] text-white shadow-lg'
                                                } ${message.isError ? 'border-red-500 bg-red-50' : ''}`}
                                        >
                                            {message.isBot ? (
                                                <div className={`chatbot-markdown ${isFullScreen ? 'prose-lg' : 'prose-sm'}`}>
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            code: ({ inline, className, children, ...props }) => (
                                                                <CodeBlock
                                                                    inline={inline}
                                                                    className={className}
                                                                    {...props}
                                                                >
                                                                    {children}
                                                                </CodeBlock>
                                                            ),
                                                        }}
                                                    >
                                                        {message.text}
                                                    </ReactMarkdown>
                                                </div>
                                            ) : (
                                                <p className={isFullScreen ? 'text-base' : 'text-sm'}>{message.text}</p>
                                            )}

                                            <div className="flex items-center justify-between mt-2">
                                                <span className="chatbot-timestamp">
                                                    {formatTimestamp(message.timestamp)}
                                                </span>

                                                {message.isBot && (
                                                    <MessageActions
                                                        message={message}
                                                        onCopy={copyToClipboard}
                                                        onRegenerate={handleRegenerate}
                                                        onFeedback={handleFeedback}
                                                        copied={copiedMessageId}
                                                        feedback={feedback}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`${message.isBot ? 'order-1 mr-2' : 'order-2 ml-2'} flex-shrink-0`}>
                                        <Icon3D
                                            size={isFullScreen ? "md" : "sm"}
                                            color={message.isBot ? 'secondary' : 'primary'}
                                            animated={false}
                                        >
                                            {message.isBot ? <Bot size={isFullScreen ? 24 : 16} /> : <User size={isFullScreen ? 24 : 16} />}
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
                                    <div className="flex items-center space-x-2">
                                        <Icon3D size="sm" color="secondary" animated={false}>
                                            <Bot size={16} />
                                        </Icon3D>
                                        <div className="bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border-subtle))] rounded-xl p-3 shadow-sm">
                                            <div className="flex space-x-2">
                                                <motion.div className="typing-indicator-dot w-2 h-2 bg-[rgb(var(--accent))] rounded-full" />
                                                <motion.div className="typing-indicator-dot w-2 h-2 bg-[rgb(var(--accent))] rounded-full" />
                                                <motion.div className="typing-indicator-dot w-2 h-2 bg-[rgb(var(--accent))] rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-[rgb(var(--bg-card))] border-t border-[rgb(var(--border-subtle))]">
                            <div className="flex space-x-2">
                                <div className="flex-1 relative chatbot-input-focus rounded-lg">
                                    <textarea
                                        ref={inputRef}
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Ask me anything about interviews..."
                                        className="w-full p-3 border-2 border-[rgb(var(--border))] rounded-xl bg-[rgb(var(--bg-body))] text-[rgb(var(--text-primary))] resize-none focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-[rgb(var(--accent))] transition-all placeholder:text-[rgb(var(--text-secondary))]"
                                        rows="1"
                                        style={{ minHeight: '44px', maxHeight: '120px' }}
                                        disabled={isLoading}
                                    />
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleSendMessage()}
                                    disabled={!inputMessage.trim() || isLoading}
                                    className="px-4 py-3 bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
                                >
                                    <Send size={18} />
                                </motion.button>
                            </div>
                        </div>
                    </>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

export default ChatbotWindow;
