const { PromptTemplate, ChatPromptTemplate } = require('@langchain/core/prompts');
const { StringOutputParser, StructuredOutputParser } = require('@langchain/core/output_parsers');
const { z } = require('zod');
const FailoverChatModel = require('./FailoverChatModel');

// ------------------------------------------------------------------
// NEW CONFIGURATION reusing Failover Logic
// ------------------------------------------------------------------

// Shared instance or factory could be used, but separate instances allow different metadata
const chatModel = new FailoverChatModel({ featureType: 'general' });

const qaModel = new FailoverChatModel({ featureType: 'interview' });

const chatbotModel = new FailoverChatModel({ featureType: 'chatbot' });

const mcqModel = new FailoverChatModel({ featureType: 'mcq' });

// ------------------------------------------------------------------
// OLD CONFIGURATION (Kept for reference or direct usage if needed)
/*
const { ChatOpenAI } = require('@langchain/openai');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const chatModel = new ChatOpenAI({...});
...
*/
// ------------------------------------------------------------------

// Output Parsers
const stringParser = new StringOutputParser();

// Structured output parser for Q&A
const qaSchema = z.object({
  questions: z.array(z.object({
    question: z.string().describe('The interview question'),
    answer: z.string().describe('Detailed answer in markdown format'),
    category: z.string().describe('The subtopic or category this question belongs to (e.g., "Basics", "Advanced", "Performance")'),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    topics: z.array(z.string()).optional()
  }))
});

const qaParser = StructuredOutputParser.fromZodSchema(qaSchema);

// MCQ Schema
const mcqSchema = z.object({
  questions: z.array(z.object({
    questionNumber: z.number(),
    questionText: z.string(),
    options: z.object({
      A: z.string(),
      B: z.string(),
      C: z.string(),
      D: z.string()
    }),
    correct: z.enum(['A', 'B', 'C', 'D']),
    explanation: z.string()
  }))
});

const mcqParser = StructuredOutputParser.fromZodSchema(mcqSchema);

module.exports = {
  chatModel,
  qaModel,
  chatbotModel,
  mcqModel,
  stringParser,
  qaParser,
  qaSchema,
  mcqParser,
  mcqSchema,
  PromptTemplate,
  ChatPromptTemplate
};
