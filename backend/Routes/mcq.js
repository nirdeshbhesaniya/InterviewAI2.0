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

// Generate MCQ questions using Gemini AI with uniqueness factors
async function generateMCQQuestions(topic, difficulty = 'medium', numberOfQuestions = 30) {
    // Add randomization factors to ensure unique questions every time
    const randomSeed = Math.floor(Math.random() * 100000);
    const timestamp = Date.now();
    const uniqueFactors = [
        'recent industry trends',
        'practical scenarios',
        'edge cases',
        'optimization techniques',
        'debugging challenges',
        'best practices',
        'common pitfalls',
        'advanced concepts',
        'real-world applications',
        'performance considerations'
    ];

    // Randomly select 3-4 focus areas for uniqueness
    const selectedFocusAreas = uniqueFactors
        .sort(() => Math.random() - 0.5)
        .slice(0, 3 + Math.floor(Math.random() * 2))
        .join(', ');

    const prompt = `Generate exactly ${numberOfQuestions} UNIQUE and VARIED multiple-choice questions about "${topic}" with ${difficulty} difficulty level.

UNIQUENESS REQUIREMENTS (Session ID: ${randomSeed}-${timestamp}):
- Focus areas for this session: ${selectedFocusAreas}
- Create DIVERSE question types and scenarios
- Avoid repetitive patterns or similar questions
- Include varied contexts and use cases
- Mix different subtopics within ${topic}

Format each question exactly as follows:
QUESTION_NUMBER. Question text here?
A) Option A
B) Option B  
C) Option C
D) Option D
CORRECT: [A/B/C/D]
EXPLANATION: Brief explanation of why this answer is correct.

IMPORTANT FORMATTING RULES:
- Use proper markdown code formatting for code blocks
- For inline code, use single backticks
- Keep code blocks clean and properly indented
- Avoid special characters or regex patterns that might break parsing
- Each question must be on a separate line
- Options A, B, C, D must each be on separate lines
- Use clear, readable code examples
- End code blocks cleanly without any extra characters

CONTENT REQUIREMENTS:
- Questions should cover different aspects of ${topic}
- Include at least 40% questions with code examples
- Mix of: syntax questions, output prediction, debugging, best practices
- Use realistic, practical code scenarios
- Progressive difficulty: easy → medium → hard
- Cover: fundamentals, advanced concepts, common mistakes, real-world applications
- ENSURE EACH QUESTION IS UNIQUE AND NOT REPETITIVE

Generate all ${numberOfQuestions} questions following this exact format with clean, properly formatted code blocks.`;

    try {
        const response = await chatWithAI(prompt, 'general');
        return parseMCQResponse(response, numberOfQuestions);
    } catch (error) {
        console.error('Error generating MCQ questions:', error);
        throw new Error('Failed to generate questions');
    }
}

// Parse AI response into structured MCQ format with improved code block handling
function parseMCQResponse(response, numberOfQuestions = 30) {
    const questions = [];

    // Function to clean code content and remove artifacts
    const cleanContent = (content) => {
        if (!content) return content;
        return content
            .replace(/```\?/g, '') // Remove ```? artifacts
            .replace(/\?\?\?/g, '') // Remove ??? artifacts
            .replace(/```(\w+)?\s*\n([\s\S]*?)\n\s*```/g, (match, lang, code) => {
                // Clean up code blocks
                const cleanCode = code.trim();
                return `\`\`\`${lang || ''}\n${cleanCode}\n\`\`\``;
            })
            .replace(/\n\s*\n\s*\n/g, '\n\n') // Normalize excessive line breaks
            .trim();
    };

    // Split by question numbers but preserve code blocks
    const questionBlocks = response.split(/(?=^\d+\.\s)/m).filter(block => block.trim());

    questionBlocks.forEach((block, index) => {
        if (!block.trim()) return;

        try {
            // Extract question text (everything from question number to first option)
            const questionMatch = block.match(/^\d+\.\s([\s\S]*?)(?=^[A-D]\))/m);
            if (!questionMatch) return;

            let questionText = cleanContent(questionMatch[1].trim());

            if (!questionText.endsWith('?')) {
                questionText += '?';
            }

            const optionsArray = [];
            let correctAnswer = '';
            let explanation = '';

            // Extract options with better pattern matching
            const lines = block.split('\n');
            let currentOption = '';
            let optionLetter = '';
            let inOption = false;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();

                // Check if this is an option line
                const optionStart = line.match(/^([A-D])\)\s*(.*)$/);
                if (optionStart) {
                    // Save previous option if exists
                    if (inOption && currentOption && optionLetter) {
                        optionsArray[optionLetter.charCodeAt(0) - 65] = cleanContent(currentOption.trim());
                    }

                    // Start new option
                    optionLetter = optionStart[1];
                    currentOption = optionStart[2];
                    inOption = true;
                } else if (inOption && !line.startsWith('CORRECT:') && !line.startsWith('EXPLANATION:')) {
                    // Continue current option (for multi-line options with code)
                    currentOption += '\n' + line;
                } else if (line.startsWith('CORRECT:')) {
                    // Save last option before processing correct answer
                    if (inOption && currentOption && optionLetter) {
                        optionsArray[optionLetter.charCodeAt(0) - 65] = cleanContent(currentOption.trim());
                    }
                    inOption = false;

                    // Extract correct answer
                    const correctMatch = line.match(/CORRECT:\s*\[?([A-D])\]?/);
                    if (correctMatch) {
                        correctAnswer = correctMatch[1];
                    }
                } else if (line.startsWith('EXPLANATION:')) {
                    explanation = line.substring(12).trim();
                    // Continue collecting explanation if it spans multiple lines
                    for (let j = i + 1; j < lines.length; j++) {
                        const nextLine = lines[j].trim();
                        if (nextLine && !nextLine.match(/^\d+\./)) {
                            explanation += ' ' + nextLine;
                        } else {
                            break;
                        }
                    }
                    explanation = cleanContent(explanation);
                    break;
                }
            }

            // Save the last option if we ended while processing it
            if (inOption && currentOption && optionLetter) {
                optionsArray[optionLetter.charCodeAt(0) - 65] = currentOption.trim();
            }

            // Filter out empty options and ensure we have 4 options
            const validOptions = optionsArray.filter(opt => opt && opt.trim());

            if (validOptions.length === 4 && correctAnswer && questionText) {
                // Convert correct answer letter to array index
                const correctIndex = ['A', 'B', 'C', 'D'].indexOf(correctAnswer);

                questions.push({
                    id: questions.length + 1,
                    question: questionText,
                    options: validOptions,
                    correctAnswer: correctIndex,
                    explanation: explanation || 'No explanation provided.'
                });
            }
        } catch (error) {
            console.error('Error parsing question block:', error);
            // Skip this block and continue with next
        }
    });

    return questions.slice(0, numberOfQuestions);
}

// Add additional uniqueness by shuffling options within each question
function addQuestionVariations(questions) {
    return questions.map(question => {
        // Create a mapping of original options to shuffled positions
        const optionIndices = [0, 1, 2, 3];
        const shuffledIndices = [...optionIndices].sort(() => Math.random() - 0.5);

        // Create new shuffled options array
        const shuffledOptions = shuffledIndices.map(index => question.options[index]);

        // Find the new position of the correct answer
        const newCorrectAnswerIndex = shuffledIndices.indexOf(question.correctAnswer);

        return {
            ...question,
            options: shuffledOptions,
            correctAnswer: newCorrectAnswerIndex
        };
    });
}// Evaluate MCQ answers using AI
async function evaluateAnswers(questions, userAnswers, userInfo, timeSpent = 0) {
    const { name, email } = userInfo;

    let correctCount = 0;
    let totalQuestions = questions.length;
    const detailedResults = [];

    questions.forEach((question, index) => {
        const userAnswer = userAnswers[index]; // Use array index
        const isCorrect = userAnswer === question.correctAnswer; // Compare indexes directly

        if (isCorrect) correctCount++;

        detailedResults.push({
            questionNumber: index + 1,
            question: question.question,
            userAnswer: userAnswer !== undefined ? question.options[userAnswer] : 'Not Answered',
            correctAnswer: question.options[question.correctAnswer],
            isCorrect: isCorrect,
            explanation: question.explanation,
            options: question.options
        });
    });

    const score = Math.round((correctCount / totalQuestions) * 100);
    const grade = getGrade(score);

    // Generate AI feedback
    const feedbackPrompt = `A user named ${name} has completed a ${totalQuestions}-question MCQ test and scored ${score}% (${correctCount}/${totalQuestions} correct). 

Provide personalized feedback including:
1. Overall performance assessment
2. Strengths and areas for improvement
3. Study recommendations
4. Motivational message
5. Next steps for learning

Keep it encouraging and constructive.`;

    let aiFeedback = '';
    try {
        aiFeedback = await chatWithAI(feedbackPrompt, 'general');
        aiFeedback = aiFeedback.replace(/[*#`_]/g, ''); // Remove markdown
    } catch (error) {
        aiFeedback = `Congratulations ${name}! You scored ${score}% on the test. Keep practicing to improve your knowledge.`;
    }

    return {
        totalQuestions,
        correctAnswers: correctCount,
        score,
        grade,
        aiFeedback,
        detailedResults,
        timeSpent: timeSpent,
        timestamp: new Date().toISOString()
    };
}

// Get grade based on score
function getGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
}

// Send results via email
async function sendResultsEmail(userInfo, results, topic) {
    const { name, email } = userInfo;
    const transporter = createTransporter();

    const emailHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #f97316, #dc2626, #db2777); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Interview AI - MCQ Test Results</h1>
      </div>
      
      <div style="background: #fff; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #ddd;">
        <h2 style="color: #333; margin-top: 0;">Hello ${name}!</h2>
        
        <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #f97316;">
          <h3 style="color: #333; margin-top: 0;">Test Summary</h3>
          <p><strong>Topic:</strong> ${topic}</p>
          <p><strong>Total Questions:</strong> ${results.totalQuestions}</p>
          <p><strong>Correct Answers:</strong> ${results.correctAnswers}</p>
          <p><strong>Score:</strong> ${results.score}%</p>
          <p><strong>Grade:</strong> ${results.grade}</p>
          <p><strong>Time Taken:</strong> ${Math.floor(results.timeSpent / 60)} minutes ${results.timeSpent % 60} seconds</p>
          <p><strong>Test Date:</strong> ${new Date(results.timestamp).toLocaleString()}</p>
        </div>
        
        <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e40af; margin-top: 0;">AI Feedback</h3>
          <p style="line-height: 1.6; color: #555; white-space: pre-line;">${results.aiFeedback}</p>
        </div>
        
        <div style="margin: 30px 0;">
          <h3 style="color: #333;">Detailed Results</h3>
          ${results.detailedResults.map((result, index) => {
        // Function to format text with basic code highlighting for email
        const formatForEmail = (text) => {
            return text
                .replace(/```(\w+)?\n([\s\S]*?)```/g, '<div style="background: #f8f9fa; border-left: 4px solid #007bff; padding: 10px; margin: 10px 0; font-family: monospace; font-size: 14px; overflow-x: auto; border-radius: 4px;"><pre style="margin: 0; white-space: pre-wrap;">$2</pre></div>')
                .replace(/`([^`]+)`/g, '<code style="background: #f1f3f4; padding: 2px 4px; border-radius: 3px; font-family: monospace; font-size: 13px;">$1</code>')
                .replace(/\n/g, '<br>');
        };

        return `
            <div style="border: 1px solid #ddd; margin: 15px 0; padding: 20px; border-radius: 8px; ${result.isCorrect ? 'background: #f0f9f0; border-color: #4ade80;' : 'background: #fef2f2; border-color: #f87171;'}">
              <div style="margin-bottom: 15px;">
                <p style="margin: 0 0 10px 0; font-weight: bold; font-size: 16px;">Q${result.questionNumber}: </p>
                <div style="margin: 10px 0; line-height: 1.6;">${formatForEmail(result.question)}</div>
              </div>
              
              <div style="background: white; padding: 15px; border-radius: 6px; margin: 10px 0;">
                <p style="margin: 0 0 8px 0;"><strong style="color: #666;">Your Answer:</strong></p>
                <div style="margin: 5px 0; padding: 8px; background: #f8f9fa; border-radius: 4px;">${formatForEmail(result.userAnswer)}</div>
                
                <p style="margin: 15px 0 8px 0;"><strong style="color: #666;">Correct Answer:</strong></p>
                <div style="margin: 5px 0; padding: 8px; background: #e8f5e8; border-radius: 4px;">${formatForEmail(result.correctAnswer)}</div>
              </div>
              
              <p style="margin: 15px 0 10px 0; font-weight: bold; color: ${result.isCorrect ? '#16a34a' : '#dc2626'}; font-size: 14px;">
                <strong>Status:</strong> ${result.isCorrect ? '✅ Correct' : '❌ Incorrect'}
              </p>
              
              ${result.explanation ? `
                <div style="margin: 15px 0 0 0; padding: 12px; background: #f0f7ff; border-left: 4px solid #2563eb; border-radius: 4px;">
                  <p style="margin: 0 0 5px 0; font-weight: bold; color: #1e40af;">Explanation:</p>
                  <div style="color: #374151; line-height: 1.6;">${formatForEmail(result.explanation)}</div>
                </div>
              ` : ''}
            </div>`;
    }).join('')}
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
          <p style="margin: 0; color: #555;">Want to improve your skills? Visit <strong>Interview AI</strong> for more practice tests and interview preparation resources!</p>
        </div>
      </div>
    </div>
  `;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Your MCQ Test Results - ${results.score}% Score`,
        html: emailHTML
    };

    await transporter.sendMail(mailOptions);
}

// Generate MCQ test with enhanced uniqueness
router.post('/generate', async (req, res) => {
    try {
        const { topic, difficulty = 'medium', numberOfQuestions = 30, userEmail } = req.body;

        if (!topic) {
            return res.status(400).json({
                success: false,
                message: 'Topic is required'
            });
        }

        // Add user-specific and time-based uniqueness factors
        const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const userHash = userEmail ? userEmail.split('@')[0] : 'anonymous';

        console.log(`Generating UNIQUE MCQ test for topic: ${topic} with ${numberOfQuestions} questions (Session: ${sessionId})`);

        // Generate questions with uniqueness factors
        const questions = await generateMCQQuestions(topic, difficulty, numberOfQuestions);

        if (questions.length < numberOfQuestions) {
            return res.status(500).json({
                success: false,
                message: 'Failed to generate enough questions. Please try again.'
            });
        }

        // Add variations by shuffling options within each question
        const variatedQuestions = addQuestionVariations(questions);

        // Shuffle questions to add another layer of uniqueness
        const shuffledQuestions = variatedQuestions.sort(() => Math.random() - 0.5);

        // Remove correct answers and explanations from response for frontend
        const questionsForTest = shuffledQuestions.map(({ correctAnswer, explanation, ...question }) => question);

        res.json({
            success: true,
            data: {
                questions: questionsForTest,
                questionsWithAnswers: shuffledQuestions, // Include questions with correct answers for evaluation
                topic,
                difficulty,
                totalQuestions: shuffledQuestions.length,
                timeLimit: 45, // 45 minutes
                sessionId: sessionId // Track session for uniqueness
            }
        });

    } catch (error) {
        console.error('Error generating MCQ test:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate MCQ test. Please try again.'
        });
    }
});

// Submit MCQ test answers
router.post('/submit', async (req, res) => {
    try {
        const { topic, answers, userInfo, numberOfQuestions = 30, timeSpent = 0, questions } = req.body;

        if (!topic || !answers || !userInfo || !userInfo.name || !userInfo.email) {
            return res.status(400).json({
                success: false,
                message: 'Topic, answers, and user information are required'
            });
        }

        console.log(`Evaluating MCQ test for: ${userInfo.email}`);

        let questionsWithAnswers;

        // Use provided questions if available, otherwise regenerate (fallback for old tests)
        if (questions && Array.isArray(questions) && questions.length > 0) {
            questionsWithAnswers = questions;
            console.log(`Using provided questions for evaluation (${questions.length} questions)`);
        } else {
            console.log('No questions provided, regenerating questions for evaluation (this may cause inconsistency)');
            questionsWithAnswers = await generateMCQQuestions(topic, 'medium', numberOfQuestions);
        }

        // Evaluate answers
        const results = await evaluateAnswers(questionsWithAnswers, answers, userInfo, timeSpent);

        // Send results email
        try {
            await sendResultsEmail(userInfo, results, topic);
            console.log(`Results email sent to: ${userInfo.email}`);
        } catch (emailError) {
            console.error('Failed to send results email:', emailError);
            // Don't fail the request if email fails
        }

        res.json({
            success: true,
            data: {
                results: {
                    totalQuestions: results.totalQuestions,
                    correctAnswers: results.correctAnswers,
                    score: results.score,
                    grade: results.grade,
                    aiFeedback: results.aiFeedback,
                    timeSpent: results.timeSpent
                },
                message: 'Test submitted successfully! Results have been sent to your email.'
            }
        });

    } catch (error) {
        console.error('Error submitting MCQ test:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to evaluate test. Please try again.'
        });
    }
});

// Get available topics
router.get('/topics', (req, res) => {
    const topics = [
        'JavaScript Fundamentals',
        'React Development',
        'Node.js Backend',
        'Python Programming',
        'Data Structures',
        'Algorithms',
        'Database Management',
        'System Design',
        'Web Development',
        'Machine Learning',
        'Cybersecurity',
        'DevOps',
        'Cloud Computing',
        'Mobile Development',
        'Software Engineering'
    ];

    res.json({
        success: true,
        data: { topics }
    });
});

module.exports = router;
