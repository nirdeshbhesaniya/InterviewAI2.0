import React from 'react';
import { motion } from 'framer-motion';
import { Copy, RotateCcw, ThumbsUp, ThumbsDown, Check } from 'lucide-react';

const MessageActions = ({
    message,
    onCopy,
    onRegenerate,
    onFeedback,
    copied,
    feedback
}) => {
    return (
        <div className="flex items-center space-x-1 mt-2">
            {/* Copy button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onCopy(message.text, message.id)}
                className="p-1.5 rounded-md hover:bg-[rgb(var(--bg-elevated-alt))] transition-colors group"
                title="Copy message"
            >
                {copied === message.id ? (
                    <Check size={14} className="text-green-500" />
                ) : (
                    <Copy size={14} className="text-[rgb(var(--text-muted))] group-hover:text-[rgb(var(--text-secondary))]" />
                )}
            </motion.button>

            {/* Regenerate button (only for bot messages) */}
            {message.isBot && onRegenerate && (
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onRegenerate(message.id)}
                    className="p-1.5 rounded-md hover:bg-[rgb(var(--bg-elevated-alt))] transition-colors group"
                    title="Regenerate response"
                >
                    <RotateCcw size={14} className="text-[rgb(var(--text-muted))] group-hover:text-[rgb(var(--text-secondary))]" />
                </motion.button>
            )}

            {/* Feedback buttons (only for bot messages) */}
            {message.isBot && onFeedback && (
                <>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onFeedback(message.id, 'up')}
                        className={`p-1.5 rounded-md hover:bg-[rgb(var(--bg-elevated-alt))] transition-colors group ${feedback?.[message.id] === 'up' ? 'bg-green-100 dark:bg-green-900/20' : ''
                            }`}
                        title="Helpful"
                    >
                        <ThumbsUp
                            size={14}
                            className={`${feedback?.[message.id] === 'up'
                                    ? 'text-green-500 fill-green-500'
                                    : 'text-[rgb(var(--text-muted))] group-hover:text-[rgb(var(--text-secondary))]'
                                }`}
                        />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onFeedback(message.id, 'down')}
                        className={`p-1.5 rounded-md hover:bg-[rgb(var(--bg-elevated-alt))] transition-colors group ${feedback?.[message.id] === 'down' ? 'bg-red-100 dark:bg-red-900/20' : ''
                            }`}
                        title="Not helpful"
                    >
                        <ThumbsDown
                            size={14}
                            className={`${feedback?.[message.id] === 'down'
                                    ? 'text-red-500 fill-red-500'
                                    : 'text-[rgb(var(--text-muted))] group-hover:text-[rgb(var(--text-secondary))]'
                                }`}
                        />
                    </motion.button>
                </>
            )}
        </div>
    );
};

export default MessageActions;
