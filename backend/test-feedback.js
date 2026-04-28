require('dotenv').config();
const { generateInterviewFeedback } = require('./utils/gemini');

const fakeInterview = {
    interviewType: "Technical",
    difficulty: "Intermediate",
    focusArea: "React.js and Node.js",
    degree: "B.Tech in Computer Science",
    skills: "JavaScript, React, Node.js, Express",
    mockInterviewResult: [
        {
            question: "Can you explain the virtual DOM in React?",
            correctAnswer: "The virtual DOM is a lightweight copy of the real DOM. React uses it to diff changes and efficiently update the real DOM only where necessary."
        },
        {
            question: "How does Node.js handle concurrency despite being single-threaded?",
            correctAnswer: "Node.js uses the event loop and asynchronous, non-blocking I/O (often leaning on libuv) to handle multiple concurrent operations."
        }
    ]
};

const fakeTranscript = [
    { role: 'interviewer', text: "Can you explain the virtual DOM in React?" },
    { role: 'user', text: "Um, it's like a fake HTML tree that React creates. I think it makes things fast because it doesn't change the actual webpage until it needs to." },
    { role: 'interviewer', text: "How does Node.js handle concurrency despite being single-threaded?" },
    { role: 'user', text: "Node uses an event loop. It just waits for things to finish in the background so it doesn't block the main thread." }
];

async function testFeedback() {
    console.log("=== Starting Mock Interview Feedback Test ===");
    console.log("Testing with Candidate: B.Tech, React/Node.js skills");
    console.log("Generating AI Feedback using the deeply honest FAANG hiring manager persona...");

    try {
        const start = Date.now();
        const feedback = await generateInterviewFeedback(fakeInterview, fakeTranscript);
        const end = Date.now();

        console.log(`\n=== FEEDBACK GENERATED in ${((end - start) / 1000).toFixed(2)}s ===\n`);
        console.log(JSON.stringify(feedback, null, 2));
    } catch (error) {
        console.error("Test failed:", error);
    }
}

testFeedback();