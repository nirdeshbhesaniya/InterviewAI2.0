require('dotenv').config();
const { sendWelcomeEmail, sendCustomEmail, getEmailTemplate } = require('./utils/emailService');

// TEST CONFIGURATION
const TEST_EMAIL = 'nirdeshbhesaniya@gmail.com'; // Using the email from previous context (or I should ask? I'll use the one from .env if possible, or fallback)
// Ideally, I should read EMAIL_USER from .env or just use a hardcoded one if I'm sure.
// The user previously used 'nirdeshbhesaniya@gmail.com' in other scripts.

const USER_NAME = 'Nirdesh Bhesaniya';

async function testWelcomeEmail() {
    console.log('Testing Welcome Email...');
    try {
        await sendWelcomeEmail(TEST_EMAIL, USER_NAME);
        console.log('✅ Welcome Email Sent!');
    } catch (error) {
        console.error('❌ Welcome Email Failed:', error);
    }
}

async function testMCQEmail() {
    console.log('\nTesting MCQ Results Email...');
    try {
        // Mock Data
        const userInfo = { name: USER_NAME, email: TEST_EMAIL };
        const topic = 'JavaScript Fundamentals';
        const results = {
            score: 85,
            grade: 'Excellent',
            correctAnswers: 17,
            totalQuestions: 20,
            timeSpent: 345,
            timestamp: new Date(),
            aiFeedback: "You have a strong command of JavaScript fundamentals! Your understanding of closures and async programming is impressive. To improve further, review ES6+ features like Generators and WeakMaps.",
            detailedResults: [
                {
                    questionNumber: 1,
                    question: "What is the output of `console.log(typeof null)`?",
                    userAnswer: "`'object'`",
                    correctAnswer: "`'object'`",
                    isCorrect: true,
                    explanation: "In JavaScript, `typeof null` is a historical bug that returns `'object'`."
                },
                {
                    questionNumber: 2,
                    question: "Which keyword is used to declare a block-scoped variable?",
                    userAnswer: "`var`",
                    correctAnswer: "`let` or `const`",
                    isCorrect: false,
                    explanation: "`var` is function-scoped. `let` and `const` are block-scoped."
                }
            ]
        };

        // --- Logic copied from mcq.js ---
        const formatForEmail = (text) => {
            return text
                .replace(/```(\w+)?\n([\s\S]*?)```/g, '<div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 6px; padding: 12px; margin: 10px 0; font-family: \'Courier New\', monospace; font-size: 13px; color: #1F2937; overflow-x: auto;"><pre style="margin: 0; white-space: pre-wrap;">$2</pre></div>')
                .replace(/`([^`]+)`/g, '<code style="background: #E5E7EB; color: #EF4444; padding: 2px 6px; border-radius: 4px; font-family: \'Courier New\', monospace; font-size: 13px;">$1</code>')
                .replace(/\n/g, '<br>');
        };

        const detailedResultsHTML = results.detailedResults.map((result, index) => `
            <div style="border: 1px solid ${result.isCorrect ? '#D1FAE5' : '#FECACA'}; margin: 20px 0; padding: 20px; border-radius: 8px; background: ${result.isCorrect ? '#ECFDF5' : '#FEF2F2'};">
                <div style="margin-bottom: 15px;">
                    <p style="margin: 0 0 12px 0; font-weight: bold; font-size: 16px; color: #111827;">Q${result.questionNumber}</p>
                    <div style="margin: 10px 0; line-height: 1.6; color: #374151;">${formatForEmail(result.question)}</div>
                </div>
                
                <div style="background: #FFFFFF; padding: 15px; border-radius: 6px; margin: 15px 0; border: 1px solid #E5E7EB;">
                    <p style="margin: 0 0 10px 0; font-weight: 600; color: #6B7280; font-size: 13px; text-transform: uppercase;">Your Answer:</p>
                    <div style="margin: 5px 0; padding: 10px; background: #F9FAFB; border-radius: 4px; color: #1F2937; border-left: 3px solid ${result.isCorrect ? '#10B981' : '#6366F1'};">${formatForEmail(result.userAnswer)}</div>
                    
                    <p style="margin: 20px 0 10px 0; font-weight: 600; color: #6B7280; font-size: 13px; text-transform: uppercase;">Correct Answer:</p>
                    <div style="margin: 5px 0; padding: 10px; background: #F9FAFB; border-radius: 4px; color: #1F2937; border-left: 3px solid #10B981;">${formatForEmail(result.correctAnswer)}</div>
                </div>
                
                <p style="margin: 15px 0 10px 0; font-weight: bold; color: ${result.isCorrect ? '#059669' : '#DC2626'}; font-size: 15px;">
                    ${result.isCorrect ? '✅ Correct' : '❌ Incorrect'}
                </p>
                
                ${result.explanation ? `
                    <div style="margin: 15px 0 0 0; padding: 15px; background: #EFF6FF; border-left: 4px solid #3B82F6; border-radius: 6px;">
                        <p style="margin: 0 0 8px 0; font-weight: 600; color: #1E40AF;">💡 Explanation:</p>
                        <div style="color: #1E3A8A; line-height: 1.6; font-size: 14px;">${formatForEmail(result.explanation)}</div>
                    </div>
                ` : ''}
            </div>
        `).join('');

        const emailContent = `
            <div>
                <h2 style="color: #111827; margin-top: 0; font-size: 24px;">Hello ${userInfo.name}! 👋</h2>
                
                <div style="background: #F9FAFB; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 5px solid #3B82F6; border: 1px solid #E5E7EB;">
                    <h3 style="color: #111827; margin-top: 0; font-size: 20px;">📊 Test Summary</h3>
                    <table style="width: 100%; color: #374151; border-spacing: 0;">
                        <tr><td style="padding: 8px 0; border-bottom: 1px solid #F3F4F6;"><strong style="color: #6B7280;">Topic:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #F3F4F6;">${topic}</td></tr>
                        <tr><td style="padding: 8px 0; border-bottom: 1px solid #F3F4F6;"><strong style="color: #6B7280;">Total Questions:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #F3F4F6;">${results.totalQuestions}</td></tr>
                        <tr><td style="padding: 8px 0; border-bottom: 1px solid #F3F4F6;"><strong style="color: #6B7280;">Correct Answers:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #F3F4F6;">${results.correctAnswers}</td></tr>
                        <tr><td style="padding: 8px 0; border-bottom: 1px solid #F3F4F6;"><strong style="color: #6B7280;">Score:</strong></td><td style="padding: 8px 0; font-size: 20px; font-weight: bold; color: ${results.score >= 70 ? '#059669' : results.score >= 50 ? '#D97706' : '#DC2626'}; border-bottom: 1px solid #F3F4F6;">${results.score}%</td></tr>
                        <tr><td style="padding: 8px 0; border-bottom: 1px solid #F3F4F6;"><strong style="color: #6B7280;">Grade:</strong></td><td style="padding: 8px 0; font-weight: bold; color: #111827; border-bottom: 1px solid #F3F4F6;">${results.grade}</td></tr>
                        <tr><td style="padding: 8px 0; border-bottom: 1px solid #F3F4F6;"><strong style="color: #6B7280;">Time Taken:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #F3F4F6;">${Math.floor(results.timeSpent / 60)}m ${results.timeSpent % 60}s</td></tr>
                        <tr><td style="padding: 8px 0;"><strong style="color: #6B7280;">Test Date:</strong></td><td style="padding: 8px 0;">${new Date(results.timestamp).toLocaleString()}</td></tr>
                    </table>
                </div>
                
                <div style="background: #EFF6FF; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #BFDBFE;">
                    <h3 style="color: #1E40AF; margin-top: 0; font-size: 18px;">🤖 AI Feedback</h3>
                    <p style="line-height: 1.6; color: #1E3A8A; white-space: pre-line; margin: 0;">${results.aiFeedback}</p>
                </div>
                
                <div style="margin: 30px 0;">
                    <h3 style="color: #111827; font-size: 22px; margin-bottom: 20px;">📝 Detailed Results</h3>
                    ${detailedResultsHTML}
                </div>
                
                <div style="text-align: center; margin-top: 40px; padding: 25px; background: #F9FAFB; border-radius: 8px; border: 1px solid #E5E7EB;">
                    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px;">🚀 Want to improve your skills?</p>
                    <p style="margin: 0; color: #6B7280;">Visit <a href="https://interviewai.tech" style="color: #2563EB; font-weight: bold; text-decoration: none;">Interview AI</a> for more practice tests!</p>
                </div>
            </div>
        `;

        const fullEmailHTML = getEmailTemplate(emailContent, {
            preheader: `Your MCQ Test Results - ${results.score}% Score`,
            title: `📊 MCQ Test Results - ${results.score}%`
        });

        await sendCustomEmail(
            TEST_EMAIL,
            `🎯 Test Result - ${topic}`,
            fullEmailHTML,
            `MCQ Results for ${topic}: ${results.score}%`
        );
        console.log('✅ MCQ Results Email Sent!');
    } catch (error) {
        console.error('❌ MCQ Email Failed:', error);
    }
}

async function runTests() {
    console.log('--- STARTING EMAIL TESTS ---');
    console.log(`To: ${TEST_EMAIL}`);
    console.log(`Mode: Professional Light Theme ☀️`);
    console.log(`Logo URL assumed: https://interviewai.tech/images/logo.png`);

    await testWelcomeEmail();
    await testMCQEmail();

    console.log('--- TESTS COMPLETED ---');
}

runTests();
