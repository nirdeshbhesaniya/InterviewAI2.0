const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const { authenticateToken, identifyUser } = require('../middlewares/auth');
const { normalizeUrl, getVideoId } = require('../utils/urlHelper');

// Get all resources with filters
router.get('/', identifyUser, require('../middlewares/cache')(60), async (req, res) => {
    try {
        const { branch, type, semester, search } = req.query;

        let query = {};

        if (branch) {
            query.$or = [
                { branch: branch },
                { branch: 'all' }
            ];
        }
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
        let resources = await Resource.find(finalQuery)
            .populate('uploadedBy', 'fullName email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Transform for creator view: show 'pending' if approved but has pending updates
        if (req.user) {
            resources = resources.map(resource => {
                // Check if user is the creator
                const isCreator = resource.uploadedBy && resource.uploadedBy._id.toString() === req.user._id.toString();
                if (isCreator && resource.pendingUpdates) {
                    return { ...resource, status: 'pending' };
                }
                return resource;
            });
        }

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
router.get('/:id', identifyUser, require('../middlewares/cache')(300), async (req, res) => {
    try {
        let resource = await Resource.findById(req.params.id)
            .populate('uploadedBy', 'name email')
            .lean();

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        // Transform for creator view
        if (req.user) {
            const isCreator = resource.uploadedBy && resource.uploadedBy._id.toString() === req.user._id.toString();
            if (isCreator && resource.pendingUpdates) {
                resource.status = 'pending';
            }
        }

        // Increment views (manual update because findByIdAndUpdate skips hooks/logic, but simplest for lean)
        // Since we used lean(), resource is a POJO. Does not track changes.
        // We need to update views in DB separately.
        await Resource.updateOne({ _id: req.params.id }, { $inc: { views: 1 } });
        // Since we are returning the object, increment the view count in memory for display
        resource.views = (resource.views || 0) + 1;

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

        // Validate branch and semester are non-empty arrays (or convert single to array if needed for robustness)
        const branchArray = Array.isArray(branch) ? branch : [branch];
        const semesterArray = Array.isArray(semester) ? semester : [semester];

        if (branchArray.length === 0 || semesterArray.length === 0) {
            return res.status(400).json({ message: 'At least one branch and semester must be selected' });
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

        // Normalize URL for duplicate check and storage
        const normalizedUrl = normalizeUrl(url);
        const videoId = getVideoId(url);

        // Check for duplicate URL
        // If it's a YouTube video, search for the Video ID in any URL in the DB
        let existingResource = null;
        if (videoId) {
            existingResource = await Resource.findOne({
                url: { $regex: videoId }
            });
        }

        // Fallback or non-youtube: check exact normalized URL match
        if (!existingResource) {
            existingResource = await Resource.findOne({ url: normalizedUrl });
        }

        if (existingResource) {
            return res.status(409).json({
                message: 'This resource link already exists in the database',
                resource: existingResource
            });
        }

        const resource = new Resource({
            title,
            description,
            type,
            url: normalizedUrl,
            branch: branchArray,
            subject,
            semester: semesterArray,
            uploadedBy: req.user._id,
            uploadedByName: req.user.fullName || 'Anonymous',
            tags: tags || [],
            status: (req.user.role === 'admin' || req.user.role === 'owner') ? 'approved' : 'pending'
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

        // Check if user is the owner (creator) or admin/owner (role)
        // Use req.user._id because req.user is a Mongoose document from auth middleware
        if (resource.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'owner') {
            return res.status(403).json({ message: 'You can only update your own resources' });
        }

        const updates = req.body;
        delete updates.uploadedBy; // Prevent changing owner
        delete updates.downloads; // Prevent manipulating download count
        delete updates.views; // Prevent manipulating view count

        const isAdminOrOwner = req.user.role === 'admin' || req.user.role === 'owner';

        if (isAdminOrOwner) {
            Object.assign(resource, updates);
        } else {
            // Filter crucial fields for pendingUpdates to ensure safety
            const allowedFields = ['title', 'description', 'type', 'url', 'branch', 'subject', 'semester', 'tags'];
            const filteredUpdates = {};
            Object.keys(updates).forEach(key => {
                if (allowedFields.includes(key)) {
                    filteredUpdates[key] = updates[key];
                }
            });

            if (resource.status === 'approved') {
                // Existing approved resource: Save to pendingUpdates
                resource.pendingUpdates = filteredUpdates;
            } else {
                // Pending or Rejected: Update directly
                Object.assign(resource, filteredUpdates);
                resource.status = 'pending';
                resource.pendingUpdates = null;
            }
        }

        await resource.save();

        res.json({
            message: isAdminOrOwner ? 'Resource updated successfully' : 'Update requested and pending approval',
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
        if (resource.uploadedBy.toString() !== req.user._id.toString()) {
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
        let resources = await Resource.find({ uploadedBy: req.user._id })
            .sort({ createdAt: -1 })
            .lean();

        // Transform for creators
        resources = resources.map(resource => {
            if (resource.pendingUpdates) {
                return { ...resource, status: 'pending' };
            }
            return resource;
        });

        res.json(resources);
    } catch (error) {
        console.error('Error fetching user resources:', error);
        res.status(500).json({ message: 'Failed to fetch user resources', error: error.message });
    }
});

// ADMIN: Get all pending resources with pagination
router.get('/admin/pending', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'owner') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const { branch, semester, search } = req.query;

        const query = {
            $or: [
                { status: 'pending' },
                { pendingUpdates: { $ne: null } }
            ]
        };

        if (branch && branch !== 'all') {
            query.branch = branch;
        }

        if (semester && semester !== 'all') {
            query.semester = semester;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        const totalResources = await Resource.countDocuments(query);
        const resources = await Resource.find(query)
            .populate('uploadedBy', 'fullName email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            success: true, // Ensuring consistent response format
            resources,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalResources / limit),
                totalResources,
                hasMore: page * limit < totalResources
            }
        });
    } catch (error) {
        console.error('Error fetching pending resources:', error);
        res.status(500).json({ message: 'Failed to fetch pending resources', error: error.message });
    }
});

// ADMIN: Update resource status (Approve/Reject)
router.patch('/:id/status', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'owner') {
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

        if (status === 'rejected' && resource.status === 'approved' && resource.pendingUpdates) {
            // Rejecting an update to an existing approved resource: clear updates but keep resource approved
            resource.pendingUpdates = null;
            await resource.save();
            return res.json({ message: 'Update rejected, original resource preserved', resource });
        }

        // Rejecting a new or pending resource: Remove from database
        if (status === 'rejected' && resource.status === 'pending') {
            await Resource.findByIdAndDelete(req.params.id);
            return res.json({ message: 'Resource rejected and removed' });
        }

        resource.status = status;

        if (status === 'approved' && resource.pendingUpdates) {
            Object.assign(resource, resource.pendingUpdates);
            resource.pendingUpdates = null;
        }
        // No need for 'else if rejected' here as it's handled above

        await resource.save();

        res.json({ message: `Resource ${status} successfully`, resource });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ message: 'Failed to update status', error: error.message });
    }
});

module.exports = router;


