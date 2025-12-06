const { Resend } = require('resend');
const dotenv = require('dotenv');
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendOTPEmail = async (email, otp) => {
  try {
    const response = await resend.emails.send({
      from: process.env.EMAIL_SENDER || 'onboarding@resend.dev',
      to: email,
      subject: 'Your OTP for Password Reset',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden;">
            
            <!-- Header with gradient -->
            <div style="background: linear-gradient(135deg, #f97316, #dc2626, #db2777); padding: 40px 30px; text-align: center; position: relative;">
              <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="white" opacity="0.1"/><circle cx="80" cy="40" r="1" fill="white" opacity="0.1"/><circle cx="40" cy="80" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>'); opacity: 0.3;"></div>
              
              <div style="position: relative; z-index: 2;">
                <div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 15px; border-radius: 50%; margin-bottom: 20px; backdrop-filter: blur(10px);">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9 12L11 14L15 10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                  🔐 Password Reset
                </h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px; font-weight: 300;">
                  InterviewPrep AI Security
                </p>
              </div>
            </div>

            <!-- Main content -->
            <div style="padding: 40px 30px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">
                  Your Security Code
                </h2>
                <p style="color: #6b7280; margin: 0; font-size: 16px; line-height: 1.5;">
                  Use the verification code below to reset your password securely
                </p>
              </div>

              <!-- OTP Container -->
              <div style="background: linear-gradient(145deg, #f8fafc, #e2e8f0); border: 2px dashed #d1d5db; border-radius: 16px; padding: 30px; margin: 30px 0; text-align: center; position: relative; overflow: hidden;">
                <div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%); animation: pulse 3s ease-in-out infinite;"></div>
                
                <div style="position: relative; z-index: 2;">
                  <p style="color: #374151; margin: 0 0 15px 0; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">
                    Verification Code
                  </p>
                  <div style="background: linear-gradient(135deg, #f97316, #dc2626); padding: 20px; border-radius: 12px; display: inline-block; box-shadow: 0 10px 25px rgba(249,115,22,0.3); transform: perspective(1000px) rotateX(5deg);">
                    <h1 style="color: white; margin: 0; font-size: 42px; font-weight: 900; letter-spacing: 8px; text-shadow: 0 2px 4px rgba(0,0,0,0.3); font-family: 'Courier New', monospace;">
                      ${otp}
                    </h1>
                  </div>
                </div>
              </div>

              <!-- Important notice -->
              <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border-left: 4px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                  <div style="flex-shrink: 0; margin-top: 2px;">
                    ⚠️
                  </div>
                  <div>
                    <h4 style="color: #92400e; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
                      Important Security Notice
                    </h4>
                    <p style="color: #78350f; margin: 0; font-size: 14px; line-height: 1.5;">
                      This verification code expires in <strong>10 minutes</strong>. Never share this code with anyone. If you didn't request this reset, please ignore this email.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Additional help -->
              <div style="text-align: center; margin-top: 30px; padding-top: 25px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; margin: 0 0 15px 0; font-size: 14px;">
                  Need help? Contact our support team
                </p>
                <div style="display: inline-flex; gap: 15px;">
                  <a href="mailto:support@interviewprepai.com" style="color: #f97316; text-decoration: none; font-weight: 500; font-size: 14px;">
                    📧 Email Support
                  </a>
                  <span style="color: #d1d5db;">•</span>
                  <a href="#" style="color: #f97316; text-decoration: none; font-weight: 500; font-size: 14px;">
                    💬 Live Chat
                  </a>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 13px;">
                This email was sent by <strong>InterviewPrep AI</strong>
              </p>
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                © 2025 InterviewPrep AI. All rights reserved.
              </p>
            </div>
          </div>

          <!-- Floating elements for visual appeal -->
          <div style="position: absolute; top: 10%; left: 10%; width: 20px; height: 20px; background: rgba(255,255,255,0.1); border-radius: 50%; animation: float 6s ease-in-out infinite;"></div>
          <div style="position: absolute; top: 20%; right: 10%; width: 15px; height: 15px; background: rgba(255,255,255,0.1); border-radius: 50%; animation: float 4s ease-in-out infinite reverse;"></div>
          <div style="position: absolute; bottom: 20%; left: 20%; width: 25px; height: 25px; background: rgba(255,255,255,0.1); border-radius: 50%; animation: float 5s ease-in-out infinite;"></div>
        </div>

        <style>
          @keyframes pulse {
            0%, 100% { opacity: 0.6; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
        </style>
      `,
      text: `Your OTP is: ${otp}`,
    });

    if (response?.data?.id) {
      console.log('✅ OTP Email sent via Resend:', response.data.id);
      return { success: true, messageId: response.data.id };
    } else {
      console.error('⚠️ Unexpected response from Resend:', response);
      return {
        success: false,
        error: 'Failed to send email',
        details: response
      };
    }
  } catch (error) {
    console.error('❌ Resend email error:', error);
    return {
      success: false,
      error: error.message,
      details: error.toString()
    };
  }
};

exports.sendNotificationEmail = async (userEmail, title, message, action, actionUrl) => {
  try {
    const response = await resend.emails.send({
      from: process.env.EMAIL_SENDER || 'onboarding@resend.dev',
      to: userEmail,
      subject: `🔔 ${title} - InterviewPrep AI`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #f97316, #dc2626, #db2777); padding: 40px 30px; text-align: center;">
              <div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 15px; border-radius: 50%; margin-bottom: 20px; backdrop-filter: blur(10px);">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                🔔 ${title}
              </h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px; font-weight: 300;">
                InterviewPrep AI Notification
              </p>
            </div>

            <!-- Main content -->
            <div style="padding: 40px 30px;">
              <div style="background: linear-gradient(145deg, #f8fafc, #e2e8f0); border-radius: 16px; padding: 30px; margin: 20px 0;">
                <p style="color: #374151; margin: 0; font-size: 16px; line-height: 1.8;">
                  ${message}
                </p>
              </div>

              ${action && actionUrl ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${actionUrl}" style="display: inline-block; background: linear-gradient(135deg, #f97316, #dc2626); color: white; padding: 15px 40px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 10px 25px rgba(249,115,22,0.3); transition: transform 0.2s;">
                  ${action}
                </a>
              </div>
              ` : ''}

              <div style="text-align: center; margin-top: 30px; padding-top: 25px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; margin: 0 0 15px 0; font-size: 14px;">
                  Manage your notification preferences
                </p>
                <a href="${process.env.APP_URL || 'http://localhost:5173'}/settings" style="color: #f97316; text-decoration: none; font-weight: 500; font-size: 14px;">
                  ⚙️ Settings
                </a>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 13px;">
                This email was sent by <strong>InterviewPrep AI</strong>
              </p>
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                © 2025 InterviewPrep AI. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `,
      text: `${title}\n\n${message}${action ? `\n\n${action}: ${actionUrl}` : ''}`,
    });

    if (response?.data?.id) {
      console.log('✅ Notification Email sent via Resend:', response.data.id);
      return { success: true, messageId: response.data.id };
    } else {
      return { success: false, error: 'Failed to send email' };
    }
  } catch (error) {
    console.error('❌ Notification email error:', error);
    return { success: false, error: error.message };
  }
};
