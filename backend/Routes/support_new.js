const express = require('express');
const router = express.Router();
const { sendSupportEmailToTeam, sendSupportAutoReply } = require('../utils/emailService');
const { chatWithAI } = require('../utils/gemini');

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

    // Generate AI auto-reply message
    console.log('Generating AI auto-reply...');
    const aiAutoReply = await generateAutoReplyMessage({ name, category, subject, message, priority });
    console.log('AI auto-reply generated successfully');

    // Send email to support team using new email service
    console.log('Sending email to support team...');
    const supportEmailResult = await sendSupportEmailToTeam(name, email, subject, category, priority, message);

    if (!supportEmailResult.success) {
      console.error('Failed to send support email:', supportEmailResult.error);
      throw new Error('Failed to send email to support team');
    }
    console.log('Support email sent successfully');

    // Send AI auto-reply to user using new email service
    console.log('Sending AI auto-reply to user...');
    const autoReplyResult = await sendSupportAutoReply(name, email, subject, category, priority, aiAutoReply, message);

    if (!autoReplyResult.success) {
      console.error('Failed to send auto-reply:', autoReplyResult.error);
      // Don't throw error here - support email was sent, auto-reply is nice-to-have
    } else {
      console.log('AI auto-reply sent successfully');
    }

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
