/**
 * Unified Email Service Loader
 * 
 * Automatically selects the appropriate email service based on environment:
 * - Production (Render, etc.): Uses SendGrid (HTTP API - no port blocking)
 * - Development: Uses Nodemailer (Gmail SMTP)
 * 
 * Usage:
 * const { sendOTPEmail, sendNotificationEmail } = require('./utils/email');
 * 
 * Environment Variables:
 * - USE_SENDGRID=true → Force SendGrid
 * - SENDGRID_API_KEY → Required for SendGrid
 * - EMAIL_USER, EMAIL_PASS → Required for Nodemailer
 */

require('dotenv').config();

// Determine which service to use
const useSendGrid = process.env.USE_SENDGRID === 'true' ||
    (process.env.NODE_ENV === 'production' && process.env.SENDGRID_API_KEY);

let emailService;

if (useSendGrid) {
    console.log('🔷 Using SendGrid Email Service (Production-ready)');
    try {
        emailService = require('./emailServiceSendGrid');
    } catch (error) {
        console.error('❌ Failed to load SendGrid service:', error.message);
        console.warn('⚠️ Falling back to Nodemailer...');
        emailService = require('./emailService');
    }
} else {
    console.log('📧 Using Nodemailer Email Service (Development)');
    emailService = require('./emailService');
}

// Export all email functions
module.exports = emailService;

// Named exports for convenience
exports.sendOTPEmail = emailService.sendOTPEmail;
exports.sendNotificationEmail = emailService.sendNotificationEmail;
exports.sendSupportEmailToTeam = emailService.sendSupportEmailToTeam;
exports.sendSupportAutoReply = emailService.sendSupportAutoReply;
exports.sendCustomEmail = emailService.sendCustomEmail;
exports.getEmailTemplate = emailService.getEmailTemplate;
exports.getOTPEmailContent = emailService.getOTPEmailContent;
exports.getNotificationEmailContent = emailService.getNotificationEmailContent;

// Export info about which service is being used
exports.getServiceInfo = () => ({
    service: useSendGrid ? 'SendGrid' : 'Nodemailer',
    isProduction: process.env.NODE_ENV === 'production',
    configured: useSendGrid
        ? !!process.env.SENDGRID_API_KEY
        : !!(process.env.EMAIL_USER && process.env.EMAIL_PASS)
});
