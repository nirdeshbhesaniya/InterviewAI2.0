const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const RoadmapProgress = require('../models/RoadmapProgress');
const { chatWithAI } = require('../utils/gemini');

// @route   GET /api/roadmaps/resource-urls
// @desc    Use Gemini AI to generate direct resource URLs for a given topic
// @access  Private
router.get('/resource-urls', authenticateToken, async (req, res) => {
    try {
        const { topic, type } = req.query;
        if (!topic) return res.status(400).json({ url: null, error: 'Topic required' });

        let prompt = '';

        if (type === 'gfg') {
            prompt = `For the programming/tech topic "${topic}", provide the single most relevant GeeksforGeeks article URL.
GeeksforGeeks URL patterns:
- https://www.geeksforgeeks.org/{topic-slug}/
- https://www.geeksforgeeks.org/{category}/{topic-slug}/
Examples:
- "HTML Basics" → https://www.geeksforgeeks.org/html/html-basics/
- "React Hooks" → https://www.geeksforgeeks.org/reactjs/react-hooks/
- "JavaScript Arrays" → https://www.geeksforgeeks.org/javascript/javascript-arrays/
- "CSS Flexbox" → https://www.geeksforgeeks.org/css/css-flexbox/
- "Node.js" → https://www.geeksforgeeks.org/nodejs/
- "MongoDB" → https://www.geeksforgeeks.org/mongodb-tutorial/

Respond with ONLY the URL, nothing else. No explanation. Just the URL on a single line.`;
        } else if (type === 'w3s') {
            prompt = `For the programming/tech topic "${topic}", provide the single most relevant W3Schools page URL.
W3Schools URL patterns:
- https://www.w3schools.com/html/
- https://www.w3schools.com/css/
- https://www.w3schools.com/js/
- https://www.w3schools.com/react/
- https://www.w3schools.com/nodejs/
- https://www.w3schools.com/python/
- https://www.w3schools.com/sql/
Examples:
- "HTML Basics" → https://www.w3schools.com/html/html_intro.asp
- "CSS Flexbox" → https://www.w3schools.com/css/css3_flexbox.asp
- "React Hooks" → https://www.w3schools.com/react/react_hooks.asp
- "JavaScript Arrays" → https://www.w3schools.com/js/js_arrays.asp

Respond with ONLY the URL, nothing else. No explanation. Just the URL on a single line.`;
        } else if (type === 'docs') {
            prompt = `For the programming/tech topic "${topic}", provide the single most relevant official documentation URL.
Examples:
- "React" → https://react.dev/
- "Node.js" → https://nodejs.org/en/docs/
- "MongoDB" → https://www.mongodb.com/docs/
- "Express.js" → https://expressjs.com/
- "TypeScript" → https://www.typescriptlang.org/docs/
- "Python" → https://docs.python.org/3/
- "JavaScript" → https://developer.mozilla.org/en-US/docs/Web/JavaScript
- "CSS" → https://developer.mozilla.org/en-US/docs/Web/CSS
- "HTML" → https://developer.mozilla.org/en-US/docs/Web/HTML

Respond with ONLY the URL, nothing else. No explanation. Just the URL on a single line.`;
        } else {
            return res.status(400).json({ url: null, error: 'Invalid type. Use gfg, w3s, or docs' });
        }

        const aiResponse = await chatWithAI(prompt, 'general');
        const url = aiResponse.trim().replace(/^["']|["']$/g, '').split('\n')[0].trim();

        if (url && url.startsWith('http')) {
            return res.json({ url });
        }

        return res.json({ url: null });

    } catch (err) {
        console.error('resource-urls error:', err.message);
        return res.status(500).json({ url: null, error: err.message });
    }
});

// @route   GET /api/roadmaps/progress
// @desc    Get all roadmap progresses for a user
// @access  Private
router.get('/progress', authenticateToken, async (req, res) => {
    try {
        const progresses = await RoadmapProgress.find({ userId: req.user._id });
        res.json(progresses);
    } catch (err) {
        console.error('Error fetching roadmap progress:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/roadmaps/progress/:roadmapId
// @desc    Get progress for a specific roadmap
// @access  Private
router.get('/progress/:roadmapId', authenticateToken, async (req, res) => {
    try {
        const { roadmapId } = req.params;
        const progress = await RoadmapProgress.findOne({ userId: req.user._id, roadmapId });
        
        if (!progress) {
            return res.json({ completedTopics: [], clearedModules: [], lastUpdated: null });
        }
        res.json(progress);
    } catch (err) {
        console.error('Error fetching roadmap progress by ID:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/roadmaps/progress/:roadmapId
// @desc    Save/Update progress for a specific roadmap
// @access  Private
router.post('/progress/:roadmapId', authenticateToken, async (req, res) => {
    try {
        const { roadmapId } = req.params;
        const { completedTopics, clearedModules } = req.body;

        if (!Array.isArray(completedTopics)) {
            return res.status(400).json({ message: 'completedTopics must be an array' });
        }

        const progress = await RoadmapProgress.findOneAndUpdate(
            { userId: req.user._id, roadmapId },
            { 
                $set: { 
                    completedTopics,
                    clearedModules: clearedModules || [],
                    lastUpdated: Date.now()
                } 
            },
            { new: true, upsert: true }
        );

        res.json(progress);
    } catch (err) {
        console.error('Error saving roadmap progress:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
