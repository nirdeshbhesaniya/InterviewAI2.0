const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const { chatWithAI } = require('../utils/gemini');

// @route   POST /api/assessment/generate
// @desc    Generate a 10-question MCQ test based on module topics
// @access  Private
router.post('/generate', authenticateToken, async (req, res) => {
    try {
        const { moduleTitle, topics } = req.body;
        
        if (!moduleTitle || !topics || !Array.isArray(topics)) {
            return res.status(400).json({ error: 'moduleTitle and an array of topics are required' });
        }

        const prompt = `Generate a 10-question multiple-choice assessment test covering the following module and its topics:
Module: ${moduleTitle}
Topics: ${topics.join(', ')}

Return ONLY a JSON array of 10 objects. Do not wrap it in markdown block quotes (e.g., no \`\`\`json). Just return the raw JSON array.
Each object must have exactly these keys:
- "question": (string) the question text
- "options": (array of 4 strings) the possible answers
- "correctAnswer": (string) the exact string of the correct option

Example format:
[
  {
    "question": "What does HTML stand for?",
    "options": ["Hyper Text Preprocessor", "Hyper Text Markup Language", "Hyper Tool Multi Language", "Hyperlink and Text Markup Language"],
    "correctAnswer": "Hyper Text Markup Language"
  }
]`;

        const aiResponse = await chatWithAI(prompt, 'general');
        
        // Try to parse the response
        let questions = [];
        try {
            // Remove markdown code blocks if the AI accidentally added them
            const cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            questions = JSON.parse(cleanResponse);
        } catch (parseError) {
            console.error('Failed to parse AI response as JSON:', parseError, 'Raw response:', aiResponse);
            return res.status(500).json({ error: 'Failed to generate assessment. Invalid AI response format.' });
        }

        return res.json({ questions });

    } catch (err) {
        console.error('Assessment generation error:', err.message);
        return res.status(500).json({ error: err.message });
    }
});

// @route   POST /api/assessment/evaluate
// @desc    Evaluate user answers against questions to determine score and pass status
// @access  Private
router.post('/evaluate', authenticateToken, async (req, res) => {
    try {
        const { questions, userAnswers } = req.body;

        if (!questions || !userAnswers || !Array.isArray(questions) || !Array.isArray(userAnswers)) {
            return res.status(400).json({ error: 'questions and userAnswers arrays are required' });
        }

        let score = 0;
        const total = questions.length;

        // Determine score by matching correctAnswer with userAnswers
        // Expect userAnswers to be an array of selected option strings in the same order as questions
        for (let i = 0; i < total; i++) {
            if (userAnswers[i] && userAnswers[i] === questions[i].correctAnswer) {
                score++;
            }
        }

        const percentage = Math.round((score / total) * 100);
        const passed = percentage >= 75;

        // Generate feedback using AI
        const prompt = `A user just took a multiple-choice assessment test and scored ${percentage}% (${score}/${total}).
Based on their score, provide a short, encouraging 2-sentence feedback message. 
If they passed (>= 75%), congratulate them on clearing the module.
If they failed (< 75%), encourage them to review the topics and try again.

Respond with ONLY the feedback string.`;

        const feedback = await chatWithAI(prompt, 'general');

        return res.json({
            score: percentage,
            passed,
            feedback: feedback.trim()
        });

    } catch (err) {
        console.error('Assessment evaluation error:', err.message);
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
