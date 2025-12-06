const express = require('express');
const router = express.Router();
const Note = require('../Models/Note');

// Get all notes (global view with optional filters)
router.get('/', async (req, res) => {
    try {
        const { type, userId, tags, search, limit = 50, skip = 0 } = req.query;

        let query = {};

        // Filter by type (pdf/youtube)
        if (type) {
            query.type = type;
        }

        // Filter by user
        if (userId) {
            query.userId = userId;
        }

        // Filter by tags
        if (tags) {
            query.tags = { $in: tags.split(',') };
        }

        // Search in title and description
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const notes = await Note.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const totalCount = await Note.countDocuments(query);

        res.json({
            success: true,
            notes,
            totalCount
        });
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notes',
            error: error.message
        });
    }
});

// Get single note by ID
router.get('/:id', async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        res.json({
            success: true,
            note
        });
    } catch (error) {
        console.error('Error fetching note:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch note',
            error: error.message
        });
    }
});

// Create new note
router.post('/', async (req, res) => {
    try {
        const { userId, userName, userEmail, type, title, description, link, tags } = req.body;

        // Validate required fields
        if (!userId || !userName || !userEmail || !type || !title || !link) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Validate type
        if (!['pdf', 'youtube'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid note type. Must be "pdf" or "youtube"'
            });
        }

        // Validate link format
        if (type === 'youtube') {
            const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
            if (!youtubeRegex.test(link)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid YouTube link format'
                });
            }
        } else if (type === 'pdf') {
            const driveRegex = /^https:\/\/drive\.google\.com\/.+/;
            if (!driveRegex.test(link)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid Google Drive link format'
                });
            }
        }

        const note = new Note({
            userId,
            userName,
            userEmail,
            type,
            title,
            description: description || '',
            link,
            tags: tags || []
        });

        await note.save();

        res.status(201).json({
            success: true,
            message: 'Note created successfully',
            note
        });
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create note',
            error: error.message
        });
    }
});

// Update note (only by creator)
router.put('/:id', async (req, res) => {
    try {
        const { userId, title, description, tags } = req.body;

        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        // Check if user is the creator
        if (note.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only edit your own notes'
            });
        }

        // Update fields
        if (title) note.title = title;
        if (description !== undefined) note.description = description;
        if (tags) note.tags = tags;

        await note.save();

        res.json({
            success: true,
            message: 'Note updated successfully',
            note
        });
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update note',
            error: error.message
        });
    }
});

// Delete note (only by creator)
router.delete('/:id', async (req, res) => {
    try {
        const { userId } = req.body;

        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        // Check if user is the creator
        if (note.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own notes'
            });
        }

        await Note.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Note deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete note',
            error: error.message
        });
    }
});

// Track note view (increment only once per user)
router.post('/:id/view', async (req, res) => {
    try {
        const { userId } = req.body;

        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        // Check if user has already viewed this note
        const alreadyViewed = note.viewers.some(viewer => viewer.userId === userId);

        if (!alreadyViewed) {
            // Add user to viewers and increment view count
            note.viewers.push({ userId });
            note.views += 1;
            await note.save();
        }

        res.json({
            success: true,
            views: note.views,
            alreadyViewed
        });
    } catch (error) {
        console.error('Error tracking view:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to track view',
            error: error.message
        });
    }
});

// Toggle like on note
router.post('/:id/like', async (req, res) => {
    try {
        const { userId, userName } = req.body;

        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        // Check if user already liked
        const likeIndex = note.likes.findIndex(like => like.userId === userId);

        if (likeIndex > -1) {
            // Unlike
            note.likes.splice(likeIndex, 1);
        } else {
            // Like
            note.likes.push({ userId, userName });
        }

        await note.save();

        res.json({
            success: true,
            message: likeIndex > -1 ? 'Note unliked' : 'Note liked',
            note
        });
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle like',
            error: error.message
        });
    }
});

// Get user's notes
router.get('/user/:userId', async (req, res) => {
    try {
        const { type } = req.query;
        let query = { userId: req.params.userId };

        if (type) {
            query.type = type;
        }

        const notes = await Note.find(query).sort({ createdAt: -1 });

        res.json({
            success: true,
            notes,
            totalCount: notes.length
        });
    } catch (error) {
        console.error('Error fetching user notes:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user notes',
            error: error.message
        });
    }
});

module.exports = router;
