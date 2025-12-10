require('dotenv').config();

/**
 * Production Email Test Suite
 * Tests email service on production environments like Render
 */

async function testProductionEmail() {
    console.log('============================================================');
    console.log('🧪 PRODUCTION EMAIL SERVICE TEST');
    console.log('============================================================\n');

    // Check environment
    console.log('📋 Environment Configuration:');
    console.log(`  NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  Platform: ${process.platform}`);
    console.log(`  Email User: ${process.env.EMAIL_USER || '❌ Not set'}`);
    console.log(`  SendGrid API Key: ${process.env.SENDGRID_API_KEY ? '✅ Set (' + process.env.SENDGRID_API_KEY.substring(0, 10) + '...)' : '❌ Not set'}`);
    console.log(`  Use SendGrid: ${process.env.USE_SENDGRID || 'auto'}`);
    console.log('');

    // Load email service
    console.log('📦 Loading Email Service...');
    const emailService = require('./utils/email');
    const serviceInfo = emailService.getServiceInfo();

    console.log(`  ✅ Service: ${serviceInfo.service}`);
    console.log(`  ✅ Configured: ${serviceInfo.configured ? 'Yes' : 'No'}`);
    console.log(`  ✅ Production: ${serviceInfo.isProduction ? 'Yes' : 'No'}\n`);

    if (!serviceInfo.configured) {
        console.error('❌ Email service not properly configured!');
        console.error('\nRequired environment variables:');
        if (serviceInfo.service === 'SendGrid') {
            console.error('  - SENDGRID_API_KEY');
            console.error('  - EMAIL_USER (verified sender email)');
        } else {
            console.error('  - EMAIL_USER');
            console.error('  - EMAIL_PASS (Gmail app password)');
        }
        process.exit(1);
    }

    // Test recipient
    const testEmail = process.env.EMAIL_USER; // Send to self for testing

    console.log('============================================================');
    console.log('🧪 TEST 1: OTP Email');
    console.log('============================================================\n');

    try {
        console.log(`Sending OTP email to: ${testEmail}`);

        const otpResult = await emailService.sendOTPEmail(testEmail, '123456');

        if (otpResult.success) {
            console.log('✅ OTP Email sent successfully!');
            console.log(`   Message ID: ${otpResult.messageId}`);
            if (otpResult.statusCode) {
                console.log(`   Status Code: ${otpResult.statusCode}`);
            }
        } else {
            console.log('❌ Failed to send OTP email');
            console.log(`   Error: ${otpResult.error}`);
            console.log(`   Code: ${otpResult.code}`);
            if (otpResult.details) {
                console.log(`   Details:`, otpResult.details);
            }
        }
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('   Stack:', error.stack);
    }

    console.log('\n============================================================');
    console.log('🧪 TEST 2: Notification Email');
    console.log('============================================================\n');

    try {
        console.log(`Sending notification to: ${testEmail}`);

        const notifResult = await emailService.sendNotificationEmail(
            testEmail,
            'Test Notification',
            'This is a test notification from your production email service. If you receive this, your email system is working correctly!',
            'View Dashboard',
            process.env.APP_URL || 'http://localhost:5173'
        );

        if (notifResult.success) {
            console.log('✅ Notification email sent successfully!');
            console.log(`   Message ID: ${notifResult.messageId}`);
            if (notifResult.statusCode) {
                console.log(`   Status Code: ${notifResult.statusCode}`);
            }
        } else {
            console.log('❌ Failed to send notification email');
            console.log(`   Error: ${notifResult.error}`);
            console.log(`   Code: ${notifResult.code}`);
            if (notifResult.details) {
                console.log(`   Details:`, notifResult.details);
            }
        }
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }

    console.log('\n============================================================');
    console.log('🧪 TEST 3: Support Emails');
    console.log('============================================================\n');

    try {
        console.log('Sending support request to team...');

        const supportResult = await emailService.sendSupportEmailToTeam(
            'Test User',
            testEmail,
            'Production Email Test',
            'technical',
            'high',
            'Testing support email functionality on production server. This is an automated test.'
        );

        if (supportResult.success) {
            console.log('✅ Support email sent to team!');
            console.log(`   Message ID: ${supportResult.messageId}`);
            if (supportResult.statusCode) {
                console.log(`   Status Code: ${supportResult.statusCode}`);
            }
        } else {
            console.log('❌ Failed to send support email');
            console.log(`   Error: ${supportResult.error}`);
        }

        console.log('\nSending auto-reply to user...');

        const replyResult = await emailService.sendSupportAutoReply(
            'Test User',
            testEmail,
            'Production Email Test',
            'technical',
            'high',
            'Thank you for testing the email system. This is an automated response confirming that support emails are working correctly.',
            'Testing support email functionality on production server.'
        );

        if (replyResult.success) {
            console.log('✅ Auto-reply sent to user!');
            console.log(`   Message ID: ${replyResult.messageId}`);
            if (replyResult.statusCode) {
                console.log(`   Status Code: ${replyResult.statusCode}`);
            }
        } else {
            console.log('❌ Failed to send auto-reply');
            console.log(`   Error: ${replyResult.error}`);
        }
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }

    console.log('\n============================================================');
    console.log('📊 TEST SUMMARY');
    console.log('============================================================\n');

    console.log(`Email Service: ${serviceInfo.service}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`\n✅ All tests completed!`);
    console.log('\nPlease check your inbox at:', testEmail);
    console.log('\nExpected emails:');
    console.log('  1. OTP Email with code 123456');
    console.log('  2. Test Notification');
    console.log('  3. Support Request (if team email set)');
    console.log('  4. Support Auto-Reply');

    if (serviceInfo.service === 'SendGrid') {
        console.log('\n💡 Tip: Check SendGrid dashboard for delivery stats:');
        console.log('   https://app.sendgrid.com/email_activity');
    }

    console.log('\n============================================================');
}

// Run tests
testProductionEmail().catch(error => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
});
