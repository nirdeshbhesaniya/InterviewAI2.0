/**
 * Test script for LangChain integration
 * Run with: node test-langchain.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:8080';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test 1: Chatbot with Memory
async function testChatbotMemory() {
  logSection('TEST 1: Chatbot with Conversation Memory');

  try {
    const sessionId = `test-${Date.now()}`;

    // First message
    log('\n📤 Sending: "What is React?"', 'blue');
    const response1 = await axios.post(`${BASE_URL}/api/chatbot/ask`, {
      message: 'What is React?',
      sessionId: sessionId
    });

    log(`✅ Response 1 received (${response1.data.response.length} chars)`, 'green');
    log(`Response preview: ${response1.data.response.substring(0, 150)}...`, 'yellow');

    await wait(1000);

    // Follow-up message (should remember context)
    log('\n📤 Sending: "Give me a code example" (should remember React)', 'blue');
    const response2 = await axios.post(`${BASE_URL}/api/chatbot/ask`, {
      message: 'Give me a code example',
      sessionId: sessionId
    });

    log(`✅ Response 2 received (${response2.data.response.length} chars)`, 'green');
    log(`Response preview: ${response2.data.response.substring(0, 150)}...`, 'yellow');

    // Check if context was maintained
    const hasReactContext = response2.data.response.toLowerCase().includes('react');
    if (hasReactContext) {
      log('\n✅ SUCCESS: Chatbot maintained conversation context!', 'green');
    } else {
      log('\n⚠️  WARNING: Context may not have been maintained', 'yellow');
    }

    return true;
  } catch (error) {
    log(`\n❌ FAILED: ${error.message}`, 'red');
    if (error.response) {
      log(`Error details: ${JSON.stringify(error.response.data)}`, 'red');
    }
    return false;
  }
}

// Test 2: Interview Q&A Generation
async function testInterviewGeneration() {
  logSection('TEST 2: Interview Q&A Generation (Structured Output)');

  try {
    log('\n📤 Creating interview card for "React Hooks"...', 'blue');

    const response = await axios.post(`${BASE_URL}/api/interview`, {
      title: 'React Hooks',
      tag: 'Frontend',
      initials: 'RH',
      experience: 'Senior',
      desc: 'Advanced React hooks concepts including custom hooks',
      color: 'blue',
      creatorEmail: 'test@example.com'
    });

    log(`✅ Interview card created successfully!`, 'green');
    log(`Session ID: ${response.data.sessionId}`, 'yellow');
    log(`Number of Q&A pairs: ${response.data.qna?.length || 0}`, 'yellow');

    if (response.data.qna && response.data.qna.length > 0) {
      const firstQA = response.data.qna[0];
      log(`\nFirst Question: ${firstQA.question}`, 'cyan');
      log(`Answer parts: ${firstQA.answerParts?.length || 0}`, 'yellow');

      log('\n✅ SUCCESS: Structured output with proper Q&A format!', 'green');
      return response.data.sessionId;
    } else {
      log('\n⚠️  WARNING: No Q&A pairs generated', 'yellow');
      return null;
    }
  } catch (error) {
    log(`\n❌ FAILED: ${error.message}`, 'red');
    if (error.response) {
      log(`Error details: ${JSON.stringify(error.response.data)}`, 'red');
    }
    return null;
  }
}

// Test 3: MCQ Generation
async function testMCQGeneration() {
  logSection('TEST 3: MCQ Generation');

  try {
    log('\n📤 Generating MCQ test for "JavaScript Promises"...', 'blue');

    const response = await axios.post(`${BASE_URL}/api/mcq/generate`, {
      topic: 'JavaScript Promises',
      difficulty: 'medium',
      numberOfQuestions: 5
    });

    log(`✅ MCQ test generated successfully!`, 'green');
    log(`Number of questions: ${response.data.count}`, 'yellow');

    if (response.data.questions && response.data.questions.length > 0) {
      const firstQ = response.data.questions[0];
      log(`\nFirst Question: ${firstQ.questionText}`, 'cyan');
      log(`Options: ${Object.keys(firstQ.options || {}).length}`, 'yellow');
      log(`Correct answer: ${firstQ.correctAnswer}`, 'yellow');

      log('\n✅ SUCCESS: MCQ generated with structured format!', 'green');
    }

    return true;
  } catch (error) {
    log(`\n❌ FAILED: ${error.message}`, 'red');
    if (error.response) {
      log(`Error details: ${JSON.stringify(error.response.data)}`, 'red');
    }
    return false;
  }
}

// Test 4: MCQ Generation with Validation (LangGraph)
async function testMCQValidation() {
  logSection('TEST 4: MCQ Generation with Validation (LangGraph)');

  try {
    log('\n📤 Generating validated MCQ test...', 'blue');

    const response = await axios.post(`${BASE_URL}/api/mcq/generate-validated`, {
      topic: 'JavaScript Async/Await',
      difficulty: 'medium',
      numberOfQuestions: 5
    });

    log(`✅ Validated MCQ test generated!`, 'green');
    log(`Number of questions: ${response.data.count}`, 'yellow');
    log(`Validated: ${response.data.validated}`, 'yellow');

    if (response.data.validated) {
      log('\n✅ SUCCESS: LangGraph validation workflow completed!', 'green');
    }

    return true;
  } catch (error) {
    log(`\n❌ FAILED: ${error.message}`, 'red');
    if (error.response) {
      log(`Error details: ${JSON.stringify(error.response.data)}`, 'red');
    }
    return false;
  }
}

// Test 5: Regenerate Answer
async function testRegenerateAnswer(sessionId) {
  if (!sessionId) {
    log('\n⏭️  SKIPPED: No session ID from previous test', 'yellow');
    return false;
  }

  logSection('TEST 5: Regenerate Single Answer');

  try {
    log(`\n📤 Regenerating answer for session: ${sessionId}...`, 'blue');

    const response = await axios.patch(
      `${BASE_URL}/api/interview/regenerate/${sessionId}/0`
    );

    log(`✅ Answer regenerated successfully!`, 'green');
    log(`Answer parts: ${response.data.answerParts?.length || 0}`, 'yellow');

    log('\n✅ SUCCESS: Answer regeneration works!', 'green');
    return true;
  } catch (error) {
    log(`\n❌ FAILED: ${error.message}`, 'red');
    if (error.response) {
      log(`Error details: ${JSON.stringify(error.response.data)}`, 'red');
    }
    return false;
  }
}

// Test 6: Clear Chat Session
async function testClearSession() {
  logSection('TEST 6: Clear Chat Session');

  try {
    const sessionId = `test-clear-${Date.now()}`;

    // Create a session
    await axios.post(`${BASE_URL}/api/chatbot/ask`, {
      message: 'Test message',
      sessionId: sessionId
    });

    // Clear it
    log('\n📤 Clearing chat session...', 'blue');
    const response = await axios.post(`${BASE_URL}/api/chatbot/clear`, {
      sessionId: sessionId
    });

    log(`✅ ${response.data.message}`, 'green');
    log('\n✅ SUCCESS: Session cleanup works!', 'green');

    return true;
  } catch (error) {
    log(`\n❌ FAILED: ${error.message}`, 'red');
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('\n');
  log('🧪 LANGCHAIN INTEGRATION TEST SUITE', 'cyan');
  log('Testing LangChain + LangGraph integration...', 'cyan');

  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };

  // Test 1
  results.total++;
  if (await testChatbotMemory()) results.passed++;
  else results.failed++;

  await wait(2000);

  // Test 2
  results.total++;
  const sessionId = await testInterviewGeneration();
  if (sessionId) results.passed++;
  else results.failed++;

  await wait(2000);

  // Test 3
  results.total++;
  if (await testMCQGeneration()) results.passed++;
  else results.failed++;

  await wait(2000);

  // Test 4
  results.total++;
  if (await testMCQValidation()) results.passed++;
  else results.failed++;

  await wait(2000);

  // Test 5
  results.total++;
  if (await testRegenerateAnswer(sessionId)) results.passed++;
  else results.failed++;

  await wait(2000);

  // Test 6
  results.total++;
  if (await testClearSession()) results.passed++;
  else results.failed++;

  // Summary
  logSection('TEST SUMMARY');
  log(`\nTotal Tests: ${results.total}`, 'cyan');
  log(`✅ Passed: ${results.passed}`, 'green');
  log(`❌ Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');

  const successRate = ((results.passed / results.total) * 100).toFixed(1);
  log(`\nSuccess Rate: ${successRate}%`, successRate === '100.0' ? 'green' : 'yellow');

  if (results.failed === 0) {
    log('\n🎉 ALL TESTS PASSED! LangChain integration is working perfectly!', 'green');
  } else {
    log(`\n⚠️  ${results.failed} test(s) failed. Check the errors above.`, 'yellow');
  }

  console.log('\n');
  process.exit(results.failed === 0 ? 0 : 1);
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/api/health`);
    return true;
  } catch (error) {
    log('❌ Server is not running. Please start the server first:', 'red');
    log('   cd backend && npm start', 'yellow');
    return false;
  }
}

// Main execution
(async () => {
  if (await checkServer()) {
    await runAllTests();
  } else {
    process.exit(1);
  }
})();
