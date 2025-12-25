const { ChatOpenAI } = require('@langchain/openai');
const { PromptTemplate, ChatPromptTemplate } = require('@langchain/core/prompts');
const { StringOutputParser, StructuredOutputParser } = require('@langchain/core/output_parsers');
const { z } = require('zod');

// Detect if using OpenRouter
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const isOpenRouter = OPENAI_API_KEY?.startsWith('sk-or-v1');

// Initialize LangChain OpenAI client
const chatModel = new ChatOpenAI({
  openAIApiKey: OPENAI_API_KEY,
  modelName: isOpenRouter ? 'openai/gpt-4o-mini' : 'gpt-4o-mini',
  temperature: 0.7,
  configuration: isOpenRouter ? {
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': 'https://interview-ai.app',
      'X-Title': 'Interview AI'
    }
  } : {}
});

// Create different model instances for different use cases
const qaModel = new ChatOpenAI({
  openAIApiKey: OPENAI_API_KEY,
  modelName: isOpenRouter ? 'openai/gpt-4o-mini' : 'gpt-4o-mini',
  temperature: 0.7,
  configuration: isOpenRouter ? {
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': 'https://interview-ai.app',
      'X-Title': 'Interview AI'
    }
  } : {}
});

const chatbotModel = new ChatOpenAI({
  openAIApiKey: OPENAI_API_KEY,
  modelName: isOpenRouter ? 'openai/gpt-4o-mini' : 'gpt-4o-mini',
  temperature: 0.8,
  configuration: isOpenRouter ? {
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': 'https://interview-ai.app',
      'X-Title': 'Interview AI'
    }
  } : {}
});

// Optimized model for fast MCQ generation
const mcqModel = new ChatOpenAI({
  openAIApiKey: OPENAI_API_KEY,
  modelName: isOpenRouter ? 'openai/gpt-4o-mini' : 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 12000, // Increased for batch generation
  configuration: isOpenRouter ? {
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': 'https://interview-ai.app',
      'X-Title': 'Interview AI'
    }
  } : {}
});

// Output Parsers
const stringParser = new StringOutputParser();

// Structured output parser for Q&A
const qaSchema = z.object({
  questions: z.array(z.object({
    question: z.string().describe('The interview question'),
    answer: z.string().describe('Detailed answer in markdown format'),
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
