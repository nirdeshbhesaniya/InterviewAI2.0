const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { chatWithAI } = require('../utils/gemini');

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Generate AI auto-reply using Gemini
async function generateAutoReplyMessage(supportRequest) {
  const { name, category, subject, message, priority } = supportRequest;

  const aiPrompt = `You are a professional customer support representative for Interview AI, an interview preparation platform. 

Generate a personalized auto-reply email response for a support request with the following details:
- Customer Name: ${name}
- Category: ${category}
- Subject: ${subject}
- Priority: ${priority}
- Customer Message: ${message}

Requirements for the response:
1. Be professional, empathetic, and helpful
2. Acknowledge their specific issue/question
3. Provide relevant helpful tips or guidance if applicable
4. Set appropriate expectations for response time based on priority
5. Keep it concise but warm
6. Include next steps if relevant
7. Don't use markdown formatting (plain text only for email)

The response should be the email body content only, starting with a greeting and ending with a professional signature.`;

  try {
    const aiResponse = await chatWithAI(aiPrompt, 'support');
    return aiResponse.replace(/[*#`_]/g, ''); // Remove markdown formatting
  } catch (error) {
    console.error('AI auto-reply generation failed:', error);
    // Fallback to default message
    return `Hello ${name},

Thank you for contacting Interview AI support! We have received your message regarding "${subject}" and appreciate you taking the time to reach out.

Our support team will review your request and get back to you soon. ${priority === 'urgent' ? 'Since this is marked as urgent, we aim to respond within 4 hours.' : priority === 'high' ? 'We aim to respond to high priority requests within 8 hours.' : 'We typically respond within 24 hours during business days.'}

In the meantime, feel free to explore our FAQ section or documentation for immediate answers to common questions.

Best regards,
The Interview AI Support Team`;
  }
}

// Contact support endpoint using Nodemailer with AI auto-reply
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, category, message, priority } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be filled'
      });
    }

    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: Email credentials not found. Please configure EMAIL_USER and EMAIL_PASS in environment variables.'
      });
    }

    console.log('Processing support request from:', email);

    // Create email transporter
    const transporter = createTransporter();

    // Generate AI auto-reply message
    console.log('Generating AI auto-reply...');
    const aiAutoReply = await generateAutoReplyMessage({ name, category, subject, message, priority });
    console.log('AI auto-reply generated successfully');

    // Email to support team
    const supportEmailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.SUPPORT_TEAM_EMAIL || process.env.EMAIL_USER,
      subject: `[${category.toUpperCase()}] [${priority.toUpperCase()}] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #f97316; padding-bottom: 10px;">
            New Support Request - Interview AI
          </h2>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #555;">Contact Information</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Category:</strong> ${category}</p>
            <p><strong>Priority:</strong> ${priority}</p>
          </div>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #555;">Subject</h3>
            <p style="background: #fff; padding: 15px; border-left: 4px solid #f97316; margin: 0;">
              ${subject}
            </p>
          </div>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #555;">Message</h3>
            <div style="background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          <div style="margin-top: 30px; padding: 15px; background: #e8f4fd; border-radius: 8px;">
            <p style="margin: 0; font-size: 12px; color: #666;">
              This message was sent from the Interview AI support form on ${new Date().toLocaleString()}.
              An AI-generated auto-reply has been sent to the customer.
            </p>
          </div>
        </div>
      `
    };

    // Auto-reply email to user with AI response
    const autoReplyOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `${subject} - Interview AI Support`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f97316, #dc2626, #db2777); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Interview AI Support</h1>
          </div>
          
          <div style="background: #fff; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #ddd;">
            <div style="color: #333; line-height: 1.6; white-space: pre-line;">
              ${aiAutoReply}
            </div>
            
            <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #f97316;">
              <h4 style="margin-top: 0; color: #333;">Your Request Details:</h4>
              <p style="margin: 5px 0;"><strong>Subject:</strong> ${subject}</p>
              <p style="margin: 5px 0;"><strong>Category:</strong> ${category}</p>
              <p style="margin: 5px 0;"><strong>Priority:</strong> ${priority}</p>
              <p style="margin: 5px 0;"><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #888; font-size: 12px;">
            <p>This response was generated with AI assistance. Our support team will follow up if needed.</p>
          </div>
        </div>
      `
    };

    console.log('Sending email to support team...');
    // Send email to support team
    await transporter.sendMail(supportEmailOptions);
    console.log('Support email sent successfully');

    console.log('Sending AI auto-reply to user...');
    // Send AI auto-reply to user
    await transporter.sendMail(autoReplyOptions);
    console.log('AI auto-reply sent successfully');

    res.json({
      success: true,
      message: 'Your support request has been submitted successfully. You should receive an AI-powered automated response shortly!'
    });

  } catch (error) {
    console.error('Support endpoint error:', error);

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit support request. Please try again or contact us directly.'
    });
  }
});
// End of main try block for /contact route
// Get support statistics (optional - for admin dashboard)
router.get('/stats', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        totalRequests: 0,
        pendingRequests: 0,
        resolvedRequests: 0,
        averageResponseTime: '2 hours',
        aiResponsesGenerated: 0
      }
    });
  } catch (error) {
    console.error('Support stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch support statistics'
    });
  }
});

// Test endpoint to verify AI functionality
router.post('/test-ai', async (req, res) => {
  try {
    const testRequest = {
      name: 'Test User',
      category: 'technical',
      subject: 'Code execution not working',
      message: 'I am having trouble with the code editor. It shows compilation errors.',
      priority: 'medium'
    };

    const aiResponse = await generateAutoReplyMessage(testRequest);

    res.json({
      success: true,
      aiResponse: aiResponse
    });
  } catch (error) {
    console.error('AI test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test AI functionality'
    });
  }
});

module.exports = router;
