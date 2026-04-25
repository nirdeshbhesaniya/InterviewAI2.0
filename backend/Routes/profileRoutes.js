const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Interview = require('../models/Interview'); // 👈 Import Interview model
const bcrypt = require('bcryptjs');
const upload = require('../middlewares/upload');
const { uploadToCloudinary } = require('../utils/cloudinary');
// ... (lines 8-109 unchanged)



// Middleware to verify user authentication
const authenticateUser = async (req, res, next) => {
    try {
        // For FormData requests, req.body might not be available yet
        // We'll get the user email from headers or body
        let userEmail = req.headers['user-email'];

        // If not in headers, try to get from body (for JSON requests)
        if (!userEmail && req.body && req.body.email) {
            userEmail = req.body.email;
        }

        //.log('Authentication attempt - Headers:', req.headers['user-email'], 'Body email:', req.body?.email);

        if (!userEmail) {
            return res.status(401).json({
                success: false,
                message: 'User email required for authentication'
            });
        }

        const user = await User.findOne({ email: userEmail });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.isBanned || user.isDeleted) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been blocked or deleted by admin',
                isBanned: true
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({
            success: false,
            message: 'Authentication failed',
            error: error.message
        });
    }
};

// Get user profile
router.get('/', authenticateUser, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password -resetPasswordToken -resetPasswordExpires -otp -otpExpires');

        res.json({
            success: true,
            data: { user }
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile'
        });
    }
});

// Update user profile
router.put('/update', authenticateUser, async (req, res) => {
    try {
        const { fullName, bio, location, website, linkedin, github, careerProfile } = req.body;

        // Validate required fields
        if (!fullName || fullName.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Full name is required'
            });
        }

        // Validate URLs if provided
        const urlFields = { website, linkedin, github };
        for (const [field, url] of Object.entries(urlFields)) {
            if (url && url.trim()) {
                try {
                    new URL(url);
                } catch (error) {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid ${field} URL format`
                    });
                }
            }
        }

        const sanitizeStringArray = (arr) => {
            if (!Array.isArray(arr)) return [];
            return [...new Set(arr.map((item) => String(item || '').trim()).filter(Boolean))];
        };

        const normalizeWorkExperience = (items) => {
            if (!Array.isArray(items)) return [];
            return items
                .map((item) => ({
                    companyName: String(item?.companyName || '').trim(),
                    role: String(item?.role || '').trim(),
                    startDate: String(item?.startDate || '').trim(),
                    endDate: String(item?.endDate || '').trim(),
                    description: String(item?.description || '').trim(),
                    keySkills: String(item?.keySkills || '').trim()
                }))
                .filter((item) => item.companyName || item.role || item.description);
        };

        const normalizeRecruiterProfile = (profile) => {
            if (!profile || typeof profile !== 'object') return undefined;

            return {
                basic: {
                    headline: String(profile.basic?.headline || '').trim(),
                    currentCompany: String(profile.basic?.currentCompany || '').trim(),
                    currentSalary: String(profile.basic?.currentSalary || '').trim(),
                    expectedSalary: String(profile.basic?.expectedSalary || '').trim(),
                    noticePeriod: String(profile.basic?.noticePeriod || '').trim()
                },
                contact: {
                    emailVerified: Boolean(profile.contact?.emailVerified),
                    phone: String(profile.contact?.phone || '').trim(),
                    phoneVerified: Boolean(profile.contact?.phoneVerified),
                    address: String(profile.contact?.address || '').trim(),
                    preferredLocation: String(profile.contact?.preferredLocation || '').trim(),
                    privacy: String(profile.contact?.privacy || 'recruiter').trim() || 'recruiter'
                },
                career: {
                    industry: String(profile.career?.industry || '').trim(),
                    functionalArea: String(profile.career?.functionalArea || '').trim(),
                    role: String(profile.career?.role || '').trim(),
                    jobType: String(profile.career?.jobType || '').trim(),
                    preferredShift: String(profile.career?.preferredShift || '').trim(),
                    employmentType: String(profile.career?.employmentType || '').trim()
                },
                workExperience: normalizeWorkExperience(profile.workExperience),
                education: Array.isArray(profile.education)
                    ? profile.education
                        .map((item) => ({
                            degree: String(item?.degree || '').trim(),
                            collegeName: String(item?.collegeName || '').trim(),
                            yearOfPassing: String(item?.yearOfPassing || '').trim(),
                            score: String(item?.score || '').trim()
                        }))
                        .filter((item) => item.degree || item.collegeName)
                    : [],
                skills: {
                    keySkills: sanitizeStringArray(profile.skills?.keySkills),
                    secondarySkills: sanitizeStringArray(profile.skills?.secondarySkills),
                    levels: sanitizeStringArray(profile.skills?.levels)
                },
                resume: {
                    fileName: String(profile.resume?.fileName || '').trim(),
                    fileUrl: String(profile.resume?.fileUrl || '').trim(),
                    uploadedAt: profile.resume?.uploadedAt ? new Date(profile.resume.uploadedAt) : undefined
                },
                projects: Array.isArray(profile.projects)
                    ? profile.projects
                        .map((item) => ({
                            title: String(item?.title || '').trim(),
                            description: String(item?.description || '').trim(),
                            techStack: String(item?.techStack || '').trim(),
                            githubLink: String(item?.githubLink || '').trim(),
                            liveLink: String(item?.liveLink || '').trim()
                        }))
                        .filter((item) => item.title || item.description)
                    : [],
                accomplishments: {
                    certifications: sanitizeStringArray(profile.accomplishments?.certifications),
                    awards: sanitizeStringArray(profile.accomplishments?.awards),
                    publications: sanitizeStringArray(profile.accomplishments?.publications),
                    patents: sanitizeStringArray(profile.accomplishments?.patents)
                },
                onlineProfiles: {
                    linkedin: String(profile.onlineProfiles?.linkedin || '').trim(),
                    github: String(profile.onlineProfiles?.github || '').trim(),
                    portfolio: String(profile.onlineProfiles?.portfolio || '').trim()
                },
                summary: String(profile.summary || '').trim()
            };
        };

        const existingCareerProfile = req.user.careerProfile || {};
        const normalizedRecruiterProfile = careerProfile && typeof careerProfile === 'object' && careerProfile.recruiterProfile !== undefined
            ? normalizeRecruiterProfile(careerProfile.recruiterProfile)
            : existingCareerProfile.recruiterProfile;

        const normalizedCareerProfile = careerProfile && typeof careerProfile === 'object'
            ? {
                personal: {
                    phone: String(careerProfile.personal?.phone || '').trim(),
                    gender: String(careerProfile.personal?.gender || '').trim(),
                    dateOfBirth: String(careerProfile.personal?.dateOfBirth || '').trim()
                },
                preferences: {
                    jobTypes: sanitizeStringArray(careerProfile.preferences?.jobTypes),
                    availability: String(careerProfile.preferences?.availability || '').trim(),
                    preferredLocations: sanitizeStringArray(careerProfile.preferences?.preferredLocations)
                },
                profileSummary: String(careerProfile.profileSummary || '').trim(),
                keySkills: sanitizeStringArray(careerProfile.keySkills),
                languages: Array.isArray(careerProfile.languages)
                    ? careerProfile.languages
                        .map((item) => ({
                            name: String(item?.name || '').trim(),
                            proficiency: String(item?.proficiency || '').trim()
                        }))
                        .filter((item) => item.name)
                    : [],
                education: Array.isArray(careerProfile.education)
                    ? careerProfile.education
                        .map((item) => ({
                            degree: String(item?.degree || '').trim(),
                            institute: String(item?.institute || '').trim(),
                            graduationYear: String(item?.graduationYear || '').trim(),
                            courseType: String(item?.courseType || '').trim(),
                            score: String(item?.score || '').trim()
                        }))
                        .filter((item) => item.degree || item.institute)
                    : [],
                internships: Array.isArray(careerProfile.internships)
                    ? careerProfile.internships
                        .map((item) => ({
                            company: String(item?.company || '').trim(),
                            role: String(item?.role || '').trim(),
                            duration: String(item?.duration || '').trim(),
                            description: String(item?.description || '').trim()
                        }))
                        .filter((item) => item.company || item.role)
                    : [],
                projects: Array.isArray(careerProfile.projects)
                    ? careerProfile.projects
                        .map((item) => ({
                            title: String(item?.title || '').trim(),
                            technologies: sanitizeStringArray(item?.technologies || []),
                            description: String(item?.description || '').trim(),
                            link: String(item?.link || '').trim()
                        }))
                        .filter((item) => item.title || item.description)
                    : [],
                accomplishments: sanitizeStringArray(careerProfile.accomplishments),
                competitiveExams: Array.isArray(careerProfile.competitiveExams)
                    ? careerProfile.competitiveExams
                        .map((item) => ({
                            examName: String(item?.examName || '').trim(),
                            score: String(item?.score || '').trim(),
                            year: String(item?.year || '').trim()
                        }))
                        .filter((item) => item.examName)
                    : [],
                employment: Array.isArray(careerProfile.employment)
                    ? careerProfile.employment
                        .map((item) => ({
                            company: String(item?.company || '').trim(),
                            role: String(item?.role || '').trim(),
                            duration: String(item?.duration || '').trim(),
                            description: String(item?.description || '').trim()
                        }))
                        .filter((item) => item.company || item.role)
                    : [],
                academicAchievements: sanitizeStringArray(careerProfile.academicAchievements),
                recruiterProfile: normalizedRecruiterProfile
            }
            : undefined;

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                fullName: fullName.trim(),
                bio: bio?.trim() || '',
                location: location?.trim() || '',
                website: website?.trim() || '',
                linkedin: linkedin?.trim() || '',
                github: github?.trim() || '',
                ...(normalizedCareerProfile ? { careerProfile: normalizedCareerProfile } : {}),
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        ).select('-password -resetPasswordToken -resetPasswordExpires -otp -otpExpires');

        // Sync changes to Interview sessions
        try {
            await Interview.updateMany(
                { creatorEmail: req.user.email },
                {
                    $set: {
                        'creatorDetails.fullName': updatedUser.fullName,
                        'creatorDetails.bio': updatedUser.bio,
                        'creatorDetails.location': updatedUser.location,
                        'creatorDetails.website': updatedUser.website,
                        'creatorDetails.linkedin': updatedUser.linkedin,
                        'creatorDetails.github': updatedUser.github
                    }
                }
            );
        } catch (syncError) {
            console.error('Failed to sync profile updates to sessions:', syncError);
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user: updatedUser }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
});

// Upload profile photo
router.post('/upload-photo', upload.single('photo'), async (req, res) => {
    try {
        // Authenticate user after multer processes the FormData
        const userEmail = req.body.email || req.headers['user-email'];

        if (!userEmail) {
            return res.status(401).json({
                success: false,
                message: 'User email required for authentication'
            });
        }

        const user = await User.findOne({ email: userEmail });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No photo file provided'
            });
        }

        // Upload to Cloudinary
        const result = await uploadToCloudinary(req.file.buffer, {
            folder: 'interview-ai/profiles',
            width: 400,
            height: 400,
            crop: 'fill',
            gravity: 'face'
        });

        // Update user's photo URL
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            {
                photo: result.secure_url,
                updatedAt: new Date()
            },
            { new: true }
        ).select('-password -resetPasswordToken -resetPasswordExpires -otp -otpExpires');

        // Sync photo change to Interview sessions
        try {
            await Interview.updateMany(
                { creatorEmail: user.email },
                {
                    $set: {
                        'creatorDetails.photo': result.secure_url
                    }
                }
            );
        } catch (syncError) {
            console.error('Failed to sync profile photo to sessions:', syncError);
        }

        res.json({
            success: true,
            message: 'Profile photo updated successfully',
            data: {
                photoUrl: result.secure_url,
                user: updatedUser
            }
        });
    } catch (error) {
        console.error('Error uploading profile photo:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload profile photo'
        });
    }
});

// Change password
router.put('/change-password', authenticateUser, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long'
            });
        }

        // Verify current password
        const user = await User.findById(req.user._id);
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 12);

        // Update password and track change date
        await User.findByIdAndUpdate(req.user._id, {
            password: hashedNewPassword,
            lastPasswordChange: new Date(),
            updatedAt: new Date()
        });

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password'
        });
    }
});

// Delete account (soft delete with confirmation)
router.delete('/delete-account', authenticateUser, async (req, res) => {
    try {
        // Mark account as deleted (soft delete)
        await User.findByIdAndUpdate(req.user._id, {
            isDeleted: true,
            deletedAt: new Date(),
            // Clear sensitive data
            sessions: [],
            resetPasswordToken: undefined,
            resetPasswordExpires: undefined,
            otp: undefined,
            otpExpires: undefined
        });

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete account'
        });
    }
});

// Get user preferences
router.get('/preferences', authenticateUser, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        // Return preferences with defaults if not set
        const preferences = {
            emailNotifications: user.preferences?.emailNotifications ?? true,
            testReminders: user.preferences?.testReminders ?? true,
            weeklyDigest: user.preferences?.weeklyDigest ?? false,
            language: user.preferences?.language || 'en',
            timezone: user.preferences?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
        };

        res.json({
            success: true,
            data: preferences
        });
    } catch (error) {
        console.error('Error fetching preferences:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch preferences'
        });
    }
});

// Update user preferences
router.put('/preferences', authenticateUser, async (req, res) => {
    try {
        const { emailNotifications, testReminders, weeklyDigest, language, timezone } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                preferences: {
                    emailNotifications,
                    testReminders,
                    weeklyDigest,
                    language,
                    timezone
                }
            },
            { new: true }
        );

        res.json({
            success: true,
            message: 'Preferences updated successfully',
            data: updatedUser.preferences
        });
    } catch (error) {
        console.error('Error updating preferences:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update preferences'
        });
    }
});

// Get security information
router.get('/security', authenticateUser, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        // Get current token from request header
        const currentToken = req.headers.authorization?.replace('Bearer ', '');

        // Format sessions for frontend
        const sessions = (user.sessions || []).map((session, index) => ({
            id: session._id || `session-${index}`,
            device: session.device || 'Unknown Device',
            browser: session.browser || 'Unknown',
            os: session.os || 'Unknown',
            location: session.location || 'Unknown Location',
            ip: session.ip || 'Unknown IP',
            lastActive: session.lastActive || session.createdAt,
            createdAt: session.createdAt,
            current: session.token === currentToken
        }));

        res.json({
            success: true,
            data: {
                sessions,
                twoFactorEnabled: user.twoFactorEnabled || false,
                lastPasswordChange: user.lastPasswordChange || null
            }
        });
    } catch (error) {
        console.error('Error fetching security info:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch security information'
        });
    }
});

// Revoke session
router.post('/revoke-session', authenticateUser, async (req, res) => {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: 'Session ID is required'
            });
        }

        const user = await User.findById(req.user._id);

        // Remove the session
        user.sessions = user.sessions.filter(session =>
            session._id.toString() !== sessionId &&
            `session-${user.sessions.indexOf(session)}` !== sessionId
        );

        await user.save();

        res.json({
            success: true,
            message: 'Session revoked successfully'
        });
    } catch (error) {
        console.error('Error revoking session:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to revoke session'
        });
    }
});

// Toggle Two-Factor Authentication
router.post('/toggle-2fa', authenticateUser, async (req, res) => {
    try {
        const { enabled } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { twoFactorEnabled: enabled },
            { new: true }
        );

        res.json({
            success: true,
            message: `Two-factor authentication ${enabled ? 'enabled' : 'disabled'} successfully`,
            data: { twoFactorEnabled: user.twoFactorEnabled }
        });
    } catch (error) {
        console.error('Error toggling 2FA:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle two-factor authentication'
        });
    }
});

// Get user statistics
router.get('/stats', authenticateUser, async (req, res) => {
    try {
        // Import models
        const Interview = require('../models/Interview');
        const MCQTest = require('../models/MCQTest');
        const Note = require('../models/Note');

        // Get actual statistics from database
        const [interviewCount, mcqCount, notesCount] = await Promise.all([
            // Count interview sessions created by user
            Interview.countDocuments({ userEmail: req.user.email }),

            // Count MCQ tests taken by user
            MCQTest.countDocuments({ userEmail: req.user.email }),

            // Count notes shared by user
            Note.countDocuments({ userId: req.user.email })
        ]);

        // Get activity timeline for last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [mcqActivity, notesActivity, interviewActivity] = await Promise.all([
            MCQTest.aggregate([
                {
                    $match: {
                        userEmail: req.user.email,
                        createdAt: { $gte: thirtyDaysAgo }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Note.aggregate([
                {
                    $match: {
                        userId: req.user.email,
                        createdAt: { $gte: thirtyDaysAgo }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Interview.aggregate([
                {
                    $match: {
                        userEmail: req.user.email,
                        createdAt: { $gte: thirtyDaysAgo }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ])
        ]);

        // Create activity timeline array
        const activityMap = {};

        mcqActivity.forEach(item => {
            if (!activityMap[item._id]) activityMap[item._id] = { date: item._id, tests: 0, notes: 0, interviews: 0 };
            activityMap[item._id].tests = item.count;
        });

        notesActivity.forEach(item => {
            if (!activityMap[item._id]) activityMap[item._id] = { date: item._id, tests: 0, notes: 0, interviews: 0 };
            activityMap[item._id].notes = item.count;
        });

        interviewActivity.forEach(item => {
            if (!activityMap[item._id]) activityMap[item._id] = { date: item._id, tests: 0, notes: 0, interviews: 0 };
            activityMap[item._id].interviews = item.count;
        });

        const activityTimeline = Object.values(activityMap).sort((a, b) =>
            new Date(a.date) - new Date(b.date)
        );

        // Get performance by category (from MCQ tests)
        const performanceByCategory = await MCQTest.aggregate([
            {
                $match: {
                    userEmail: req.user.email,
                    score: { $exists: true }
                }
            },
            {
                $group: {
                    _id: '$topic',
                    avgScore: { $avg: '$score' },
                    testCount: { $sum: 1 }
                }
            },
            {
                $project: {
                    category: '$_id',
                    score: { $round: ['$avgScore', 0] },
                    tests: '$testCount',
                    _id: 0
                }
            },
            { $sort: { score: -1 } },
            { $limit: 5 }
        ]);

        const stats = {
            interviewsSessions: interviewCount,
            mcqTestsTaken: mcqCount,
            notesShared: notesCount,
            joinedDate: req.user.createdAt,
            lastActive: new Date(),
            activityTimeline,
            performanceByCategory
        };

        res.json({
            success: true,
            data: { stats }
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user statistics'
        });
    }
});

module.exports = router;
