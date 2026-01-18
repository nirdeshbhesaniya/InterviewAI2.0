import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import ChatbotToggle from './ChatbotToggle';
import ChatbotWindow from './ChatbotWindow';
import MobileChatbotWindow from './MobileChatbotWindow';
import { ChatbotContext } from '../../context/ChatBotContext';

const Chatbot = () => {
    const { isOpen, isAuthModalOpen } = useContext(ChatbotContext);
    const location = useLocation();

    // Hide chatbot on MCQ test page OR when Auth Modal is open
    const isMCQTest = location.pathname === '/mcq-test';

    if (isMCQTest || isAuthModalOpen) {
        return null;
    }

    return (
        <>
            {/* Toggle Button - always rendered if not on MCQ test */}
            <ChatbotToggle />

            {/* Desktop Chatbot Window */}
            {isOpen && (
                <div className="hidden md:block">
                    <ChatbotWindow />
                </div>
            )}

            {/* Mobile Chatbot Window */}
            {isOpen && (
                <div className="block md:hidden">
                    <MobileChatbotWindow />
                </div>
            )}
        </>
    );
};

export default Chatbot;
