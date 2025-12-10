const sgMail = require('@sendgrid/mail');

// Import template helpers from the main email service
const {
    getEmailTemplate,
    getOTPEmailContent,
    getNotificationEmailContent,
    getSupportEmailToTeam,
    getSupportAutoReply
} = require('./emailService');

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    console.log('✅ SendGrid initialized');
} else {
    console.warn('⚠️ SENDGRID_API_KEY not found. Email sending will fail.');
}

/**
 * Send OTP Email via SendGrid
 */
exports.sendOTPEmail = async (email, otp) => {
    try {
        if (!process.env.SENDGRID_API_KEY) {
            throw new Error('SendGrid API key not configured. Please set SENDGRID_API_KEY environment variable.');
        }

        console.log(`📧 Sending OTP email to ${email} via SendGrid...`);

        const htmlContent = getEmailTemplate(getOTPEmailContent(otp), {
            title: 'Password Reset - InterviewPrep AI'
        });

        const msg = {
            to: email,
            from: {
                email: process.env.EMAIL_USER,
                name: 'InterviewPrep AI'
            },
            subject: '🔐 Password Reset - Your OTP Code',
            html: htmlContent,
            text: `Your OTP for password reset is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, please ignore this email.\n\n- InterviewPrep AI Team`
        };

        const result = await sgMail.send(msg);

        console.log('✅ OTP Email sent via SendGrid:', result[0].statusCode);

        return {
            success: true,
            messageId: result[0].headers['x-message-id'],
            statusCode: result[0].statusCode
        };

    } catch (error) {
        console.error('❌ SendGrid error:', error.response?.body || error.message);

        return {
            success: false,
            error: error.message,
            code: error.code,
            details: error.response?.body
        };
    }
};

/**
 * Send Notification Email via SendGrid
 */
exports.sendNotificationEmail = async (userEmail, title, message, action, actionUrl) => {
    try {
        if (!process.env.SENDGRID_API_KEY) {
            throw new Error('SendGrid API key not configured.');
        }

        console.log(`📧 Sending notification email to ${userEmail} via SendGrid...`);

        const htmlContent = getEmailTemplate(
            getNotificationEmailContent(title, message, action, actionUrl),
            { title: `${title} - InterviewPrep AI` }
        );

        const msg = {
            to: userEmail,
            from: {
                email: process.env.EMAIL_USER,
                name: 'InterviewPrep AI'
            },
            subject: `🔔 ${title} - InterviewPrep AI`,
            html: htmlContent,
            text: `${title}\n\n${message}${action && actionUrl ? `\n\n${action}: ${actionUrl}` : ''}\n\n- InterviewPrep AI Team`
        };

        const result = await sgMail.send(msg);

        console.log('✅ Notification email sent via SendGrid:', result[0].statusCode);

        return {
            success: true,
            messageId: result[0].headers['x-message-id'],
            statusCode: result[0].statusCode
        };

    } catch (error) {
        console.error('❌ SendGrid error:', error.response?.body || error.message);

        return {
            success: false,
            error: error.message,
            code: error.code,
            details: error.response?.body
        };
    }
};

/**
 * Send Support Email to Team via SendGrid
 */
exports.sendSupportEmailToTeam = async (name, email, subject, category, priority, message) => {
    try {
        if (!process.env.SENDGRID_API_KEY) {
            throw new Error('SendGrid API key not configured.');
        }

        console.log(`📧 Sending support email to team via SendGrid...`);

        const htmlContent = getEmailTemplate(
            getSupportEmailToTeam(name, email, subject, category, priority, message),
            { title: 'New Support Request - InterviewPrep AI', headerGradient: false }
        );

        const msg = {
            to: process.env.SUPPORT_TEAM_EMAIL || process.env.EMAIL_USER,
            from: {
                email: process.env.EMAIL_USER,
                name: 'InterviewPrep AI Support System'
            },
            replyTo: email,
            subject: `🎫 [${category.toUpperCase()}] [${priority.toUpperCase()}] ${subject}`,
            html: htmlContent,
            text: `New Support Request\n\nFrom: ${name} (${email})\nCategory: ${category}\nPriority: ${priority}\nSubject: ${subject}\n\nMessage:\n${message}\n\nSubmitted: ${new Date().toLocaleString()}`
        };

        const result = await sgMail.send(msg);

        console.log('✅ Support email sent to team via SendGrid:', result[0].statusCode);

        return {
            success: true,
            messageId: result[0].headers['x-message-id'],
            statusCode: result[0].statusCode
        };

    } catch (error) {
        console.error('❌ SendGrid error:', error.response?.body || error.message);

        return {
            success: false,
            error: error.message,
            code: error.code,
            details: error.response?.body
        };
    }
};

/**
 * Send Auto-Reply to Support Requester via SendGrid
 */
exports.sendSupportAutoReply = async (name, email, subject, category, priority, aiResponse, userMessage) => {
    try {
        if (!process.env.SENDGRID_API_KEY) {
            throw new Error('SendGrid API key not configured.');
        }

        console.log(`📧 Sending auto-reply to ${email} via SendGrid...`);

        const htmlContent = getEmailTemplate(
            getSupportAutoReply(name, subject, category, priority, aiResponse, userMessage),
            { title: 'Support Request Received - InterviewPrep AI' }
        );

        const msg = {
            to: email,
            from: {
                email: process.env.EMAIL_USER,
                name: 'InterviewPrep AI Support'
            },
            subject: `Re: ${subject} - InterviewPrep AI Support`,
            html: htmlContent,
            text: `Hello ${name},\n\nThank you for contacting InterviewPrep AI support.\n\nAI Assistant Response:\n${aiResponse}\n\nYour Request Details:\n- Subject: ${subject}\n- Category: ${category}\n- Priority: ${priority}\n- Submitted: ${new Date().toLocaleString()}\n\nOur support team will review your request and follow up if needed.\n\n- InterviewPrep AI Support Team`
        };

        const result = await sgMail.send(msg);

        console.log('✅ Auto-reply sent via SendGrid:', result[0].statusCode);

        return {
            success: true,
            messageId: result[0].headers['x-message-id'],
            statusCode: result[0].statusCode
        };

    } catch (error) {
        console.error('❌ SendGrid error:', error.response?.body || error.message);

        return {
            success: false,
            error: error.message,
            code: error.code,
            details: error.response?.body
        };
    }
};

/**
 * Send Custom Email via SendGrid
 */
exports.sendCustomEmail = async (to, subject, htmlContent, textContent = '', options = {}) => {
    try {
        if (!process.env.SENDGRID_API_KEY) {
            throw new Error('SendGrid API key not configured.');
        }

        console.log(`📧 Sending custom email to ${to} via SendGrid...`);

        const msg = {
            to: to,
            from: options.from || {
                email: process.env.EMAIL_USER,
                name: 'InterviewPrep AI'
            },
            subject: subject,
            html: htmlContent,
            text: textContent || subject,
            replyTo: options.replyTo,
            cc: options.cc,
            bcc: options.bcc
        };

        const result = await sgMail.send(msg);

        console.log('✅ Custom email sent via SendGrid:', result[0].statusCode);

        return {
            success: true,
            messageId: result[0].headers['x-message-id'],
            statusCode: result[0].statusCode
        };

    } catch (error) {
        console.error('❌ SendGrid error:', error.response?.body || error.message);

        return {
            success: false,
            error: error.message,
            code: error.code,
            details: error.response?.body
        };
    }
};

// Get service information
exports.getServiceInfo = () => ({
    service: 'SendGrid',
    isProduction: process.env.NODE_ENV === 'production',
    configured: !!process.env.SENDGRID_API_KEY
});

// Export template helpers for reuse
exports.getEmailTemplate = getEmailTemplate;
exports.getOTPEmailContent = getOTPEmailContent;
exports.getNotificationEmailContent = getNotificationEmailContent;
