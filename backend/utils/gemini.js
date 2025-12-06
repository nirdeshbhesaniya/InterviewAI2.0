const OpenAI = require('openai');

// Ensure API key is present early for clearer diagnostics
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error('[OpenAI] Missing OPENAI_API_KEY environment variable.');
}

// Detect if using OpenRouter (key starts with sk-or-v1)
const isOpenRouter = OPENAI_API_KEY?.startsWith('sk-or-v1');

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY || '',
  baseURL: isOpenRouter ? 'https://openrouter.ai/api/v1' : undefined,
  defaultHeaders: isOpenRouter ? {
    'HTTP-Referer': 'https://interview-ai.app',
    'X-Title': 'Interview AI'
  } : undefined
});

// ChatGPT model preferences (use OpenRouter models if detected)
const CHAT_MODEL_PREFERENCES = isOpenRouter
  ? ['openai/gpt-4o-mini', 'openai/gpt-3.5-turbo']
  : ['gpt-4o-mini', 'gpt-3.5-turbo'];
const QA_MODEL_PREFERENCES = isOpenRouter
  ? ['openai/gpt-4o-mini', 'openai/gpt-3.5-turbo']
  : ['gpt-4o-mini', 'gpt-3.5-turbo'];

async function generateWithFallback(preferences, systemPrompt, userPrompt) {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY missing. Set it in your backend .env');
  }
  let lastErr;
  for (const modelId of preferences) {
    try {
      const completion = await openai.chat.completions.create({
        model: modelId,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error(`Empty response from model ${modelId}`);
      }

      return { content, usedModel: modelId };
    } catch (err) {
      lastErr = err;
      const status = err?.status || err?.response?.status;

      // Handle rate limits and try next model
      if (status === 429) {
        console.warn(`[OpenAI] Rate limit on model "${modelId}". Trying next...`);
        continue;
      }

      // Invalid API key or auth error
      if (status === 401) {
        console.error('[OpenAI] Invalid API key. Verify OPENAI_API_KEY in backend .env and restart server.');
        break;
      }

      // Model not found, try next
      if (status === 404) {
        console.warn(`[OpenAI] Model "${modelId}" not found. Trying next...`);
        continue;
      }

      // Other errors, stop trying
      console.warn(`[OpenAI] Error (status ${status}) on model "${modelId}".`);
      break;
    }
  }
  throw lastErr || new Error('All ChatGPT models failed');
}

// Clean markdown formatting artifacts
function cleanText(text) {
  return text
    .replace(/[*#@!$>]+/g, '') // Strip symbols
    .replace(/\n{3,}/g, '\n\n') // Normalize excessive line breaks
    .trim();
}

// Parse markdown answer into parts: text/code
function parseAnswer(answerText) {
  const lines = answerText.split('\n');
  const parts = [];

  let current = { type: 'text', content: '' };
  let isInCodeBlock = false;
  let codeLang = '';

  for (const line of lines) {
    const codeBlockMatch = line.trim().match(/^```(\w+)?/);

    if (codeBlockMatch) {
      // Toggle code block
      if (isInCodeBlock) {
        // End code block
        parts.push({
          type: 'code',
          content: current.content.trim(),
          language: codeLang || 'plaintext',
        });
        current = { type: 'text', content: '' };
        codeLang = '';
      } else {
        // Start code block
        if (current.content.trim()) {
          parts.push({
            type: 'text',
            content: cleanText(current.content),
          });
        }
        current = { type: 'code', content: '' };
        codeLang = codeBlockMatch[1] || 'plaintext';
      }

      isInCodeBlock = !isInCodeBlock;
    } else {
      current.content += line + '\n';
    }
  }

  if (current.content.trim()) {
    parts.push({
      type: isInCodeBlock ? 'code' : 'text',
      content: cleanText(current.content),
      ...(isInCodeBlock && { language: codeLang || 'plaintext' }),
    });
  }

  return parts;
}

// Generate Q&A from ChatGPT
async function generateInterviewQuestions(title, tag, experience, desc) {
  const systemPrompt = `You are an expert interviewer. Generate structured technical interview questions with detailed answers.`;

  const userPrompt = `Generate 5 structured technical interview questions on the topic **"${title}"** under the tag [${tag}], tailored for a candidate with **${experience}** of experience.

For each question:
- Use numbered formatting (e.g., 1. Question).
- Follow each question with a detailed answer in markdown format.
- Include bullet points, emphasis, and **code blocks** wrapped in triple backticks (e.g., \`\`\`js).

Strict formatting: 1 question per section.`;

  try {
    const { content, usedModel } = await generateWithFallback(QA_MODEL_PREFERENCES, systemPrompt, userPrompt);

    const qaSections = content
      .split(/\n(?=\d+\.\s)/) // Split on "1. Question"
      .filter(Boolean)
      .map((entry) => {
        const [qLine, ...aLines] = entry.trim().split('\n');
        const question = qLine.replace(/^\d+\.\s*/, '').trim();
        const answerText = aLines.join('\n').trim();

        return {
          question: cleanText(question),
          answerParts: parseAnswer(answerText),
        };
      });

    return qaSections;
  } catch (err) {
    if (err.status === 429) {
      console.warn('OpenAI API rate limit exceeded.');
    }
    console.error('ChatGPT generation failed:', err);
    throw err;
  }
}

// Chat with AI function
async function chatWithAI(userMessage, context = 'general') {
  let systemPrompt = '';

  switch (context) {
    case 'interview_preparation':
      systemPrompt = `You are an expert Interview AI Assistant specializing in:
- Technical interview preparation (coding, algorithms, system design)
- Behavioral interview guidance (STAR method, leadership examples)
- Resume and profile optimization
- Salary negotiation strategies
- Industry-specific interview tips
- Mock interview practice

Provide detailed, actionable advice with examples when appropriate. Use markdown formatting for better readability including code blocks, bullet points, and emphasis.`;
      break;
    default:
      systemPrompt = 'You are a helpful AI assistant. Provide clear and concise responses using markdown formatting.';
  }

  try {
    const { content } = await generateWithFallback(CHAT_MODEL_PREFERENCES, systemPrompt, userMessage);
    return content;
  } catch (error) {
    console.error('ChatGPT error:', error);
    throw new Error('Failed to generate AI response');
  }
}

// Generate a single detailed answer for a question
async function generateAnswer(question, title, tag, experience) {
  const systemPrompt = 'You are a senior technical interviewer helping candidates prepare for interviews.';
  const userPrompt = `Generate a detailed, technical answer for the interview question: "${question}" for the topic "${title}" [${tag}] aimed at a candidate with ${experience} experience. Include clear structure and code examples (wrapped in triple backticks with language identifier) if relevant.`;

  try {
    const { content } = await generateWithFallback(QA_MODEL_PREFERENCES, systemPrompt, userPrompt);
    return parseAnswer(content);
  } catch (error) {
    console.error('ChatGPT generateAnswer error:', error);
    throw new Error('Failed to generate answer');
  }
}

// Generate 3 more Q&A pairs
async function generateMoreQuestions(title, tag, experience) {
  const systemPrompt = 'You are a senior technical interviewer creating interview questions with detailed answers.';
  const userPrompt = `Generate 3 more technical interview questions with detailed answers on "${title}" [${tag}] for a candidate with ${experience} experience. 
Answers should include clear explanations and code blocks (wrapped in triple backticks with language identifier) if relevant. 

Format EXACTLY like this:
1. What is [technical concept]?
[Detailed answer with code examples if needed]

2. How does [another concept] work?
[Detailed answer with code examples if needed]

3. Explain [concept]?
[Detailed answer with code examples if needed]`;

  try {
    const { content } = await generateWithFallback(QA_MODEL_PREFERENCES, systemPrompt, userPrompt);

    // Parse the response into Q&A pairs
    const generatedQnA = content
      .split(/\n(?=\d+\.\s)/)
      .map((entry) => {
        const [qLine, ...aLines] = entry.trim().split('\n');
        const question = qLine.replace(/^\d+\.\s*/, '').trim();
        const answer = aLines.join('\n').trim();
        const answerParts = parseAnswer(answer);
        return { question, answerParts };
      })
      .filter((qa) => qa.question && qa.answerParts.length);

    return generatedQnA;
  } catch (error) {
    console.error('ChatGPT generateMoreQuestions error:', error);
    throw new Error('Failed to generate more questions');
  }
}

// Summarize text in 2-3 sentences
async function summarizeText(text) {
  const systemPrompt = 'You are a helpful assistant that creates concise summaries.';
  const userPrompt = `Summarize the following technical answer in 2-3 sentences:\n\n"${text}"`;

  try {
    const { content } = await generateWithFallback(CHAT_MODEL_PREFERENCES, systemPrompt, userPrompt);
    return content;
  } catch (error) {
    console.error('ChatGPT summarizeText error:', error);
    throw new Error('Failed to generate summary');
  }
}

module.exports = {
  generateInterviewQuestions,
  chatWithAI,
  generateAnswer,
  generateMoreQuestions,
  summarizeText
};
