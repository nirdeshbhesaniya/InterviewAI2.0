const { RunnableSequence } = require('@langchain/core/runnables');
const {
  qaModel,
  chatbotModel,
  mcqModel,
  stringParser,
  qaParser,
  mcqParser,
  ChatPromptTemplate
} = require('./langchain-config');
const { BufferMemory } = require('langchain/memory');
const { ConversationChain } = require('langchain/chains');

// ============================================
// 1. INTERVIEW Q&A GENERATION CHAIN
// ============================================

const interviewQAPrompt = ChatPromptTemplate.fromMessages([
  ['system', `You are an expert technical interviewer. Generate structured interview questions with detailed, comprehensive answers.
Your answers should include:
- Clear explanations
- Code examples wrapped in triple backticks with language identifiers
- Best practices and common pitfalls
- Real-world applications

{format_instructions}`],
  ['human', `Generate {numberOfQuestions} structured technical interview questions on the topic "{title}" under the tag [{tag}], tailored for a candidate with {experience} of experience.

For each question:
1. Create a challenging, relevant question
2. Categorize it into a relevant subtopic (e.g., "Core Concepts", "Best Practices", "Advanced")
3. Provide a detailed answer in markdown format
4. Include code blocks where appropriate (use \`\`\`language syntax)
5. Add bullet points for key concepts`]
]);

const { RunnableLambda } = require("@langchain/core/runnables");

async function createInterviewQAChain() {
  const chain = RunnableSequence.from([
    {
      title: (input) => input.title,
      tag: (input) => input.tag,
      experience: (input) => input.experience,
      numberOfQuestions: (input) => input.numberOfQuestions || 5,
      format_instructions: () => qaParser.getFormatInstructions()
    },
    interviewQAPrompt,
    qaModel.bind({ response_format: { type: "json_object" } }),
    // Custom cleaning function to handle markdown blocks
    new RunnableLambda({
      func: (output) => {
        // Output is AIMessage (or string depending on model). content property holds the string.
        let text = typeof output === 'string' ? output : output.content;

        // Strip markdown code blocks if present
        if (text.trim().startsWith('```')) {
          text = text.replace(/^```(json)?/, '').replace(/```$/, '').trim();
        }
        return text;
      }
    }),
    qaParser
  ]);

  return chain;
}

// ============================================
// 2. SINGLE ANSWER GENERATION CHAIN
// ============================================

const answerPrompt = ChatPromptTemplate.fromMessages([
  ['system', 'You are a senior technical interviewer helping candidates prepare for interviews. Provide detailed, well-structured answers.'],
  ['human', `Generate a comprehensive, technical answer for this interview question:

Question: "{question}"
Topic: "{title}" [{tag}]
Experience Level: {experience}

Include:
- Clear explanations with examples
- Code blocks (use \`\`\`language syntax) where relevant
- Best practices
- Common mistakes to avoid

Provide your answer in markdown format.`]
]);

async function createAnswerChain() {
  const chain = RunnableSequence.from([
    answerPrompt,
    qaModel,
    stringParser
  ]);

  return chain;
}

// ============================================
// 3. MCQ GENERATION CHAIN
// ============================================

const mcqPrompt = ChatPromptTemplate.fromMessages([
  ['system', `You are an expert at creating diverse, high-quality multiple-choice questions for technical assessments.
Create UNIQUE questions that test real understanding, not just memorization.`],
  ['human', `Generate exactly {numberOfQuestions} UNIQUE and VARIED multiple-choice questions about "{topic}" with {difficulty} difficulty level.

Session ID for uniqueness: {sessionId}
Focus areas: {focusAreas}

REQUIREMENTS:
- Create DIVERSE question types (syntax, debugging, output prediction, best practices)
- Cover different aspects of {topic}
- Include at least 40% questions with code examples
- Use clean, properly formatted code blocks
- Progressive difficulty distribution

Format each question exactly as:
QUESTION_NUMBER. [Question text]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
CORRECT: [A/B/C/D]
EXPLANATION: [Brief explanation]

---`]
]);

async function createMCQChain() {
  const chain = RunnableSequence.from([
    {
      topic: (input) => input.topic,
      difficulty: (input) => input.difficulty || 'medium',
      numberOfQuestions: (input) => input.numberOfQuestions || 10, // Reduced default from 30 to 10
      sessionId: (input) => `${Math.floor(Math.random() * 100000)}-${Date.now()}`,
      focusAreas: (input) => {
        const areas = [
          'recent industry trends', 'practical scenarios', 'edge cases',
          'optimization techniques', 'debugging challenges', 'best practices',
          'common pitfalls', 'advanced concepts', 'real-world applications',
          'performance considerations'
        ];
        return areas.sort(() => Math.random() - 0.5).slice(0, 4).join(', ');
      }
    },
    mcqPrompt,
    mcqModel, // Use optimized MCQ model
    stringParser
  ]);

  return chain;
}

// ============================================
// 4. CONVERSATIONAL CHATBOT CHAIN
// ============================================

async function createChatbotChain(sessionId = 'default') {
  const memory = new BufferMemory({
    returnMessages: true,
    memoryKey: 'history',
    inputKey: 'input'
  });

  const chatPrompt = ChatPromptTemplate.fromMessages([
    ['system', `You are an expert Interview AI Assistant specializing in:
- Technical interview preparation (coding, algorithms, system design)
- Behavioral interview guidance (STAR method, leadership examples)
- Resume and profile optimization
- Salary negotiation strategies
- Industry-specific interview tips
- Mock interview practice

Provide short, concise, and easily understandable advice. Avoid long paragraphs. Use simple language. Use markdown formatting including:
- Code blocks with language identifiers
- Bullet points for lists
- Bold/italic for emphasis
- Headers for sections`],
    ['placeholder', '{history}'],
    ['human', '{input}']
  ]);

  const chain = new ConversationChain({
    llm: chatbotModel,
    memory: memory,
    prompt: chatPrompt
  });

  return chain;
}

// ============================================
// 5. TEXT SUMMARIZATION CHAIN
// ============================================

const summarizePrompt = ChatPromptTemplate.fromMessages([
  ['system', 'You are a helpful assistant that creates concise, informative summaries while preserving key technical details.'],
  ['human', 'Summarize the following technical answer in 2-3 sentences, preserving the most important concepts:\n\n"{text}"']
]);

async function createSummarizeChain() {
  const chain = RunnableSequence.from([
    summarizePrompt,
    chatbotModel,
    stringParser
  ]);

  return chain;
}

// ============================================
// 6. GENERATE MORE QUESTIONS CHAIN
// ============================================

const moreQuestionsPrompt = ChatPromptTemplate.fromMessages([
  ['system', 'You are a senior technical interviewer creating diverse interview questions with detailed answers.'],
  ['human', `Generate 3 additional unique technical interview questions with detailed answers on "{topic}" (Context: {title} [{tag}]) for a candidate with {experience} experience.

REQUIREMENTS:
- Questions should be different from typical/common questions
- Focus specifically on "{topic}" if provided, otherwise broadly on the main title
- Include clear explanations
- Add code blocks where relevant (use \`\`\`language syntax)
- Cover different aspects of the topic

Format:
QUESTION 1: [question text]
ANSWER 1: [detailed answer with markdown]

QUESTION 2: [question text]
ANSWER 2: [detailed answer with markdown]

QUESTION 3: [question text]
ANSWER 3: [detailed answer with markdown]`]
]);

async function createMoreQuestionsChain() {
  const chain = RunnableSequence.from([
    {
      title: (input) => input.title,
      tag: (input) => input.tag,
      experience: (input) => input.experience,
      topic: (input) => input.topic || input.title // Use specific topic or fallback to title
    },
    moreQuestionsPrompt,
    qaModel,
    stringParser
  ]);

  return chain;
}

module.exports = {
  createInterviewQAChain,
  createAnswerChain,
  createMCQChain,
  createChatbotChain,
  createSummarizeChain,
  createMoreQuestionsChain
};
