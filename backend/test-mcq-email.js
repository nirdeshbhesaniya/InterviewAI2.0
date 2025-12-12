require('dotenv').config();
const { sendCustomEmail, getEmailTemplate } = require('./utils/emailService');

/**
 * Test MCQ Results Email
 * This simulates the email sent after completing an MCQ test
 */

async function testMCQResultsEmail() {
    console.log('============================================================');
    console.log('🧪 MCQ RESULTS EMAIL TEST');
    console.log('============================================================\n');

    // Sample test results data
    const userInfo = {
        name: 'Test User',
        email: process.env.EMAIL_USER || 'your-email@gmail.com' // Send to yourself for testing
    };

    const topic = 'JavaScript Fundamentals';

    const results = {
        totalQuestions: 5,
        correctAnswers: 3,
        score: 60,
        grade: 'B',
        timeSpent: 425, // 7 minutes 5 seconds
        timestamp: new Date().toISOString(),
        aiFeedback: `Great attempt! You scored 60% on JavaScript Fundamentals.

Strengths:
✅ Good understanding of basic syntax
✅ Strong grasp of array methods
✅ Clear knowledge of ES6 features

Areas for Improvement:
❌ Review async/await and Promises
❌ Practice closure concepts
❌ Study event loop mechanics

Recommendation: Focus on asynchronous JavaScript and practice more code challenges to improve your score to 80%+.`,
        detailedResults: [
            {
                questionNumber: 1,
                question: 'What is the output of `console.log(typeof null)` in JavaScript?',
                userAnswer: 'A) "object"',
                correctAnswer: 'A) "object"',
                isCorrect: true,
                explanation: 'In JavaScript, `typeof null` returns "object". This is actually a known bug in JavaScript that has existed since its creation, but it cannot be fixed due to backward compatibility concerns.'
            },
            {
                questionNumber: 2,
                question: 'Which method would you use to add an element to the end of an array?\n\nGiven: `const arr = [1, 2, 3];`',
                userAnswer: 'B) arr.unshift(4)',
                correctAnswer: 'A) arr.push(4)',
                isCorrect: false,
                explanation: '`push()` adds elements to the end of an array, while `unshift()` adds elements to the beginning. After `arr.push(4)`, the array becomes `[1, 2, 3, 4]`.'
            },
            {
                questionNumber: 3,
                question: 'What will this code output?\n\n```javascript\nconst promise = new Promise((resolve) => {\n  console.log(1);\n  resolve();\n  console.log(2);\n});\npromise.then(() => console.log(3));\nconsole.log(4);\n```',
                userAnswer: 'C) 1, 2, 4, 3',
                correctAnswer: 'C) 1, 2, 4, 3',
                isCorrect: true,
                explanation: 'The Promise executor runs synchronously, so 1 and 2 are logged first. Then 4 is logged (synchronous code). Finally, 3 is logged when the promise callback executes (asynchronous).'
            },
            {
                questionNumber: 4,
                question: 'Which ES6 feature allows you to extract values from arrays or objects into distinct variables?',
                userAnswer: 'A) Spread operator',
                correctAnswer: 'B) Destructuring',
                isCorrect: false,
                explanation: 'Destructuring allows you to extract values from arrays or objects. Example: `const [a, b] = [1, 2]` or `const {name, age} = person`. The spread operator (`...`) is used to expand arrays or objects.'
            },
            {
                questionNumber: 5,
                question: 'What does the following code return?\n\n```javascript\nfunction outer() {\n  let count = 0;\n  return function inner() {\n    return ++count;\n  };\n}\nconst counter = outer();\nconsole.log(counter());\nconsole.log(counter());\n```',
                userAnswer: 'D) 1, 2',
                correctAnswer: 'D) 1, 2',
                isCorrect: true,
                explanation: 'This demonstrates closure. The `inner` function has access to the `count` variable from its outer scope, even after `outer` has finished executing. Each call to `counter()` increments and returns the value.'
            }
        ]
    };

    console.log('📋 Test Configuration:');
    console.log(`  Student: ${userInfo.name}`);
    console.log(`  Email: ${userInfo.email}`);
    console.log(`  Topic: ${topic}`);
    console.log(`  Score: ${results.score}%`);
    console.log(`  Grade: ${results.grade}`);
    console.log(`  Questions: ${results.correctAnswers}/${results.totalQuestions} correct\n`);

    try {
        console.log('📧 Generating MCQ results email...\n');

        // Format code blocks and inline code
        const formatForEmail = (text) => {
            return text
                .replace(/```(\w+)?\n([\s\S]*?)```/g, '<div style="background: #1F2937; border-left: 4px solid #6366F1; padding: 15px; margin: 12px 0; font-family: \'Courier New\', monospace; font-size: 13px; overflow-x: auto; border-radius: 6px;"><pre style="margin: 0; white-space: pre-wrap; color: #E5E7EB;">$2</pre></div>')
                .replace(/`([^`]+)`/g, '<code style="background: #1F2937; color: #22D3EE; padding: 3px 6px; border-radius: 4px; font-family: \'Courier New\', monospace; font-size: 13px;">$1</code>')
                .replace(/\n/g, '<br>');
        };

        // Build detailed results HTML
        const detailedResultsHTML = results.detailedResults.map((result) => `
            <div style="border: 1px solid ${result.isCorrect ? '#16a34a' : '#dc2626'}; margin: 20px 0; padding: 20px; border-radius: 8px; background: ${result.isCorrect ? '#0f2419' : '#2d0f0f'};">
                <div style="margin-bottom: 15px;">
                    <p style="margin: 0 0 12px 0; font-weight: bold; font-size: 16px; color: #F9FAFB;">Q${result.questionNumber}</p>
                    <div style="margin: 10px 0; line-height: 1.8; color: #E5E7EB;">${formatForEmail(result.question)}</div>
                </div>
                
                <div style="background: #111827; padding: 15px; border-radius: 6px; margin: 15px 0; border: 1px solid #1F2937;">
                    <p style="margin: 0 0 10px 0; font-weight: 600; color: #9CA3AF;">Your Answer:</p>
                    <div style="margin: 5px 0; padding: 10px; background: #1F2937; border-radius: 4px; color: #F9FAFB; border-left: 3px solid #6366F1;">${formatForEmail(result.userAnswer)}</div>
                    
                    <p style="margin: 20px 0 10px 0; font-weight: 600; color: #9CA3AF;">Correct Answer:</p>
                    <div style="margin: 5px 0; padding: 10px; background: #1F2937; border-radius: 4px; color: #F9FAFB; border-left: 3px solid #22D3EE;">${formatForEmail(result.correctAnswer)}</div>
                </div>
                
                <p style="margin: 15px 0 10px 0; font-weight: bold; color: ${result.isCorrect ? '#4ade80' : '#f87171'}; font-size: 15px;">
                    ${result.isCorrect ? '✅ Correct' : '❌ Incorrect'}
                </p>
                
                ${result.explanation ? `
                    <div style="margin: 15px 0 0 0; padding: 15px; background: #1F2937; border-left: 4px solid #6366F1; border-radius: 6px;">
                        <p style="margin: 0 0 8px 0; font-weight: 600; color: #22D3EE;">💡 Explanation:</p>
                        <div style="color: #E5E7EB; line-height: 1.8;">${formatForEmail(result.explanation)}</div>
                    </div>
                ` : ''}
            </div>
        `).join('');

        // Main content
        const emailContent = `
            <div style="padding: 20px;">
                <h2 style="color: #F9FAFB; margin-top: 0; font-size: 24px;">Hello ${userInfo.name}! 👋</h2>
                
                <div style="background: linear-gradient(135deg, #1F2937 0%, #111827 100%); padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 5px solid #6366F1;">
                    <h3 style="color: #22D3EE; margin-top: 0; font-size: 20px;">📊 Test Summary</h3>
                    <table style="width: 100%; color: #E5E7EB; border-spacing: 0;">
                        <tr><td style="padding: 8px 0;"><strong style="color: #9CA3AF;">Topic:</strong></td><td style="padding: 8px 0;">${topic}</td></tr>
                        <tr><td style="padding: 8px 0;"><strong style="color: #9CA3AF;">Total Questions:</strong></td><td style="padding: 8px 0;">${results.totalQuestions}</td></tr>
                        <tr><td style="padding: 8px 0;"><strong style="color: #9CA3AF;">Correct Answers:</strong></td><td style="padding: 8px 0;">${results.correctAnswers}</td></tr>
                        <tr><td style="padding: 8px 0;"><strong style="color: #9CA3AF;">Score:</strong></td><td style="padding: 8px 0; font-size: 20px; font-weight: bold; color: ${results.score >= 70 ? '#4ade80' : results.score >= 50 ? '#fbbf24' : '#f87171'};">${results.score}%</td></tr>
                        <tr><td style="padding: 8px 0;"><strong style="color: #9CA3AF;">Grade:</strong></td><td style="padding: 8px 0; font-weight: bold; color: #22D3EE;">${results.grade}</td></tr>
                        <tr><td style="padding: 8px 0;"><strong style="color: #9CA3AF;">Time Taken:</strong></td><td style="padding: 8px 0;">${Math.floor(results.timeSpent / 60)}m ${results.timeSpent % 60}s</td></tr>
                        <tr><td style="padding: 8px 0;"><strong style="color: #9CA3AF;">Test Date:</strong></td><td style="padding: 8px 0;">${new Date(results.timestamp).toLocaleString()}</td></tr>
                    </table>
                </div>
                
                <div style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <h3 style="color: #FFFFFF; margin-top: 0; font-size: 18px;">🤖 AI Feedback</h3>
                    <p style="line-height: 1.8; color: #E0E7FF; white-space: pre-line; margin: 0;">${results.aiFeedback}</p>
                </div>
                
                <div style="margin: 30px 0;">
                    <h3 style="color: #F9FAFB; font-size: 22px; margin-bottom: 20px;">📝 Detailed Results</h3>
                    ${detailedResultsHTML}
                </div>
                
                <div style="text-align: center; margin-top: 40px; padding: 25px; background: linear-gradient(135deg, #1F2937 0%, #111827 100%); border-radius: 8px; border: 1px solid #374151;">
                    <p style="margin: 0 0 15px 0; color: #E5E7EB; font-size: 16px;">🚀 Want to improve your skills?</p>
                    <p style="margin: 0; color: #9CA3AF;">Visit <strong style="background: linear-gradient(135deg, #22D3EE, #6366F1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Interview AI</strong> for more practice tests!</p>
                </div>
            </div>
        `;

        // Use the email template
        const fullEmailHTML = getEmailTemplate(emailContent, {
            preheader: `Your MCQ Test Results - ${results.score}% Score`,
            title: `📊 MCQ Test Results - ${results.score}%`
        });

        console.log('📤 Sending email...\n');

        const result = await sendCustomEmail(
            userInfo.email,
            `🎯 Your MCQ Test Results - ${results.score}% Score on ${topic}`,
            fullEmailHTML,
            `MCQ Test Results\n\nTopic: ${topic}\nScore: ${results.score}%\nGrade: ${results.grade}\nCorrect: ${results.correctAnswers}/${results.totalQuestions}`
        );

        if (result.success) {
            console.log('✅ MCQ results email sent successfully!');
            console.log(`   Message ID: ${result.messageId}`);
            console.log(`   Sent to: ${userInfo.email}\n`);
        } else {
            console.log('❌ Failed to send email');
            console.log(`   Error: ${result.error}\n`);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('\nFull error:', error);
    }

    console.log('============================================================');
    console.log('Test Complete!');
    console.log('============================================================');
}

// Run the test
testMCQResultsEmail();
