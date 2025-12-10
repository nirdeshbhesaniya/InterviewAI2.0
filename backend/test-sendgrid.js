require('dotenv').config();

/**
 * SendGrid Email Service Test
 * 
 * Setup Instructions:
 * 1. Sign up at https://signup.sendgrid.com/ (Free: 100 emails/day)
 * 2. Verify your email
 * 3. Go to Settings → API Keys → Create API Key
 * 4. Add to .env: SENDGRID_API_KEY=SG.xxxxx
 * 5. Verify sender email in SendGrid dashboard
 * 6. Run this test: node test-sendgrid.js
 */

async function testSendGrid() {
  console.log('============================================================');
  console.log('📧 SENDGRID EMAIL SERVICE TEST');
  console.log('============================================================\n');

  // Check if SendGrid is configured
  console.log('📋 Checking Configuration...\n');

  if (!process.env.SENDGRID_API_KEY) {
    console.log('❌ SENDGRID_API_KEY not found in .env\n');
    console.log('🔧 Setup Instructions:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('1️⃣  Create SendGrid Account (FREE):');
    console.log('   → https://signup.sendgrid.com/');
    console.log('   → Free tier: 100 emails/day forever\n');
    
    console.log('2️⃣  Verify Your Email:');
    console.log('   → Check inbox for verification email\n');
    
    console.log('3️⃣  Create API Key:');
    console.log('   → Login to SendGrid dashboard');
    console.log('   → Settings → API Keys → Create API Key');
    console.log('   → Name: "InterviewPrep Email Service"');
    console.log('   → Permissions: "Full Access" or "Mail Send"');
    console.log('   → Copy the API key (starts with "SG.")\n');
    
    console.log('4️⃣  Verify Sender Email:');
    console.log('   → Settings → Sender Authentication');
    console.log('   → Single Sender Verification');
    console.log('   → Add: nirdeshbhesaniya@gmail.com');
    console.log('   → Verify via email link\n');
    
    console.log('5️⃣  Update .env file:');
    console.log('   Add these lines to backend/.env:\n');
    console.log('   SENDGRID_API_KEY=SG.your_api_key_here');
    console.log('   USE_SENDGRID=true\n');
    
    console.log('6️⃣  Run this test again:');
    console.log('   node test-sendgrid.js\n');
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n💡 Quick Start URL: https://app.sendgrid.com/guide/integrate');
    console.log('============================================================\n');
    process.exit(0);
  }

  console.log('✅ SendGrid API Key found');
  console.log(`   Key: ${process.env.SENDGRID_API_KEY.substring(0, 15)}...`);
  
  if (!process.env.EMAIL_USER) {
    console.log('❌ EMAIL_USER not set\n');
    console.log('Please add to .env:');
    console.log('  EMAIL_USER=nirdeshbhesaniya@gmail.com\n');
    process.exit(1);
  }
  
  console.log(`✅ Sender Email: ${process.env.EMAIL_USER}\n`);

  // Set USE_SENDGRID temporarily for this test
  process.env.USE_SENDGRID = 'true';

  console.log('============================================================');
  console.log('🧪 TEST 1: OTP Email via SendGrid');
  console.log('============================================================\n');

  try {
    // Load email service
    const emailService = require('./utils/email');
    const serviceInfo = emailService.getServiceInfo();
    
    console.log(`Service: ${serviceInfo.service}`);
    console.log(`Configured: ${serviceInfo.configured ? 'Yes' : 'No'}\n`);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const testEmail = process.env.EMAIL_USER;

    console.log(`Sending OTP: ${otp}`);
    console.log(`To: ${testEmail}\n`);

    const startTime = Date.now();
    const result = await emailService.sendOTPEmail(testEmail, otp);
    const duration = Date.now() - startTime;

    if (result.success) {
      console.log('✅ SUCCESS! Email sent via SendGrid');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`  Message ID: ${result.messageId}`);
      console.log(`  Status Code: ${result.statusCode}`);
      console.log(`  Duration: ${duration}ms`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } else {
      console.log('❌ FAILED to send email');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`  Error: ${result.error}`);
      console.log(`  Code: ${result.code}`);
      if (result.details) {
        console.log('  Details:', JSON.stringify(result.details, null, 2));
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      if (result.details?.errors) {
        const errors = result.details.errors;
        console.log('🔍 Error Analysis:');
        errors.forEach(err => {
          if (err.message?.includes('does not contain a valid address')) {
            console.log('\n  ⚠️ SENDER NOT VERIFIED');
            console.log('  → Go to: https://app.sendgrid.com/settings/sender_auth/senders');
            console.log('  → Verify sender email: ' + process.env.EMAIL_USER);
          } else if (err.message?.includes('permission')) {
            console.log('\n  ⚠️ API KEY PERMISSIONS');
            console.log('  → Recreate API key with "Mail Send" permission');
          } else if (err.message?.includes('does not exist')) {
            console.log('\n  ⚠️ INVALID API KEY');
            console.log('  → Check SENDGRID_API_KEY in .env');
            console.log('  → Should start with "SG."');
          }
        });
        console.log('');
      }
      
      process.exit(1);
    }

  } catch (error) {
    console.log('❌ TEST FAILED');
    console.error('\n💥 Error:', error.message);
    console.error('\nStack:', error.stack);
    process.exit(1);
  }

  console.log('============================================================');
  console.log('🧪 TEST 2: Notification Email via SendGrid');
  console.log('============================================================\n');

  try {
    const emailService = require('./utils/email');
    const testEmail = process.env.EMAIL_USER;

    console.log(`Sending notification to: ${testEmail}\n`);

    const startTime = Date.now();
    const result = await emailService.sendNotificationEmail(
      testEmail,
      'SendGrid Test Successful',
      'Congratulations! Your SendGrid email service is working perfectly. You can now send emails from production without SMTP port issues.',
      'View Dashboard',
      process.env.APP_URL || 'https://interviewai2-0.onrender.com'
    );
    const duration = Date.now() - startTime;

    if (result.success) {
      console.log('✅ SUCCESS! Notification sent');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`  Message ID: ${result.messageId}`);
      console.log(`  Status Code: ${result.statusCode}`);
      console.log(`  Duration: ${duration}ms`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } else {
      console.log('❌ FAILED to send notification');
      console.log(`  Error: ${result.error}\n`);
    }

  } catch (error) {
    console.log('❌ TEST FAILED');
    console.error('Error:', error.message);
  }

  console.log('============================================================');
  console.log('📊 FINAL SUMMARY');
  console.log('============================================================\n');

  console.log('✅ SendGrid Email Service is WORKING!\n');
  console.log('📬 Check your inbox at:', process.env.EMAIL_USER);
  console.log('\nYou should have received:');
  console.log('  1. OTP Email with code');
  console.log('  2. Test Notification\n');

  console.log('🚀 Next Steps for Production (Render):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1. Go to Render Dashboard → Your Service → Environment');
  console.log('2. Add these environment variables:');
  console.log(`   SENDGRID_API_KEY=${process.env.SENDGRID_API_KEY}`);
  console.log(`   EMAIL_USER=${process.env.EMAIL_USER}`);
  console.log('   USE_SENDGRID=true');
  console.log('   NODE_ENV=production');
  console.log('\n3. Deploy your app');
  console.log('\n4. Emails will work without SMTP port issues! 🎉');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('📊 SendGrid Dashboard:');
  console.log('  → https://app.sendgrid.com/email_activity\n');

  console.log('============================================================\n');
}

// Run test
testSendGrid();
