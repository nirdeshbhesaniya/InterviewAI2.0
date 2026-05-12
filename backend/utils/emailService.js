const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Modern Email Service for Interview AI
 * Uses Brevo REST API (HTTP) via Axios
 * 
 * Includes rich, responsive email templates (Professional Light Theme).
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

/**
 * Centralized Email Sender Util
 */
const sendEmail = async ({ to, subject, html, text, from, replyTo }) => {
  // Collect all available Brevo API keys
  const apiKeys = [
    process.env.BREVO_API_KEY,
    process.env.BREVO_API_KEY_NEW
  ].filter(Boolean);

  if (apiKeys.length === 0) {
    console.warn('⚠️ BREVO API keys are missing. Email will not be sent.');
    return { success: false, error: 'Configuration missing' };
  }

  // Use configured From address, or fallback to a professional format
  const senderName = 'Interview AI';
  const senderEmail = 'noreply@interviewai.tech';

  // Parse 'from' if it contains name and email "Name <email>"
  let finalSender = { name: senderName, email: senderEmail };
  if (from) {
    const match = from.match(/(.*?)\s*<(.*?)>/);
    if (match) {
      finalSender = { name: match[1].trim(), email: match[2].trim() };
    } else {
      finalSender = { email: from };
    }
  }

  const payload = {
    sender: finalSender,
    to: [{ email: to }],
    subject: subject,
    htmlContent: html,
    textContent: text || html.replace(/<[^>]*>?/gm, ''), // Basic fallback
  };

  if (replyTo) {
    payload.replyTo = { email: replyTo };
  }

  let lastError = null;

  // Try each API key until one works
  for (let i = 0; i < apiKeys.length; i++) {
    const apiKey = apiKeys[i];
    const keyLabel = i === 0 ? 'Primary' : 'Secondary';

    try {
      const response = await axios.post(BREVO_API_URL, payload, {
        headers: {
          'accept': 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json'
        },
        timeout: 10000 // 10 seconds timeout
      });

      console.log(`✅ Email sent to ${to} using ${keyLabel} Key | MsgID: ${response.data.messageId}`);
      return { success: true, messageId: response.data.messageId };
    } catch (error) {
      lastError = error;
      const status = error.response?.status;
      const errorData = error.response?.data;
      
      // Log failure for this specific key
      console.error(`❌ Failed with ${keyLabel} Key: [${status || 'TIMEOUT'}]`, errorData ? JSON.stringify(errorData) : error.message);

      // Check if we should try the next key
      // 401 (Unauthorized), 403 (Forbidden - usually limit), 402 (Payment Required) or 429 (Too Many Requests)
      const shouldFallback = [401, 402, 403, 429].includes(status) || !status; // !status means timeout or network error

      if (shouldFallback && i < apiKeys.length - 1) {
        console.warn(`🔄 Attempting fallback to the next Brevo API key...`);
        continue;
      }

      // If it's a 400 error, it's likely a bad request (e.g., invalid email), 
      // so trying another key won't help. Break early.
      break;
    }
  }

  return { success: false, error: lastError?.message || 'Failed to send email after trying all keys' };
};

// ==========================================
// RICH HTML TEMPLATES
// ==========================================

const APP_URL = process.env.APP_URL || 'https://interviewai.tech';
const LOGO_URL = `${APP_URL}/images/logo.png`;

/**
 * Base Email Template - Professional Light Theme
 */
const getEmailTemplate = (content, { title = 'Interview AI Notification', preheader = '' } = {}) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased;">
  
  <!-- Email Container -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Inner Wrapper -->
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.05); border: 1px solid #E2E8F0;">
          
          <!-- Modern Gradient Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); padding: 40px 40px 30px 40px; text-align: center;">
              <h1 style="color: #FFFFFF; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">
                Interview AI
              </h1>
              <div style="height: 4px; width: 40px; background-color: rgba(255, 255, 255, 0.3); margin: 15px auto 0; border-radius: 2px;"></div>
            </td>
          </tr>
          
          <!-- Content Area -->
          <tr>
            <td style="padding: 48px; color: #1F2937; font-size: 16px; line-height: 1.6;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background-color: #F8FAFC; text-align: center; border-top: 1px solid #E2E8F0;">
              <p style="color: #64748B; margin: 0 0 8px 0; font-size: 14px;">
                &copy; ${new Date().getFullYear()} Interview AI. All rights reserved.
              </p>
              <p style="color: #94A3B8; margin: 0; font-size: 12px;">
                Elevating your professional interview journey.
              </p>
            </td>
          </tr>
        </table>
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
      <h2 style="color: #0F172A; margin: 0 0 24px 0; font-size: 24px; font-weight: 700;">
        Reset Your Password
      </h2>
      <p style="color: #475569; margin: 0 0 32px 0; font-size: 16px; line-height: 1.6;">
        We received a request to reset your password for your Interview AI account. Use the verification code below to choose a new password.
      </p>
      
      <div style="background-color: #F8FAFC; border-radius: 12px; padding: 32px; text-align: center; border: 1px solid #E2E8F0;">
        <div style="font-size: 42px; font-weight: 800; color: #3B82F6; letter-spacing: 6px; margin-bottom: 8px;">
            ${otp}
        </div>
        <p style="color: #64748B; margin: 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
            Verification Code
        </p>
      </div>

      <p style="color: #64748B; font-size: 15px; margin-top: 32px;">
        If you did not request a password reset, you can safely ignore this email.
      </p>
    </div>
  `;
};

const getRegistrationOTPEmailContent = (otp, fullName) => {
  return `
    <div style="text-align: center;">
      <h2 style="color: #0F172A; margin: 0 0 16px 0; font-size: 26px; font-weight: 700;">
        Welcome to Interview AI
      </h2>
      <p style="color: #475569; margin: 0 0 32px 0; font-size: 17px;">
        Hi ${fullName}, please verify your email address to get started.
      </p>

      <div style="text-align: center;">
        <a href="https://interviewai.tech/verify?otp=${otp}" 
           style="display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: #FFFFFF; padding: 16px 36px; border-radius: 12px; font-size: 16px; font-weight: 700; text-decoration: none; box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);">
          Verify Email Address
        </a>
      </div>
    </div>
  `;
};

const getNotificationEmailContent = (title, message, action, actionUrl) => {
  return `
    <div>
      <h2 style="color: #0F172A; margin: 0 0 24px 0; font-size: 24px; font-weight: 700;">
        ${title}
      </h2>
      
      <p style="color: #334155; font-size: 16px; line-height: 1.8; white-space: pre-line; margin-bottom: 32px;">
        ${message}
      </p>

      ${action && actionUrl ? `
        <div style="text-align: center; margin: 40px 0;">
            <a href="${actionUrl}" style="display: inline-block; background-color: #3B82F6; color: #FFFFFF; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px;">
                ${action}
            </a>
        </div>
      ` : ''}
    </div>
  `;
};

const getWelcomeEmailContent = (fullName) => {
  return `
    <div>
      <h2 style="color: #0F172A; margin: 0 0 20px 0; font-size: 26px; font-weight: 700;">
        Welcome aboard, ${fullName}
      </h2>
      <p style="color: #334155; margin-bottom: 24px; font-size: 17px; line-height: 1.6;">
        We're thrilled to have you join <strong>Interview AI</strong>. You've taken a significant step towards mastering your technical interviews.
      </p>
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="${APP_URL}/dashboard" style="display: inline-block; background-color: #3B82F6; color: #FFFFFF; font-weight: 600; text-decoration: none; padding: 18px 48px; border-radius: 8px; font-size: 16px;">
            Get Started Now
        </a>
      </div>
    </div>
  `;
};

const getSupportEmailToTeam = (name, email, subject, category, priority, message) => {
  return `
    <div>
      <h2 style="color: #0F172A; margin: 0 0 24px 0; font-size: 20px; font-weight: 700;">
        New Support Request
      </h2>
      <div style="background: #F8FAFC; padding: 24px; border-radius: 8px; border: 1px solid #E2E8F0;">
        <p style="color: #334155;"><strong>From:</strong> ${name} (${email})</p>
        <p style="color: #334155;"><strong>Subject:</strong> ${subject}</p>
        <p style="color: #334155;"><strong>Message:</strong> ${message}</p>
      </div>
    </div>
  `;
};

const getSupportAutoReply = (name, subject, category, priority, aiResponse, userMessage) => {
  return `
    <div>
      <h2 style="color: #0F172A; margin: 0 0 16px 0; font-size: 24px; font-weight: 700;">
        Hello ${name}
      </h2>
      <p style="color: #475569; margin: 0 0 32px 0; font-size: 16px; line-height: 1.6;">
        Thank you for contacting Interview AI support. We've received your message and our team is already looking into it. In the meantime, our AI assistant has prepared an initial response for you.
      </p>
      
      <!-- AI Response -->
      <div style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 12px; margin-bottom: 32px; padding: 24px;">
          <div style="color: #1E3A8A; font-size: 15px; line-height: 1.8; white-space: pre-line;">
            ${aiResponse}
          </div>
      </div>
      
      <!-- Request Summary -->
      <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 24px;">
         <h4 style="color: #374151; margin: 0 0 12px 0; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Your Request</h4>
         <p style="margin: 0 0 10px 0; font-size: 14px;">
            <strong style="color: #6B7280;">Subject:</strong> <span style="color: #111827; font-weight: 600;">${subject}</span>
         </p>
         <p style="margin: 0; font-size: 14px;">
            <strong style="color: #6B7280;">Category:</strong> <span style="color: #111827; font-weight: 600;">${category}</span>
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
    subject: 'Password Reset - Interview AI',
    html: htmlContent,
    text: `Your OTP is ${otp}`
  });
};

exports.sendRegistrationOTPEmail = async (email, otp, fullName) => {
  const htmlContent = getEmailTemplate(getRegistrationOTPEmailContent(otp, fullName), { title: 'Verify Your Email' });
  return sendEmail({
    to: email,
    subject: 'Verify Your Email - Interview AI',
    html: htmlContent,
    text: `Your verification code is ${otp}`
  });
};

exports.sendWelcomeEmail = async (email, fullName) => {
  const htmlContent = getEmailTemplate(getWelcomeEmailContent(fullName), { title: 'Welcome to Interview AI' });
  return sendEmail({
    to: email,
    subject: 'Welcome to Interview AI',
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
    subject: title,
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
    subject: `[${category.toUpperCase()}] ${subject}`,
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

exports.getServiceInfo = () => {
  const keys = [process.env.BREVO_API_KEY, process.env.BREVO_API_KEY_NEW].filter(Boolean);
  return {
    service: 'Brevo API (HTTP)',
    isProduction: process.env.NODE_ENV === 'production',
    configured: keys.length > 0,
    apiKeysCount: keys.length
  };
};