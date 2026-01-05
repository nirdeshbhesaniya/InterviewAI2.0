const express = require('express');
const router = express.Router();
const Resource = require('../Models/Resource');
const { authenticateToken, identifyUser } = require('../middlewares/auth');

// Get all resources with filters
router.get('/', identifyUser, async (req, res) => {
    try {
        const { branch, type, semester, search } = req.query;

        let query = {};

        if (branch) query.branch = branch;
        if (type && type !== 'all') query.type = type;
        if (semester && semester !== 'all') query.semester = semester;

        // Search logic
        let searchCondition = {};
        if (search) {
            searchCondition.$or = [
                { title: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        // Status filter logic (Allow pending if user is owner)
        let statusCondition = { status: 'approved' };
        if (req.user) {
            statusCondition = {
                $or: [
                    { status: 'approved' },
                    { status: 'pending', uploadedBy: req.user._id }
                ]
            };
        }

        // Combine conditions
        const conditions = [];
        if (Object.keys(query).length > 0) conditions.push(query);
        if (Object.keys(searchCondition).length > 0) conditions.push(searchCondition);
        conditions.push(statusCondition);

        const finalQuery = conditions.length > 0 ? { $and: conditions } : {};

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await Resource.countDocuments(finalQuery);
        const resources = await Resource.find(finalQuery)
            .populate('uploadedBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            success: true,
            resources,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalResources: total
        });
    } catch (error) {
        console.error('Error fetching resources:', error);
        res.status(500).json({ message: 'Failed to fetch resources', error: error.message });
    }
});

// Get single resource by ID
router.get('/:id', async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id)
            .populate('uploadedBy', 'name email');

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        // Increment views
        resource.views += 1;
        await resource.save();

        res.json(resource);
    } catch (error) {
        console.error('Error fetching resource:', error);
        res.status(500).json({ message: 'Failed to fetch resource', error: error.message });
    }
});

// Create new resource (protected)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const {
            title,
            description,
            type,
            url,
            branch,
            subject,
            semester,
            tags
        } = req.body;

        // Validate required fields
        if (!title || !type || !url || !branch || !subject || !semester) {
            return res.status(400).json({
                message: 'Missing required fields',
                required: ['title', 'type', 'url', 'branch', 'subject', 'semester']
            });
        }

        // Validate URL based on type
        if (type === 'video') {
            const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
            if (!isYouTube) {
                return res.status(400).json({ message: 'For video type, please provide a YouTube URL' });
            }
        } else if (type === 'pdf') {
            const isGoogleDrive = url.includes('drive.google.com');
            if (!isGoogleDrive) {
                return res.status(400).json({ message: 'For PDF type, please provide a Google Drive URL' });
            }
        }

        const resource = new Resource({
            title,
            description,
            type,
            url,
            branch,
            subject,
            semester,
            uploadedBy: req.user._id,
            uploadedByName: req.user.fullName || 'Anonymous',
            tags: tags || [],
            status: req.user.role === 'admin' ? 'approved' : 'pending'
        });

        await resource.save();

        res.status(201).json({
            message: 'Resource uploaded successfully',
            resource
        });
    } catch (error) {
        console.error('Error creating resource:', error);
        res.status(500).json({ message: 'Failed to create resource', error: error.message });
    }
});

// Update resource (protected - only owner can update)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        // Check if user is the owner
        if (resource.uploadedBy.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'You can only update your own resources' });
        }

        const updates = req.body;
        delete updates.uploadedBy; // Prevent changing owner
        delete updates.downloads; // Prevent manipulating download count
        delete updates.views; // Prevent manipulating view count

        Object.assign(resource, updates);
        await resource.save();

        res.json({
            message: 'Resource updated successfully',
            resource
        });
    } catch (error) {
        console.error('Error updating resource:', error);
        res.status(500).json({ message: 'Failed to update resource', error: error.message });
    }
});

// Delete resource (protected - only owner can delete)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        // Check if user is the owner
        if (resource.uploadedBy.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'You can only delete your own resources' });
        }

        await Resource.findByIdAndDelete(req.params.id);

        res.json({ message: 'Resource deleted successfully' });
    } catch (error) {
        console.error('Error deleting resource:', error);
        res.status(500).json({ message: 'Failed to delete resource', error: error.message });
    }
});

// Increment download count
router.post('/:id/download', async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        resource.downloads += 1;
        await resource.save();

        res.json({ message: 'Download count incremented', downloads: resource.downloads });
    } catch (error) {
        console.error('Error incrementing download count:', error);
        res.status(500).json({ message: 'Failed to increment download count', error: error.message });
    }
});

// Like/Unlike resource (protected)
router.post('/:id/like', authenticateToken, async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        const userId = req.user.userId;
        const likeIndex = resource.likes.indexOf(userId);

        if (likeIndex > -1) {
            // Unlike
            resource.likes.splice(likeIndex, 1);
        } else {
            // Like
            resource.likes.push(userId);
        }

        await resource.save();

        res.json({
            message: likeIndex > -1 ? 'Resource unliked' : 'Resource liked',
            likes: resource.likes.length,
            isLiked: likeIndex === -1
        });
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({ message: 'Failed to toggle like', error: error.message });
    }
});

// Get user's uploaded resources (protected)
router.get('/user/my-uploads', authenticateToken, async (req, res) => {
    try {
        const resources = await Resource.find({ uploadedBy: req.user._id })
            .sort({ createdAt: -1 });

        res.json(resources);
    } catch (error) {
        console.error('Error fetching user resources:', error);
        res.status(500).json({ message: 'Failed to fetch user resources', error: error.message });
    }
});

// ADMIN: Get all pending resources
router.get('/admin/pending', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const resources = await Resource.find({ status: 'pending' })
            .populate('uploadedBy', 'name email')
            .sort({ createdAt: -1 });

        res.json(resources);
    } catch (error) {
        console.error('Error fetching pending resources:', error);
        res.status(500).json({ message: 'Failed to fetch pending resources', error: error.message });
    }
});

// ADMIN: Update resource status (Approve/Reject)
router.patch('/:id/status', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { status } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const resource = await Resource.findById(req.params.id);
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        resource.status = status;
        await resource.save();

        res.json({ message: `Resource ${status} successfully`, resource });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ message: 'Failed to update status', error: error.message });
    }
});

module.exports = router;


