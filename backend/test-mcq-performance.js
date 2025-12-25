/**
 * MCQ Performance Test
 * Tests the optimized MCQ generation system
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
    console.log('\n' + '='.repeat(60));
    log(title, 'bright');
    console.log('='.repeat(60) + '\n');
}

async function testMCQPerformance() {
    logSection('MCQ PERFORMANCE TEST');

    const testCases = [
        { topic: 'JavaScript Fundamentals', difficulty: 'medium', questions: 30 },
        { topic: 'React Development', difficulty: 'medium', questions: 30 },
        { topic: 'Node.js Backend', difficulty: 'hard', questions: 30 }
    ];

    const results = [];

    for (const testCase of testCases) {
        log(`\n📋 Testing: ${testCase.topic} (${testCase.difficulty})`, 'cyan');

        try {
            // First request (should generate fresh)
            log('  🔄 First request (generating fresh)...', 'blue');
            const start1 = Date.now();

            const response1 = await axios.post(`${BASE_URL}/api/mcq/generate`, {
                topic: testCase.topic,
                difficulty: testCase.difficulty,
                numberOfQuestions: testCase.questions
            });

            const time1 = ((Date.now() - start1) / 1000).toFixed(2);
            const cached1 = response1.data.data.cached;
            const generationTime1 = response1.data.data.generationTime;

            log(`  ✅ First request: ${time1}s (Generation: ${generationTime1}s, Cached: ${cached1})`, 'green');

            // Wait a moment
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Second request (should use cache)
            log('  🔄 Second request (should use cache)...', 'blue');
            const start2 = Date.now();

            const response2 = await axios.post(`${BASE_URL}/api/mcq/generate`, {
                topic: testCase.topic,
                difficulty: testCase.difficulty,
                numberOfQuestions: testCase.questions
            });

            const time2 = ((Date.now() - start2) / 1000).toFixed(2);
            const cached2 = response2.data.data.cached;
            const generationTime2 = response2.data.data.generationTime;

            log(`  ✅ Second request: ${time2}s (Generation: ${generationTime2}s, Cached: ${cached2})`, 'green');

            // Calculate improvement
            const improvement = ((1 - (parseFloat(time2) / parseFloat(time1))) * 100).toFixed(1);

            results.push({
                topic: testCase.topic,
                difficulty: testCase.difficulty,
                firstRequest: {
                    totalTime: time1,
                    generationTime: generationTime1,
                    cached: cached1
                },
                secondRequest: {
                    totalTime: time2,
                    generationTime: generationTime2,
                    cached: cached2
                },
                improvement: `${improvement}%`,
                questionsGenerated: response1.data.data.totalQuestions
            });

            log(`  📊 Improvement: ${improvement}% faster on second request`, 'yellow');

        } catch (error) {
            log(`  ❌ Error: ${error.message}`, 'red');
            if (error.response) {
                log(`     Response: ${JSON.stringify(error.response.data)}`, 'red');
            }
        }
    }

    // Display summary
    logSection('PERFORMANCE SUMMARY');

    console.table(results.map(r => ({
        Topic: r.topic,
        Difficulty: r.difficulty,
        'First (s)': r.firstRequest.totalTime,
        'Second (s)': r.secondRequest.totalTime,
        'Improvement': r.improvement,
        'Cache Hit': r.secondRequest.cached ? '✅' : '❌',
        'Questions': r.questionsGenerated
    })));

    // Get cache stats
    try {
        log('\n📊 Cache Statistics:', 'cyan');
        const cacheStats = await axios.get(`${BASE_URL}/api/mcq/cache-stats`);
        console.log(JSON.stringify(cacheStats.data.data, null, 2));
    } catch (error) {
        log('Failed to fetch cache stats', 'red');
    }

    // Calculate averages
    const avgFirstRequest = (results.reduce((sum, r) => sum + parseFloat(r.firstRequest.totalTime), 0) / results.length).toFixed(2);
    const avgSecondRequest = (results.reduce((sum, r) => sum + parseFloat(r.secondRequest.totalTime), 0) / results.length).toFixed(2);
    const avgImprovement = (results.reduce((sum, r) => sum + parseFloat(r.improvement), 0) / results.length).toFixed(1);

    logSection('AVERAGE METRICS');
    log(`Average First Request:  ${avgFirstRequest}s`, 'yellow');
    log(`Average Second Request: ${avgSecondRequest}s`, 'green');
    log(`Average Improvement:    ${avgImprovement}%`, 'bright');

    // Success criteria
    logSection('SUCCESS CRITERIA');
    const firstRequestPass = parseFloat(avgFirstRequest) < 20;
    const secondRequestPass = parseFloat(avgSecondRequest) < 5;
    const improvementPass = parseFloat(avgImprovement) > 50;

    log(`✓ First request < 20s:  ${firstRequestPass ? '✅ PASS' : '❌ FAIL'} (${avgFirstRequest}s)`, firstRequestPass ? 'green' : 'red');
    log(`✓ Second request < 5s:  ${secondRequestPass ? '✅ PASS' : '❌ FAIL'} (${avgSecondRequest}s)`, secondRequestPass ? 'green' : 'red');
    log(`✓ Improvement > 50%:    ${improvementPass ? '✅ PASS' : '❌ FAIL'} (${avgImprovement}%)`, improvementPass ? 'green' : 'red');

    const allPass = firstRequestPass && secondRequestPass && improvementPass;
    log(`\n${allPass ? '🎉 ALL TESTS PASSED!' : '⚠️  SOME TESTS FAILED'}`, allPass ? 'green' : 'yellow');
}

// Run the test
console.log('\n🚀 Starting MCQ Performance Test...\n');
console.log('Make sure the backend server is running on http://localhost:5000\n');

testMCQPerformance()
    .then(() => {
        log('\n✅ Performance test completed!', 'green');
        process.exit(0);
    })
    .catch(error => {
        log(`\n❌ Test failed: ${error.message}`, 'red');
        console.error(error);
        process.exit(1);
    });
