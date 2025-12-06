const express = require('express');
const { chatWithAI } = require('../utils/gemini');
const router = express.Router();

// POST /api/chatbot/ask
router.post('/ask', async (req, res) => {
    try {
        const { message, context = 'general' } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        const response = await chatWithAI(message, context);

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