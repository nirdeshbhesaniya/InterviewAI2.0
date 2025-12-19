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

router.post('/register', upload.single('photo'), registerUser);
router.post('/verify-registration-otp', verifyRegistrationOTP);
router.post('/resend-registration-otp', resendRegistrationOTP);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

module.exports = router;
