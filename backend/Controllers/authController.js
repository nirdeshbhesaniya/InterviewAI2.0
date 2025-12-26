const bcrypt = require('bcryptjs');
const User = require('../Models/User');
const { cloudinary, uploadToCloudinary } = require('../utils/cloudinary');
const { sendOTPEmail, sendWelcomeEmail, sendRegistrationOTPEmail } = require('../utils/emailService');
const crypto = require('crypto');

// Generate a 4-digit OTP for registration
const generateRegistrationOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Generate a 6-digit OTP for password reset
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: 'Please provide all required fields: fullName, email, and password'
      });
    }

    // Check for existing user with timeout
    let existingUser;
    try {
      existingUser = await User.findOne({ email }).maxTimeMS(5000);
    } catch (dbError) {
      console.error('❌ Database error during registration check:', dbError.message);
      return res.status(503).json({
        message: 'Service temporarily unavailable. Please try again.',
        error: process.env.NODE_ENV === 'production' ? undefined : dbError.message
      });
    }

    if (existingUser) {
      // If user exists but not verified, allow re-registration
      if (!existingUser.isEmailVerified) {
        // Generate new OTP
        const otp = generateRegistrationOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Upload profile image if provided
        let uploadedPhotoUrl = '';
        if (req.file) {
          try {
            const result = await uploadToCloudinary(req.file.buffer, { folder: 'user_profiles' });
            uploadedPhotoUrl = result.secure_url;
          } catch (uploadError) {
            console.error('Cloudinary upload error:', uploadError);
            return res.status(500).json({
              message: 'Failed to upload profile image. Please try again with a different image.'
            });
          }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update temp user data
        existingUser.tempUserData = {
          fullName,
          email,
          password: hashedPassword,
          photo: uploadedPhotoUrl
        };
        existingUser.emailVerificationOTP = otp;
        existingUser.emailVerificationOTPExpires = otpExpires;
        await existingUser.save();

        // Send OTP email
        const emailResult = await sendRegistrationOTPEmail(email, otp, fullName);

        console.log('📧 Email Result (Existing User):', emailResult);

        if (!emailResult.success) {
          console.error('Email sending failed:', emailResult);
          return res.status(500).json({
            message: 'Failed to send verification email',
            error: emailResult.error
          });
        }

        console.log(`✅ Re-registration OTP sent for ${email}. OTP: ${otp}`);

        return res.status(200).json({
          message: 'OTP sent to your email. Please verify to complete registration.',
          email,
          requiresVerification: true
        });
      }

      return res.status(400).json({ message: 'Email already registered' });
    }

    // Upload profile image from memory to Cloudinary
    let uploadedPhotoUrl = '';
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, { folder: 'user_profiles' });
        uploadedPhotoUrl = result.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({
          message: 'Failed to upload profile image. Please try again with a different image.'
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateRegistrationOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create temporary user with unverified status
    const newUser = new User({
      fullName: '', // Will be set after verification
      email,
      password: '', // Will be set after verification
      photo: '',
      isEmailVerified: false,
      emailVerificationOTP: otp,
      emailVerificationOTPExpires: otpExpires,
      tempUserData: {
        fullName,
        email,
        password: hashedPassword,
        photo: uploadedPhotoUrl
      }
    });

    await newUser.save();

    // Send OTP email
    const emailResult = await sendRegistrationOTPEmail(email, otp, fullName);

    console.log('📧 Email Result:', emailResult);

    if (!emailResult.success) {
      console.error('Email sending failed:', emailResult);
      // Delete the temporary user if email fails
      await User.deleteOne({ _id: newUser._id });

      return res.status(500).json({
        message: 'Failed to send verification email',
        error: emailResult.error
      });
    }

    console.log(`✅ Registration successful for ${email}. OTP: ${otp}`);

    res.status(201).json({
      message: 'Verification code sent to your email. Please verify to complete registration.',
      email,
      requiresVerification: true
    });
  } catch (err) {
    console.error('Registration Error:', err);

    // Handle multer errors
    if (err.name === 'MulterError') {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Image file is too large. Maximum size is 5MB.' });
      }
      return res.status(400).json({ message: 'Image upload error: ' + err.message });
    }

    // Handle file type errors
    if (err.message && err.message.includes('Only JPEG')) {
      return res.status(400).json({ message: err.message });
    }

    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Verify registration OTP and complete account creation
exports.verifyRegistrationOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find user by email with valid OTP
    const user = await User.findOne({
      email,
      emailVerificationOTP: otp,
      emailVerificationOTPExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    // Complete user registration with temp data
    if (!user.tempUserData) {
      return res.status(400).json({ message: 'Registration data not found. Please try registering again.' });
    }

    user.fullName = user.tempUserData.fullName;
    user.password = user.tempUserData.password;
    user.photo = user.tempUserData.photo;
    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationOTPExpires = undefined;
    user.tempUserData = undefined;

    await user.save();

    // Send welcome email (don't wait for it to complete)
    sendWelcomeEmail(email, user.fullName).catch(error => {
      console.error('Failed to send welcome email:', error);
    });

    res.status(200).json({
      message: 'Email verified successfully! Your account has been created.',
      verified: true
    });
  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Resend registration OTP
exports.resendRegistrationOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Find unverified user
    const user = await User.findOne({
      email,
      isEmailVerified: false
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found or already verified' });
    }

    if (!user.tempUserData) {
      return res.status(400).json({ message: 'Registration data not found. Please try registering again.' });
    }

    // Generate new OTP
    const otp = generateRegistrationOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.emailVerificationOTP = otp;
    user.emailVerificationOTPExpires = otpExpires;
    await user.save();

    // Send OTP email
    const emailResult = await sendRegistrationOTPEmail(email, otp, user.tempUserData.fullName);

    if (!emailResult.success) {
      console.error('Email sending failed:', emailResult);
      return res.status(500).json({
        message: 'Failed to send verification email',
        error: emailResult.error
      });
    }

    res.status(200).json({
      message: 'New verification code sent to your email',
      email
    });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
const jwt = require('jsonwebtoken');

exports.loginUser = async (req, res) => {
  const startTime = Date.now();

  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide both email and password'
      });
    }

    // Check if user exists with error handling
    let user;
    try {
      user = await User.findOne({ email }).maxTimeMS(5000); // 5 second timeout
    } catch (dbError) {
      console.error('❌ Database error during login (findOne):', dbError.message);
      return res.status(503).json({
        message: 'Service temporarily unavailable. Please try again.',
        error: process.env.NODE_ENV === 'production' ? undefined : dbError.message
      });
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in',
        requiresVerification: true,
        email: user.email
      });
    }

    // Compare password with error handling
    let isMatch;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (bcryptError) {
      console.error('❌ Bcrypt error during login:', bcryptError.message);
      return res.status(500).json({
        message: 'Authentication error. Please try again.',
        error: process.env.NODE_ENV === 'production' ? undefined : bcryptError.message
      });
    }

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token with error handling
    let token;
    try {
      token = jwt.sign(
        { userId: user._id, email: user.email, name: user.fullName },
        process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
        { expiresIn: '7d' }
      );
    } catch (jwtError) {
      console.error('❌ JWT generation error:', jwtError.message);
      return res.status(500).json({
        message: 'Token generation failed. Please try again.',
        error: process.env.NODE_ENV === 'production' ? undefined : jwtError.message
      });
    }

    // Extract device info from headers
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ip = req.ip || req.connection.remoteAddress;

    // Parse user agent to get device info
    const getDeviceInfo = (ua) => {
      let browser = 'Unknown Browser';
      let os = 'Unknown OS';

      if (ua.includes('Chrome')) browser = 'Chrome';
      else if (ua.includes('Firefox')) browser = 'Firefox';
      else if (ua.includes('Safari')) browser = 'Safari';
      else if (ua.includes('Edge')) browser = 'Edge';

      if (ua.includes('Windows')) os = 'Windows';
      else if (ua.includes('Mac')) os = 'macOS';
      else if (ua.includes('Linux')) os = 'Linux';
      else if (ua.includes('Android')) os = 'Android';
      else if (ua.includes('iOS')) os = 'iOS';

      return { browser, os };
    };

    const { browser, os } = getDeviceInfo(userAgent);

    // Create session
    const newSession = {
      token: token,
      device: `${browser} on ${os}`,
      browser,
      os,
      ip,
      location: 'Location unavailable', // You can integrate IP geolocation API
      createdAt: new Date(),
      lastActive: new Date()
    };

    // Add session to user (keep last 5 sessions) with error handling
    try {
      if (!user.sessions) user.sessions = [];
      user.sessions.push(newSession);
      if (user.sessions.length > 5) {
        user.sessions = user.sessions.slice(-5);
      }

      await user.save();
    } catch (saveError) {
      console.error('❌ Database error during login (save session):', saveError.message);
      // Continue with login even if session save fails - non-critical
      console.log('⚠️ Login succeeded but session save failed - continuing');
    }

    // Performance logging
    const duration = Date.now() - startTime;
    console.log(`✅ Login successful for ${email} in ${duration}ms`);

    res.status(200).json({
      message: 'Login successful',
      user: {
        userId: user._id,
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        photo: user.photo,
        bio: user.bio,
        location: user.location,
        website: user.website,
        linkedin: user.linkedin,
        github: user.github,
        createdAt: user.createdAt,
        token: token
      },
      token
    });
  } catch (err) {
    const duration = Date.now() - startTime;
    console.error(`❌ Login error after ${duration}ms:`, err.message);
    console.error('Stack trace:', err.stack);

    // Return safe error message for production
    res.status(500).json({
      message: 'Server error during login. Please try again.',
      error: process.env.NODE_ENV === 'production' ? undefined : err.message
    });
  }
};

// Request password reset with OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    // console.log('Forgot password request for email:', email);

    // Find user by email with timeout
    let user;
    try {
      user = await User.findOne({ email }).maxTimeMS(5000);
    } catch (dbError) {
      console.error('❌ Database error during forgot password:', dbError.message);
      return res.status(503).json({
        message: 'Service temporarily unavailable. Please try again.',
        error: process.env.NODE_ENV === 'production' ? undefined : dbError.message
      });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to user
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP email
    // console.log('Sending OTP email to:', email);
    const emailResult = await sendOTPEmail(email, otp);

    if (!emailResult.success) {
      console.error('Email sending failed:', emailResult);
      // Update user to clear OTP since email failed
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();

      return res.status(500).json({
        message: 'Failed to send OTP email',
        error: emailResult.error,
        details: emailResult.details || 'No additional details available'
      });
    }

    // console.log('OTP email sent successfully');
    res.status(200).json({ message: 'OTP sent to your email' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Verify OTP and allow password reset
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find user by email
    const user = await User.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Save reset token
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    res.status(200).json({
      message: 'OTP verified successfully',
      resetToken
    });
  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Reset password with token
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Find user by reset token
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
