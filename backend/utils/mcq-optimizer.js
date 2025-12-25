// MCQ Optimizer - Batch Processing and Parallel Generation
const { createMCQChain } = require('./langchain-chains');

/**
 * Generate MCQ questions in optimized batches with parallel processing
 * @param {string} topic - The topic for questions
 * @param {string} difficulty - Difficulty level (easy/medium/hard)
 * @param {number} totalQuestions - Total number of questions to generate
 * @param {Function} progressCallback - Optional callback for progress updates
 * @returns {Promise<Array>} Array of generated questions
 */
async function generateMCQBatch(topic, difficulty = 'medium', totalQuestions = 30, progressCallback = null) {
    const BATCH_SIZE = 10; // Generate 10 questions per batch
    const numBatches = Math.ceil(totalQuestions / BATCH_SIZE);

    console.log(`🚀 Starting optimized MCQ generation: ${totalQuestions} questions in ${numBatches} batches`);

    try {
        // Create batches for parallel processing
        const batchPromises = [];

        for (let i = 0; i < numBatches; i++) {
            const questionsInBatch = Math.min(BATCH_SIZE, totalQuestions - (i * BATCH_SIZE));

            // Create a promise for each batch
            const batchPromise = generateSingleBatch(
                topic,
                difficulty,
                questionsInBatch,
                i + 1,
                numBatches,
                progressCallback
            );

            batchPromises.push(batchPromise);
        }

        // Execute all batches in parallel
        console.log(`⚡ Generating ${numBatches} batches in parallel...`);
        const startTime = Date.now();

        const batchResults = await Promise.all(batchPromises);

        const endTime = Date.now();
        const totalTime = ((endTime - startTime) / 1000).toFixed(2);

        // Flatten all batch results into single array
        const allQuestions = batchResults.flat();

        console.log(`✅ Generated ${allQuestions.length} questions in ${totalTime}s (${(totalTime / allQuestions.length).toFixed(2)}s per question)`);

        // Deduplicate questions (remove any duplicates)
        const uniqueQuestions = deduplicateQuestions(allQuestions);

        // If we don't have enough unique questions, generate more
        if (uniqueQuestions.length < totalQuestions) {
            console.log(`⚠️ Only ${uniqueQuestions.length} unique questions, generating ${totalQuestions - uniqueQuestions.length} more...`);
            const additionalQuestions = await generateSingleBatch(
                topic,
                difficulty,
                totalQuestions - uniqueQuestions.length,
                numBatches + 1,
                numBatches + 1,
                progressCallback
            );
            uniqueQuestions.push(...additionalQuestions);
        }

        return uniqueQuestions.slice(0, totalQuestions);

    } catch (error) {
        console.error('❌ Error in batch generation:', error);
        throw error;
    }
}

/**
 * Generate a single batch of questions
 */
async function generateSingleBatch(topic, difficulty, numberOfQuestions, batchNum, totalBatches, progressCallback) {
    try {
        console.log(`📦 Batch ${batchNum}/${totalBatches}: Generating ${numberOfQuestions} questions...`);

        const chain = await createMCQChain();
        const result = await chain.invoke({
            topic,
            difficulty,
            numberOfQuestions
        });

        // Parse the result (assuming it returns a string that needs parsing)
        const questions = parseMCQResponse(result, numberOfQuestions);

        console.log(`✓ Batch ${batchNum}/${totalBatches}: Generated ${questions.length} questions`);

        // Call progress callback if provided
        if (progressCallback) {
            progressCallback({
                batch: batchNum,
                totalBatches,
                questionsGenerated: questions.length,
                progress: Math.round((batchNum / totalBatches) * 100)
            });
        }

        return questions;

    } catch (error) {
        console.error(`❌ Error in batch ${batchNum}:`, error);
        // Return empty array instead of failing completely
        return [];
    }
}

/**
 * Parse MCQ response from AI
 */
function parseMCQResponse(response, numberOfQuestions = 10) {
    const questions = [];

    // Clean content helper
    const cleanContent = (content) => {
        if (!content) return content;
        return content
            .replace(/```\?/g, '')
            .replace(/\?\?\?/g, '')
            .replace(/```(\w+)?\s*\n([\s\S]*?)\n\s*```/g, (match, lang, code) => {
                const cleanCode = code.trim();
                return `\`\`\`${lang || ''}\n${cleanCode}\n\`\`\``;
            })
            .replace(/\n\s*\n\s*\n/g, '\n\n')
            .trim();
    };

    // Split by question numbers
    const questionBlocks = response.split(/(?=^\d+\.\s)/m).filter(block => block.trim());

    questionBlocks.forEach((block, index) => {
        if (!block.trim()) return;

        try {
            // Extract question text
            const questionMatch = block.match(/^\d+\.\s([\s\S]*?)(?=^[A-D]\))/m);
            if (!questionMatch) return;

            let questionText = cleanContent(questionMatch[1].trim());
            if (!questionText.endsWith('?')) {
                questionText += '?';
            }

            const optionsArray = [];
            let correctAnswer = '';
            let explanation = '';

            // Extract options
            const lines = block.split('\n');
            let currentOption = '';
            let optionLetter = '';
            let inOption = false;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();

                const optionStart = line.match(/^([A-D])\)\s*(.*)$/);
                if (optionStart) {
                    if (inOption && currentOption && optionLetter) {
                        optionsArray[optionLetter.charCodeAt(0) - 65] = cleanContent(currentOption.trim());
                    }
                    optionLetter = optionStart[1];
                    currentOption = optionStart[2];
                    inOption = true;
                } else if (inOption && !line.startsWith('CORRECT:') && !line.startsWith('EXPLANATION:')) {
                    currentOption += '\n' + line;
                } else if (line.startsWith('CORRECT:')) {
                    if (inOption && currentOption && optionLetter) {
                        optionsArray[optionLetter.charCodeAt(0) - 65] = cleanContent(currentOption.trim());
                    }
                    inOption = false;
                    const correctMatch = line.match(/CORRECT:\s*\[?([A-D])\]?/);
                    if (correctMatch) {
                        correctAnswer = correctMatch[1];
                    }
                } else if (line.startsWith('EXPLANATION:')) {
                    explanation = line.substring(12).trim();
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

            if (inOption && currentOption && optionLetter) {
                optionsArray[optionLetter.charCodeAt(0) - 65] = currentOption.trim();
            }

            const validOptions = optionsArray.filter(opt => opt && opt.trim());

            if (validOptions.length === 4 && correctAnswer && questionText) {
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
        }
    });

    return questions.slice(0, numberOfQuestions);
}

/**
 * Remove duplicate questions based on question text similarity
 */
function deduplicateQuestions(questions) {
    const seen = new Set();
    const unique = [];

    for (const question of questions) {
        // Create a normalized version for comparison
        const normalized = question.question
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();

        if (!seen.has(normalized)) {
            seen.add(normalized);
            unique.push(question);
        }
    }

    console.log(`🔍 Deduplication: ${questions.length} → ${unique.length} unique questions`);
    return unique;
}

/**
 * Shuffle options within each question for variety
 */
function shuffleQuestionOptions(questions) {
    return questions.map(question => {
        const optionIndices = [0, 1, 2, 3];
        const shuffledIndices = [...optionIndices].sort(() => Math.random() - 0.5);

        const shuffledOptions = shuffledIndices.map(index => question.options[index]);
        const newCorrectAnswerIndex = shuffledIndices.indexOf(question.correctAnswer);

        return {
            ...question,
            options: shuffledOptions,
            correctAnswer: newCorrectAnswerIndex
        };
    });
}

module.exports = {
    generateMCQBatch,
    generateSingleBatch,
    parseMCQResponse,
    deduplicateQuestions,
    shuffleQuestionOptions
};
