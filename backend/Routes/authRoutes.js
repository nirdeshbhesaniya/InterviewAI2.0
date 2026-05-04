const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
    registerUser,
    verifyRegistrationOTP,
    resendRegistrationOTP,
    loginUser,
    forgotPassword,
    verifyOTP,
    resetPassword
} = require('../Controllers/authController');
const upload = require('../middlewares/upload');
const registrationSecurity = require('../middlewares/registrationSecurity');

// ── Rate limiter: max 5 registration attempts per IP per 15 minutes ──────
const TEST_BYPASS_KEY = process.env.TEST_BYPASS_KEY || 'dev-test-bypass-key-change-in-prod';

const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limit for local test scripts (NEVER active in production)
  skip: (req) => {
    if (process.env.NODE_ENV === 'production') return false;
    return req.headers['x-test-key'] === TEST_BYPASS_KEY;
  },
  message: {
    message: 'Too many account creation attempts from this IP. Please wait 15 minutes and try again.'
  },
  handler: (req, res) => {
    console.warn(`⚠️  Registration rate limit hit: IP=${req.ip}`);
    res.status(429).json({
      message: 'Too many account creation attempts from this IP. Please wait 15 minutes and try again.',
      retryAfter: 15 * 60
    });
  }
});

// ── Rate limiter: max 10 OTP resend attempts per IP per 30 minutes ────────
const otpResendLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many OTP resend attempts. Please wait before trying again.' }
});

// Multer error handling middleware
const handleMulterError = (err, req, res, next) => {
    if (err) {
        if (err.name === 'MulterError') {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'Image file is too large. Maximum size is 5MB.' });
            }
            return res.status(400).json({ message: 'Image upload error: ' + err.message });
        }
        if (err.message && err.message.includes('Only JPEG')) {
            return res.status(400).json({ message: err.message });
        }
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
    next();
};

// 📝 Register: rate-limit → multer upload → security checks → controller
router.post(
  '/register',
  registrationLimiter,
  upload.single('photo'),
  handleMulterError,
  registrationSecurity,
  registerUser
);

// 🔑 OTP verification (no heavy limits – OTP itself is the gate)
router.post('/verify-registration-otp', verifyRegistrationOTP);

// 📨 Resend OTP (limited to prevent OTP flooding)
router.post('/resend-registration-otp', otpResendLimiter, resendRegistrationOTP);

router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

module.exports = router;
