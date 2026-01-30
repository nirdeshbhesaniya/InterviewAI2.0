const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Note = require('../models/Note');
const Resource = require('../models/Resource');
const PracticeTest = require('../models/PracticeTest');
const Interview = require('../models/Interview');

// GET /api/public/stats
// Public endpoint to get application statistics
router.get('/stats', require('../middlewares/cache')(600), async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({});

        // Calculate total Q&A from Interview sessions
        const totalQnA = await Interview.aggregate([
            { $project: { qnaCount: { $size: { $ifNull: ["$qna", []] } } } },
            { $group: { _id: null, total: { $sum: "$qnaCount" } } }
        ]);

        const qnaCount = totalQnA.length > 0 ? totalQnA[0].total : 0;

        res.json({
            success: true,
            stats: {
                totalUsers: totalUsers,
                totalQuestionsSolved: qnaCount
            }
        });
    } catch (error) {
        console.error('Error fetching public stats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
    }
});

// GET /api/public/search
// Global search for public content
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) {
            return res.json({ success: true, results: [] });
        }

        const queryRegex = new RegExp(q, 'i'); // Case-insensitive search

        // Execute queries in parallel
        const [notes, resources, tests, interviews] = await Promise.all([
            // 1. Notes (Approved)
            Note.find({
                status: 'approved',
                $or: [{ title: queryRegex }, { tags: queryRegex }]
            }).select('title type description _id branch semester subject tags userName link views createdAt').limit(5),

            // 2. Resources (Approved)
            Resource.find({
                status: 'approved',
                $or: [{ title: queryRegex }, { subject: queryRegex }]
            }).select('title type description _id branch semester subject uploadedByName url views createdAt').limit(5),

            // 3. Practice Tests (Published)
            PracticeTest.find({
                isPublished: true,
                $or: [{ title: queryRegex }, { topic: queryRegex }]
            }).select('title topic description _id questions createdAt').limit(5),

            // 4. Interviews
            Interview.find({
                $or: [{ title: queryRegex }, { tag: queryRegex }]
            }).select('title tag desc sessionId creatorEmail creatorDetails createdAt').limit(5)
        ]);

        // Normalize Results with Page Calculation
        const results = [];

        // Helper function to calculate page number
        const calculatePageNumber = async (Model, item, limit) => {
            try {
                const query = { status: 'approved' };
                const countBefore = await Model.countDocuments({
                    ...query,
                    createdAt: { $gt: item.createdAt }
                });
                return Math.floor(countBefore / limit) + 1;
            } catch (error) {
                console.error('Page calculation error:', error);
                return null;
            }
        };

        // Process Notes with page numbers
        for (const item of notes) {
            const pageNumber = await calculatePageNumber(Note, item, 9); // ITEMS_PER_PAGE for Notes = 9
            results.push({
                id: item._id,
                title: item.title,
                type: 'Note',
                desc: item.description || 'Study Note',
                path: `/notes`,
                icon: 'BookOpen',
                // Metadata for Preview Modal
                branch: item.branch,
                semester: item.semester,
                subject: item.subject,
                tags: item.tags,
                uploadedByName: item.userName,
                author: item.userName,
                link: item.link,
                views: item.views,
                createdAt: item.createdAt,
                locationPath: pageNumber ? `Notes > Page ${pageNumber}` : 'Notes'
            });
        }

        // Process Resources with page numbers
        for (const item of resources) {
            const pageNumber = await calculatePageNumber(Resource, item, 12); // ITEMS_PER_PAGE for Resources = 12
            results.push({
                id: item._id,
                title: item.title,
                type: 'Resource',
                desc: item.description || `Resource for ${item.subject}`,
                path: `/resources`,
                icon: 'FileText',
                // Metadata
                branch: item.branch,
                semester: item.semester,
                subject: item.subject,
                uploadedByName: item.uploadedByName,
                author: item.uploadedByName,
                link: item.url,
                views: item.views,
                createdAt: item.createdAt,
                locationPath: pageNumber ? `Resources > Page ${pageNumber}` : 'Resources'
            });
        }

        // Process Tests (no pagination)
        tests.forEach(item => results.push({
            id: item._id,
            title: item.title,
            type: 'Test',
            desc: item.description || `Practice Test on ${item.topic}`,
            path: `/mcq-test/practice/${item._id}`, // Direct link to start test
            icon: 'CheckCircle',
            // Metadata
            subject: item.topic,
            views: item.questions?.length ? `${item.questions.length} Questions` : 'Practice',
            createdAt: item.createdAt,
            locationPath: 'Practice Tests',
            link: `/mcq-test/practice/${item._id}` // Direct link for opening
        }));

        // Process Interviews (no pagination)
        interviews.forEach(item => results.push({
            id: item.sessionId || item._id,
            title: item.title,
            type: 'Interview',
            desc: item.desc || `AI Interview for ${item.tag}`,
            path: `/dashboard`,
            icon: 'Bot',
            // Metadata
            tags: item.tag,
            author: item.creatorDetails?.fullName || item.creatorEmail || 'Anonymous',
            uploadedByName: item.creatorDetails?.fullName || item.creatorEmail || 'Anonymous',
            createdAt: item.createdAt,
            locationPath: 'Dashboard > Interview Sessions'
        }));

        res.json({ success: true, results: results.slice(0, 10) }); // Return top 10 combined

    } catch (error) {
        console.error('Search API Error:', error);
        res.status(500).json({ success: false, message: 'Search failed' });
    }
});

// GET /api/public/find-page
// Calculate which page a specific item is on
router.get('/find-page', async (req, res) => {
    try {
        const { type, id, limit = 10 } = req.query; // 'Note' or 'Resource'

        if (!type || !id) {
            return res.status(400).json({ success: false, message: 'Missing type or id' });
        }

        let Model;
        let query = {}; // Base query for visibility

        if (type === 'Note') {
            Model = Note;
            query = { status: 'approved' };
        } else if (type === 'Resource') {
            Model = Resource;
            query = { status: 'approved' };
        } else {
            return res.status(400).json({ success: false, message: 'Invalid type' });
        }

        const targetItem = await Model.findById(id);
        if (!targetItem) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        // Count items created AFTER this one (assuming Newest First sort)
        // We must include the same filters used in the main list (e.g., status approved)
        // If sorting is by createdAt descending:
        const countBefore = await Model.countDocuments({
            ...query,
            createdAt: { $gt: targetItem.createdAt }
        });

        // Calculate page
        // skip = countBefore
        // page = Math.floor(skip / limit) + 1
        const page = Math.floor(countBefore / parseInt(limit)) + 1;

        res.json({
            success: true,
            page,
            id,
            totalBefore: countBefore
        });

    } catch (error) {
        console.error('Find Page Error:', error);
        res.status(500).json({ success: false, message: 'Calculation failed' });
    }
});

module.exports = router;
