require('dotenv').config();

/**
 * Registration OTP Email Test
 * Tests the 4-digit registration OTP email sending functionality
 */

async function testRegistrationOTP() {
    console.log('============================================================');
    console.log('✨ REGISTRATION OTP EMAIL TEST');
    console.log('============================================================\n');

    // Load email service
    const emailService = require('./utils/emailService');

    // Check configuration
    console.log('📋 Configuration:');
    console.log(`  Email Service: ${process.env.EMAIL_SERVICE || 'gmail'}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  Email User: ${process.env.EMAIL_USER}`);
    console.log(`  App URL: ${process.env.APP_URL || 'http://localhost:5173'}\n`);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('❌ Email service not configured!');
        console.error('\nPlease set environment variables:');
        console.error('  - EMAIL_USER=your-email@gmail.com');
        console.error('  - EMAIL_PASS=your-app-password');
        console.error('  - EMAIL_SERVICE=gmail (optional, defaults to gmail)');
        process.exit(1);
    }

    // Generate random 4-digit OTP (matching registration flow)
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const testEmail = process.env.TEST_EMAIL || process.env.EMAIL_USER;
    const testName = 'Test User';

    console.log('📧 Sending Registration OTP Email...');
    console.log(`  To: ${testEmail}`);
    console.log(`  Full Name: ${testName}`);
    console.log(`  OTP Code: ${otp} (4 digits)`);
    console.log(`  Template: AI Tech Dark Gradient theme`);
    console.log(`  Features: Responsive, Modern design\n`);

    try {
        const startTime = Date.now();

        // Send registration OTP email
        const result = await emailService.sendRegistrationOTPEmail(testEmail, otp, testName);

        const duration = Date.now() - startTime;

        console.log('============================================================');
        console.log('✅ SUCCESS!');
        console.log('============================================================\n');
        console.log(`📬 Email sent successfully in ${duration}ms`);
        console.log(`📨 Message ID: ${result.messageId || 'N/A'}`);
        console.log(`📧 Recipient: ${testEmail}`);
        console.log(`🔐 OTP Code: ${otp}\n`);

        console.log('📋 Email Details:');
        console.log(`  Subject: Verify Your Email - Interview AI`);
        console.log(`  Template: Registration OTP with gradient design`);
        console.log(`  Content Includes:`);
        console.log(`    ✓ Welcome message with user's name`);
        console.log(`    ✓ 4-digit OTP in large, styled box`);
        console.log(`    ✓ 10-minute expiration notice`);
        console.log(`    ✓ Security information`);
        console.log(`    ✓ What's Next section`);
        console.log(`    ✓ Support contact options`);
        console.log(`    ✓ Responsive mobile-friendly design\n`);

        console.log('🎨 Design Features:');
        console.log(`  ✓ AI Tech Dark Gradient theme`);
        console.log(`  ✓ Gradient header with logo`);
        console.log(`  ✓ Large 48px OTP display`);
        console.log(`  ✓ Color-coded info boxes`);
        console.log(`  ✓ Smooth animations and shadows`);
        console.log(`  ✓ Mobile responsive layout\n`);

        console.log('✨ Next Steps:');
        console.log(`  1. Check inbox at: ${testEmail}`);
        console.log(`  2. Verify the email rendering`);
        console.log(`  3. Check mobile responsiveness`);
        console.log(`  4. Test OTP code: ${otp}`);
        console.log(`  5. Verify all links work correctly\n`);

        console.log('============================================================');
        process.exit(0);

    } catch (error) {
        const duration = Date.now() - startTime;

        console.log('============================================================');
        console.log('❌ FAILED!');
        console.log('============================================================\n');
        console.log(`⏱️  Failed after ${duration}ms\n`);
        console.error('Error Details:');
        console.error(`  Type: ${error.name || 'Unknown'}`);
        console.error(`  Message: ${error.message}`);

        if (error.code) {
            console.error(`  Code: ${error.code}`);
        }

        if (error.command) {
            console.error(`  Command: ${error.command}`);
        }

        if (error.response) {
            console.error(`  Response: ${error.response}`);
        }

        console.error('\n💡 Troubleshooting Tips:');
        console.error('  1. Verify EMAIL_USER and EMAIL_PASS in .env file');
        console.error('  2. For Gmail: Use App Password (not regular password)');
        console.error('  3. Enable "Less secure app access" or use OAuth2');
        console.error('  4. Check firewall/network settings');
        console.error('  5. Verify SMTP ports are not blocked (587, 465, 25)');
        console.error('  6. Check email service status\n');

        console.log('Stack Trace:');
        console.error(error.stack);
        console.log('\n============================================================');
        process.exit(1);
    }
}

// Run test
testRegistrationOTP().catch(error => {
    console.error('\n💥 Unexpected Error:', error);
    process.exit(1);
});
