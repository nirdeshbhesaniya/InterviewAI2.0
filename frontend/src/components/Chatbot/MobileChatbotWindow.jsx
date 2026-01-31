import React, { useContext, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    X,
    RotateCcw,
    Bot,
    User,
    Sparkles
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatbotContext } from '../../context/ChatBotContext';
import Icon3D from '../ui/Icon3D';
import CodeBlock from './CodeBlock';
import MessageActions from './MessageActions';

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
    const [feedback, setFeedback] = useState({});
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
                <div className="flex items-center justify-between p-4 chatbot-header-gradient text-white shadow-lg">
                    <div className="flex items-center space-x-3">
                        <Icon3D size="sm" color="secondary" animated={false}>
                            <Bot size={20} />
                        </Icon3D>
                        <div>
                            <h3 className="font-semibold !text-white">AI Interview Assistant</h3>
                            <p className="text-sm !text-white/80 opacity-90">
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
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[rgb(var(--bg-body))] chatbot-messages-container">
                    {messages.length === 1 && (
                        <div className="space-y-4">
                            <div className="text-center text-sm font-medium text-[rgb(var(--text-secondary))] mb-6 flex items-center justify-center gap-2">
                                <Sparkles className="w-5 h-5 text-[rgb(var(--accent))]" />
                                <span>Quick start questions:</span>
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
                                        className="chatbot-quick-question p-4 text-left text-sm font-medium text-[rgb(var(--text-primary))] bg-[rgb(var(--bg-card))] border-2 border-[rgb(var(--border))] rounded-xl hover:border-[rgb(var(--accent))] hover:shadow-md transition-all duration-200"
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
                            <div className={`max-w-[85%] ${message.isBot ? 'order-2' : 'order-1'}`}>
                                <div
                                    className={`rounded-xl p-4 ${message.isBot
                                        ? 'chatbot-bot-message bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border-subtle))] text-[rgb(var(--text-primary))]'
                                        : 'chatbot-user-message text-white bg-[rgb(var(--accent))] shadow-lg'
                                        } ${message.isError ? 'message-status-error border-red-500' : ''}`}
                                >
                                    {message.isBot ? (
                                        <div className="chatbot-markdown prose-sm">
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
                                        <p>{message.text}</p>
                                    )}

                                    <div className="flex items-center justify-between mt-3">
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
                                <div className="chatbot-bot-message rounded-xl p-4 bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border-subtle))] shadow-sm">
                                    <div className="flex space-x-2">
                                        <motion.div className="typing-indicator-dot w-3 h-3 bg-[rgb(var(--accent))] rounded-full" />
                                        <motion.div className="typing-indicator-dot w-3 h-3 bg-[rgb(var(--accent))] rounded-full" />
                                        <motion.div className="typing-indicator-dot w-3 h-3 bg-[rgb(var(--accent))] rounded-full" />
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
                        <div className="flex-1 relative chatbot-input-focus rounded-lg">
                            <textarea
                                ref={inputRef}
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask me anything about interviews..."
                                className="w-full p-4 border-2 border-[rgb(var(--border))] rounded-xl bg-[rgb(var(--bg-body))] text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-secondary))] resize-none focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-[rgb(var(--accent))] transition-all"
                                rows="2"
                                disabled={isLoading}
                            />
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSendMessage()}
                            disabled={!inputMessage.trim() || isLoading}
                            className="px-5 py-4 bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white rounded-xl hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center self-end shadow-lg"
                        >
                            <Send size={22} />
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default MobileChatbotWindow;
