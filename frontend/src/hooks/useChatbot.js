import { useState, useCallback } from 'react';
import axios from '../utils/axiosInstance';
import { API } from '../utils/apiPaths';

export const useChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hi! I'm your AI Interview Assistant. I can help you with interview preparation, coding questions, system design, and much more. How can I assist you today?",
            isBot: true,
            timestamp: new Date(),
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    const toggleChatbot = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);

    const closeChatbot = useCallback(() => {
        setIsOpen(false);
    }, []);

    const sendMessage = useCallback(async (userMessage) => {
        if (!userMessage.trim()) return;

        const userMsg = {
            id: Date.now(),
            text: userMessage,
            isBot: false,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const response = await axios.post(API.CHATBOT.ASK, {
                message: userMessage,
                context: 'interview_preparation'
            });

            const botMsg = {
                id: Date.now() + 1,
                text: response.data.response,
                isBot: true,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error('Chatbot error:', error);
            const errorMsg = {
                id: Date.now() + 1,
                text: "I apologize, but I'm having trouble responding right now. Please try again later.",
                isBot: true,
                timestamp: new Date(),
                isError: true,
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearChat = useCallback(() => {
        setMessages([
            {
                id: 1,
                text: "Hi! I'm your AI Interview Assistant. I can help you with interview preparation, coding questions, system design, and much more. How can I assist you today?",
                isBot: true,
                timestamp: new Date(),
            }
        ]);
    }, []);

    return {
        isOpen,
        messages,
        isLoading,
        toggleChatbot,
        closeChatbot,
        sendMessage,
        clearChat,
    };
};