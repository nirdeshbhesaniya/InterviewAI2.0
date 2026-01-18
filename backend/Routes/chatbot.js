const express = require('express');
const { chatWithAI } = require('../utils/gemini');
const { authenticateToken } = require('../middlewares/auth'); // Import auth middleware
const router = express.Router();

// POST /api/chatbot/ask
router.post('/ask', authenticateToken, async (req, res) => {
    try {
        const { message, context = 'general' } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        const response = await chatWithAI(message, context);

        // Log AI Usage
        if (req.user) {
            const { logAIUsage } = require('../utils/aiLogger');
            logAIUsage(
                req.user._id,
                'openrouter', // Provider
                'gpt-4o-mini', // Model
                'success',
                message.length + response.length, // Rough token estimate (chars/4 approx)
                'CHATBOT',
                { context, messageLength: message.length }
            );
        }

        res.json({
            success: true,
            response: response,
            timestamp: new Date().toISOString()
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

module.exports = router;