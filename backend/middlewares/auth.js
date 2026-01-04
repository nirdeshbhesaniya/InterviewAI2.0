const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Access token required' });
        }

        const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

        jwt.verify(token, jwtSecret, async (err, decodedUser) => {
            if (err) {
                console.error('Token verification failed:', err.message);
                return res.status(403).json({
                    message: 'Invalid or expired token',
                    error: err.message
                });
            }

            try {
                // Fetch full user to check ban status (optional: can rely on token if we assume short expiration, but DB check is safer for immediate ban)
                // For performance, we might want to cache this or minimalize, but for now we'll do a quick check.
                // Assuming we can trust the token payload for basic info, but for ban status we MUST check DB or assume token invalidation mechanism exists.
                // Since this app doesn't have token revocation list, DB check is best for ban enforcement.

                // optimization: if we have a user cache, check there. For now, findOne with selection.
                // Re-require User here to avoid circular dependency if possible, or assume it's available.
                const User = require('../Models/User');
                const user = await User.findById(decodedUser.userId).select('isBanned role email fullName');

                if (!user) {
                    return res.status(401).json({ message: 'User not found' });
                }

                if (user.isBanned) {
                    return res.status(403).json({
                        message: 'your account blocked by admin', // Specific message as requested
                        isBanned: true
                    });
                }

                req.user = user;
                next();
            } catch (dbErr) {
                console.error('Auth Middleware DB Error:', dbErr);
                res.status(500).json({ message: 'Internal server error during auth' });
            }
        });
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ message: 'Authentication failed', error: error.message });
    }
};

module.exports = { authenticateToken };
