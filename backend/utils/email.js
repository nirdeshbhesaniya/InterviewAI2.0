/**
 * Email Service Entry Point
 * 
 * Replaces legacy email.js that switched between SendGrid and Nodemailer.
 * Now exclusively uses emailService.js which implements Brevo REST API.
 */

const emailService = require('./emailService');

module.exports = emailService;

// Named exports for convenience
exports.sendOTPEmail = emailService.sendOTPEmail;
exports.sendRegistrationOTPEmail = emailService.sendRegistrationOTPEmail;
exports.sendWelcomeEmail = emailService.sendWelcomeEmail;
exports.sendNotificationEmail = emailService.sendNotificationEmail;
exports.sendSupportEmailToTeam = emailService.sendSupportEmailToTeam;
exports.sendSupportAutoReply = emailService.sendSupportAutoReply;
exports.sendCustomEmail = emailService.sendCustomEmail;
exports.getEmailTemplate = emailService.getEmailTemplate;
exports.getOTPEmailContent = emailService.getOTPEmailContent;
exports.getNotificationEmailContent = emailService.getNotificationEmailContent;
exports.getServiceInfo = emailService.getServiceInfo;
