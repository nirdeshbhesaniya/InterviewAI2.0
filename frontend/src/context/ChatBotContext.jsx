import React, { createContext, useState } from 'react';
import { useChatbot } from '../hooks/useChatbot';

const ChatbotContext = createContext();

const ChatbotProvider = ({ children }) => {
    const chatbot = useChatbot();
    const [isMinimized, setIsMinimized] = useState(false);

    const minimizeChatbot = () => setIsMinimized(true);
    const expandChatbot = () => setIsMinimized(false);

    const contextValue = {
        ...chatbot,
        isMinimized,
        minimizeChatbot,
        expandChatbot,
    };

    return (
        <ChatbotContext.Provider value={contextValue}>
            {children}
        </ChatbotContext.Provider>
    );
};

export default ChatbotProvider;
export { ChatbotContext };
