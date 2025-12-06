const express = require('express');
const router = express.Router();
const User = require('../Models/User');
const bcrypt = require('bcryptjs');
const upload = require('../middlewares/upload');
const { uploadToCloudinary } = require('../utils/cloudinary');

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

        console.log('Authentication attempt - Headers:', req.headers['user-email'], 'Body email:', req.body?.email);

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
        const { fullName, bio, location, website, linkedin, github } = req.body;

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

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                fullName: fullName.trim(),
                bio: bio?.trim() || '',
                location: location?.trim() || '',
                website: website?.trim() || '',
                linkedin: linkedin?.trim() || '',
                github: github?.trim() || '',
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        ).select('-password -resetPasswordToken -resetPasswordExpires -otp -otpExpires');

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

        // Update password
        await User.findByIdAndUpdate(req.user._id, {
            password: hashedNewPassword,
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
        const { password, confirmDelete } = req.body;

        if (!password || confirmDelete !== 'DELETE') {
            return res.status(400).json({
                success: false,
                message: 'Password and confirmation required'
            });
        }

        // Verify password
        const user = await User.findById(req.user._id);
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Incorrect password'
            });
        }

        // Mark account as deleted (you might want to implement soft delete)
        await User.findByIdAndUpdate(req.user._id, {
            isDeleted: true,
            deletedAt: new Date()
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

// Get user statistics
router.get('/stats', authenticateUser, async (req, res) => {
    try {
        // You can expand this to get actual statistics from your database
        const stats = {
            interviewsSessions: 0, // Count from Interview model
            mcqTestsTaken: 0, // Count from MCQ submissions
            totalTimeSpent: 0, // Calculate from session data
            averageScore: 0, // Calculate from test results
            joinedDate: req.user.createdAt,
            lastActive: new Date()
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
