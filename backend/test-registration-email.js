/**
 * Email Configuration Test Script
 * Run this to verify your email service is working properly
 */

require('dotenv').config();
const { sendRegistrationOTPEmail } = require('./utils/emailService');

const testEmail = async () => {
    console.log('🔍 Testing Email Configuration...\n');

    // Check environment variables
    console.log('Environment Variables:');
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Not set');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Not set');
    console.log('SMTP_HOST:', process.env.SMTP_HOST || 'Using Gmail service');
    console.log('SMTP_PORT:', process.env.SMTP_PORT || '465 (default)');
    console.log('\n');

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('❌ Email credentials not configured!');
        console.log('\n📝 Please set the following environment variables:');
        console.log('  EMAIL_USER=your-email@gmail.com');
        console.log('  EMAIL_PASS=your-app-password');
        console.log('\n💡 For Gmail:');
        console.log('  1. Go to https://myaccount.google.com/apppasswords');
        console.log('  2. Generate an app password');
        console.log('  3. Use that password in EMAIL_PASS\n');
        process.exit(1);
    }

    // Test sending email
    const testEmailAddress = process.env.TEST_EMAIL || process.env.EMAIL_USER;
    const testOTP = '1234';
    const testName = 'Test User';

    console.log(`📧 Sending test registration OTP to: ${testEmailAddress}\n`);

    try {
        const result = await sendRegistrationOTPEmail(testEmailAddress, testOTP, testName);

        if (result.success) {
            console.log('\n✅ SUCCESS! Email sent successfully!');
            console.log('Message ID:', result.messageId);
            console.log('\n🎉 Your email service is working correctly!');
            console.log('OTP:', testOTP);
        } else {
            console.log('\n❌ FAILED! Email could not be sent');
            console.log('Error:', result.error);
            console.log('Details:', JSON.stringify(result.details, null, 2));

            console.log('\n🔧 Troubleshooting Tips:');
            console.log('  1. Check if EMAIL_USER and EMAIL_PASS are correct');
            console.log('  2. For Gmail, ensure you\'re using an App Password, not your regular password');
            console.log('  3. Enable "Less secure app access" or use App Password');
            console.log('  4. Check your internet connection');
            console.log('  5. Verify firewall settings allow SMTP connections\n');
        }
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error('Stack:', error.stack);
    }

    process.exit(0);
};

testEmail();
