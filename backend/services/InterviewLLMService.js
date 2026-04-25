const OpenAI = require('openai');

class InterviewLLMService {
    constructor() {
        const apiKey = process.env.OPENAI_API_KEY;
        const isOpenRouter = apiKey?.startsWith('sk-or-');

        this.openai = new OpenAI({
            apiKey: apiKey,
            baseURL: isOpenRouter ? 'https://openrouter.ai/api/v1' : undefined,
        });

        this.systemPrompt = "You are a professional interviewer."; // Default, will be overridden
        this.chatHistory = [];

        this.interviewTerms = [
            'interview', 'candidate', 'experience', 'project', 'resume', 'role',
            'architecture', 'debug', 'design', 'api', 'database', 'frontend', 'backend',
            'challenge', 'tradeoff', 'result', 'impact', 'technology', 'system'
        ];

        this.offTopicTerms = [
            'celebrity', 'movie', 'song', 'cricket', 'football', 'astrology', 'horoscope',
            'politics', 'religion', 'gossip', 'dating', 'romance', 'lottery', 'betting'
        ];
    }

    isLikelyOffTopic(reply = '') {
        const text = reply.toLowerCase();
        const hasInterviewContext = this.interviewTerms.some((term) => text.includes(term));
        const hasOffTopicSignal = this.offTopicTerms.some((term) => text.includes(term));
        return hasOffTopicSignal && !hasInterviewContext;
    }

    enforceInterviewFocus(reply = '') {
        let safeReply = (reply || '').toString().trim();

        if (!safeReply) {
            return "Let's stay focused on the interview. Can you describe one recent project, your exact contribution, and the measurable outcome?";
        }

        if (this.isLikelyOffTopic(safeReply)) {
            return "Let's keep this interview focused on your professional experience. Can you explain a recent project using Situation, Task, Action, and Result, including the technologies you used and the measurable impact?";
        }

        // Keep the interviewer in question-driven mode.
        if (!safeReply.includes('?')) {
            safeReply = `${safeReply} Can you walk me through your thought process and the exact steps you took?`;
        }

        return safeReply;
    }

    /**
     * Initialize the interview context
     * @param {string} systemMessage - The initial prompt defining the interviewer persona and questions
     */
    initialize(systemMessage) {
        const guardrails = `
INTERVIEW GUARDRAILS:
* Never invent facts about the candidate.
* Stay strictly within interview context: candidate experience, projects, resume, role fit, and technical problem-solving.
* Do not discuss entertainment, politics, personal gossip, or unrelated topics.
* Require specifics: technologies used, exact responsibilities, tradeoffs, and measurable outcomes.
* If the response is generic, scripted, or polished without detail, ask a follow-up that demands context-specific evidence.
* Compare answers against the resume summary, job role, and earlier answers. If there is a mismatch, ask for clarification.
* Focus on process, not only final results.
* Use STAR only as a structure for the candidate's answer. Do not narrate the story for them.
* Refuse harmful, abusive, sexually explicit, or inappropriate content and redirect to the interview topic.
* If the candidate appears to be misrepresenting skills or using AI to fabricate experience, challenge the claim with targeted verification questions.
* If any answer is unsafe or highly inappropriate, treat it as a session-level violation.
`;

        this.systemPrompt = `${systemMessage}\n${guardrails}`;
        this.chatHistory = [
            { role: "system", content: this.systemPrompt }
        ];
    }

    /**
     * Generate a response from the LLM
     * @param {string} userMessage - The candidate's answer
     * @returns {Promise<string>} - The interviewer's response
     */
    async generateResponse(userMessage) {
        this.chatHistory.push({ role: "user", content: userMessage });

        try {
            const completion = await this.openai.chat.completions.create({
                model: "gpt-4o-mini", // Cost-effective and fast
                messages: this.chatHistory,
                max_tokens: 250, // Keep responses relatively concise
                temperature: 0.7,
            });

            const rawReply = completion.choices[0].message.content;
            const reply = this.enforceInterviewFocus(rawReply);
            this.chatHistory.push({ role: "assistant", content: reply });
            return reply;
        } catch (error) {
            console.error("OpenAI Error:", error);
            return "I apologize, I'm having trouble processing that. Could you please repeat?";
        }
    }
}

module.exports = InterviewLLMService;
