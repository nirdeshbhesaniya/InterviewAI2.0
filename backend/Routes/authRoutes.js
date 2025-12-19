const express = require('express');
const router = express.Router();
const {
    registerUser,
    verifyRegistrationOTP,
    resendRegistrationOTP,
    loginUser,
    forgotPassword,
    verifyOTP,
    resetPassword
} = require('../Controllers/authController');
const upload = require('../middlewares/upload'); // ✅ Use this and remove any redefinition

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

router.post('/register', upload.single('photo'), handleMulterError, registerUser);
router.post('/verify-registration-otp', verifyRegistrationOTP);
router.post('/resend-registration-otp', resendRegistrationOTP);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

module.exports = router;
