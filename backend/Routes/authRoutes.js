const express = require('express');
const router = express.Router();
const { registerUser, loginUser, forgotPassword, verifyOTP, resetPassword } = require('../Controllers/authController');
const upload = require('../middlewares/upload'); // ✅ Use this and remove any redefinition

router.post('/register', upload.single('photo'), registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

module.exports = router;
