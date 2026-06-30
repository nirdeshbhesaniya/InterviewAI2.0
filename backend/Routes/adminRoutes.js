const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Interview = require('../models/Interview');
const Notification = require('../models/Notification');
const SystemSetting = require('../models/SystemSetting');
const { authenticateToken } = require('../middlewares/auth');
const { getFeatureStatus, setFeatureStatus } = require('../middlewares/featureAuth');
const { FEATURE_LOCKS, getFeatureDefinition } = require('../utils/featureRegistry');

// Middleware to check if user is admin or owner
const requireAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'owner')) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin or Owner rights must required.' });
    }
};

// Apply auth and admin check to all routes
router.use(authenticateToken, requireAdmin);

// GET all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password -sessions -tempUserData -twoFactorSecret')
            .sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

// PATCH ban/unban user
router.patch('/users/:userId/ban', async (req, res) => {
    try {
        const { userId } = req.params;
        const { isBanned } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent banning self
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot ban yourself' });
        }

        user.isBanned = isBanned;

        // If banning, maybe clear sessions to force logout immediatley? 
        // The middleware check handles the "next request", but clearing sessions is good practice.
        if (isBanned) {
            user.sessions = [];
        }

        await user.save();

        res.json({
            message: `User ${isBanned ? 'banned' : 'unbanned'} successfully`,
            user: { _id: user._id, isBanned: user.isBanned }
        });
    } catch (err) {
        console.error('Error updating ban status:', err);
        res.status(500).json({ message: 'Failed to update user status' });
    }
});

// PUT update user details (Admin)
router.put('/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const updates = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const requester = req.user;

        // Role Management Rules:
        // 1. Only 'owner' can change ANY user's role to/from 'admin'.
        // 2. Admins cannot change roles at all.
        // 3. Admins cannot modify other admins or the owner.

        if (updates.role) {
            // Check if role is changing
            if (updates.role !== user.role) {
                if (requester.role !== 'owner') {
                    return res.status(403).json({ message: 'Only the Owner can change user roles.' });
                }

                // Owner cannot demote themselves (unless transferring ownership, but let's block simple demotion)
                if (user._id.toString() === requester._id.toString() && updates.role !== 'owner') {
                    return res.status(400).json({ message: 'Cannot demote yourself from Owner.' });
                }
            }
        }

        // General Profile Updates Limitation for Admins:
        // Admins should not be able to edit other Admins or Owner
        if (requester.role === 'admin' && (user.role === 'admin' || user.role === 'owner') && user._id.toString() !== requester._id.toString()) {
            return res.status(403).json({ message: 'Admins cannot edit other Admins or the Owner.' });
        }


        // Allowed fields to update
        const allowedUpdates = ['fullName', 'email', 'role', 'bio', 'location', 'website', 'linkedin', 'github'];

        Object.keys(updates).forEach(key => {
            if (allowedUpdates.includes(key)) {
                user[key] = updates[key];
            }
        });

        await user.save();

        res.json({
            message: 'User updated successfully',
            user
        });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ message: 'Failed to update user' });
    }
});

// GET pending Sessions (Global view for admin)
router.get('/pending-sessions', async (req, res) => {
    try {
        // Fetch sessions with status 'pending'
        const pendingSessions = await Interview.find({ status: 'pending' })
            .sort({ createdAt: -1 });

        res.json(pendingSessions);
    } catch (err) {
        console.error('Error fetching pending sessions:', err);
        res.status(500).json({ message: 'Failed to fetch pending sessions' });
    }
});

// GET pending Q&A requests (Global view for admin)
router.get('/qna-requests', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const { category } = req.query;

        // Build Aggregation Pipeline
        const pipeline = [
            // 1. Match interviews with at least one question that is pending OR has a pending update
            {
                $match: {
                    $or: [
                        { 'qna.status': 'pending' },
                        { 'qna.pendingUpdate.status': 'pending' }
                    ]
                }
            },
            // 2. Unwind qna array to process individual questions
            { $unwind: '$qna' },
            // 3. Match only the relevant questions (either new pending or existing with pending update)
            {
                $match: {
                    $or: [
                        { 'qna.status': 'pending' },
                        { 'qna.pendingUpdate.status': 'pending' }
                    ],
                    ...(category ? { 'qna.category': category } : {})
                }
            },
            // 4. Lookup user details (requester)
            // Note: requestedBy is in pendingUpdate for updates, or main qna for new questions
            {
                $lookup: {
                    from: 'users',
                    let: {
                        requesterId: {
                            $cond: {
                                if: { $eq: ['$qna.status', 'pending'] },
                                then: { $toObjectId: '$qna.requestedBy' },
                                else: { $toObjectId: '$qna.pendingUpdate.requestedBy' }
                            }
                        }
                    },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$_id', '$$requesterId'] } } }
                    ],
                    as: 'requester'
                }
            },
            // 5. Unwind requester
            { $unwind: { path: '$requester', preserveNullAndEmptyArrays: true } },
            // 6. Search Match
            ...(req.query.search ? [{
                $match: {
                    $or: [
                        { 'qna.question': { $regex: req.query.search, $options: 'i' } },
                        { 'qna.pendingUpdate.question': { $regex: req.query.search, $options: 'i' } },
                        { 'requester.fullName': { $regex: req.query.search, $options: 'i' } },
                        { 'requester.email': { $regex: req.query.search, $options: 'i' } }
                    ]
                }
            }] : []),
            // 7. Sort by creation/request date
            { $sort: { 'qna.createdAt': -1 } }
        ];

        // Get Total Count
        const countPipeline = [...pipeline, { $count: 'total' }];
        const countResult = await Interview.aggregate(countPipeline);
        const total = countResult.length > 0 ? countResult[0].total : 0;

        // Apply Pagination
        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: limit });

        // Project final shape
        pipeline.push({
            $project: {
                interviewId: '$_id',
                sessionId: '$sessionId',
                interviewTitle: '$title',
                qnaId: '$qna._id',
                // Determine if it's a new question or an update
                type: {
                    $cond: {
                        if: { $eq: ['$qna.status', 'pending'] },
                        then: 'new',
                        else: 'update'
                    }
                },
                // Use pendingUpdate data if update, else main data
                question: {
                    $cond: {
                        if: { $eq: ['$qna.status', 'pending'] },
                        then: '$qna.question',
                        else: '$qna.pendingUpdate.question'
                    }
                },
                answerParts: {
                    $cond: {
                        if: { $eq: ['$qna.status', 'pending'] },
                        then: '$qna.answerParts',
                        else: '$qna.pendingUpdate.answerParts'
                    }
                },
                category: {
                    $cond: {
                        if: { $eq: ['$qna.status', 'pending'] },
                        then: '$qna.category',
                        else: '$qna.pendingUpdate.category'
                    }
                },
                // Original data context for updates (optional, for diffing)
                originalQuestion: '$qna.question',

                requestedBy: {
                    _id: '$requester._id',
                    fullName: '$requester.fullName',
                    email: '$requester.email',
                    photo: '$requester.photo'
                },
                createdAt: '$qna.createdAt'
            }
        });

        const pendingRequests = await Interview.aggregate(pipeline);

        res.json({
            success: true,
            data: pendingRequests,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalRequests: total,
                hasMore: page * limit < total
            }
        });

    } catch (err) {
        console.error('Error fetching Q&A requests:', err);
        res.status(500).json({ message: 'Failed to fetch requests' });
    }
});

// POST approve ALL pending Q&A requests
router.post('/approve-all-qna', async (req, res) => {
    try {
        const interviews = await Interview.find({ 'qna.status': 'pending' });

        let approvedCount = 0;

        for (const interview of interviews) {
            let modified = false;
            interview.qna.forEach(q => {
                if (q.status === 'pending') {
                    q.status = 'approved';
                    // Optional: Create notification for requester here if needed, 
                    // skipping for bulk performance for now unless critical.
                    modified = true;
                    approvedCount++;
                }
            });

            if (modified) {
                await interview.save();
            }
        }

        res.json({ message: `Successfully approved ${approvedCount} questions across ${interviews.length} sessions.`, count: approvedCount });

    } catch (err) {
        console.error('Error approving all requests:', err);
        res.status(500).json({ message: 'Failed to approve all requests' });
    }
});

// GET feature lock configuration (ADMIN ONLY)
// This endpoint requires authentication and admin role
router.get('/feature-locks', async (req, res) => {
    // Prevent all caching so the admin always sees live state
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    try {
        // Verify admin access
        if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'owner')) {
            return res.status(403).json({
                message: 'Access denied. Admin or Owner rights required.',
                requiresAuth: true
            });
        }

        const features = await Promise.all(FEATURE_LOCKS.map(async (feature) => {
            const isEnabled = await getFeatureStatus(feature.key, true);
            const setting = await SystemSetting.findOne({ key: feature.key }).select('updatedAt updatedBy');

            return {
                ...feature,
                isEnabled,
                isLocked: !isEnabled,
                updatedAt: setting?.updatedAt || null,
                updatedBy: setting?.updatedBy || null
            };
        }));

        res.json({
            success: true,
            features,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error('Error fetching feature locks:', err);
        res.status(500).json({ message: 'Failed to fetch feature locks', error: err.message });
    }
});

// PATCH feature lock status (OWNER ONLY)
// This endpoint requires authentication and owner role
router.patch('/feature-locks/:featureKey', async (req, res) => {
    // Prevent all caching
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    try {
        // Verify owner access
        if (!req.user || req.user.role !== 'owner') {
            return res.status(403).json({
                message: 'Access denied. Owner rights required.',
                requiresAuth: true
            });
        }

        const { featureKey } = req.params;
        const { isEnabled } = req.body;

        if (typeof isEnabled !== 'boolean') {
            return res.status(400).json({ message: 'isEnabled must be a boolean' });
        }

        const featureDefinition = getFeatureDefinition(featureKey);
        if (!featureDefinition) {
            return res.status(404).json({ message: 'Unknown feature key' });
        }

        await setFeatureStatus(featureKey, isEnabled, req.user._id, featureDefinition.description);

        res.json({
            success: true,
            message: `${featureDefinition.label} ${isEnabled ? 'unlocked' : 'locked'} successfully`,
            feature: {
                key: featureKey,
                isEnabled,
                isLocked: !isEnabled
            },
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error('Error updating feature lock:', err);
        res.status(500).json({ message: 'Failed to update feature lock', error: err.message });
    }
});

// DELETE user (Admin/Owner)
router.delete('/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (req.user.role !== 'owner') {
            return res.status(403).json({ message: 'Only the Owner can delete users.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent deleting self, owner, or admin
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot delete yourself' });
        }
        
        if (user.role === 'admin' || user.role === 'owner') {
            return res.status(403).json({ message: 'Cannot delete admin or owner accounts' });
        }

        await User.findByIdAndDelete(userId);

        res.json({ message: 'User permanently deleted from database' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ message: 'Failed to delete user' });
    }
});

// DELETE interview session (Admin/Owner) with creator notification
router.delete('/interviews/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // The id param here is actually the sessionId (UUID), not the _id
        const interview = await Interview.findOne({ sessionId: id });

        if (!interview) {
            return res.status(404).json({ message: 'Interview session not found' });
        }

        // Notify the creator
        const creator = await User.findOne({ email: interview.creatorEmail });
        if (creator) {
            await Notification.create({
                userId: creator._id,
                type: 'warning',
                title: 'Session Deleted',
                message: `Your interview session "${interview.title}" was deleted by an ${req.user.role === 'owner' ? 'owner' : 'administrator'}.`,
                recipientType: 'individual'
            });
        }

        await Interview.findOneAndDelete({ sessionId: id });
        res.json({ message: 'Interview session deleted successfully' });
    } catch (err) {
        console.error('Error deleting interview:', err);
        res.status(500).json({ message: 'Failed to delete interview session' });
    }
});

// PUT Edit interview session metadata (Admin/Owner)
router.put('/interviews/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { title, tag, experience, desc, color, initials, status } = req.body;

        const session = await Interview.findOne({ sessionId });
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Update fields if provided
        if (title) session.title = title;
        if (tag) session.tag = tag;
        if (experience) session.experience = experience;
        if (desc) session.desc = desc;
        if (color) session.color = color;
        if (initials) session.initials = initials;
        if (status) session.status = status;

        // Notify creator
        const creator = await User.findOne({ email: session.creatorEmail });
        if (creator) {
            await Notification.create({
                userId: creator._id,
                type: 'info',
                title: 'Session Updated',
                message: `Your interview session "${session.title}" was edited by an ${req.user.role === 'owner' ? 'owner' : 'administrator'}.`,
                recipientType: 'individual',
                metadata: { sessionId }
            });
        }

        await session.save();
        res.json({ message: 'Session updated successfully', session });
    } catch (err) {
        console.error('Error updating session:', err);
        res.status(500).json({ message: 'Failed to update session' });
    }
});

// GET All sessions (Admin view)
router.get('/interviews', async (req, res) => {
    try {
        const { status, page = 1, limit = 20, search } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build query
        const query = {};
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { tag: { $regex: search, $options: 'i' } },
                { creatorEmail: { $regex: search, $options: 'i' } }
            ];
        }

        const sessions = await Interview.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Interview.countDocuments(query);

        res.json({
            success: true,
            data: sessions,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                total,
                hasMore: parseInt(page) * parseInt(limit) < total
            }
        });
    } catch (err) {
        console.error('Error fetching sessions:', err);
        res.status(500).json({ message: 'Failed to fetch sessions' });
    }
});

// DELETE Note (Admin)
router.delete('/notes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Assuming you have a Note model, but it wasn't required at top.
        // I need to require it or use mongoose.model('Note') if strictly dynamic, 
        // but better to add `const Note = require('../Models/Note');` at top if not there.
        // Checking imports... Note is missing. I will add it to imports in a separate edit or use mongoose.model.
        // For safety/cleanliness, I'll use mongoose.model if I can't confirm the file path, 
        // but I should add the import.
        // Let's assume the file is '../Models/Note'.
        const Note = require('../models/Note');
        const note = await Note.findByIdAndDelete(id);

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        res.json({ message: 'Note deleted successfully' });
    } catch (err) {
        console.error('Error deleting note:', err);
        res.status(500).json({ message: 'Failed to delete note' });
    }
});

// DELETE Resource (Admin)
router.delete('/resources/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const Resource = require('../models/Resource');
        const resource = await Resource.findByIdAndDelete(id);

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        res.json({ message: 'Resource deleted successfully' });
    } catch (err) {
        console.error('Error deleting resource:', err);
        res.status(500).json({ message: 'Failed to delete resource' });
    }
});

// GET all Practice Tests (Admin - includes unpublished)
router.get('/practice-tests', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';

        const PracticeTest = require('../models/PracticeTest');
        
        let query = {};
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { topic: { $regex: search, $options: 'i' } }
            ];
        }

        const totalTests = await PracticeTest.countDocuments(query);
        
        // Use aggregation to get question count without fetching the whole array
        const tests = await PracticeTest.aggregate([
            { $match: query },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    topic: 1,
                    difficulty: 1,
                    isPublished: 1,
                    createdAt: 1,
                    attempts: 1,
                    submissions: 1,
                    maxAttempts: 1,
                    timeLimit: 1,
                    passingScore: 1,
                    isTimeRestricted: 1,
                    startTime: 1,
                    endTime: 1,
                    moduleType: 1,
                    modules: 1,
                    securityEnabled: 1,
                    questionCount: { $size: { $ifNull: ["$questions", []] } },
                    dsaQuestionCount: { $size: { $ifNull: ["$dsaQuestions", []] } }
                }
            }
        ]);

        const processedTests = tests.map(t => {
            const moduleType = t.moduleType || 'mcq';
            const modules = t.modules && t.modules.length > 0 ? t.modules : [
                {
                    moduleType: moduleType,
                    title: moduleType === 'dsa' ? 'DSA Coding Module' : 'Module 1',
                    timeLimit: t.timeLimit || 30,
                    order: 0,
                    passingScore: t.passingScore || 40
                }
            ];
            return {
                ...t,
                moduleType,
                modules
            };
        });

        res.json({
            success: true,
            data: processedTests,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalTests / limit),
                totalTests
            }
        });
    } catch (err) {
        console.error('Error fetching practice tests (Admin):', err);
        res.status(500).json({ success: false, message: 'Failed to fetch practice tests' });
    }
});

// CREATE Practice Test (Admin) — supports MCQ, DSA, and Mixed module types
router.post('/practice-tests', async (req, res) => {
    try {
        const {
            title, description, topic, difficulty, questions,
            isPublished, maxAttempts, timeLimit, guidelines,
            isTimeRestricted, startTime, endTime, passingScore,
            moduleType, modules, dsaQuestions, branch, securityEnabled
        } = req.body;
        const PracticeTest = require('../models/PracticeTest');
        const hasScheduleWindow = isTimeRestricted || !!startTime || !!endTime;

        const testData = {
            title,
            description,
            topic,
            branch: branch || 'computer',
            difficulty,
            moduleType: moduleType || 'mcq',
            modules: modules || [],
            questions: questions || [],
            dsaQuestions: (dsaQuestions || []).map(dq => {
                if (Array.isArray(dq.constraints)) {
                    dq.constraints = dq.constraints.join('\n');
                }
                return dq;
            }),
            createdBy: req.user._id,
            isPublished: isPublished !== undefined ? isPublished : true,
            maxAttempts: maxAttempts !== undefined ? maxAttempts : 1,
            timeLimit: timeLimit !== undefined ? timeLimit : 30,
            guidelines: guidelines || '',
            passingScore: passingScore !== undefined ? passingScore : 40,
            isTimeRestricted: hasScheduleWindow,
            securityEnabled: securityEnabled !== undefined ? securityEnabled : false,
            startTime: startTime || null,
            endTime: endTime || null
        };

        // Auto-generate modules if not provided for dsa/mixed types
        if ((testData.moduleType === 'dsa' || testData.moduleType === 'mixed') && testData.modules.length === 0) {
            const autoModules = [];
            if (testData.moduleType === 'mixed' && testData.questions.length > 0) {
                autoModules.push({ moduleType: 'mcq', title: 'MCQ Module', timeLimit: testData.timeLimit, order: 0, passingScore: testData.passingScore });
            }
            if (testData.dsaQuestions.length > 0) {
                autoModules.push({ moduleType: 'dsa', title: 'DSA Coding Module', timeLimit: 45, order: autoModules.length, passingScore: testData.passingScore });
            }
            testData.modules = autoModules;
        }

        const newTest = new PracticeTest(testData);
        await newTest.save();
        res.status(201).json({ message: 'Practice test created successfully', test: newTest });
    } catch (err) {
        console.error('Error creating practice test:', err);
        res.status(500).json({ message: 'Failed to create practice test', error: err.message });
    }
});

// UPDATE Practice Test (Admin) — supports MCQ, DSA, and Mixed module types
router.put('/practice-tests/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const PracticeTest = require('../models/PracticeTest');

        if (updates.startTime || updates.endTime || updates.isTimeRestricted !== undefined) {
            updates.isTimeRestricted = Boolean(updates.isTimeRestricted || updates.startTime || updates.endTime);
        }

        // Ensure moduleType-related fields are included
        if (updates.moduleType) {
            if (!updates.modules) updates.modules = [];
            if (!updates.dsaQuestions) updates.dsaQuestions = [];
        }

        if (updates.dsaQuestions && Array.isArray(updates.dsaQuestions)) {
            updates.dsaQuestions = updates.dsaQuestions.map(dq => {
                if (Array.isArray(dq.constraints)) {
                    dq.constraints = dq.constraints.join('\n');
                }
                return dq;
            });
        }

        const test = await PracticeTest.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

        if (!test) {
            return res.status(404).json({ message: 'Practice test not found' });
        }

        res.json({ message: 'Practice test updated successfully', test });
    } catch (err) {
        console.error('Error updating practice test:', err);
        res.status(500).json({ message: 'Failed to update practice test' });
    }
});

// GET aggregated analytics for all practice tests (Admin)
router.get('/practice-tests/analytics', async (req, res) => {
    try {
        const PracticeTest = require('../models/PracticeTest');
        const PracticeTestResult = require('../models/PracticeTestResult');

        const totalTests = await PracticeTest.countDocuments();

        const agg = await PracticeTestResult.aggregate([
            { 
                $match: { 
                    practiceTestId: { $exists: true, $ne: null, $nin: ["", "null", "undefined"] } 
                } 
            },
            {
                // Ensure practiceTestId is treated as an ObjectId for consistent grouping
                $addFields: {
                    normalizedTestId: { $toObjectId: "$practiceTestId" }
                }
            },
            {
                $group: {
                    _id: '$normalizedTestId',
                    attempts: { $sum: 1 },
                    submissions: { $sum: { $cond: [{ $in: ['$testStatus', ['completed', 'auto-submitted']] }, 1, 0] } },
                    users: { $addToSet: '$userEmail' },
                    avgScore: { 
                        $avg: {
                            $cond: [{ $in: ['$testStatus', ['completed', 'auto-submitted', 'timeout']] }, '$score', null]
                        } 
                    },
                    lastAttempt: { $max: '$createdAt' }
                }
            },
            {
                $project: {
                    _id: 1,
                    attempts: 1,
                    submissions: 1,
                    uniqueUsersCount: { $size: '$users' },
                    avgScore: { $round: ['$avgScore', 2] },
                    lastAttempt: 1
                }
            }
        ]);

        const testIds = agg.map(a => a._id);
        const tests = await PracticeTest.find({ _id: { $in: testIds } })
            .select('title description topic createdBy createdAt maxAttempts timeLimit passingScore isTimeRestricted startTime endTime attempts submissions');

        const perTest = tests.map(t => {
            const a = agg.find(x => x._id && x._id.toString() === t._id.toString()) || {};
            return {
                testId: t._id,
                title: t.title,
                topic: t.topic,
                createdAt: t.createdAt,
                maxAttempts: t.maxAttempts,
                timeLimit: t.timeLimit,
                passingScore: t.passingScore || 40,
                isTimeRestricted: t.isTimeRestricted,
                startTime: t.startTime,
                endTime: t.endTime,
                // Use the higher value to handle legacy data (where submissions field wasn't present)
                attempts: Math.max(t.attempts || 0, a.attempts || 0),
                submissions: Math.max(t.submissions || 0, a.submissions || 0),
                uniqueUsers: a.uniqueUsersCount || 0,
                avgScore: a.avgScore || 0,
                lastAttempt: a.lastAttempt || null
            };
        });

        // Calculate totals
        // totalAttempts = Sum of all hits in PracticeTest model
        const allTests = await PracticeTest.find({}, 'attempts submissions');
        const totalAttempts = allTests.reduce((s, x) => s + (x.attempts || 0), 0);
        
        // totalSubmissions = Sum of actual completed records in PracticeTestResult (legacy safe)
        const totalSubmissions = agg.reduce((s, x) => s + (x.submissions || 0), 0);
        const distinctUsers = await PracticeTestResult.distinct('userEmail', { practiceTestId: { $ne: null } });

        res.json({
            success: true,
            totals: {
                totalTests,
                totalAttempts,
                totalSubmissions,
                totalUsersAttended: distinctUsers.length
            },
            perTest
        });
    } catch (err) {
        console.error('Error fetching practice tests analytics:', err);
        res.status(500).json({ message: 'Failed to fetch practice tests analytics', error: err.message });
    }
});

// GET Single Practice Test (Admin - Full Details)
router.get('/practice-tests/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const PracticeTest = require('../models/PracticeTest');

        const test = await PracticeTest.findById(id);

        if (!test) {
            return res.status(404).json({ message: 'Practice test not found' });
        }

        const testObj = test.toObject();
        if (!testObj.moduleType) testObj.moduleType = 'mcq';
        if (!testObj.modules || testObj.modules.length === 0) {
            testObj.modules = [
                {
                    moduleType: testObj.moduleType,
                    title: testObj.moduleType === 'dsa' ? 'DSA Coding Module' : 'Module 1',
                    timeLimit: testObj.timeLimit || 30,
                    order: 0,
                    passingScore: testObj.passingScore || 40
                }
            ];
        }

        res.json(testObj);
    } catch (err) {
        console.error('Error fetching practice test details:', err);
        res.status(500).json({ message: 'Failed to fetch practice test details' });
    }
});

// DELETE Practice Test (Admin)
router.delete('/practice-tests/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const PracticeTest = require('../models/PracticeTest');

        const test = await PracticeTest.findByIdAndDelete(id);

        if (!test) {
            return res.status(404).json({ message: 'Practice test not found' });
        }

        res.json({ message: 'Practice test deleted successfully' });
    } catch (err) {
        console.error('Error deleting practice test:', err);
        res.status(500).json({ message: 'Failed to delete practice test' });
    }
});

// GET Practice Test Attempts (Admin)
router.get('/practice-tests/:id/attempts', async (req, res) => {
    try {
        const { id } = req.params;
        const PracticeTestResult = require('../models/PracticeTestResult');

        const attempts = await PracticeTestResult.find({ practiceTestId: id })
            .populate('userId', 'fullName email')
            .populate('practiceTestId', 'title topic')
            .sort({ createdAt: -1 });

        // Merge topic from parent if missing in record
        const data = attempts.map(a => {
            const doc = a.toObject();
            if (!doc.topic && a.practiceTestId) {
                doc.topic = a.practiceTestId.topic;
            }
            return doc;
        });

        res.json({ success: true, data });
    } catch (err) {
        console.error('Error fetching practice test attempts:', err);
        res.status(500).json({ message: 'Failed to fetch attempts' });
    }
});


// RESET Practice Test Attempts for User (Admin)
router.post('/practice-tests/:id/reset-attempts', async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'User email is required' });
        }

        const PracticeTestResult = require('../models/PracticeTestResult');
        const PracticeTest = require('../models/PracticeTest');

        // Get count before deleting for counter sync
        const deletedCount = await PracticeTestResult.countDocuments({
            userEmail: email,
            practiceTestId: id,
            testStatus: { $in: ['completed', 'auto-submitted'] }
        });

        // Delete all PracticeTestResult records matching this user and practice test
        const result = await PracticeTestResult.deleteMany({
            userEmail: email,
            practiceTestId: id
        });

        // Sync the submissions counter if needed
        if (deletedCount > 0) {
            await PracticeTest.findByIdAndUpdate(id, { $inc: { submissions: -deletedCount } });
        }

        res.json({
            success: true,
            message: `Reset ${result.deletedCount} attempt(s) for ${email}`
        });
    } catch (err) {
        console.error('Error resetting practice test attempts:', err);
        res.status(500).json({ message: 'Failed to reset attempts' });
    }
});

// BULK UPLOAD Practice Test Questions (Admin) — supports MCQ and DSA formats
router.post('/practice-tests/bulk-upload', async (req, res) => {
    try {
        const { testId, mcqQuestions, dsaQuestions } = req.body;
        const PracticeTest = require('../models/PracticeTest');

        if (!testId) {
            return res.status(400).json({ message: 'testId is required' });
        }

        const test = await PracticeTest.findById(testId);
        if (!test) {
            return res.status(404).json({ message: 'Practice test not found' });
        }

        let mcqAdded = 0;
        let dsaAdded = 0;

        // Bulk add MCQ questions
        if (mcqQuestions && Array.isArray(mcqQuestions) && mcqQuestions.length > 0) {
            for (const q of mcqQuestions) {
                if (q.question && q.options && q.options.length === 4 && q.correctAnswer !== undefined) {
                    test.questions.push({
                        question: q.question,
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                        explanation: q.explanation || '',
                        codeSnippet: q.codeSnippet || ''
                    });
                    mcqAdded++;
                }
            }
        }

        // Bulk add DSA questions
        if (dsaQuestions && Array.isArray(dsaQuestions) && dsaQuestions.length > 0) {
            for (const dq of dsaQuestions) {
                if (dq.title && dq.description && dq.publicTestCases && dq.publicTestCases.length >= 2 && dq.hiddenTestCases && dq.hiddenTestCases.length >= 1) {
                    test.dsaQuestions.push({
                        title: dq.title,
                        description: dq.description,
                        constraints: dq.constraints || '',
                        difficulty: dq.difficulty || 'medium',
                        allowedLanguages: dq.allowedLanguages || ['cpp', 'java', 'python', 'javascript'],
                        maxScore: dq.maxScore || 100,
                        timeLimit: dq.timeLimit || 2,
                        memoryLimit: dq.memoryLimit || 256,
                        starterCode: dq.starterCode || {},
                        publicTestCases: dq.publicTestCases,
                        hiddenTestCases: dq.hiddenTestCases,
                        moduleIndex: dq.moduleIndex || 0
                    });
                    dsaAdded++;
                }
            }

            // Auto-update moduleType if DSA questions were added to an MCQ-only test
            if (test.moduleType === 'mcq' && dsaAdded > 0) {
                test.moduleType = test.questions.length > 0 ? 'mixed' : 'dsa';
            }
        }

        await test.save();

        res.json({
            success: true,
            message: `Bulk upload complete: ${mcqAdded} MCQ question(s) and ${dsaAdded} DSA question(s) added.`,
            mcqAdded,
            dsaAdded
        });
    } catch (err) {
        console.error('Error in bulk upload:', err);
        res.status(500).json({ message: 'Bulk upload failed', error: err.message });
    }
});

// POST Create Notification (Owner Only)
router.post('/notifications/create', async (req, res) => {
    try {
        // Strict Owner Check
        if (req.user.role !== 'owner') {
            return res.status(403).json({ message: 'Only the Owner can create broadcast notifications.' });
        }

        const { title, message, recipientType, recipientId, isEmailSent } = req.body;
        const Notification = require('../models/Notification');
        const { sendNotificationEmail } = require('../utils/emailService');

        if (!title || !message || !recipientType) {
            return res.status(400).json({ message: 'Title, message, and recipientType are required.' });
        }

        let notificationData = {
            title,
            message,
            recipientType,
            createdBy: req.user._id,
            isActive: true,
            emailSent: isEmailSent || false
        };

        if (recipientType === 'user' || recipientType === 'admin') {
            if (!recipientId) return res.status(400).json({ message: 'Recipient ID required for specific user/admin.' });
            notificationData.recipientType = 'individual';
            notificationData.userId = recipientId; // Legacy support
            notificationData.targetAudience = 'none';
        } else if (recipientType === 'all') {
            notificationData.recipientType = 'broadcast';
            notificationData.targetAudience = 'all';
        } else if (recipientType === 'all_admins') {
            notificationData.recipientType = 'broadcast';
            notificationData.targetAudience = 'admins';
        }

        const notification = new Notification(notificationData);
        await notification.save();

        // Handle Email Sending
        if (isEmailSent) {
            // Async execution to not block response
            (async () => {
                try {
                    if (recipientType === 'user' || recipientType === 'admin') {
                        // Fetch email
                        const targetUser = await User.findById(recipientId);
                        if (targetUser && targetUser.preferences?.emailNotifications !== false) {
                            await sendNotificationEmail(targetUser.email, title, message);
                        }
                    } else {
                        // Broadcast Email
                        let query = {};
                        if (recipientType === 'all_admins') {
                            query.role = { $in: ['admin', 'owner'] };
                        } else if (recipientType === 'all') {
                            // query remains {}
                        }

                        // We only send to those who have email enabled
                        query['preferences.emailNotifications'] = { $ne: false };

                        // Limit to avoid explosion? 
                        const users = await User.find(query, 'email');

                        console.log(`Sending broadcast email to ${users.length} users...`);

                        // Send in chunks or sequentially
                        // Use a simple loop for now (SendGrid/Brevo usually handles rate limits, but we should be careful)
                        for (const u of users) {
                            try {
                                await sendNotificationEmail(u.email, title, message);
                            } catch (e) {
                                console.error(`Failed to send email to ${u.email}`, e.message);
                            }
                        }
                        console.log('Broadcast emails sent.');
                    }
                } catch (emailErr) {
                    console.error('Error in email sending task:', emailErr);
                }
            })();
        }

        res.status(201).json({ message: 'Notification created successfully', notification });

    } catch (err) {
        console.error('Error creating notification:', err);
        res.status(500).json({ message: 'Failed to create notification' });
    }
});


// GET All Broadcast Notifications
router.get('/notifications/broadcasts', async (req, res) => {
    try {
        const Notification = require('../models/Notification');
        const broadcasts = await Notification.find({
            recipientType: { $in: ['all', 'broadcast'] },
            isActive: true
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            broadcasts
        });
    } catch (err) {
        console.error('Error fetching broadcasts:', err);
        res.status(500).json({ message: 'Failed to fetch broadcasts' });
    }
});

// DELETE Broadcast Notification (Permanent)
router.delete('/notifications/broadcasts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const Notification = require('../models/Notification');

        // Find first to verify it's a broadcast
        const notification = await Notification.findOne({
            _id: id,
            recipientType: { $in: ['all', 'broadcast'] }
        });

        if (!notification) {
            return res.status(404).json({ message: 'Broadcast notification not found' });
        }

        await Notification.findByIdAndDelete(id);

        res.json({ message: 'Broadcast notification deleted permanently' });
    } catch (err) {
        console.error('Error deleting broadcast:', err);
        res.status(500).json({ message: 'Failed to delete broadcast' });
    }
});

// GET User specific activity and stats (Admin)
router.get('/users/:userId/activity', async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const email = user.email;

        // Dynamically load models
        const RoadmapProgress = require('../models/RoadmapProgress');
        const Note = require('../models/Note');
        const Resource = require('../models/Resource');
        const PracticeTestResult = require('../models/PracticeTestResult');
        const MockInterview = require('../models/MockInterview');
        const MCQTest = require('../models/MCQTest');

        // Fetch counts
        const [
            interviewsCount, // This is actually Q&A sessions
            roadmapsCount,
            notesCount,
            resourcesCount,
            testsCount,
            aiInterviewsCount,
            aiMcqTestsCount
        ] = await Promise.all([
            Interview.countDocuments({ creatorEmail: email }),
            RoadmapProgress.countDocuments({ userId }),
            Note.countDocuments({ authorId: userId }),
            Resource.countDocuments({ uploadedBy: userId }),
            PracticeTestResult.countDocuments({ userEmail: email }),
            MockInterview.countDocuments({ userId }),
            MCQTest.countDocuments({ userId })
        ]);

        // Aggregate chronological activity for the timeline chart
        // We will pull the last 6 months of data
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        // Function to group by month 'YYYY-MM'
        const getMonthlyAggregation = async (Model, dateField, matchQuery) => {
            return Model.aggregate([
                { $match: { ...matchQuery, [dateField]: { $gte: sixMonthsAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m", date: `$${dateField}` } },
                        count: { $sum: 1 }
                    }
                }
            ]);
        };

        const [monthlyInterviews, monthlyTests, monthlyRoadmaps, monthlyAiInterviews, monthlyAiTests] = await Promise.all([
            getMonthlyAggregation(Interview, 'createdAt', { creatorEmail: email }),
            getMonthlyAggregation(PracticeTestResult, 'createdAt', { userEmail: email }),
            getMonthlyAggregation(RoadmapProgress, 'lastUpdated', { userId: new mongoose.Types.ObjectId(userId) }),
            getMonthlyAggregation(MockInterview, 'createdAt', { userId: new mongoose.Types.ObjectId(userId) }),
            getMonthlyAggregation(MCQTest, 'createdAt', { userId: new mongoose.Types.ObjectId(userId) })
        ]);

        // Merge monthly stats into a unified array
        const timelineMap = {};
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthStr = d.toISOString().substring(0, 7); // 'YYYY-MM'
            timelineMap[monthStr] = { month: monthStr, interviews: 0, tests: 0, roadmaps: 0, aiInterviews: 0, aiTests: 0 };
        }

        monthlyInterviews.forEach(item => { if (timelineMap[item._id]) timelineMap[item._id].interviews = item.count; });
        monthlyTests.forEach(item => { if (timelineMap[item._id]) timelineMap[item._id].tests = item.count; });
        monthlyRoadmaps.forEach(item => { if (timelineMap[item._id]) timelineMap[item._id].roadmaps = item.count; });
        monthlyAiInterviews.forEach(item => { if (timelineMap[item._id]) timelineMap[item._id].aiInterviews = item.count; });
        monthlyAiTests.forEach(item => { if (timelineMap[item._id]) timelineMap[item._id].aiTests = item.count; });

        const timeline = Object.values(timelineMap);

        res.json({
            success: true,
            user: {
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                joinedAt: user.createdAt
            },
            stats: {
                interviewsCount, // Q&A
                roadmapsCount,
                notesCount,
                resourcesCount,
                testsCount,
                aiInterviewsCount,
                aiMcqTestsCount
            },
            timeline
        });

    } catch (err) {
        console.error('Error fetching user activity:', err);
        res.status(500).json({ message: 'Failed to fetch user activity' });
    }
});

// DELETE All Banned Users (Owner Only)
router.delete('/users/banned/all', async (req, res) => {
    try {
        if (req.user.role !== 'owner') {
            return res.status(403).json({ message: 'Only the Owner can delete users.' });
        }

        const result = await User.deleteMany({ isBanned: true });
        res.json({ message: `Successfully deleted ${result.deletedCount} banned users.` });
    } catch (err) {
        console.error('Error deleting banned users:', err);
        res.status(500).json({ message: 'Failed to delete banned users' });
    }
});



// GET Roadmap Analytics (Admin)
router.get('/roadmaps/:roadmapId/analytics', async (req, res) => {
    try {
        const { roadmapId } = req.params;
        const RoadmapProgress = require('../models/RoadmapProgress');
        
        const progresses = await RoadmapProgress.find({ roadmapId })
            .populate('userId', 'fullName email avatar')
            .sort({ lastUpdated: -1 });

        res.json({
            success: true,
            data: progresses
        });
    } catch (err) {
        console.error('Error fetching roadmap analytics:', err);
        res.status(500).json({ message: 'Failed to fetch roadmap analytics' });
    }
});

module.exports = router;
