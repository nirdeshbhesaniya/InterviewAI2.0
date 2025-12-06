import React, { useContext } from 'react';
import ChatbotToggle from './ChatbotToggle';
import ChatbotWindow from './ChatbotWindow';
import MobileChatbotWindow from './MobileChatbotWindow';
import { ChatbotContext } from '../../context/ChatBotContext';

const Chatbot = () => {
    const { isOpen } = useContext(ChatbotContext);

    return (
        <>
            {/* Toggle Button */}
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
