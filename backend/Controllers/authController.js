const bcrypt = require('bcryptjs');
const User = require('../Models/User');
const cloudinary = require('../utils/cloudinary');
// const fs = require('fs'); // to delete local files if needed
const streamifier = require('streamifier');
const { sendOTPEmail, sendWelcomeEmail } = require('../utils/emailService');
const crypto = require('crypto');

exports.registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Upload profile image from memory to Cloudinary
    let uploadedPhotoUrl = '';
    if (req.file) {
      const streamUpload = (fileBuffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'user_profiles', resource_type: 'image' },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(fileBuffer).pipe(stream);
        });
      };

      const result = await streamUpload(req.file.buffer);
      uploadedPhotoUrl = result.secure_url;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      photo: uploadedPhotoUrl,
    });

    await newUser.save();

    // Send welcome email (don't wait for it to complete)
    sendWelcomeEmail(email, fullName).catch(error => {
      console.error('Failed to send welcome email:', error);
      // Don't fail registration if email fails
    });

    res.status(201).json({
      message: 'User registered successfully',
      userId: newUser._id,
    });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
const jwt = require('jsonwebtoken');

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.fullName },
      process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
      { expiresIn: '7d' }
    );

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

    // Add session to user (keep last 5 sessions)
    if (!user.sessions) user.sessions = [];
    user.sessions.push(newSession);
    if (user.sessions.length > 5) {
      user.sessions = user.sessions.slice(-5);
    }

    await user.save();

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
        token: token
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Request password reset with OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    // console.log('Forgot password request for email:', email);

    // Find user by email
    const user = await User.findOne({ email });
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
