/**
 * DSA Runner Service
 * Handles code execution against test cases using Judge0 API.
 * Used by the practice test system for evaluating DSA coding questions.
 */

const axios = require('axios');

const JUDGE0_API = 'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true';

// Judge0 language ID mapping
const LANGUAGE_IDS = {
    cpp: 54,       // C++ (GCC 9.2.0)
    java: 62,      // Java (OpenJDK 13.0.1)
    python: 71,    // Python (3.8.1)
    javascript: 63 // JavaScript (Node.js 12.14.0)
};

// Default starter code templates
const DEFAULT_STARTER_CODE = {
    cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    // Write your code here
    
    return 0;
}`,
    java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Write your code here
        
    }
}`,
    python: `# Write your code here
`,
    javascript: `// Write your code here
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', (line) => lines.push(line));
rl.on('close', () => {
    // Process input from 'lines' array
    
});`
};

/**
 * Normalize output for comparison:
 * - Trim leading/trailing whitespace
 * - Remove trailing newlines
 * - Normalize line endings
 */
function normalizeOutput(output) {
    if (!output) return '';
    return output
        .replace(/\r\n/g, '\n')  // Normalize line endings
        .replace(/\n+$/, '')      // Remove trailing newlines
        .trim();
}

/**
 * Run a single test case against user code using Judge0 API
 * @param {string} code - User's source code
 * @param {string} language - Language key (cpp, java, python, javascript)
 * @param {string} input - Test case input (stdin)
 * @param {string} expectedOutput - Expected output for comparison
 * @param {number} timeLimitSec - Time limit in seconds
 * @param {number} memoryLimitMB - Memory limit in MB
 * @returns {Object} { passed, actualOutput, error, executionTime, status }
 */
async function runTestCase(code, language, input, expectedOutput, timeLimitSec = 2, memoryLimitMB = 256) {
    const languageId = LANGUAGE_IDS[language];
    if (!languageId) {
        return {
            passed: false,
            actualOutput: '',
            error: `Unsupported language: ${language}`,
            executionTime: 0,
            status: 'error'
        };
    }

    if (!process.env.RAPIDAPI_KEY) {
        return {
            passed: false,
            actualOutput: '',
            error: 'Server configuration error: RAPIDAPI_KEY not found',
            executionTime: 0,
            status: 'error'
        };
    }

    try {
        const response = await axios.post(JUDGE0_API, {
            source_code: code,
            language_id: languageId,
            stdin: input || '',
            cpu_time_limit: timeLimitSec,
            memory_limit: memoryLimitMB * 1024 // Convert MB to KB
        }, {
            headers: {
                'x-rapidapi-key': process.env.RAPIDAPI_KEY,
                'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
                'content-type': 'application/json',
            },
            timeout: 30000 // 30 seconds overall timeout
        });

        const result = response.data;

        // Status ID reference:
        // 1 = In Queue, 2 = Processing, 3 = Accepted, 4 = Wrong Answer
        // 5 = Time Limit Exceeded, 6 = Compilation Error, 7-12 = Runtime Errors

        if (result.status?.id === 6) {
            // Compilation Error
            return {
                passed: false,
                actualOutput: '',
                error: result.compile_output || 'Compilation Error',
                executionTime: 0,
                status: 'compilation_error'
            };
        }

        if (result.status?.id === 5) {
            // Time Limit Exceeded
            return {
                passed: false,
                actualOutput: '',
                error: 'Time Limit Exceeded',
                executionTime: parseFloat(result.time || 0) * 1000,
                status: 'tle'
            };
        }

        if (result.status?.id >= 7 && result.status?.id <= 12) {
            // Runtime Error
            return {
                passed: false,
                actualOutput: '',
                error: result.stderr || result.status?.description || 'Runtime Error',
                executionTime: parseFloat(result.time || 0) * 1000,
                status: 'runtime_error'
            };
        }

        if (result.status?.id === 3) {
            // Accepted - compare output
            const normalizedExpected = normalizeOutput(expectedOutput);
            const normalizedActual = normalizeOutput(result.stdout || '');
            const passed = normalizedExpected === normalizedActual;

            return {
                passed,
                actualOutput: result.stdout || '',
                error: null,
                executionTime: parseFloat(result.time || 0) * 1000,
                status: passed ? 'accepted' : 'wrong_answer'
            };
        }

        // Fallback for unexpected statuses
        return {
            passed: false,
            actualOutput: result.stdout || '',
            error: result.stderr || result.status?.description || 'Unknown error',
            executionTime: parseFloat(result.time || 0) * 1000,
            status: 'error'
        };

    } catch (error) {
        console.error('Judge0 API error:', error.response?.data || error.message);

        if (error.response?.status === 429) {
            return {
                passed: false,
                actualOutput: '',
                error: 'API rate limit exceeded. Please try again in a moment.',
                executionTime: 0,
                status: 'rate_limited'
            };
        }

        return {
            passed: false,
            actualOutput: '',
            error: error.response?.data?.message || error.message || 'Code execution failed',
            executionTime: 0,
            status: 'error'
        };
    }
}

/**
 * Run user code against all public test cases
 * @returns {Object} { results: Array, allPassed: boolean, totalPassed: number }
 */
async function runPublicTests(code, language, publicTestCases, timeLimitSec = 2, memoryLimitMB = 256) {
    const results = [];

    for (const testCase of publicTestCases) {
        const result = await runTestCase(
            code, language,
            testCase.input, testCase.expectedOutput,
            timeLimitSec, memoryLimitMB
        );
        results.push({
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            explanation: testCase.explanation || '',
            actualOutput: result.actualOutput,
            passed: result.passed,
            error: result.error,
            executionTime: result.executionTime,
            status: result.status
        });
    }

    const totalPassed = results.filter(r => r.passed).length;

    return {
        results,
        allPassed: totalPassed === publicTestCases.length,
        totalPassed,
        totalTests: publicTestCases.length
    };
}

/**
 * Run user code against all hidden test cases
 * Only returns pass count — no test case details exposed to user
 * @returns {Object} { hiddenPassed, hiddenTotal, score }
 */
async function runHiddenTests(code, language, hiddenTestCases, maxScore = 100, timeLimitSec = 2, memoryLimitMB = 256) {
    let hiddenPassed = 0;

    for (const testCase of hiddenTestCases) {
        const result = await runTestCase(
            code, language,
            testCase.input, testCase.expectedOutput,
            timeLimitSec, memoryLimitMB
        );
        if (result.passed) {
            hiddenPassed++;
        }
    }

    const hiddenTotal = hiddenTestCases.length;
    const score = hiddenTotal > 0
        ? Math.round((hiddenPassed / hiddenTotal) * maxScore)
        : 0;

    return {
        hiddenPassed,
        hiddenTotal,
        score
    };
}

module.exports = {
    runTestCase,
    runPublicTests,
    runHiddenTests,
    LANGUAGE_IDS,
    DEFAULT_STARTER_CODE,
    normalizeOutput
};
