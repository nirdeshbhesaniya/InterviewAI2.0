import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Sparkles } from 'lucide-react';
import Icon3D from '../ui/Icon3D';
import { ChatbotContext } from '../../context/ChatBotContext';

const ChatbotToggle = () => {
    const { isOpen, toggleChatbot, isLoading } = useContext(ChatbotContext);

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {!isOpen && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                        <Icon3D
                            size="lg"
                            color="primary"
                            onClick={toggleChatbot}
                            className="relative group shadow-2xl hover:shadow-orange-500/50"
                        >
                            <MessageCircle size={32} className="text-white drop-shadow-lg" />

                            {/* Notification dot for new features */}
                            <motion.div
                                className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Sparkles size={8} className="text-white absolute top-0.5 left-0.5" />
                            </motion.div>

                            {/* Loading indicator */}
                            {isLoading && (
                                <motion.div
                                    className="absolute inset-0 rounded-xl border-2 border-white/30"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                            )}
                        </Icon3D>

                        {/* Tooltip */}
                        <motion.div
                            className="absolute bottom-full right-0 mb-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 0, y: 10 }}
                            whileHover={{ opacity: 1, y: 0 }}
                        >
                            Chat with AI Assistant
                            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Close button when chat is open */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                        <Icon3D
                            size="md"
                            color="dark"
                            onClick={toggleChatbot}
                            className="shadow-xl hover:shadow-gray-700/50"
                        >
                            <X size={24} className="text-white" />
                        </Icon3D>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ChatbotToggle;
