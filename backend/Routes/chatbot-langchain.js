const express = require('express');
const router = express.Router();
const { createChatbotChain } = require('../utils/langchain-chains');

// Store chat sessions in memory (use Redis in production)
const chatSessions = new Map();
const sessionTimestamps = new Map();

// Cleanup old sessions every 10 minutes (1 hour max age)
const SESSION_MAX_AGE = 3600000; // 1 hour
setInterval(() => {
    const now = Date.now();
    for (const [sessionId, timestamp] of sessionTimestamps) {
        if (now - timestamp > SESSION_MAX_AGE) {
            chatSessions.delete(sessionId);
            sessionTimestamps.delete(sessionId);
            console.log(`🧹 Cleaned up chat session: ${sessionId}`);
        }
    }
}, 600000); // Every 10 minutes

// POST /api/chatbot/ask
router.post('/ask', async (req, res) => {
    try {
        const { message, context = 'general', sessionId = 'default' } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        // Update session timestamp
        sessionTimestamps.set(sessionId, Date.now());

        // Get or create chat chain for this session
        let chatChain = chatSessions.get(sessionId);
        if (!chatChain) {
            chatChain = await createChatbotChain(sessionId);
            chatSessions.set(sessionId, chatChain);
            console.log(`✨ Created new chat session: ${sessionId}`);
        }

        // Invoke the chain with the user's message
        const response = await chatChain.invoke({
            input: message
        });

        res.json({
            success: true,
            response: response.response,
            timestamp: new Date().toISOString(),
            sessionId: sessionId
        });

    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate response',
            error: error.message
        });
    }
});

// POST /api/chatbot/clear - Clear chat history
router.post('/clear', async (req, res) => {
    try {
        const { sessionId = 'default' } = req.body;

        if (chatSessions.has(sessionId)) {
            chatSessions.delete(sessionId);
        }

        res.json({
            success: true,
            message: 'Chat history cleared'
        });
    } catch (error) {
        console.error('Clear chat error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear chat history',
            error: error.message
        });
    }
});

// GET /api/chatbot/sessions - Get active sessions
router.get('/sessions', async (req, res) => {
    try {
        const activeSessions = Array.from(chatSessions.keys());

        res.json({
            success: true,
            sessions: activeSessions,
            count: activeSessions.length
        });
    } catch (error) {
        console.error('Get sessions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get sessions',
            error: error.message
        });
    }
});

module.exports = router;
