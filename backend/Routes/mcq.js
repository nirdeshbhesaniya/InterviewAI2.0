const express = require('express');
const router = express.Router();
const { chatWithAI } = require('../utils/gemini');
const { sendCustomEmail, getEmailTemplate } = require('../utils/emailService');
const MCQTest = require('../models/MCQTest');
const PracticeTest = require('../models/PracticeTest');
const PracticeTestResult = require('../models/PracticeTestResult');
const User = require('../models/User');
const mongoose = require('mongoose');
const { generateMCQBatch, shuffleQuestionOptions } = require('../utils/mcq-optimizer');
const { getFromCache, addToCache, getCacheStats } = require('../utils/mcq-cache');
const { checkFeatureEnabled } = require('../middlewares/featureAuth');
const { logAIUsage } = require('../utils/aiLogger');

// Track recent submissions to prevent duplicates (userId -> timestamp)
const recentSubmissions = new Map();
const SUBMISSION_COOLDOWN = 5000; // 5 seconds cooldown

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
            codeSnippet: question.codeSnippet,
            userAnswer: userAnswer !== undefined ? question.options[userAnswer] : 'Not Answered',
            correctAnswer: question.options[question.correctAnswer],
            isCorrect: isCorrect,
            explanation: question.explanation,
            options: question.options
        });
    });

    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 100;
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

    // Help format text
    const formatForEmail = (text) => {
        return text
            .replace(/```(\w+)?\n([\s\S]*?)```/g, '<div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 6px; padding: 12px; margin: 10px 0; font-family: \'Courier New\', monospace; font-size: 13px; color: #1F2937; overflow-x: auto;"><pre style="margin: 0; white-space: pre-wrap;">$2</pre></div>')
            .replace(/`([^`]+)`/g, '<code style="background: #E5E7EB; color: #EF4444; padding: 2px 6px; border-radius: 4px; font-family: \'Courier New\', monospace; font-size: 13px;">$1</code>')
            .replace(/\n/g, '<br>');
    };

    // Build detailed results HTML
    const detailedResultsHTML = results.detailedResults.map((result, index) => `
        <div style="border: 1px solid ${result.isCorrect ? '#DCFCE7' : '#FEE2E2'}; margin: 20px 0; padding: 20px; border-radius: 12px; background: ${result.isCorrect ? '#F0FDF4' : '#FEF2F2'};">
            <div style="margin-bottom: 15px;">
                <p style="margin: 0 0 12px 0; font-weight: bold; font-size: 16px; color: #0F172A;">Question ${result.questionNumber}</p>
                <div style="margin: 10px 0; line-height: 1.6; color: #334155;">${formatForEmail(result.question)}</div>
                ${result.codeSnippet ? `
                <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px; margin: 10px 0; font-family: 'Courier New', monospace; font-size: 13px; color: #1E293B; overflow-x: auto;">
                    <pre style="margin: 0; white-space: pre-wrap;">${result.codeSnippet}</pre>
                </div>` : ''}
            </div>
            
            <div style="background: #FFFFFF; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #E2E8F0;">
                <p style="margin: 0 0 10px 0; font-weight: 600; color: #64748B; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Your Answer:</p>
                <div style="margin: 5px 0; padding: 12px; background: #F8FAFC; border-radius: 6px; color: #1E293B; border-left: 4px solid ${result.isCorrect ? '#22C55E' : '#6366F1'};">${formatForEmail(result.userAnswer)}</div>
                
                <p style="margin: 20px 0 10px 0; font-weight: 600; color: #64748B; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Correct Answer:</p>
                <div style="margin: 5px 0; padding: 12px; background: #F8FAFC; border-radius: 6px; color: #1E293B; border-left: 4px solid #22C55E;">${formatForEmail(result.correctAnswer)}</div>
            </div>
            
            <p style="margin: 15px 0 10px 0; font-weight: bold; color: ${result.isCorrect ? '#16A34A' : '#DC2626'}; font-size: 15px;">
                ${result.isCorrect ? 'Correct' : 'Incorrect'}
            </p>
            
            ${result.explanation ? `
                <div style="margin: 15px 0 0 0; padding: 15px; background: #EFF6FF; border-left: 4px solid #3B82F6; border-radius: 8px;">
                    <p style="margin: 0 0 8px 0; font-weight: 600; color: #1E40AF;">Explanation:</p>
                    <div style="color: #1E3A8A; line-height: 1.6; font-size: 14px;">${formatForEmail(result.explanation)}</div>
                </div>
            ` : ''}
        </div>
    `).join('');

    // Main content
    const emailContent = `
        <div>
            <h2 style="color: #0F172A; margin-top: 0; font-size: 24px;">Hello ${name}</h2>
            
            <div style="background: #F8FAFC; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 5px solid #3B82F6; border: 1px solid #E2E8F0;">
                <h3 style="color: #0F172A; margin-top: 0; font-size: 20px;">Test Summary</h3>
                <table style="width: 100%; color: #334155; border-spacing: 0;">
                    <tr><td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;"><strong style="color: #64748B;">Topic:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;">${topic}</td></tr>
                    <tr><td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;"><strong style="color: #64748B;">Total Questions:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;">${results.totalQuestions}</td></tr>
                    <tr><td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;"><strong style="color: #64748B;">Correct Answers:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;">${results.correctAnswers}</td></tr>
                    <tr><td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;"><strong style="color: #64748B;">Score:</strong></td><td style="padding: 8px 0; font-size: 20px; font-weight: bold; color: ${results.score >= 70 ? '#22C55E' : results.score >= 50 ? '#F59E0B' : '#EF4444'}; border-bottom: 1px solid #E2E8F0;">${results.score}%</td></tr>
                    <tr><td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;"><strong style="color: #64748B;">Grade:</strong></td><td style="padding: 8px 0; font-weight: bold; color: #0F172A; border-bottom: 1px solid #E2E8F0;">${results.grade}</td></tr>
                    <tr><td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;"><strong style="color: #64748B;">Time Taken:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;">${Math.floor(results.timeSpent / 60)}m ${results.timeSpent % 60}s</td></tr>
                    <tr><td style="padding: 8px 0;"><strong style="color: #64748B;">Test Date:</strong></td><td style="padding: 8px 0;">${new Date(results.timestamp).toLocaleString()}</td></tr>
                </table>
            </div>
            
            <div style="background: #EFF6FF; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid #BFDBFE;">
                <h3 style="color: #1E40AF; margin-top: 0; font-size: 18px;">AI Feedback</h3>
                <p style="line-height: 1.6; color: #1E3A8A; white-space: pre-line; margin: 0;">${results.aiFeedback}</p>
            </div>
            
            <div style="margin: 30px 0;">
                <h3 style="color: #0F172A; font-size: 22px; margin-bottom: 20px;">Detailed Results</h3>
                ${detailedResultsHTML}
            </div>
            
            <div style="text-align: center; margin-top: 40px; padding: 25px; background: #F8FAFC; border-radius: 12px; border: 1px solid #E2E8F0;">
                <p style="margin: 0 0 15px 0; color: #334155; font-size: 16px;">Want to improve your skills?</p>
                <p style="margin: 0; color: #64748B;">Visit <a href="https://interviewai.tech" style="color: #3B82F6; font-weight: bold; text-decoration: none;">Interview AI</a> for more practice tests!</p>
            </div>
        </div>
    `;

    // Use the new email service with custom template
    const fullEmailHTML = getEmailTemplate(emailContent, {
        preheader: `Your MCQ Test Results - ${results.score}% Score`,
        title: `MCQ Test Results - ${results.score}%`
    });

    await sendCustomEmail(
        email,
        `Your MCQ Test Results - ${results.score}% Score on ${topic}`,
        fullEmailHTML,
        `MCQ Test Results\n\nTopic: ${topic}\nScore: ${results.score}%\nGrade: ${results.grade}\nCorrect: ${results.correctAnswers}/${results.totalQuestions}`
    );
}

// Generate MCQ test with OPTIMIZED batch processing and caching
router.post('/generate', checkFeatureEnabled('ai_mcq_generation'), async (req, res) => {
    try {
        const { topic, difficulty = 'medium', numberOfQuestions = 30, userEmail, branch = 'Computer Engineering' } = req.body;

        if (!topic) {
            return res.status(400).json({
                success: false,
                message: 'Topic is required'
            });
        }

        const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const startTime = Date.now();

        console.log(`\n🎯 MCQ Generation Request: ${topic} (${difficulty}) - ${numberOfQuestions} questions`);
        console.log(`Session ID: ${sessionId}`);

        let questions;
        let cacheHit = false;

        // Try to get from cache first
        const cachedQuestions = getFromCache(topic, difficulty, numberOfQuestions);

        if (cachedQuestions && cachedQuestions.length >= numberOfQuestions) {
            console.log(`⚡ Using cached questions (${cachedQuestions.length} available)`);
            questions = cachedQuestions;
            cacheHit = true;
        } else {
            // Generate using optimized batch processing
            console.log(`🚀 Generating questions using optimized batch processing...`);

            questions = await generateMCQBatch(
                topic,
                difficulty,
                numberOfQuestions,
                (progress) => {
                    console.log(`Progress: Batch ${progress.batch}/${progress.totalBatches} - ${progress.questionsGenerated} questions`);
                },
                branch
            );

            if (questions.length < numberOfQuestions) {
                return res.status(500).json({
                    success: false,
                    message: `Failed to generate enough questions. Got ${questions.length}/${numberOfQuestions}.`
                });
            }

            // Add to cache for future requests
            addToCache(topic, difficulty, questions);

            // Log AI Usage (if userId available from request body? userEmail is there)
            // But we need userId. We can query User by email.
            if (userEmail) {
                // Async background lookup to log usage
                try {
                    const User = require('../models/User'); // Ensure User model is available
                    const user = await User.findOne({ email: userEmail });
                    if (user) {
                        const { logAIUsage } = require('../utils/aiLogger');
                        // Log as MCQ_GENERATION
                        logAIUsage(
                            user._id,
                            'openrouter', // provider (assuming default or you can get from gemini.js result if modified)
                            'gpt-4o-mini', // model (assuming default)
                            'success',
                            numberOfQuestions * 50, // rough token estimate
                            'MCQ_GENERATION',
                            { topic, difficulty, numberOfQuestions }
                        );
                    }
                } catch (logErr) {
                    console.error('Error logging AI usage:', logErr);
                }
            }
        }

        // Shuffle options within each question for variety
        const shuffledQuestions = shuffleQuestionOptions(questions);

        // Shuffle question order
        const finalQuestions = shuffledQuestions.sort(() => Math.random() - 0.5);

        // Remove correct answers and explanations from response for frontend
        const questionsForTest = finalQuestions.map(({ correctAnswer, explanation, ...question }) => question);

        const endTime = Date.now();
        const totalTime = ((endTime - startTime) / 1000).toFixed(2);

        console.log(`✅ MCQ Generation Complete:`);
        console.log(`   - Time: ${totalTime}s`);
        console.log(`   - Questions: ${finalQuestions.length}`);
        console.log(`   - Cache: ${cacheHit ? 'HIT ⚡' : 'MISS'}`);
        console.log(`   - Avg per question: ${(totalTime / finalQuestions.length).toFixed(2)}s\n`);

        res.json({
            success: true,
            data: {
                questions: questionsForTest,
                questionsWithAnswers: finalQuestions,
                topic,
                difficulty,
                totalQuestions: finalQuestions.length,
                timeLimit: 45,
                sessionId,
                generationTime: parseFloat(totalTime),
                cached: cacheHit
            }
        });

    } catch (error) {
        console.error('❌ Error generating MCQ test:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate MCQ test. Please try again.',
            error: error.message
        });
    }
});

// Submit MCQ test answers
router.post('/submit', async (req, res) => {
    try {
        const {
            topic,
            answers,
            userInfo,
            numberOfQuestions = 30,
            timeSpent = 0,
            questions,
            experience = 'beginner',
            specialization = '',
            securityWarnings = {},
            practiceTestId,
            saveHistory = true // Default to true for AI tests
        } = req.body;

        if (!topic || !answers || !userInfo || !userInfo.name || !userInfo.email) {
            return res.status(400).json({
                success: false,
                message: 'Topic, answers, and user information are required'
            });
        }

        console.log(`Evaluating MCQ test for: ${userInfo.email}`);

        let questionsWithAnswers;

        // Use provided questions if available, otherwise regenerate (fallback for old tests)
        if (practiceTestId) {
            console.log(`Evaluating Practice Test: ${practiceTestId}`);
            const practiceTest = await PracticeTest.findById(practiceTestId);
            if (!practiceTest) {
                return res.status(404).json({ success: false, message: 'Practice test not found' });
            }
            questionsWithAnswers = practiceTest.questions;
        } else if (questions && Array.isArray(questions) && questions.length > 0) {
            questionsWithAnswers = questions;
            console.log(`Using provided questions for evaluation (${questions.length} questions)`);
        } else {
            console.log('No questions provided, regenerating questions for evaluation (this may cause inconsistency)');
            questionsWithAnswers = await generateMCQQuestions(topic, 'medium', numberOfQuestions);
        }

        // Evaluate answers
        const results = await evaluateAnswers(questionsWithAnswers, answers, userInfo, timeSpent);

        // Aggregate MCQ + DSA scores if this is a Practice Test with a DSA module
        if (practiceTestId) {
            console.log(`Aggregating scores for Practice Test: ${practiceTestId}`);
            const practiceTest = await PracticeTest.findById(practiceTestId);
            if (practiceTest) {
                // Each MCQ question is worth 1 point
                let totalEarned = results.correctAnswers || 0;
                let totalMax = (practiceTest.questions || []).length;

                // Add DSA scores if DSA questions are present
                if (practiceTest.dsaQuestions && practiceTest.dsaQuestions.length > 0) {
                    const dsaMax = practiceTest.dsaQuestions.reduce((sum, dq) => sum + (dq.maxScore || 100), 0);
                    totalMax += dsaMax;

                    let dsaEarned = 0;
                    if (req.body.attemptId) {
                        const attemptDoc = await PracticeTestResult.findById(req.body.attemptId);
                        if (attemptDoc && attemptDoc.dsaResults) {
                            const dsaScores = {};
                            attemptDoc.dsaResults.forEach(r => {
                                const qIdStr = r.questionId.toString();
                                dsaScores[qIdStr] = Math.max(dsaScores[qIdStr] || 0, r.score || 0);
                            });
                            dsaEarned = Object.values(dsaScores).reduce((sum, s) => sum + s, 0);
                        }
                    }
                    totalEarned += dsaEarned;
                }

                // Recalculate percentage score
                results.score = totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 100;
                console.log(`Aggregated Practice Test Score: ${totalEarned}/${totalMax} (${results.score}%)`);
            }
        }

        // Determine test status based on security warnings and time
        let testStatus = 'completed';
        const totalWarnings = (securityWarnings.fullscreenExits || 0) + (securityWarnings.tabSwitches || 0);
        
        // Calculate allowed time
        let allowedTimeSeconds = numberOfQuestions * 120; // Default 2 mins per question
        if (practiceTestId) {
            const pt = await PracticeTest.findById(practiceTestId);
            if (pt && pt.timeLimit) {
                allowedTimeSeconds = pt.timeLimit * 60;
            }
        }

        if (totalWarnings >= 3) {
            testStatus = 'auto-submitted';
        } else if (timeSpent >= allowedTimeSeconds) {
            testStatus = 'timeout';
        }

        // Fetch user by email to get userId
        let userId = null;
        try {
            const user = await User.findOne({ email: userInfo.email });
            if (user) {
                userId = user._id;
            } else {
                console.error(`User not found for email: ${userInfo.email}`);
                return res.status(400).json({
                    success: false,
                    message: 'User not found. Please login again.'
                });
            }
        } catch (userError) {
            console.error('Error fetching user:', userError);
            return res.status(500).json({
                success: false,
                message: 'Error validating user. Please try again.'
            });
        }

        // Check for duplicate submission (within cooldown period)
        const userIdStr = userId.toString();
        const now = Date.now();
        const lastSubmission = recentSubmissions.get(userIdStr);

        if (lastSubmission && (now - lastSubmission) < SUBMISSION_COOLDOWN) {
            console.log(`⚠️ Duplicate submission blocked for user: ${userInfo.email} (within ${SUBMISSION_COOLDOWN}ms)`);
            return res.status(429).json({
                success: false,
                message: 'Please wait a moment before submitting again.'
            });
        }

        // Mark this submission
        recentSubmissions.set(userIdStr, now);

        // Clean up old entries (older than 1 minute)
        for (const [key, timestamp] of recentSubmissions.entries()) {
            if (now - timestamp > 60000) {
                recentSubmissions.delete(key);
            }
        }

        // Only save to DB and send email if saveHistory is true or if it's a practice test
        let testDocument = null;
        if (saveHistory || practiceTestId) {
            // Save test results to database
            try {
                const isPractice = !!practiceTestId;
                const ResultModel = isPractice ? PracticeTestResult : MCQTest;
                
                if (req.body.attemptId) {
                    testDocument = await ResultModel.findById(req.body.attemptId);
                }

                if (!testDocument) {
                    testDocument = new ResultModel({
                        userId: userId,
                        userEmail: userInfo.email,
                        topic: isPractice ? undefined : topic,
                        practiceTestId: isPractice ? new mongoose.Types.ObjectId(practiceTestId) : undefined,
                        experience,
                        specialization,
                        totalQuestions: results.totalQuestions,
                        correctAnswers: results.correctAnswers,
                        score: results.score,
                        timeSpent: timeSpent || 0, // Fix: Use timeSpent from req.body
                        userAnswers: answers,
                        questionsWithAnswers: isPractice ? [] : (questionsWithAnswers || []).map(q => ({
                            question: q.question,
                            options: q.options,
                            correctAnswer: q.correctAnswer,
                            explanation: q.explanation
                        })),
                        securityWarnings: {
                            fullscreenExits: securityWarnings.fullscreenExits || 0,
                            tabSwitches: securityWarnings.tabSwitches || 0
                        },
                        testStatus,
                        completedAt: new Date()
                    });
                } else {
                    testDocument.correctAnswers = results.correctAnswers;
                    testDocument.score = results.score;
                    testDocument.timeSpent = timeSpent || 0; // Fix: Use timeSpent from req.body
                    testDocument.userAnswers = answers;
                    testDocument.testStatus = testStatus;
                    testDocument.completedAt = new Date();
                }

                await testDocument.save();
                console.log(`Test results saved to ${isPractice ? 'PracticeTestResult' : 'MCQTest'}: ${testDocument._id}`);

                if (isPractice) {
                    const PracticeTest = require('../models/PracticeTest');
                    await PracticeTest.findByIdAndUpdate(practiceTestId, { $inc: { submissions: 1 } });
                    console.log(`Incremented submissions for PracticeTest: ${practiceTestId}`);
                }
            } catch (dbError) {
                console.error('Error saving test to database:', dbError);
                // Continue even if database save fails
            }

            // Send results email
            try {
                await sendResultsEmail(userInfo, results, topic);
                console.log(`Results email sent to: ${userInfo.email}`);
            } catch (emailError) {
                console.error('Failed to send results email:', emailError);
                // Don't fail the request if email fails
            }
        } else {
            console.log('Skipping DB save and email for practice test (saveHistory=false)');
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
                    timeSpent: results.timeSpent,
                    detailedResults: results.detailedResults, // Send detailed results for immediate display in practice mode
                    dsaResults: testDocument ? testDocument.dsaResults : undefined // Forward dsaResults to the frontend
                },
                message: saveHistory ? 'Test submitted successfully! Results have been sent to your email.' : 'Practice test completed!'
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

// Get cache statistics
router.get('/cache-stats', (req, res) => {
    try {
        const stats = getCacheStats();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching cache stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch cache statistics'
        });
    }
});

// Get user's test history
router.get('/history', async (req, res) => {
    try {
        const userEmail = req.headers['user-email'] || req.query.email;
        const branch = req.query.branch;

        if (!userEmail) {
            return res.status(400).json({
                success: false,
                message: 'User email is required'
            });
        }

        let query = { userEmail };
        if (branch) {
            if (branch === 'computer') {
                query.$or = [
                    { branch: 'computer' }, 
                    { branch: 'Computer Engineering' },
                    { branch: { $exists: false } }, 
                    { branch: null },
                    { branch: '' }
                ];
            } else {
                query.branch = branch;
            }
        }

        // Fetch from both models for user history
        const aiTests = await MCQTest.find(query).sort({ createdAt: -1 }).lean();
        const practiceTests = await PracticeTestResult.find({ userEmail, testStatus: { $ne: 'in-progress' } }).populate('practiceTestId').sort({ createdAt: -1 }).lean();

        let filteredPracticeTests = practiceTests;
        if (branch) {
            filteredPracticeTests = practiceTests.filter(t => {
                if (!t.practiceTestId) return false;
                const tBranch = t.practiceTestId.branch;
                if (branch === 'computer') {
                    return !tBranch || tBranch === 'computer' || tBranch === 'Computer Engineering' || tBranch === '';
                }
                return tBranch === branch;
            });
        }

        // Merge and normalize for unified view
        const history = [
            ...aiTests.map(t => ({ ...t, type: 'ai' })),
            ...filteredPracticeTests.map(t => ({ 
                ...t, 
                type: 'practice',
                topic: t.practiceTestId?.topic || t.topic,
                title: t.practiceTestId?.title || 'Practice Test'
            }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({
            success: true,
            data: {
                history,
                totalTests: history.length
            }
        });

    } catch (error) {
        console.error('Error fetching test history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch test history'
        });
    }
});

// Get detailed test results by ID
router.get('/test/:testId', async (req, res) => {
    try {
        const { testId } = req.params;
        const userEmail = req.headers['user-email'] || req.query.email;

        if (!userEmail) {
            return res.status(400).json({
                success: false,
                message: 'User email is required'
            });
        }

        // Fetch from either model
        let test = await MCQTest.findOne({ _id: testId, userEmail }).lean();
        if (!test) {
            test = await PracticeTestResult.findOne({ _id: testId, userEmail }).populate('practiceTestId').lean();
        }

        if (!test) {
            return res.status(404).json({
                success: false,
                message: 'Test not found'
            });
        }

        // If it's a practice test and data is normalized (missing in record), 
        // fill from the populated practiceTestId
        if (test.practiceTestId && (!test.questionsWithAnswers || test.questionsWithAnswers.length === 0)) {
            test.topic = test.practiceTestId.topic;
            test.questionsWithAnswers = test.practiceTestId.questions.map(q => ({
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation || ""
            }));
            test.title = test.practiceTestId.title;
        }

        res.json({
            success: true,
            data: test
        });

    } catch (error) {
        console.error('Error fetching test details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch test details'
        });
    }
});

// Get test statistics for user
router.get('/stats', async (req, res) => {
    try {
        const userEmail = req.headers['user-email'] || req.query.email;

        if (!userEmail) {
            return res.status(400).json({
                success: false,
                message: 'User email is required'
            });
        }

        const stats = await MCQTest.aggregate([
            { $match: { userEmail } },
            {
                $group: {
                    _id: null,
                    totalTests: { $sum: 1 },
                    averageScore: { $avg: '$score' },
                    highestScore: { $max: '$score' },
                    lowestScore: { $min: '$score' },
                    totalTimeSpent: { $sum: '$timeSpent' },
                    totalQuestions: { $sum: '$totalQuestions' },
                    totalCorrect: { $sum: '$correctAnswers' }
                }
            }
        ]);

        // Get topic-wise performance
        const topicStats = await MCQTest.aggregate([
            { $match: { userEmail } },
            {
                $group: {
                    _id: '$topic',
                    tests: { $sum: 1 },
                    averageScore: { $avg: '$score' },
                    bestScore: { $max: '$score' }
                }
            },
            { $sort: { tests: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            success: true,
            data: {
                overall: stats[0] || {
                    totalTests: 0,
                    averageScore: 0,
                    highestScore: 0,
                    lowestScore: 0,
                    totalTimeSpent: 0,
                    totalQuestions: 0,
                    totalCorrect: 0
                },
                byTopic: topicStats
            }
        });

    } catch (error) {
        console.error('Error fetching test statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics'
        });
    }
});

// Delete test by ID
router.delete('/test/:testId', async (req, res) => {
    try {
        const { testId } = req.params;
        const userEmail = req.headers['user-email'] || req.query.email;

        if (!userEmail) {
            return res.status(400).json({
                success: false,
                message: 'User email is required'
            });
        }

        // Find and delete the test, ensuring user can only delete their own tests
        let deletedTest = await MCQTest.findOneAndDelete({
            _id: testId,
            userEmail // Ensure user can only delete their own tests
        });

        // If not found in MCQTest, try PracticeTestResult
        if (!deletedTest) {
            deletedTest = await PracticeTestResult.findOneAndDelete({
                _id: testId,
                userEmail
            });
        }

        if (!deletedTest) {
            return res.status(404).json({
                success: false,
                message: 'Test not found or you do not have permission to delete it'
            });
        }

        res.json({
            success: true,
            message: 'Test deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting test:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete test'
        });
    }
});

// GET all published Practice Tests with Pagination
router.get('/practice-tests', checkFeatureEnabled('practice_tests'), async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 9; // Default to 9 (3x3 grid)
        const skip = (page - 1) * limit;

        const PracticeTest = require('../models/PracticeTest');

        // specific filter if needed (e.g. search, difficulty) - strictly published only
        const filter = { isPublished: true };

        if (req.query.branch) {
            filter.branch = req.query.branch;
        }

        if (req.query.search) {
            filter.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } },
                { topic: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        const totalTests = await PracticeTest.countDocuments(filter);
        const totalPages = Math.ceil(totalTests / limit);

        const tests = await PracticeTest.aggregate([
            { $match: filter },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    topic: 1,
                    difficulty: 1,
                    attempts: 1,
                    submissions: 1,
                    createdAt: 1,
                    maxAttempts: 1,
                    timeLimit: 1,
                    isTimeRestricted: 1,
                    startTime: 1,
                    endTime: 1,
                    moduleType: 1,
                    modules: 1,
                    questionCount: { $size: { $ifNull: ["$questions", []] } },
                    dsaQuestionCount: { $size: { $ifNull: ["$dsaQuestions", []] } }
                }
            }
        ]);

        res.json({
            success: true,
            data: tests,
            pagination: {
                currentPage: page,
                totalPages,
                totalTests,
                hasMore: page < totalPages
            }
        });
    } catch (err) {
        console.error('Error fetching practice tests:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch practice tests' });
    }
});

// GET specific Practice Test — includes DSA questions (stripped of hidden test cases)
router.get('/practice-tests/:id', checkFeatureEnabled('practice_tests'), async (req, res) => {
    try {
        const { id } = req.params;
        const PracticeTest = require('../models/PracticeTest');

        const test = await PracticeTest.findById(id);

        if (!test) {
            return res.status(404).json({ success: false, message: 'Test not found' });
        }

        // Strip MCQ correct answers and explanations
        const questionsForTest = (test.questions || []).map(q => ({
            id: q._id,
            question: q.question,
            options: q.options,
            codeSnippet: q.codeSnippet,
            moduleIndex: q.moduleIndex
        }));

        // Strip DSA hidden test cases — only expose public test cases to users
        const dsaQuestionsForTest = (test.dsaQuestions || []).map(dq => ({
            id: dq._id,
            title: dq.title,
            description: dq.description,
            constraints: dq.constraints,
            difficulty: dq.difficulty,
            allowedLanguages: dq.allowedLanguages,
            maxScore: dq.maxScore,
            timeLimit: dq.timeLimit,
            memoryLimit: dq.memoryLimit,
            starterCode: dq.starterCode,
            publicTestCases: dq.publicTestCases, // User can see these
            hiddenTestCaseCount: dq.hiddenTestCases ? dq.hiddenTestCases.length : 0, // Only the count
            moduleIndex: dq.moduleIndex
        }));

        // Find user's past attempts
        const userEmail = req.headers['user-email'] || req.query.email;
        let userAttempts = 0;
        if (userEmail) {
            const PracticeTestResult = require('../models/PracticeTestResult');
            userAttempts = await PracticeTestResult.countDocuments({ userEmail, practiceTestId: test._id });
        }

        res.json({
            success: true,
            data: {
                _id: test._id,
                title: test.title,
                description: test.description,
                topic: test.topic,
                difficulty: test.difficulty,
                moduleType: test.moduleType || 'mcq',
                modules: test.modules || [],
                questions: questionsForTest,
                dsaQuestions: dsaQuestionsForTest,
                totalQuestions: (test.questions || []).length,
                totalDsaQuestions: (test.dsaQuestions || []).length,
                timeLimit: test.timeLimit || 30,
                maxAttempts: test.maxAttempts || 1,
                guidelines: test.guidelines || '',
                isTimeRestricted: test.isTimeRestricted || false,
                startTime: test.startTime || null,
                endTime: test.endTime || null,
                userAttempts: userAttempts,
                submissions: test.submissions || 0,
                cached: true
            }
        });

    } catch (err) {
        console.error('Error fetching practice test:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch test' });
    }
});

// START a practice test (Create an in-progress attempt)
router.post('/practice-tests/:id/start', async (req, res) => {
    try {
        const { id } = req.params;
        const { userInfo } = req.body;

        if (!userInfo || !userInfo.email) {
            return res.status(400).json({ success: false, message: 'User info is required' });
        }

        const PracticeTest = require('../models/PracticeTest');
        const test = await PracticeTest.findById(id);

        if (!test) {
            return res.status(404).json({ success: false, message: 'Practice test not found' });
        }

        const hasScheduleWindow = test.isTimeRestricted || test.startTime || test.endTime;

        if (hasScheduleWindow) {
            const now = new Date().getTime();
            if (test.startTime && now < new Date(test.startTime).getTime()) {
                return res.status(403).json({ success: false, message: 'Test has not started yet' });
            }
            if (test.endTime && now > new Date(test.endTime).getTime()) {
                return res.status(403).json({ success: false, message: 'Test has already ended' });
            }
        }

        let userId = null;
        try {
            const User = require('../models/User');
            const user = await User.findOne({ email: userInfo.email });
            if (user) userId = user._id;
        } catch (e) {
            console.error('Error finding user:', e);
        }

        if (!userId) {
            return res.status(404).json({ success: false, message: 'User not found in DB' });
        }

        // Check max attempts in dedicated model
        const userAttempts = await PracticeTestResult.countDocuments({
            userEmail: userInfo.email,
            practiceTestId: test._id
        });

        if (test.maxAttempts && userAttempts >= test.maxAttempts) {
            return res.status(403).json({
                success: false,
                message: `You have reached the maximum attempts (${test.maxAttempts}) for this test.`
            });
        }

        const mcqTest = new PracticeTestResult({
            userId,
            userEmail: userInfo.email,
            practiceTestId: new mongoose.Types.ObjectId(test._id),
            totalQuestions: test.questions.length,
            correctAnswers: 0,
            score: 0,
            timeSpent: 0,
            userAnswers: {},
            testStatus: 'in-progress'
        });

        await mcqTest.save();

        // Increment attempts count in PracticeTest (Hits)
        await PracticeTest.findByIdAndUpdate(id, { $inc: { attempts: 1 } });
        console.log(`Incremented attempts (Hits) for PracticeTest: ${id}`);

        res.json({
            success: true,
            data: {
                attemptId: mcqTest._id
            }
        });
    } catch (err) {
        console.error('Error starting practice test:', err);
        res.status(500).json({ success: false, message: 'Failed to start practice test' });
    }
});

// Helper: Merges user solution code with driver code wrapper
function mergeUserCodeAndDriverCode(code, language, dsaQuestion) {
    if (!dsaQuestion.driverCode) return code;

    let driver = '';
    if (typeof dsaQuestion.driverCode.get === 'function') {
        driver = dsaQuestion.driverCode.get(language);
    } else {
        driver = dsaQuestion.driverCode[language];
    }

    if (!driver || !driver.trim()) return code;

    const placeholders = ['// {{USER_CODE}}', '/* {{USER_CODE}} */', '# {{USER_CODE}}', '//Solution', '#Solution'];
    for (const ph of placeholders) {
        if (driver.includes(ph)) {
            return driver.replace(ph, code);
        }
    }

    // Default fallback: Append driver code to user code
    return code + '\n\n' + driver;
}

// ─── DSA Code Execution Endpoints ───

// POST run-code: Run user code against PUBLIC test cases only
router.post('/practice-tests/:id/run-code', async (req, res) => {
    try {
        const { id } = req.params;
        const { questionId, language, code } = req.body;

        if (!questionId || !language || !code) {
            return res.status(400).json({ success: false, message: 'questionId, language, and code are required' });
        }

        const PracticeTest = require('../models/PracticeTest');
        const { runPublicTests } = require('../services/dsaRunner');

        const test = await PracticeTest.findById(id);
        if (!test) {
            return res.status(404).json({ success: false, message: 'Test not found' });
        }

        const dsaQuestion = test.dsaQuestions.id(questionId);
        if (!dsaQuestion) {
            return res.status(404).json({ success: false, message: 'DSA question not found' });
        }

        // Validate language is allowed
        if (!dsaQuestion.allowedLanguages.includes(language)) {
            return res.status(400).json({ success: false, message: `Language '${language}' is not allowed for this question` });
        }

        // Merge user code with driver code if defined
        const mergedCode = mergeUserCodeAndDriverCode(code, language, dsaQuestion);

        // Run against public test cases
        const result = await runPublicTests(
            mergedCode, language,
            dsaQuestion.publicTestCases,
            dsaQuestion.timeLimit || 2,
            dsaQuestion.memoryLimit || 256
        );

        res.json({
            success: true,
            data: result
        });

    } catch (err) {
        console.error('Error running code:', err);
        res.status(500).json({ success: false, message: 'Failed to run code' });
    }
});

// POST submit-code: Run against public first, then hidden test cases for scoring
router.post('/practice-tests/:id/submit-code', async (req, res) => {
    try {
        const { id } = req.params;
        const { questionId, language, code, attemptId } = req.body;

        if (!questionId || !language || !code || !attemptId) {
            return res.status(400).json({ success: false, message: 'questionId, language, code, and attemptId are required' });
        }

        const PracticeTest = require('../models/PracticeTest');
        const PracticeTestResult = require('../models/PracticeTestResult');
        const { runPublicTests, runHiddenTests } = require('../services/dsaRunner');

        const test = await PracticeTest.findById(id);
        if (!test) {
            return res.status(404).json({ success: false, message: 'Test not found' });
        }

        const dsaQuestion = test.dsaQuestions.id(questionId);
        if (!dsaQuestion) {
            return res.status(404).json({ success: false, message: 'DSA question not found' });
        }

        // Validate language
        if (!dsaQuestion.allowedLanguages.includes(language)) {
            return res.status(400).json({ success: false, message: `Language '${language}' is not allowed for this question` });
        }

        // Merge user code with driver code if defined
        const mergedCode = mergeUserCodeAndDriverCode(code, language, dsaQuestion);

        // Step 1: Run public test cases first
        const publicResult = await runPublicTests(
            mergedCode, language,
            dsaQuestion.publicTestCases,
            dsaQuestion.timeLimit || 2,
            dsaQuestion.memoryLimit || 256
        );

        if (!publicResult.allPassed) {
            // Public tests failed — don't run hidden tests
            // Save partial result
            await PracticeTestResult.findByIdAndUpdate(attemptId, {
                $push: {
                    dsaResults: {
                        questionId: dsaQuestion._id,
                        language,
                        code, // Save original code
                        publicTestsPassed: publicResult.totalPassed,
                        publicTestsTotal: publicResult.totalTests,
                        hiddenTestsPassed: 0,
                        hiddenTestsTotal: dsaQuestion.hiddenTestCases.length,
                        score: 0,
                        status: 'failed'
                    }
                }
            });

            return res.json({
                success: true,
                data: {
                    publicResults: publicResult.results,
                    publicAllPassed: false,
                    hiddenPassed: 0,
                    hiddenTotal: dsaQuestion.hiddenTestCases.length,
                    score: 0,
                    message: 'Public test cases failed. Fix your code and try again.'
                }
            });
        }

        // Step 2: All public tests passed — run hidden tests
        const hiddenResult = await runHiddenTests(
            mergedCode, language,
            dsaQuestion.hiddenTestCases,
            dsaQuestion.maxScore || 100,
            dsaQuestion.timeLimit || 2,
            dsaQuestion.memoryLimit || 256
        );

        // Save result to attempt
        const status = hiddenResult.hiddenPassed === hiddenResult.hiddenTotal ? 'evaluated' : 'public_passed';
        await PracticeTestResult.findByIdAndUpdate(attemptId, {
            $push: {
                dsaResults: {
                    questionId: dsaQuestion._id,
                    language,
                    code,
                    publicTestsPassed: publicResult.totalPassed,
                    publicTestsTotal: publicResult.totalTests,
                    hiddenTestsPassed: hiddenResult.hiddenPassed,
                    hiddenTestsTotal: hiddenResult.hiddenTotal,
                    score: hiddenResult.score,
                    status
                }
            }
        });

        res.json({
            success: true,
            data: {
                publicResults: publicResult.results,
                publicAllPassed: true,
                hiddenPassed: hiddenResult.hiddenPassed,
                hiddenTotal: hiddenResult.hiddenTotal,
                score: hiddenResult.score,
                maxScore: dsaQuestion.maxScore || 100,
                message: `${hiddenResult.hiddenPassed}/${hiddenResult.hiddenTotal} hidden test cases passed. Score: ${hiddenResult.score}/${dsaQuestion.maxScore || 100}`
            }
        });

    } catch (err) {
        console.error('Error submitting code:', err);
        res.status(500).json({ success: false, message: 'Failed to submit code' });
    }
});

module.exports = router;
