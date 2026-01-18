const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Modern Email Service for Interview AI
 * Uses Nodemailer with Brevo SMTP (smtp-relay.brevo.com)
 * 
 * Includes rich, responsive email templates (Professional Light Theme).
 */

// Global Transporter
let transporter = null;

const createTransporter = () => {
  if (transporter) return transporter;

  if (!process.env.BREVO_SMTP_USER || !process.env.BREVO_SMTP_KEY) {
    console.warn('⚠️ Brevo SMTP credentials missing by default. Using fallback if available.');
  }

  // Use Brevo Credentials from .env
  transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false, // true for 465, false for 587
    auth: {
      user: process.env.BREVO_SMTP_USER,
      pass: process.env.BREVO_SMTP_KEY,
    },
    connectionTimeout: 10000, // 👈 ADD THIS
    greetingTimeout: 10000,   // 👈 ADD THIS
    socketTimeout: 10000,     // 👈 ADD THIS
  });

  return transporter;
};

/**
 * Centralized Email Sender Util
 */
const sendEmail = async ({ to, subject, html, text, from, replyTo }) => {
  try {
    const mailTransport = createTransporter();
    // Use configured From address, or fallback to a professional format
    const sender = from || process.env.EMAIL_FROM || 'Interview AI <noreply@interviewai.tech>';

    const mailOptions = {
      from: sender,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>?/gm, ''), // Basic fallback
      replyTo,
    };

    const info = await mailTransport.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to} | MsgID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    throw error;
  }
};

// ==========================================
// RICH HTML TEMPLATES
// ==========================================

const APP_URL = process.env.APP_URL || 'https://interviewai.tech';
// Ideally, this should point to a live URL. 
// Since the domain might not be active, we recommend hosting the logo on a service like Imgur for testing, 
// or understanding it will be broken locally until deployment.
const LOGO_URL = `${APP_URL}/images/logo.png`;

/**
 * Base Email Template - Professional Light Theme
 */
const getEmailTemplate = (content, options = {}) => {
  const { title = 'Interview AI' } = options;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #F3F4F6; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  
  <!-- Email Container -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F3F4F6; padding: 40px 0;">
    <tr>
      <td align="center">
        
        <!-- Main Content Card -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border: 1px solid #E5E7EB;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 48px; text-align: center; border-bottom: 1px solid #F3F4F6;">
                <!-- Logo with fallback styling -->
                <img src="${LOGO_URL}" alt="Interview AI" width="180" style="display: block; margin: 0 auto; max-width: 100%; height: auto; font-family: sans-serif; font-size: 24px; font-weight: bold; color: #2563EB;" />
            </td>
          </tr>
          
          <!-- Content Area -->
          <tr>
            <td style="padding: 40px 48px; color: #374151; font-size: 16px; line-height: 1.6;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 32px 48px; text-align: center; border-top: 1px solid #E5E7EB;">
              <p style="color: #6B7280; margin: 0 0 16px 0; font-size: 14px;">
                © ${new Date().getFullYear()} <strong>Interview AI</strong>. All rights reserved.
              </p>
              
              <div style="margin-bottom: 20px;">
                <a href="${APP_URL}" style="color: #6B7280; text-decoration: none; margin: 0 10px; font-size: 13px;">Dashboard</a>
                <a href="${APP_URL}/settings" style="color: #6B7280; text-decoration: none; margin: 0 10px; font-size: 13px;">Settings</a>
                <a href="${APP_URL}/contact-support" style="color: #6B7280; text-decoration: none; margin: 0 10px; font-size: 13px;">Support</a>
              </div>

              <p style="color: #9CA3AF; margin: 0; font-size: 12px; line-height: 1.5;">
                You are receiving this email because you signed up for Interview AI.<br>
                If you did not request this, please ignore it or <a href="#" style="color: #9CA3AF; text-decoration: underline;">unsubscribe</a>.
              </p>
            </td>
          </tr>
          
        </table>
        
        <!-- Spacer for mobile -->
        <div style="height: 40px; line-height: 40px;">&nbsp;</div>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
  `.trim();
};

const getOTPEmailContent = (otp) => {
  return `
    <div style="text-align: center;">
      <h2 style="color: #111827; margin: 0 0 16px 0; font-size: 24px; font-weight: 700;">
        Reset Your Password
      </h2>
      <p style="color: #4B5563; margin: 0 0 32px 0; font-size: 16px;">
        Use the code below to verify your identity and securely reset your password.
      </p>
      
      <div style="background: #EFF6FF; border: 1px dashed #BFDBFE; border-radius: 8px; padding: 24px; display: inline-block; margin-bottom: 32px;">
        <span style="font-family: 'Courier New', monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #2563EB; display: block;">
            ${otp}
        </span>
      </div>

      <div style="text-align: left; background: #FFF7ED; border-left: 4px solid #F97316; padding: 16px; border-radius: 4px;">
        <p style="margin: 0; color: #9A3412; font-size: 14px;">
            <strong>Security Notice:</strong> This code expires in 10 minutes. Do not share it with anyone.
        </p>
      </div>
    </div>
  `;
};

const getRegistrationOTPEmailContent = (otp, fullName) => {
  return `
    <div style="text-align: center;">
      <h2 style="color: #111827; margin: 0 0 12px 0; font-size: 24px; font-weight: 700;">
        Welcome to Interview AI! 👋
      </h2>
      <p style="color: #4B5563; margin: 0 0 32px 0; font-size: 16px;">
        Hi ${fullName}, please verify your email address to get started.
      </p>

      <div style="background: #F0FDF4; border: 1px dashed #BBF7D0; border-radius: 8px; padding: 32px; margin-bottom: 32px;">
        <span style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: 700; letter-spacing: 12px; color: #059669; display: block;">
            ${otp}
        </span>
        <p style="margin: 12px 0 0 0; color: #065F46; font-size: 13px; font-weight: 500;">
            VERIFICATION CODE
        </p>
      </div>

      <p style="color: #6B7280; font-size: 14px; margin-bottom: 0;">
        If you didn't create an account with us, you can safely delete this email.
      </p>
    </div>
  `;
};

const getNotificationEmailContent = (title, message, action, actionUrl) => {
  return `
    <div>
      <h2 style="color: #111827; margin: 0 0 20px 0; font-size: 22px; font-weight: 700;">
        ${title}
      </h2>
      
      <div style="background: #F9FAFB; padding: 24px; border-radius: 8px; border-left: 4px solid #3B82F6; margin-bottom: 32px;">
        <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.7; white-space: pre-line;">
            ${message}
        </p>
      </div>

      ${action && actionUrl ? `
        <div style="text-align: center; margin: 32px 0;">
            <a href="${actionUrl}" style="display: inline-block; background-color: #2563EB; color: #FFFFFF; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-size: 15px;">
                ${action}
            </a>
        </div>
      ` : ''}

      <p style="color: #6B7280; font-size: 13px; border-top: 1px solid #E5E7EB; padding-top: 20px; margin-top: 32px;">
        Manage your notification preferences in <a href="${APP_URL}/settings" style="color: #2563EB;">Settings</a>.
      </p>
    </div>
  `;
};

const getWelcomeEmailContent = (fullName) => {
  return `
    <div>
      <h2 style="color: #111827; margin: 0 0 20px 0; font-size: 24px; font-weight: 700;">
        Welcome aboard, ${fullName}! 🚀
      </h2>
      <p style="color: #374151; margin-bottom: 24px;">
        We're thrilled to have you join <strong>Interview AI</strong>. You've taken the first step towards mastering your technical interviews.
      </p>
      
      <p style="color: #374151; margin-bottom: 32px;">
        Unlock your full potential with our comprehensive suite of tools:
      </p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 40px;">
        <!-- AI Mock Interviews -->
        <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; border: 1px solid #E5E7EB;">
            <div style="font-size: 24px; margin-bottom: 8px;">🤖</div>
            <h3 style="margin: 0 0 8px 0; color: #111827; font-size: 16px; font-weight: 600;">AI Mock Interviews</h3>
            <p style="margin: 0; color: #6B7280; font-size: 13px;">Practice real-time conversations with our advanced AI interviewer.</p>
        </div>
        
        <!-- MCQ Tests -->
        <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; border: 1px solid #E5E7EB;">
            <div style="font-size: 24px; margin-bottom: 8px;">📝</div>
            <h3 style="margin: 0 0 8px 0; color: #111827; font-size: 16px; font-weight: 600;">MCQ Tests</h3>
            <p style="margin: 0; color: #6B7280; font-size: 13px;">Test your knowledge across 15+ technical topics with instant results.</p>
        </div>

        <!-- Code Compiler -->
        <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; border: 1px solid #E5E7EB;">
            <div style="font-size: 24px; margin-bottom: 8px;">💻</div>
            <h3 style="margin: 0 0 8px 0; color: #111827; font-size: 16px; font-weight: 600;">Online Compiler</h3>
            <p style="margin: 0; color: #6B7280; font-size: 13px;">Write and run code in multiple languages directly in your browser.</p>
        </div>

        <!-- AI Chatbot -->
        <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; border: 1px solid #E5E7EB;">
            <div style="font-size: 24px; margin-bottom: 8px;">💬</div>
            <h3 style="margin: 0 0 8px 0; color: #111827; font-size: 16px; font-weight: 600;">AI Assistant</h3>
            <p style="margin: 0; color: #6B7280; font-size: 13px;">Get instant answers to your technical doubts anytime.</p>
        </div>

        <!-- Study Notes -->
        <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; border: 1px solid #E5E7EB;">
            <div style="font-size: 24px; margin-bottom: 8px;">📓</div>
            <h3 style="margin: 0 0 8px 0; color: #111827; font-size: 16px; font-weight: 600;">Study Notes</h3>
            <p style="margin: 0; color: #6B7280; font-size: 13px;">Create, organize, and share your preparation notes.</p>
        </div>

        <!-- Learning Resources -->
        <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; border: 1px solid #E5E7EB;">
            <div style="font-size: 24px; margin-bottom: 8px;">📚</div>
            <h3 style="margin: 0 0 8px 0; color: #111827; font-size: 16px; font-weight: 600;">Resources</h3>
            <p style="margin: 0; color: #6B7280; font-size: 13px;">Access curated learning materials and cheat sheets.</p>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="${APP_URL}/dashboard" style="display: inline-block; background-color: #2563EB; color: #FFFFFF; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);">
            Go to Dashboard
        </a>
      </div>
    </div>
  `;
};

const getSupportEmailToTeam = (name, email, subject, category, priority, message) => {
  const priorityColors = {
    urgent: { bg: '#FEF2F2', text: '#DC2626' },
    high: { bg: '#FFF7ED', text: '#EA580C' },
    normal: { bg: '#EFF6FF', text: '#2563EB' },
    low: { bg: '#F3F4F6', text: '#4B5563' }
  };

  const pStyle = priorityColors[priority] || priorityColors.normal;

  return `
    <div>
      <h2 style="color: #111827; margin: 0 0 24px 0; font-size: 20px; font-weight: 700; border-bottom: 2px solid #E5E7EB; padding-bottom: 12px;">
        🎫 New Support Request
      </h2>
      
      <!-- Priority Badge -->
      <div style="margin-bottom: 20px;">
        <span style="display: inline-block; background: ${pStyle.bg}; color: ${pStyle.text}; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; text-transform: uppercase;">
          ${priority} Priority
        </span>
        <span style="display: inline-block; background: #F3F4F6; color: #374151; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; margin-left: 8px;">
          ${category}
        </span>
      </div>
      
      <!-- Contact Info -->
      <div style="background: #F9FAFB; border-radius: 8px; border: 1px solid #E5E7EB; margin-bottom: 24px;">
          <div style="padding: 16px; border-bottom: 1px solid #E5E7EB;">
            <h3 style="color: #111827; margin: 0; font-size: 14px; font-weight: 600;">📋 Contact Information</h3>
          </div>
          <div style="padding: 16px;">
            <table role="presentation" width="100%" cellpadding="4" cellspacing="0" border="0">
                <tr>
                    <td width="100" style="color: #6B7280; font-size: 13px;">Name:</td>
                    <td style="color: #111827; font-size: 13px; font-weight: 500;">${name}</td>
                </tr>
                <tr>
                    <td style="color: #6B7280; font-size: 13px;">Email:</td>
                    <td style="color: #111827; font-size: 13px; font-weight: 500;">
                        <a href="mailto:${email}" style="color: #2563EB; text-decoration: none;">${email}</a>
                    </td>
                </tr>
                <tr>
                    <td style="color: #6B7280; font-size: 13px;">Time:</td>
                    <td style="color: #111827; font-size: 13px;">${new Date().toLocaleString()}</td>
                </tr>
            </table>
          </div>
      </div>
      
      <!-- Subject -->
      <div style="margin-bottom: 24px;">
        <h3 style="color: #374151; margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">
          Subject
        </h3>
        <div style="background: #FFFFFF; padding: 12px 16px; border: 1px solid #E5E7EB; border-radius: 6px; color: #111827; font-weight: 500;">
          ${subject}
        </div>
      </div>
      
      <!-- Message -->
      <div>
        <h3 style="color: #374151; margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">
          Message
        </h3>
        <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; border: 1px solid #E5E7EB;">
          <p style="color: #374151; margin: 0; font-size: 14px; line-height: 1.6; white-space: pre-line;">
            ${message}
          </p>
        </div>
      </div>
    </div>
  `;
};

const getSupportAutoReply = (name, subject, category, priority, aiResponse, userMessage) => {
  return `
    <div>
      <h2 style="color: #111827; margin: 0 0 16px 0; font-size: 24px; font-weight: 700;">
        Hello ${name}! 👋
      </h2>
      <p style="color: #4B5563; margin: 0 0 24px 0; font-size: 15px; line-height: 1.6;">
        Thank you for contacting Interview AI support. We've received your message and our AI assistant has prepared an initial response for you.
      </p>
      
      <!-- AI Response -->
      <div style="background: #F0F9FF; border: 1px solid #BAE6FD; border-radius: 8px; margin-bottom: 32px;">
        <div style="padding: 20px;">
          <div style="margin-bottom: 12px;">
            <span style="display: inline-block; background: #E0F2FE; color: #0284C7; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase;">
              🤖 AI Assistant Response
            </span>
          </div>
          <div style="color: #334155; font-size: 15px; line-height: 1.7; white-space: pre-line;">
            ${aiResponse}
          </div>
        </div>
      </div>
      
      <!-- Request Summary -->
      <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px;">
         <h4 style="color: #374151; margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">
           📝 Your Request Summary
         </h4>
         <p style="margin: 0 0 8px 0; font-size: 13px;">
            <strong style="color: #6B7280;">Subject:</strong> <span style="color: #111827;">${subject}</span>
         </p>
         <p style="margin: 0; font-size: 13px;">
            <strong style="color: #6B7280;">Category:</strong> <span style="color: #111827;">${category}</span>
         </p>
      </div>
    </div>
  `;
};


// ==========================================
// SERVICE FUNCTIONS
// ==========================================

exports.sendOTPEmail = async (email, otp) => {
  const htmlContent = getEmailTemplate(getOTPEmailContent(otp), { title: 'Password Reset - Interview AI' });
  return sendEmail({
    to: email,
    subject: '🔐 Password Reset - Interview AI',
    html: htmlContent,
    text: `Your OTP is ${otp}`
  });
};

exports.sendRegistrationOTPEmail = async (email, otp, fullName) => {
  const htmlContent = getEmailTemplate(getRegistrationOTPEmailContent(otp, fullName), { title: 'Verify Your Email' });
  return sendEmail({
    to: email,
    subject: '✨ Verify Your Email - Interview AI',
    html: htmlContent,
    text: `Your verification code is ${otp}`
  });
};

exports.sendWelcomeEmail = async (email, fullName) => {
  const htmlContent = getEmailTemplate(getWelcomeEmailContent(fullName), { title: 'Welcome to Interview AI' });
  return sendEmail({
    to: email,
    subject: '🎉 Welcome to Interview AI',
    html: htmlContent,
    text: `Welcome ${fullName}! Login to start practicing.`
  });
};

exports.sendNotificationEmail = async (userEmail, title, message, action, actionUrl) => {
  const htmlContent = getEmailTemplate(
    getNotificationEmailContent(title, message, action, actionUrl),
    { title }
  );
  return sendEmail({
    to: userEmail,
    subject: `🔔 ${title}`,
    html: htmlContent,
    text: `${title}\n\n${message}`
  });
};

exports.sendCustomEmail = async (to, subject, htmlContent, textContent = '', options = {}) => {
  return sendEmail({
    to,
    subject,
    html: htmlContent,
    text: textContent,
    ...options
  });
};

exports.sendSupportEmailToTeam = async (name, email, subject, category, priority, message) => {
  const htmlContent = getEmailTemplate(
    getSupportEmailToTeam(name, email, subject, category, priority, message),
    { title: 'New Support Request', headerGradient: false }
  );
  return sendEmail({
    to: process.env.SUPPORT_TEAM_EMAIL || process.env.EMAIL_USER,
    subject: `🎫 [${category.toUpperCase()}] ${subject}`,
    html: htmlContent,
    replyTo: email
  });
};

exports.sendSupportAutoReply = async (name, email, subject, category, priority, aiResponse, userMessage) => {
  const htmlContent = getEmailTemplate(
    getSupportAutoReply(name, subject, category, priority, aiResponse, userMessage),
    { title: 'Support Request Received' }
  );
  return sendEmail({
    to: email,
    subject: `Re: ${subject}`,
    html: htmlContent
  });
};

// Exports helper for template usage in other files
exports.getEmailTemplate = getEmailTemplate;
exports.getOTPEmailContent = getOTPEmailContent;
exports.getNotificationEmailContent = getNotificationEmailContent;
exports.getWelcomeEmailContent = getWelcomeEmailContent;
exports.getRegistrationOTPEmailContent = getRegistrationOTPEmailContent;

exports.getServiceInfo = () => ({
  service: 'Brevo SMTP (With Rich Templates)',
  isProduction: process.env.NODE_ENV === 'production',
  configured: !!(process.env.BREVO_SMTP_USER && process.env.BREVO_SMTP_KEY)
});