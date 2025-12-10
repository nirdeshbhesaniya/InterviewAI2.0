require('dotenv').config();

/**
 * Quick OTP Email Test
 * Tests OTP email sending functionality
 */

async function testOTP() {
    console.log('============================================================');
    console.log('🔐 OTP EMAIL TEST');
    console.log('============================================================\n');

    // Load email service
    const emailService = require('./utils/email');
    const serviceInfo = emailService.getServiceInfo();

    console.log('📋 Configuration:');
    console.log(`  Email Service: ${serviceInfo.service}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  Email User: ${process.env.EMAIL_USER}`);
    console.log(`  Configured: ${serviceInfo.configured ? '✅ Yes' : '❌ No'}\n`);

    if (!serviceInfo.configured) {
        console.error('❌ Email service not configured!');
        console.error('\nPlease set environment variables:');
        console.error('  - EMAIL_USER=your-email@gmail.com');
        console.error('  - EMAIL_PASS=your-app-password');
        console.error('\nOr for production:');
        console.error('  - SENDGRID_API_KEY=SG.xxxxx');
        console.error('  - USE_SENDGRID=true');
        process.exit(1);
    }

    // Generate random OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const testEmail = process.env.TEST_EMAIL || process.env.EMAIL_USER;

    console.log('📧 Sending OTP Email...');
    console.log(`  To: ${testEmail}`);
    console.log(`  OTP Code: ${otp}`);
    console.log(`  Service: ${serviceInfo.service}\n`);

    try {
        const startTime = Date.now();

        const result = await emailService.sendOTPEmail(testEmail, otp);

        const duration = Date.now() - startTime;

        console.log('============================================================');

        if (result.success) {
            console.log('✅ SUCCESS! OTP Email Sent');
            console.log('============================================================\n');
            console.log('📨 Email Details:');
            console.log(`  Message ID: ${result.messageId}`);
            console.log(`  Duration: ${duration}ms`);
            if (result.statusCode) {
                console.log(`  Status Code: ${result.statusCode}`);
            }
            if (result.response) {
                console.log(`  Response: ${result.response}`);
            }

            console.log('\n📬 Check your inbox at:', testEmail);
            console.log('\n📋 Email Content:');
            console.log('  Subject: 🔐 Password Reset - Your OTP Code');
            console.log(`  OTP Code: ${otp}`);
            console.log('  Expires: 10 minutes');
            console.log('  Theme: AI Tech Dark Gradient');

            console.log('\n============================================================');
            console.log('🎉 Test Passed! Email service is working correctly.');
            console.log('============================================================\n');

        } else {
            console.log('❌ FAILED! Could not send OTP email');
            console.log('============================================================\n');
            console.log('⚠️ Error Details:');
            console.log(`  Error: ${result.error}`);
            console.log(`  Code: ${result.code || 'N/A'}`);
            if (result.details) {
                console.log(`  Details:`, JSON.stringify(result.details, null, 2));
            }

            console.log('\n🔧 Troubleshooting:');

            if (result.code === 'ETIMEDOUT' || result.error.includes('timeout')) {
                console.log('\n  ⚠️ CONNECTION TIMEOUT DETECTED');
                console.log('  This usually means SMTP ports are blocked.');
                console.log('\n  Solutions:');
                console.log('  1. If on Render/Heroku/Cloud → Use SendGrid:');
                console.log('     npm install @sendgrid/mail');
                console.log('     Set: USE_SENDGRID=true');
                console.log('     Set: SENDGRID_API_KEY=SG.xxxxx');
                console.log('\n  2. Check firewall settings');
                console.log('  3. Try different ports (587, 465, 25)');
                console.log('\n  📖 See: PRODUCTION_EMAIL_GUIDE.md for detailed help');
            } else if (result.error.includes('Invalid login') || result.code === 'EAUTH') {
                console.log('\n  ⚠️ AUTHENTICATION FAILED');
                console.log('\n  Solutions:');
                console.log('  1. Use Gmail App Password (not regular password)');
                console.log('  2. Generate at: https://myaccount.google.com/apppasswords');
                console.log('  3. Enable 2-Step Verification first');
                console.log('  4. Update EMAIL_PASS in .env');
            } else if (result.error.includes('API key')) {
                console.log('\n  ⚠️ SENDGRID API KEY ISSUE');
                console.log('\n  Solutions:');
                console.log('  1. Verify SENDGRID_API_KEY is set correctly');
                console.log('  2. Check key starts with "SG."');
                console.log('  3. Verify email sender in SendGrid dashboard');
            } else {
                console.log('\n  Check EMAIL_SETUP_GUIDE.md for help');
            }

            console.log('\n============================================================');
            process.exit(1);
        }

    } catch (error) {
        console.log('❌ TEST FAILED');
        console.log('============================================================\n');
        console.error('💥 Unexpected Error:', error.message);
        console.error('\nStack Trace:', error.stack);
        console.log('\n============================================================');
        process.exit(1);
    }
}

// Run test
testOTP();
