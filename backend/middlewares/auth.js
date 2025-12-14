const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Access token required' });
        }

        const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
        
        jwt.verify(token, jwtSecret, (err, user) => {
            if (err) {
                console.error('Token verification failed:', err.message);
                return res.status(403).json({ 
                    message: 'Invalid or expired token',
                    error: err.message 
                });
            }

            req.user = user;
            next();
        });
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ message: 'Authentication failed', error: error.message });
    }
};

module.exports = { authenticateToken };
