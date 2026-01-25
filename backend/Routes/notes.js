const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const { authenticateToken, identifyUser } = require('../middlewares/auth');
const { normalizeUrl, getVideoId } = require('../utils/urlHelper');

// Get all notes (global view with optional filters)
router.get('/', identifyUser, require('../middlewares/cache')(60), async (req, res) => {
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

        // Search logic
        let searchCondition = {};
        if (search) {
            searchCondition.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Status filter logic
        let statusCondition = { status: 'approved' };

        // If user is logged in, allow them to see THEIR pending notes
        if (req.user) {
            statusCondition = {
                $or: [
                    { status: 'approved' },
                    { status: 'pending', userEmail: req.user.email }, // Note: Notes uses userEmail for ownership
                    { status: 'pending', userId: req.user.email }     // Handling potential field naming inconsistency (DB uses userId as email usually)
                ]
            };
        }

        // Combine all conditions
        const conditions = [];
        if (Object.keys(query).length > 0) conditions.push(query);
        if (Object.keys(searchCondition).length > 0) conditions.push(searchCondition);
        conditions.push(statusCondition);

        const finalQuery = conditions.length > 0 ? { $and: conditions } : {};

        let notes = await Note.find(finalQuery)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip))
            .lean();

        // Transform for creator view: show 'pending' if approved but has pending updates
        if (req.user) {
            notes = notes.map(note => {
                // Check if user is the creator (fuzzy match due to legacy schema)
                const isCreator = note.userId === req.user.email || note.userId === req.user.userId || note.userEmail === req.user.email;
                if (isCreator && note.pendingUpdates) {
                    return { ...note, status: 'pending' };
                }
                return note;
            });
        }

        const totalCount = await Note.countDocuments(finalQuery);

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
router.get('/:id', identifyUser, require('../middlewares/cache')(300), async (req, res) => {
    try {
        let note = await Note.findById(req.params.id).lean();

        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        // Transform for creator view
        if (req.user) {
            const isCreator = note.userId === req.user.email || note.userId === req.user.userId || note.userEmail === req.user.email;
            if (isCreator && note.pendingUpdates) {
                note.status = 'pending';
            }
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

        // Normalize Link for duplicate check and storage
        const normalizedLink = normalizeUrl(link);
        const videoId = getVideoId(link);

        // Check for duplicate Link
        let existingNote = null;
        if (videoId) {
            existingNote = await Note.findOne({
                link: { $regex: videoId }
            });
        }

        if (!existingNote) {
            existingNote = await Note.findOne({ link: normalizedLink });
        }

        if (existingNote) {
            return res.status(409).json({
                success: false,
                message: 'This note link already exists in the database',
                note: existingNote
            });
        }

        const note = new Note({
            userId,
            userName,
            userEmail,
            type,
            title,
            description: description || '',
            link: normalizedLink,
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
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { title, description, tags, userId } = req.body;

        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        // Check if user is the creator or admin/owner
        // Allow if:
        // 1. User is the creator (note.userId matches req.user.email/id)
        // 2. User has 'admin' role
        // 3. User has 'owner' role

        // Note: note.userId might be email or ObjectId depending on how it was saved.
        // req.user from authenticateToken usually has { userId, email, role ... }
        // Let's check both ID and Email match for creator check to be safe

        // Updated to use req.user._id.toString() or req.user.email since req.user is a Mongoose document
        const isCreator = note.userId === req.user.email || note.userId === req.user._id.toString() || note.userEmail === req.user.email;
        const isAdminOrOwner = req.user.role === 'admin' || req.user.role === 'owner';

        if (!isCreator && !isAdminOrOwner) {
            return res.status(403).json({
                success: false,
                message: 'You can only edit your own notes'
            });
        }

        // Update fields
        if (isAdminOrOwner) {
            if (title) note.title = title;
            if (description !== undefined) note.description = description;
            if (tags) note.tags = tags;
            // Admin updates stay approved (or whatever status they were)
        } else {
            if (note.status === 'approved') {
                // Existing approved note: Save to pendingUpdates so it stays visible
                const updates = {};
                if (title) updates.title = title;
                if (description !== undefined) updates.description = description;
                if (tags) updates.tags = tags;
                note.pendingUpdates = updates;
            } else {
                // Pending or Rejected: Update directly and ensure status is pending
                if (title) note.title = title;
                if (description !== undefined) note.description = description;
                if (tags) note.tags = tags;
                note.status = 'pending';
                note.pendingUpdates = null; // Clear checking updates since we updated main
            }
        }

        await note.save();

        res.json({
            success: true,
            message: isAdminOrOwner ? 'Note updated successfully' : 'Update requested and pending approval',
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
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        // Check if user is the creator or admin/owner
        const isCreator = note.userId === req.user.email || note.userId === req.user._id.toString() || note.userEmail === req.user.email;
        const isAdminOrOwner = req.user.role === 'admin' || req.user.role === 'owner';

        if (!isCreator && !isAdminOrOwner) {
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

// ADMIN: Get all pending notes with pagination and filtering
router.get('/admin/pending', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const { type, search } = req.query;

        const query = {
            $or: [
                { status: 'pending' },
                { pendingUpdates: { $ne: null } }
            ]
        };

        if (type && type !== 'all') {
            query.type = type;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const totalNotes = await Note.countDocuments(query);
        const notes = await Note.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            success: true,
            notes,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalNotes / limit),
                totalNotes,
                hasMore: page * limit < totalNotes
            }
        });
    } catch (error) {
        console.error('Error fetching pending notes:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch pending notes' });
    }
});

// ADMIN: Update note status
router.patch('/:id/status', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'owner') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const { status } = req.body;
        const note = await Note.findById(req.params.id);
        if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

        if (status === 'rejected' && note.status === 'approved' && note.pendingUpdates) {
            // Rejecting an update to an existing approved note: clear updates but keep note approved
            note.pendingUpdates = null;
            await note.save();
            return res.json({ success: true, message: 'Update rejected, original note preserved', note });
        }

        // Rejecting a new or pending note: Remove from database
        if (status === 'rejected' && note.status === 'pending') {
            await Note.findByIdAndDelete(req.params.id);
            return res.json({ success: true, message: 'Note rejected and removed' });
        }

        note.status = status;

        // Apply pending updates if approved
        if (status === 'approved' && note.pendingUpdates) {
            const updates = note.pendingUpdates;
            if (updates.title) note.title = updates.title;
            if (updates.description) note.description = updates.description;
            if (updates.tags) note.tags = updates.tags;
            note.pendingUpdates = null;
        }
        // No need for 'else if rejected' here as it's handled above

        await note.save();
        res.json({ success: true, message: `Note ${status}`, note });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update status' });
    }
});

module.exports = router;
