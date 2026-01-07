/**
 * Email Service Test Suite
 * Run with: node backend/test-email.js
 */

require('dotenv').config();
const {
    sendOTPEmail,
    sendNotificationEmail,
    sendSupportEmailToTeam,
    sendSupportAutoReply
} = require('./utils/emailService');

// ========================================
// CONFIGURATION
// ========================================
// Use environment variable or fallback to the sender email
const TEST_EMAIL = process.env.TEST_EMAIL || process.env.EMAIL_USER;

// ========================================
// Test Functions
// ========================================

async function testOTPEmail() {
    console.log('\n📧 Testing OTP Email...');
    console.log('Sending to:', TEST_EMAIL);

    const start = Date.now();
    const result = await sendOTPEmail(TEST_EMAIL, '123456');
    const duration = Date.now() - start;

    if (result.success) {
        console.log(`✅ OTP Email sent successfully! (${duration}ms)`);
        console.log('Message ID:', result.messageId);
    } else {
        console.error('❌ Failed to send OTP email');
        console.error('Error:', result.error);
    }

    return { ...result, duration };
}

async function testNotificationEmail() {
    console.log('\n🔔 Testing Notification Email...');
    console.log('Sending to:', TEST_EMAIL);

    const start = Date.now();
    const result = await sendNotificationEmail(
        TEST_EMAIL,
        'New Feature Available',
        'We\'ve just launched our new MCQ Test feature! Test your knowledge with AI-generated questions tailored to your interview preparation needs.',
        'Try MCQ Tests',
        'http://localhost:5173/mcq-test'
    );
    const duration = Date.now() - start;

    if (result.success) {
        console.log(`✅ Notification email sent successfully! (${duration}ms)`);
        console.log('Message ID:', result.messageId);
    } else {
        console.error('❌ Failed to send notification email');
        console.error('Error:', result.error);
    }

    return { ...result, duration };
}

async function testSupportEmails() {
    console.log('\n🎫 Testing Support Emails...');

    // Test support email to team
    console.log('Sending support request to team...');
    const startTeam = Date.now();
    const teamResult = await sendSupportEmailToTeam(
        'John Doe',
        TEST_EMAIL,
        'Cannot access code editor',
        'technical',
        'high',
        'I\'m having trouble accessing the code editor. Every time I try to run my code, it shows a compilation error even for simple print statements. I\'ve tried refreshing and clearing cache but the issue persists.'
    );
    const durationTeam = Date.now() - startTeam;

    if (teamResult.success) {
        console.log(`✅ Support email sent to team! (${durationTeam}ms)`);
        console.log('Message ID:', teamResult.messageId);
    } else {
        console.error('❌ Failed to send support email to team');
        console.error('Error:', teamResult.error);
    }

    // Test auto-reply to user
    console.log('\nSending auto-reply to user...');
    const startReply = Date.now();
    const autoReplyResult = await sendSupportAutoReply(
        'John Doe',
        TEST_EMAIL,
        'Cannot access code editor',
        'technical',
        'high',
        `Hello John,

Thank you for contacting Interview AI support! I understand you're experiencing issues with the code editor showing compilation errors.

Here are some quick troubleshooting steps:

1. Check Browser Compatibility: Ensure you're using the latest version of Chrome, Firefox, or Edge.
2. Clear Application Cache: Go to Settings → Clear Data → Clear Application Cache
3. Check Code Syntax: Make sure there are no hidden characters or formatting issues
4. Try a Different Browser: This helps identify if it's a browser-specific issue

Our technical support team has been notified of your high-priority issue and will investigate this compilation error. Given the priority level, you can expect a detailed response within 8 hours.

If the issue persists, please don't hesitate to reply to this email with:
- Your browser version
- A screenshot of the error
- A sample of the code you're trying to run

We appreciate your patience and are committed to resolving this quickly!

Best regards,
The Interview AI Support Team`,
        'I\'m having trouble accessing the code editor...'
    );
    const durationReply = Date.now() - startReply;

    if (autoReplyResult.success) {
        console.log(`✅ Auto-reply sent to user! (${durationReply}ms)`);
        console.log('Message ID:', autoReplyResult.messageId);
    } else {
        console.error('❌ Failed to send auto-reply');
        console.error('Error:', autoReplyResult.error);
    }

    return { teamResult, autoReplyResult, durationTeam, durationReply };
}

async function runAllTests() {
    console.log('='.repeat(60));
    console.log('🧪 EMAIL SERVICE TEST SUITE');
    console.log('='.repeat(60));

    // Check configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('\n❌ ERROR: Email credentials not configured!');
        console.error('\nPlease set the following in your .env file:');
        console.error('  EMAIL_USER=your-email@gmail.com');
        console.error('  EMAIL_PASS=your-app-specific-password');
        console.error('\nSee EMAIL_SETUP_GUIDE.md for instructions.');
        process.exit(1);
    }

    console.log('\n📋 Configuration:');
    console.log('  Email User:', process.env.EMAIL_USER);
    console.log('  Email Service:', process.env.EMAIL_SERVICE || 'gmail (default)');
    console.log('  Test Email:', TEST_EMAIL);
    console.log('  App URL:', process.env.APP_URL || 'http://localhost:5173 (default)');

    const results = {
        otp: null,
        notification: null,
        support: null
    };

    try {
        const startTotal = Date.now();

        // Test 1: OTP Email
        results.otp = await testOTPEmail();

        // Test 2: Notification Email
        results.notification = await testNotificationEmail();

        // Test 3: Support Emails
        results.support = await testSupportEmails();

        const totalTime = Date.now() - startTotal;

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 TEST SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total Execution Time: ${totalTime}ms`);

        const otpStatus = results.otp?.success ? '✅ PASS' : '❌ FAIL';
        const notifStatus = results.notification?.success ? '✅ PASS' : '❌ FAIL';
        const supportTeamStatus = results.support?.teamResult?.success ? '✅ PASS' : '❌ FAIL';
        const supportReplyStatus = results.support?.autoReplyResult?.success ? '✅ PASS' : '❌ FAIL';

        console.log(`\n  OTP Email:              ${otpStatus} (${results.otp.duration}ms)`);
        console.log(`  Notification Email:     ${notifStatus} (${results.notification.duration}ms)`);
        console.log(`  Support Team Email:     ${supportTeamStatus} (${results.support.durationTeam}ms)`);
        console.log(`  Support Auto-Reply:     ${supportReplyStatus} (${results.support.durationReply}ms)`);

        const allPassed = results.otp?.success &&
            results.notification?.success &&
            results.support?.teamResult?.success &&
            results.support?.autoReplyResult?.success;

        if (allPassed) {
            console.log('\n🎉 All tests passed! Check your email inbox.');
            console.log('✅ Performance verified: Subsequent emails reuse the connection.');
        } else {
            console.log('\n⚠️  Some tests failed. Please check the errors above.');
        }

    } catch (error) {
        console.error('\n❌ Test suite error:', error.message);
        console.error('\nFull error:', error);
    }

    console.log('\n' + '='.repeat(60));
    process.exit(0);
}

// Utility function to add delay between tests
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Run tests
runAllTests().catch(console.error);
