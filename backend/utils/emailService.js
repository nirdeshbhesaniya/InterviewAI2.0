const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

/**
 * Modern Email Service for Interview AI
 * Uses Nodemailer with responsive email templates matching AI Tech Dark Gradient theme
 * 
 * Production-ready with:
 * - Connection timeout handling
 * - Multiple port fallbacks (587, 465, 25)
 * - Detailed error logging
 * - Retry mechanism
 */

// Email configuration with production optimizations
const getEmailConfig = (portOverride = null) => {
  const usePort = portOverride || parseInt(process.env.SMTP_PORT || '587');

  // Custom SMTP configuration (for Render, AWS, etc.)
  if (process.env.SMTP_HOST) {
    return {
      host: process.env.SMTP_HOST,
      port: usePort,
      secure: usePort === 465, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production' ? false : true,
        ciphers: 'SSLv3'
      },
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 10000,
      debug: process.env.EMAIL_DEBUG === 'true',
      logger: process.env.EMAIL_DEBUG === 'true'
    };
  }

  // Gmail service configuration (optimized)
  const service = process.env.EMAIL_SERVICE || 'gmail';

  return {
    service: service,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    debug: process.env.EMAIL_DEBUG === 'true',
    logger: process.env.EMAIL_DEBUG === 'true'
  };
};

// Create transporter with retry logic
const createTransporter = async (retryPorts = [587, 465, 25]) => {
  const config = getEmailConfig(retryPorts[0]);

  try {
    const transporter = nodemailer.createTransport(config);

    // Verify connection
    await transporter.verify();
    console.log(`✅ Email transporter ready on port ${config.port || config.service}`);

    return transporter;
  } catch (error) {
    console.error(`❌ Failed to connect on port ${retryPorts[0]}:`, error.message);

    // Retry with next port if available
    if (retryPorts.length > 1) {
      console.log(`🔄 Retrying with port ${retryPorts[1]}...`);
      return createTransporter(retryPorts.slice(1));
    }

    // All ports failed, return unverified transporter
    console.warn('⚠️ Creating transporter without verification (may fail on send)');
    return nodemailer.createTransport(config);
  }
};

/**
 * Base Email Template - Responsive and matches AI Tech Dark Gradient theme
 */
const getEmailTemplate = (content, options = {}) => {
  const { title = 'Interview AI', headerGradient = true } = options;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #0B0F1A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  
  <!-- Email Container -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0B0F1A; padding: 20px 0;">
    <tr>
      <td align="center">
        
        <!-- Main Content Card -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #111827; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);">
          
          ${headerGradient ? `
          <!-- Header with Gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366F1 0%, #22D3EE 50%, #F97316 100%); padding: 40px 30px; text-align: center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <!-- Logo/Icon -->
                    <div style="display: inline-block; background: rgba(255,255,255,0.15); padding: 16px; border-radius: 50%; margin-bottom: 16px; backdrop-filter: blur(10px);">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7V12C2 17.5 5.8 22.7 12 24C18.2 22.7 22 17.5 22 12V7L12 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="12" r="3" stroke="white" stroke-width="2"/>
                      </svg>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="color: #F9FAFB; margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                      Interview AI
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}
          
          <!-- Content Area -->
          <tr>
            <td style="padding: 40px 30px; color: #E5E7EB;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0B0F1A; padding: 30px; text-align: center; border-top: 1px solid #1F2937;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <p style="color: #9CA3AF; margin: 0 0 12px 0; font-size: 14px;">
                      This email was sent by <strong style="color: #E5E7EB;">Interview AI</strong>
                    </p>
                    <p style="color: #6B7280; margin: 0 0 16px 0; font-size: 12px;">
                      Your AI-powered interview preparation platform
                    </p>
                    
                    <!-- Social Links / Quick Actions -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 16px auto 0;">
                      <tr>
                        <td style="padding: 0 8px;">
                          <a href="${process.env.APP_URL || 'http://localhost:5173'}/settings" style="color: #6366F1; text-decoration: none; font-size: 13px; font-weight: 500;">⚙️ Settings</a>
                        </td>
                        <td style="padding: 0 8px; color: #374151;">•</td>
                        <td style="padding: 0 8px;">
                          <a href="${process.env.APP_URL || 'http://localhost:5173'}/contact-support" style="color: #6366F1; text-decoration: none; font-size: 13px; font-weight: 500;">💬 Support</a>
                        </td>
                        <td style="padding: 0 8px; color: #374151;">•</td>
                        <td style="padding: 0 8px;">
                          <a href="${process.env.APP_URL || 'http://localhost:5173'}" style="color: #6366F1; text-decoration: none; font-size: 13px; font-weight: 500;">🏠 Dashboard</a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #6B7280; margin: 20px 0 0 0; font-size: 11px;">
                      © ${new Date().getFullYear()} Interview AI. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
        
        <!-- Spacer for mobile -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td height="20"></td>
          </tr>
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
  `.trim();
};

/**
 * OTP Email Template
 */
const getOTPEmailContent = (otp) => {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center">
          <h2 style="color: #F9FAFB; margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">
            🔐 Password Reset Request
          </h2>
          <p style="color: #9CA3AF; margin: 0 0 32px 0; font-size: 16px; line-height: 1.6;">
            Use the verification code below to reset your password securely
          </p>
        </td>
      </tr>
      
      <!-- OTP Box -->
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(145deg, #1F2933, #111827); border: 2px dashed #374151; border-radius: 12px; margin: 24px 0;">
            <tr>
              <td style="padding: 32px 48px; text-align: center;">
                <p style="color: #9CA3AF; margin: 0 0 12px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px;">
                  Verification Code
                </p>
                <div style="background: linear-gradient(135deg, #6366F1 0%, #22D3EE 50%, #F97316 100%); padding: 20px 32px; border-radius: 8px; display: inline-block;">
                  <p style="color: #F9FAFB; margin: 0; font-size: 36px; font-weight: 900; letter-spacing: 8px; font-family: 'Courier New', monospace; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                    ${otp}
                  </p>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      
      <!-- Warning Notice -->
      <tr>
        <td>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, rgba(234, 179, 8, 0.1), rgba(249, 115, 22, 0.1)); border-left: 4px solid #F97316; border-radius: 8px; margin: 24px 0;">
            <tr>
              <td style="padding: 20px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td width="32" valign="top">
                      <span style="font-size: 24px;">⚠️</span>
                    </td>
                    <td style="padding-left: 12px;">
                      <h4 style="color: #FACC15; margin: 0 0 8px 0; font-size: 15px; font-weight: 600;">
                        Important Security Notice
                      </h4>
                      <p style="color: #E5E7EB; margin: 0; font-size: 14px; line-height: 1.6;">
                        This verification code <strong>expires in 10 minutes</strong>. Never share this code with anyone. If you didn't request this reset, please ignore this email and secure your account.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      
      <!-- Help Section -->
      <tr>
        <td align="center" style="padding-top: 32px; border-top: 1px solid #1F2937; margin-top: 32px;">
          <p style="color: #9CA3AF; margin: 0 0 16px 0; font-size: 14px;">
            Need help? Our support team is here for you
          </p>
          <a href="mailto:${process.env.SUPPORT_EMAIL || process.env.EMAIL_USER}" style="display: inline-block; background: linear-gradient(135deg, #6366F1, #22D3EE); color: #F9FAFB; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);">
            📧 Contact Support
          </a>
        </td>
      </tr>
    </table>
  `;
};

/**
 * Notification Email Template
 */
const getNotificationEmailContent = (title, message, action, actionUrl) => {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center">
          <div style="display: inline-block; background: linear-gradient(135deg, #6366F1, #22D3EE); padding: 16px; border-radius: 50%; margin-bottom: 20px;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2 style="color: #F9FAFB; margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">
            ${title}
          </h2>
        </td>
      </tr>
      
      <!-- Message Content -->
      <tr>
        <td>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #1F2933; border-radius: 12px; border: 1px solid #374151; margin: 24px 0;">
            <tr>
              <td style="padding: 28px;">
                <p style="color: #E5E7EB; margin: 0; font-size: 15px; line-height: 1.8; white-space: pre-line;">
                  ${message}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      
      ${action && actionUrl ? `
      <!-- Action Button -->
      <tr>
        <td align="center" style="padding: 24px 0;">
          <a href="${actionUrl}" style="display: inline-block; background: linear-gradient(135deg, #F97316, #FB7185); color: #F9FAFB; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; box-shadow: 0 12px 30px rgba(249, 115, 22, 0.35); transition: all 0.3s;">
            ${action} →
          </a>
        </td>
      </tr>
      ` : ''}
      
      <!-- Settings Link -->
      <tr>
        <td align="center" style="padding-top: 32px; border-top: 1px solid #1F2937;">
          <p style="color: #9CA3AF; margin: 0 0 12px 0; font-size: 13px;">
            Manage your notification preferences
          </p>
          <a href="${process.env.APP_URL || 'http://localhost:5173'}/settings" style="color: #6366F1; text-decoration: none; font-weight: 500; font-size: 14px;">
            ⚙️ Notification Settings
          </a>
        </td>
      </tr>
    </table>
  `;
};

/**
 * Welcome Email for New Users
 */
const getWelcomeEmailContent = (fullName) => {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <!-- Hero Section -->
      <tr>
        <td align="center">
          <div style="display: inline-block; background: linear-gradient(135deg, #6366F1, #22D3EE); padding: 20px; border-radius: 50%; margin-bottom: 24px; box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2 style="color: #F9FAFB; margin: 0 0 12px 0; font-size: 32px; font-weight: 700;">
            Welcome to Interview AI! 🎉
          </h2>
          <p style="color: #9CA3AF; margin: 0 0 32px 0; font-size: 18px; line-height: 1.6;">
            Hi ${fullName}, we're excited to have you on board!
          </p>
        </td>
      </tr>
      
      <!-- Welcome Message -->
      <tr>
        <td>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(145deg, #1F2933, #111827); border-radius: 16px; border: 1px solid #374151; margin: 24px 0;">
            <tr>
              <td style="padding: 32px;">
                <p style="color: #E5E7EB; margin: 0 0 20px 0; font-size: 16px; line-height: 1.8;">
                  You've just joined thousands of developers preparing for their dream careers with AI-powered interview preparation tools.
                </p>
                <p style="color: #E5E7EB; margin: 0; font-size: 16px; line-height: 1.8;">
                  Get ready to ace your interviews with personalized practice sessions, real-time feedback, and comprehensive learning resources!
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      
      <!-- Features Grid -->
      <tr>
        <td>
          <h3 style="color: #F9FAFB; margin: 32px 0 20px 0; font-size: 20px; font-weight: 600; text-align: center;">
            What you can do with Interview AI:
          </h3>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td width="50%" style="padding: 8px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(34, 211, 238, 0.1)); border: 1px solid #374151; border-radius: 12px; height: 100%;">
                  <tr>
                    <td style="padding: 20px;">
                      <span style="font-size: 32px;">💬</span>
                      <h4 style="color: #22D3EE; margin: 12px 0 8px 0; font-size: 16px; font-weight: 600;">
                        AI Interview Practice
                      </h4>
                      <p style="color: #9CA3AF; margin: 0; font-size: 14px; line-height: 1.6;">
                        Practice with AI-powered mock interviews tailored to your role
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
              <td width="50%" style="padding: 8px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(251, 113, 133, 0.1)); border: 1px solid #374151; border-radius: 12px; height: 100%;">
                  <tr>
                    <td style="padding: 20px;">
                      <span style="font-size: 32px;">📝</span>
                      <h4 style="color: #F97316; margin: 12px 0 8px 0; font-size: 16px; font-weight: 600;">
                        MCQ Tests
                      </h4>
                      <p style="color: #9CA3AF; margin: 0; font-size: 14px; line-height: 1.6;">
                        Test your knowledge with topic-specific multiple choice questions
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td width="50%" style="padding: 8px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(234, 179, 8, 0.1)); border: 1px solid #374151; border-radius: 12px; height: 100%;">
                  <tr>
                    <td style="padding: 20px;">
                      <span style="font-size: 32px;">💻</span>
                      <h4 style="color: #22C55E; margin: 12px 0 8px 0; font-size: 16px; font-weight: 600;">
                        Code Execution
                      </h4>
                      <p style="color: #9CA3AF; margin: 0; font-size: 14px; line-height: 1.6;">
                        Write and execute code in multiple programming languages
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
              <td width="50%" style="padding: 8px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1)); border: 1px solid #374151; border-radius: 12px; height: 100%;">
                  <tr>
                    <td style="padding: 20px;">
                      <span style="font-size: 32px;">📚</span>
                      <h4 style="color: #A855F7; margin: 12px 0 8px 0; font-size: 16px; font-weight: 600;">
                        Learning Resources
                      </h4>
                      <p style="color: #9CA3AF; margin: 0; font-size: 14px; line-height: 1.6;">
                        Access curated study materials and community resources
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      
      <!-- Call to Action -->
      <tr>
        <td align="center" style="padding: 40px 0 24px 0;">
          <a href="${process.env.APP_URL || 'http://localhost:5173'}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #6366F1, #22D3EE); color: #F9FAFB; padding: 16px 48px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 16px; box-shadow: 0 12px 30px rgba(99, 102, 241, 0.4); transition: all 0.3s;">
            🚀 Start Your Journey
          </a>
        </td>
      </tr>
      
      <!-- Tips Section -->
      <tr>
        <td>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, rgba(234, 179, 8, 0.1), rgba(249, 115, 22, 0.1)); border-left: 4px solid #F59E0B; border-radius: 8px; margin: 24px 0;">
            <tr>
              <td style="padding: 24px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td width="40" valign="top">
                      <span style="font-size: 28px;">💡</span>
                    </td>
                    <td style="padding-left: 12px;">
                      <h4 style="color: #FACC15; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">
                        Pro Tips to Get Started:
                      </h4>
                      <ul style="color: #E5E7EB; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
                        <li style="margin-bottom: 8px;">Complete your profile to personalize your experience</li>
                        <li style="margin-bottom: 8px;">Start with a practice interview to gauge your current level</li>
                        <li style="margin-bottom: 8px;">Take MCQ tests regularly to reinforce your knowledge</li>
                        <li>Join our community and share resources with fellow learners</li>
                      </ul>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      
      <!-- Support Section -->
      <tr>
        <td align="center" style="padding-top: 32px; border-top: 1px solid #1F2937; margin-top: 32px;">
          <p style="color: #9CA3AF; margin: 0 0 16px 0; font-size: 14px;">
            Questions? We're here to help! 🤝
          </p>
          <a href="mailto:${process.env.SUPPORT_EMAIL || process.env.EMAIL_USER}" style="display: inline-block; background: transparent; border: 2px solid #6366F1; color: #6366F1; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
            📧 Contact Support
          </a>
        </td>
      </tr>
      
      <!-- Footer Message -->
      <tr>
        <td align="center" style="padding-top: 32px;">
          <p style="color: #6B7280; margin: 0; font-size: 13px; line-height: 1.6;">
            We're thrilled to be part of your interview preparation journey.<br>
            Let's make your next interview your best one yet! 💪
          </p>
        </td>
      </tr>
    </table>
  `;
};

/**
 * Send OTP Email
 */
exports.sendOTPEmail = async (email, otp) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email credentials not configured. Please set EMAIL_USER and EMAIL_PASS environment variables.');
    }

    console.log(`📧 Sending OTP email to ${email}...`);
    const transporter = await createTransporter();
    const htmlContent = getEmailTemplate(getOTPEmailContent(otp), {
      title: 'Password Reset - Interview AI'
    });

    const mailOptions = {
      from: {
        name: 'Interview AI',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: '🔐 Password Reset - Your OTP Code',
      html: htmlContent,
      text: `Your OTP for password reset is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, please ignore this email.\n\n- Interview AI Team`
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('✅ OTP Email sent successfully:', info.messageId);
    return {
      success: true,
      messageId: info.messageId,
      response: info.response
    };

  } catch (error) {
    console.error('❌ Failed to send OTP email:', error);

    // Provide detailed error info for debugging
    const errorDetails = {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    };

    console.error('Error details:', JSON.stringify(errorDetails, null, 2));

    return {
      success: false,
      error: error.message,
      code: error.code,
      details: errorDetails
    };
  }
};

/**
 * Send Notification Email
 */
exports.sendNotificationEmail = async (userEmail, title, message, action, actionUrl) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email credentials not configured.');
    }

    console.log(`📧 Sending notification email to ${userEmail}...`);
    const transporter = await createTransporter();
    const htmlContent = getEmailTemplate(
      getNotificationEmailContent(title, message, action, actionUrl),
      { title: `${title} - Interview AI` }
    );

    const mailOptions = {
      from: {
        name: 'Interview AI',
        address: process.env.EMAIL_USER
      },
      to: userEmail,
      subject: `🔔 ${title} - Interview AI`,
      html: htmlContent,
      text: `${title}\n\n${message}${action && actionUrl ? `\n\n${action}: ${actionUrl}` : ''}\n\n- Interview AI Team`
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Notification email sent successfully:', info.messageId);
    return {
      success: true,
      messageId: info.messageId
    };

  } catch (error) {
    console.error('❌ Failed to send notification email:', error);
    console.error('Error code:', error.code);
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
};

/**
 * Support Request Email Templates
 */
const getSupportEmailToTeam = (name, email, subject, category, priority, message) => {
  const priorityColors = {
    urgent: '#EF4444',
    high: '#F97316',
    normal: '#22D3EE',
    low: '#9CA3AF'
  };

  const priorityColor = priorityColors[priority] || priorityColors.normal;

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td>
          <h2 style="color: #F9FAFB; margin: 0 0 24px 0; font-size: 22px; font-weight: 600; border-bottom: 2px solid #F97316; padding-bottom: 12px;">
            🎫 New Support Request
          </h2>
        </td>
      </tr>
      
      <!-- Priority Badge -->
      <tr>
        <td style="padding-bottom: 20px;">
          <span style="display: inline-block; background: ${priorityColor}; color: #F9FAFB; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
            ${priority} Priority
          </span>
          <span style="display: inline-block; background: #1F2933; color: #22D3EE; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; margin-left: 8px;">
            ${category}
          </span>
        </td>
      </tr>
      
      <!-- Contact Info -->
      <tr>
        <td>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #1F2933; border-radius: 12px; border: 1px solid #374151; margin: 16px 0;">
            <tr>
              <td style="padding: 24px;">
                <h3 style="color: #22D3EE; margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">
                  📋 Contact Information
                </h3>
                <table role="presentation" width="100%" cellpadding="8" cellspacing="0" border="0">
                  <tr>
                    <td width="120" style="color: #9CA3AF; font-size: 14px;"><strong>Name:</strong></td>
                    <td style="color: #E5E7EB; font-size: 14px;">${name}</td>
                  </tr>
                  <tr>
                    <td style="color: #9CA3AF; font-size: 14px;"><strong>Email:</strong></td>
                    <td style="color: #E5E7EB; font-size: 14px;"><a href="mailto:${email}" style="color: #6366F1; text-decoration: none;">${email}</a></td>
                  </tr>
                  <tr>
                    <td style="color: #9CA3AF; font-size: 14px;"><strong>Time:</strong></td>
                    <td style="color: #E5E7EB; font-size: 14px;">${new Date().toLocaleString()}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      
      <!-- Subject -->
      <tr>
        <td style="padding: 16px 0;">
          <h3 style="color: #22D3EE; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">
            📌 Subject
          </h3>
          <div style="background: #111827; padding: 16px; border-left: 4px solid #F97316; border-radius: 6px;">
            <p style="color: #F9FAFB; margin: 0; font-size: 15px; font-weight: 500;">
              ${subject}
            </p>
          </div>
        </td>
      </tr>
      
      <!-- Message -->
      <tr>
        <td style="padding: 16px 0;">
          <h3 style="color: #22D3EE; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">
            💬 Message
          </h3>
          <div style="background: #111827; padding: 24px; border-radius: 8px; border: 1px solid #374151;">
            <p style="color: #E5E7EB; margin: 0; font-size: 14px; line-height: 1.8; white-space: pre-line;">
              ${message}
            </p>
          </div>
        </td>
      </tr>
      
      <!-- Footer Note -->
      <tr>
        <td style="padding-top: 24px; border-top: 1px solid #1F2937; margin-top: 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(34, 211, 238, 0.1)); border-radius: 8px;">
            <tr>
              <td style="padding: 16px;">
                <p style="color: #9CA3AF; margin: 0; font-size: 13px;">
                  ℹ️ An AI-powered auto-reply has been sent to the customer. Please review and follow up if additional support is needed.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
};

const getSupportAutoReply = (name, subject, category, priority, aiResponse, userMessage) => {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td>
          <h2 style="color: #F9FAFB; margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">
            Hello ${name}! 👋
          </h2>
          <p style="color: #9CA3AF; margin: 0 0 32px 0; font-size: 15px; line-height: 1.6;">
            Thank you for contacting Interview AI support. We've received your message and our AI assistant has prepared an initial response for you.
          </p>
        </td>
      </tr>
      
      <!-- AI Response -->
      <tr>
        <td>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(145deg, #1F2933, #111827); border: 1px solid #374151; border-radius: 12px; margin: 20px 0;">
            <tr>
              <td style="padding: 28px;">
                <div style="margin-bottom: 20px;">
                  <span style="display: inline-block; background: linear-gradient(135deg, #6366F1, #22D3EE); color: #F9FAFB; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                    🤖 AI Assistant Response
                  </span>
                </div>
                <div style="color: #E5E7EB; font-size: 15px; line-height: 1.8; white-space: pre-line;">
                  ${aiResponse}
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      
      <!-- Request Summary -->
      <tr>
        <td style="padding-top: 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #0B0F1A; border: 1px solid #1F2937; border-radius: 8px;">
            <tr>
              <td style="padding: 20px;">
                <h4 style="color: #22D3EE; margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">
                  📝 Your Request Summary
                </h4>
                <table role="presentation" width="100%" cellpadding="6" cellspacing="0" border="0">
                  <tr>
                    <td width="100" style="color: #9CA3AF; font-size: 13px;">Subject:</td>
                    <td style="color: #E5E7EB; font-size: 13px;">${subject}</td>
                  </tr>
                  <tr>
                    <td style="color: #9CA3AF; font-size: 13px;">Category:</td>
                    <td style="color: #E5E7EB; font-size: 13px;">${category}</td>
                  </tr>
                  <tr>
                    <td style="color: #9CA3AF; font-size: 13px;">Priority:</td>
                    <td style="color: #E5E7EB; font-size: 13px;">${priority}</td>
                  </tr>
                  <tr>
                    <td style="color: #9CA3AF; font-size: 13px;">Submitted:</td>
                    <td style="color: #E5E7EB; font-size: 13px;">${new Date().toLocaleString()}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      
      <!-- Human Follow-up Notice -->
      <tr>
        <td style="padding-top: 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, rgba(34, 211, 238, 0.1), rgba(99, 102, 241, 0.1)); border-radius: 8px; border: 1px solid rgba(99, 102, 241, 0.3);">
            <tr>
              <td style="padding: 20px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td width="32" valign="top">
                      <span style="font-size: 24px;">🧑‍💼</span>
                    </td>
                    <td style="padding-left: 12px;">
                      <h4 style="color: #22D3EE; margin: 0 0 8px 0; font-size: 15px; font-weight: 600;">
                        Human Support Team Review
                      </h4>
                      <p style="color: #E5E7EB; margin: 0; font-size: 13px; line-height: 1.6;">
                        ${priority === 'urgent' ? 'Our team will review your urgent request and respond within <strong>4 hours</strong>.' :
      priority === 'high' ? 'Our team will review your high-priority request and respond within <strong>8 hours</strong>.' :
        'Our team will review your request and typically respond within <strong>24 hours</strong> during business days.'}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      
      <!-- Quick Actions -->
      <tr>
        <td align="center" style="padding-top: 32px; border-top: 1px solid #1F2937; margin-top: 32px;">
          <p style="color: #9CA3AF; margin: 0 0 16px 0; font-size: 14px;">
            Need more help? Explore our resources
          </p>
          <table role="presentation" cellpadding="8" cellspacing="0" border="0" style="margin: 0 auto;">
            <tr>
              <td>
                <a href="${process.env.APP_URL || 'http://localhost:5173'}/contact-support" style="display: inline-block; background: #1F2933; color: #22D3EE; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 13px; border: 1px solid #374151;">
                  📚 FAQ & Docs
                </a>
              </td>
              <td>
                <a href="${process.env.APP_URL || 'http://localhost:5173'}" style="display: inline-block; background: linear-gradient(135deg, #6366F1, #22D3EE); color: #F9FAFB; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 13px;">
                  🏠 Dashboard
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      
      <!-- Note -->
      <tr>
        <td align="center" style="padding-top: 24px;">
          <p style="color: #6B7280; margin: 0; font-size: 12px; font-style: italic;">
            💡 This initial response was generated by our AI assistant. Our human support team will follow up if needed.
          </p>
        </td>
      </tr>
    </table>
  `;
};

/**
 * Send Support Request to Team
 */
exports.sendSupportEmailToTeam = async (name, email, subject, category, priority, message) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email credentials not configured.');
    }

    console.log(`📧 Sending support email to team...`);
    const transporter = await createTransporter();
    const htmlContent = getEmailTemplate(
      getSupportEmailToTeam(name, email, subject, category, priority, message),
      { title: 'New Support Request - Interview AI', headerGradient: false }
    );

    const mailOptions = {
      from: {
        name: 'Interview AI Support System',
        address: process.env.EMAIL_USER
      },
      to: process.env.SUPPORT_TEAM_EMAIL || process.env.EMAIL_USER,
      replyTo: email,
      subject: `🎫 [${category.toUpperCase()}] [${priority.toUpperCase()}] ${subject}`,
      html: htmlContent,
      text: `New Support Request\n\nFrom: ${name} (${email})\nCategory: ${category}\nPriority: ${priority}\nSubject: ${subject}\n\nMessage:\n${message}\n\nSubmitted: ${new Date().toLocaleString()}`
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Support email sent to team:', info.messageId);
    return {
      success: true,
      messageId: info.messageId
    };

  } catch (error) {
    console.error('❌ Failed to send support email to team:', error);
    console.error('Error code:', error.code);
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
};

/**
 * Send Auto-Reply to Support Requester
 */
exports.sendSupportAutoReply = async (name, email, subject, category, priority, aiResponse, userMessage) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email credentials not configured.');
    }

    console.log(`📧 Sending auto-reply to ${email}...`);
    const transporter = await createTransporter();
    const htmlContent = getEmailTemplate(
      getSupportAutoReply(name, subject, category, priority, aiResponse, userMessage),
      { title: 'Support Request Received - Interview AI' }
    );

    const mailOptions = {
      from: {
        name: 'Interview AI Support',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: `Re: ${subject} - Interview AI Support`,
      html: htmlContent,
      text: `Hello ${name},\n\nThank you for contacting Interview AI support.\n\nAI Assistant Response:\n${aiResponse}\n\nYour Request Details:\n- Subject: ${subject}\n- Category: ${category}\n- Priority: ${priority}\n- Submitted: ${new Date().toLocaleString()}\n\nOur support team will review your request and follow up if needed.\n\n- Interview AI Support Team`
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Auto-reply sent to user:', info.messageId);
    return {
      success: true,
      messageId: info.messageId
    };

  } catch (error) {
    console.error('❌ Failed to send auto-reply:', error);
    console.error('Error code:', error.code);
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
};

/**
 * Send a custom email with HTML content
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML content (can be full template or just inner content)
 * @param {string} textContent - Plain text version
 * @param {object} options - Additional options (from, replyTo, etc.)
 */
exports.sendCustomEmail = async (to, subject, htmlContent, textContent = '', options = {}) => {
  try {
    console.log(`📧 Sending custom email to ${to}...`);
    const transporter = await createTransporter();

    const mailOptions = {
      from: options.from || process.env.EMAIL_USER,
      to,
      subject,
      html: htmlContent,
      text: textContent || subject,
      ...options // Allow additional options like replyTo, cc, bcc
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('❌ Error sending custom email:', error);
    console.error('Error code:', error.code);
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
};

// Get service information
exports.getServiceInfo = () => ({
  service: 'Nodemailer',
  isProduction: process.env.NODE_ENV === 'production',
  configured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS)
});

// Export email template helpers for advanced use cases
exports.getEmailTemplate = getEmailTemplate;
exports.getOTPEmailContent = getOTPEmailContent;
exports.getNotificationEmailContent = getNotificationEmailContent; exports.getWelcomeEmailContent = getWelcomeEmailContent;

/**
 * Send Welcome Email to New Users
 */
exports.sendWelcomeEmail = async (email, fullName) => {
  try {
    console.log(`📧 Sending welcome email to ${email}...`);
    const transporter = await createTransporter();

    const htmlContent = getEmailTemplate(getWelcomeEmailContent(fullName), {
      title: 'Welcome to Interview AI'
    });

    const mailOptions = {
      from: `"Interview AI" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🎉 Welcome to Interview AI - Let\'s Ace Your Interviews!',
      html: htmlContent,
      text: `Welcome to Interview AI, ${fullName}! We're excited to have you on board. Start your interview preparation journey today with AI-powered practice sessions, MCQ tests, code execution, and learning resources. Visit ${process.env.APP_URL || 'http://localhost:5173'}/dashboard to get started.`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent successfully to ${email}`);

    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    console.error('Error code:', error.code);
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
};