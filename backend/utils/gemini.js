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

/**
 * Extract a structured candidate profile from raw resume PDF text.
 * Uses OpenRouter (OpenAI models) to parse and organize the information.
 * Returns an empty object on failure so interviews still work without a resume.
 *
 * @param {string} rawText - Raw text extracted from the PDF by pdf-parse
 * @returns {Promise<Object>} Structured candidate profile
 */
async function extractResumeProfile(rawText) {
  console.log(`[ResumeParser] Received rawText with length: ${rawText?.length || 0}`);

  if (!rawText || rawText.trim().length < 50) {
    console.warn(`[ResumeParser] rawText is too short (< 50 chars). The PDF might be image-based or empty. Skipping extraction.`);
    return {};
  }

  // Trim to avoid token overflows (max ~6000 chars of resume text)
  const trimmedText = rawText.trim().substring(0, 6000);

  const systemPrompt = `You are an expert resume parser. You always respond with ONLY valid JSON objects.`;

  const userPrompt = `Extract structured information from the following resume text.

Return ONLY a JSON object following this exact schema:
{
  "summary": "A 2-3 sentence professional summary of the candidate",
  "education": ["B.Tech CSE from XYZ University (2024)", "..."],
  "skills": ["React", "Node.js", "MongoDB", "..."],
  "projects": [
    {
      "title": "Project Name",
      "description": "Brief description of the project",
      "technologies": ["React", "Node.js"]
    }
  ],
  "workExperience": [
    {
      "company": "Company Name",
      "role": "Software Engineer Intern",
      "duration": "Jan 2024 – Jun 2024",
      "highlights": ["Built REST APIs", "Improved performance by 30%"]
    }
  ],
  "certifications": ["AWS Certified Developer", "..."]
}

Rules:
- If a field has no information, use an empty array [] or empty string ""
- Do NOT invent information not present in the resume

RESUME TEXT:
${trimmedText}`;

  try {
    const { content } = await generateWithFallback(QA_MODEL_PREFERENCES, systemPrompt, userPrompt);
    console.log(`[ResumeParser] OpenRouter response length: ${content.length}`);

    const extractFirstJsonObject = (text) => {
      const start = text.indexOf('{');
      if (start === -1) return '';

      let depth = 0;
      let inString = false;
      let escaped = false;

      for (let i = start; i < text.length; i += 1) {
        const ch = text[i];

        if (inString) {
          if (escaped) {
            escaped = false;
            continue;
          }
          if (ch === '\\') {
            escaped = true;
            continue;
          }
          if (ch === '"') {
            inString = false;
          }
          continue;
        }

        if (ch === '"') {
          inString = true;
          continue;
        }

        if (ch === '{') depth += 1;
        if (ch === '}') {
          depth -= 1;
          if (depth === 0) {
            return text.slice(start, i + 1);
          }
        }
      }

      return '';
    };

    const jsonString = extractFirstJsonObject(content);
    if (!jsonString) {
      throw new Error('No JSON object found in the AI response');
    }

    const profile = JSON.parse(jsonString);
    console.log('[ResumeParser] Successfully extracted candidate profile via OpenRouter.');
    return profile;

  } catch (err) {
    console.error('[ResumeParser] Failed to extract profile from resume:', err.message);
    return {}; // Graceful degradation — interview still works
  }
}


/**
 * Generate mock interview questions via OpenRouter (OpenAI-compatible).
 * Returns a strict JSON array of question objects.
 */
async function generateMockInterviewData(skills, degree, interviewType, difficulty, focusArea, questionCount = 5, options = {}) {
  const {
    jobRole = 'General',
    jobExperience = 0,
    resumeContext = '',
    candidateProfile = null,
    branch = 'computer'
  } = options;

  const profileSkills = Array.isArray(candidateProfile?.skills) ? candidateProfile.skills.join(', ') : '';
  const profileProjects = Array.isArray(candidateProfile?.projects)
    ? candidateProfile.projects
      .slice(0, 3)
      .map((p) => {
        const tech = Array.isArray(p?.technologies) && p.technologies.length
          ? ` (${p.technologies.join(', ')})`
          : '';
        return `${p?.title || 'Project'}${tech}${p?.description ? `: ${p.description}` : ''}`;
      })
      .join(' | ')
    : '';

  const profileExperience = Array.isArray(candidateProfile?.workExperience)
    ? candidateProfile.workExperience
      .slice(0, 2)
      .map((w) => `${w?.role || 'Role'} at ${w?.company || 'Company'}${w?.duration ? ` (${w.duration})` : ''}`)
      .join(' | ')
    : '';

  const condensedResumeContext = String(resumeContext || '').slice(0, 1200);

  const systemPrompt = `You are an expert technical interviewer. You always respond with ONLY valid JSON arrays — no markdown, no explanation, no code fences.`;

  const userPrompt = `Generate exactly ${questionCount} ${difficulty}-level ${interviewType} interview questions for a candidate with the following profile:
- Degree: ${degree}
- Branch: ${branch} Engineering
- Skills: ${skills}
- Job Role: ${jobRole}
- Experience: ${jobExperience} years
- Focus Area: ${focusArea}

Make sure to heavily tailor the technical questions to standard concepts, theory, and practical applications specific to the **${branch} Engineering** branch. Use the resume-derived context below to personalize questions when available. At least 2 questions should reference the candidate's real project/work details if present.

RESUME SUMMARY CONTEXT:
${condensedResumeContext || 'N/A'}

STRUCTURED RESUME SIGNALS:
- Resume Skills: ${profileSkills || 'N/A'}
- Resume Projects: ${profileProjects || 'N/A'}
- Resume Work Experience: ${profileExperience || 'N/A'}

Return ONLY a JSON array following this exact schema (no markdown, no fences):
[
  {
    "question": "The interview question text",
    "ideal_answer": "A concise ideal answer for evaluation reference"
  }
]

Generate exactly ${questionCount} items. Return ONLY the JSON array.`;

  try {
    const { content } = await generateWithFallback(QA_MODEL_PREFERENCES, systemPrompt, userPrompt);

    // Strip any accidental markdown fences
    const jsonString = content
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const questions = JSON.parse(jsonString);

    if (!Array.isArray(questions)) {
      throw new Error('Model did not return a valid JSON array');
    }

    console.log(`[MockInterview] Generated ${questions.length} questions via OpenRouter.`);
    return questions;

  } catch (err) {
    console.error('[MockInterview] generateMockInterviewData failed:', err.message);
    throw err;
  }
}

/**
 * Generate overall interview feedback from transcript via OpenRouter (OpenAI-compatible).
 * Returns per-question feedback, overall score, and improvement suggestions.
 */
async function generateInterviewFeedback(interview, transcript) {
  // Format transcript into readable text
  const transcriptText = Array.isArray(transcript)
    ? transcript.map(t => `${t.role === 'user' ? 'Candidate' : 'Interviewer'}: ${t.text}`).join('\n')
    : String(transcript || '');

  // Format reference questions with ideal answers
  const questionsList = (interview.mockInterviewResult || [])
    .map((q, i) => `Q${i + 1}: ${q.question}\nIdeal Answer: ${q.correctAnswer || 'N/A'}`)
    .join('\n\n');

  // Candidate context for better analysis
  const candidateSkills = interview.skills || '';
  const candidateDegree = interview.degree || '';
  const focusArea = interview.focusArea || '';

  const systemPrompt = `You are a strict, highly experienced Principal Engineering Manager and Elite Interview Coach from a top-tier tech company (like Google, Meta, or NVIDIA). 
Your goal is to provide deeply professional, industrial-grade evaluation and feedback that simulates a real-world interview debrief.
Your feedback must be:
1. **Critical & Professional**: Do not use generic praise. If an answer is standard, call it standard. If it lacks depth, explain the missing technical nuances.
2. **Actionable & Specific**: Every piece of feedback should reference a specific moment or concept from the transcript.
3. **Realistic Scoring**: Score as if you were deciding whether to hire this person for a $150k+/year role. Be conservative with high scores.
4. **Polished "Rewritten" Answers**: The "rewrittenAnswer" should be exactly what an elite candidate would say—concise, structured, and technically profound.
You always respond with ONLY valid JSON objects — no markdown, no explanation, no html tags, no code fences.`;

  const userPrompt = `Perform a comprehensive, critical evaluation of this ${interview.interviewType} interview (Difficulty: ${interview.difficulty}, Focus: ${focusArea}).

CANDIDATE PROFILE:
- Degree: ${candidateDegree}
- Skills: ${candidateSkills}
- Focus Area: ${focusArea}

REFERENCE QUESTIONS & IDEAL ANSWERS:
${questionsList}

FULL INTERVIEW TRANSCRIPT:
${transcriptText.substring(0, 8000)}

Analyze the transcript rigorously and return ONLY a valid JSON object with this exact schema (no markdown, no fences):
{
  "score": <number 0-100, overall performance percentage>,
  "overallSummary": "<4-5 sentence professional evaluation summary. Start with a clear 'Hire/No Hire' sentiment and explain the reasoning based on industry standards.>",
  "strengths": ["<Specific strength with evidence from transcript, e.g., 'Demonstrated deep understanding of CAP theorem during the system design question...'>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<Specific weakness with evidence, e.g., 'Failed to mention edge cases for the array manipulation logic...'>", "<weakness 2>", "<weakness 3>"],
  "improvements": ["<Specific architectural or behavioral tip>", "<tip 2>", "<tip 3>", "<tip 4>"],
  "communicationScore": <number 1-10, evaluate clarity, structural logic (STAR), and professional vocabulary>,
  "technicalScore": <number 1-10, evaluate depth, accuracy, and understanding of underlying principles>,
  "problemSolvingScore": <number 1-10, evaluate analytical path, edge case consideration, and optimization mindset>,
  "confidenceScore": <number 1-10, evaluate poise, delivery speed, and assertiveness>,
  "starMethodAdherence": <number 1-10, evaluate how well they used Situation-Task-Action-Result structure>,
  "skillGaps": [
    {
      "skill": "<Technical skill or concept, e.g., 'Microservices Orchestration'>",
      "level": "<Beginner|Intermediate|Advanced>",
      "recommendation": "<Specific book, documentation link, or practice project idea>"
    }
  ],
  "feedback": [
    {
      "question": "<first 50 chars of the question>",
      "userAnswer": "<Concise summary of their actual response>",
      "feedback": "<Professional hiring manager feedback. Explain *why* the answer would or wouldn't pass a technical screen at a top firm.>",
      "rating": <number 1-10>,
      "strengths": ["<specific win in this answer>"],
      "improvements": ["<specific technical or structural addition>"],
      "idealApproach": "<Explain the 'Senior Engineer' approach to this specific question in 2-3 sentences.>",
      "rewrittenAnswer": "<The 'Perfect Answer': Professional, structured, and technical version (3-5 sentences).>"
    }
  ],
  "overallRecommendations": [
    {
      "category": "<Technical|Communication|Behavioral|Problem Solving>",
      "tip": "<High-impact recommendation>",
      "priority": "<High|Medium|Low>"
    }
  ],
  "interviewReadiness": "<Not Ready|Needs More Practice|Almost Ready|Interview Ready|Exceptional>",
  "nextSteps": [
    "<Specific technical topic to master>",
    "<Specific behavioral pattern to practice>",
    "<Concrete action item>"
  ]
}

EVALUATION GUIDELINES:
- **Be Rigorous**: A 10/10 requires exceptional clarity and technical perfection. 
- **Reference Transcript**: Use phrases like "When you mentioned..." or "Your explanation of..." to make it feel real.
- **Scoring**: If transcript is empty or very short, scores MUST be 0-2.
- **Industry Standard**: Evaluate against expectations for top tech firms.
- **MUST Output ONLY raw JSON.**`;

  try {
    const { content } = await generateWithFallback(QA_MODEL_PREFERENCES, systemPrompt, userPrompt);

    // Strip any accidental markdown fences
    const jsonString = content
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const feedback = JSON.parse(jsonString);
    console.log(`[MockInterview] Generated enriched interview feedback. Score: ${feedback.score}, Readiness: ${feedback.interviewReadiness}`);
    return feedback;

  } catch (err) {
    console.error('[MockInterview] generateInterviewFeedback failed:', err.message);
    // Safe fallback — interview end flow never crashes
    return {
      score: 50,
      overallSummary: 'Feedback generation encountered an error. Please review your interview manually.',
      strengths: ['Completed the interview session'],
      weaknesses: ['Unable to analyze specific weaknesses due to processing error'],
      improvements: ['Review your answers for clarity', 'Practice technical explanations', 'Work on structured responses'],
      communicationScore: 5,
      technicalScore: 5,
      problemSolvingScore: 5,
      confidenceScore: 5,
      starMethodAdherence: 5,
      skillGaps: [],
      feedback: interview.mockInterviewResult?.map(q => ({
        question: q.question,
        userAnswer: "Error transcribing answer.",
        feedback: "Unable to generate detailed feedback.",
        rating: 5,
        strengths: ["Attempted question"],
        improvements: ["Try again later"],
        idealApproach: "Provide clear examples.",
        rewrittenAnswer: "NA"
      })) || [],
      overallRecommendations: [
        { category: 'Technical', tip: 'Practice explaining technical concepts clearly', priority: 'High' },
        { category: 'Communication', tip: 'Use the STAR method for behavioral questions', priority: 'Medium' }
      ],
      interviewReadiness: 'Needs More Practice',
      nextSteps: ['Retake this interview for a fresh assessment', 'Practice with different focus areas']
    };
  }
}

/**
 * Generate highly realistic job postings for a given role via Gemini/OpenRouter.
 * Returns a strict JSON object containing 'freshers' and 'experienced' arrays.
 */
async function generateJobs(role, branch = '') {
  const systemPrompt = `You are a professional IT Career Recruiter. You always respond with ONLY valid JSON objects — no markdown formatting, no code fences.`;

  const userPrompt = `Generate exactly 6 highly realistic, current job openings for the role of "${role}" in INDIA. 
The industry branch/domain for this role is "${branch} Engineering".
Split them into exactly 3 for 'freshers' (0-2 years experience) and 3 for 'experienced' (3+ years experience).
Make the company names ONLY top real Indian companies or MNCs that are highly relevant to the "${branch}" engineering sector. 
(For example: If Mechanical, use L&T, Tata Motors, Mahindra. If Electrical, use Tata Power, Adani Power. If Software, use TCS, Zomato, Google. If Civil, use L&T, Shapoorji. If Chemical, use Reliance, UPL, etc.).
For the applyUrl, DO NOT make up fake direct job URLs. Instead, provide the ACTUAL official career page root URL for that company (e.g., "https://www.tatamotors.com/careers" or "https://www.larsentoubro.com/corporate/careers/") so the user can genuinely search and apply there.

Return ONLY a JSON object following this exact schema:
{
  "freshers": [
    {
      "companyName": "TCS",
      "role": "${role} - Entry Level",
      "location": "Bangalore / Pune",
      "salary": "₹4L - ₹7L",
      "description": "Short 2-sentence description of the role.",
      "applyUrl": "https://www.tcs.com/careers"
    }
  ],
  "experienced": [
    {
      "companyName": "Zomato",
      "role": "Senior ${role}",
      "location": "Gurgaon",
      "salary": "₹25L - ₹40L",
      "description": "Short 2-sentence description of the senior role.",
      "applyUrl": "https://www.zomato.com/careers"
    }
  ]
}`;

  try {
    const { content } = await generateWithFallback(QA_MODEL_PREFERENCES, systemPrompt, userPrompt);

    // Strip any accidental markdown fences
    const jsonString = content
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const jobsData = JSON.parse(jsonString);
    if (!jobsData.freshers || !jobsData.experienced) {
      throw new Error('Invalid jobs schema returned by AI');
    }
    
    return jobsData;
  } catch (err) {
    console.error('[JobSearch] generateJobs failed:', err.message);
    throw err;
  }
}

module.exports = {
  generateInterviewQuestions,
  chatWithAI,
  generateAnswer,
  generateMoreQuestions,
  summarizeText,
  extractResumeProfile,
  generateMockInterviewData,
  generateInterviewFeedback,
  generateJobs
};
