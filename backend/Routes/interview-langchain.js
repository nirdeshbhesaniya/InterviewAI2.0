const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Interview = require('../Models/Interview');
const User = require('../Models/User');
const {
  createInterviewQAChain,
  createAnswerChain,
  createMoreQuestionsChain,
  createSummarizeChain
} = require('../utils/langchain-chains');
const { createInterviewPrepWorkflow } = require('../utils/langgraph-workflows');
const { sendOTPEmail } = require('../utils/emailService');

// Helper function to parse LangChain string output into Q&A format
function parseInterviewResponse(responseText) {
  const questions = [];

  // Split by QUESTION markers
  const questionBlocks = responseText.split(/QUESTION\s+\d+:/i).filter(Boolean);

  for (const block of questionBlocks) {
    // Split each block into question and answer
    const answerMatch = block.match(/^(.*?)\s*ANSWER\s+\d+:\s*([\s\S]*)/i);

    if (answerMatch) {
      // Replace all backticks in question with double quotes
      let question = answerMatch[1].trim().replace(/`/g, '"');
      const answer = answerMatch[2].trim();

      questions.push({
        question,
        answer
      });
    }
  }

  return questions;
}

// Helper function to parse answer text into parts (text/code blocks)
function parseAnswerIntoParts(answerText) {
  if (!answerText) return [];

  const parts = [];
  const lines = answerText.split('\n');

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
            content: current.content.trim(),
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
      content: current.content.trim(),
      ...(isInCodeBlock && { language: codeLang || 'plaintext' }),
    });
  }

  return parts;
}

// GET all cards
router.get('/', async (req, res) => {
  try {
    const cards = await Interview.find().sort({ createdAt: -1 });
    res.json(cards);
  } catch {
    res.status(500).json({ message: 'Failed to fetch cards' });
  }
});

// GET single card
router.get('/:sessionId', async (req, res) => {
  try {
    const card = await Interview.findOne({ sessionId: req.params.sessionId });
    if (!card) return res.status(404).json({ message: 'Card not found' });
    res.json(card);
  } catch {
    res.status(500).json({ message: 'Failed to fetch card' });
  }
});

// CHECK DUPLICATES
router.post('/check-duplicates', async (req, res) => {
  try {
    const { title, tag } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    // 1. Combine title and tags into a single text
    const searchText = `${title} ${tag || ''}`;

    // 2. Tokenize and clean (remove stopwords, short words)
    const stopWords = new Set(['the', 'and', 'for', 'with', 'interview', 'guide', 'prep', 'full', 'stack', 'developer', 'software', 'engineer']);
    const keywords = searchText
      .split(/[\s,.-]+/) // Split by delimiters
      .map(w => w.toLowerCase())
      .filter(w => w.length > 2 && !stopWords.has(w)); // Filter short & stop words

    // If no unique keywords found, fall back to simple title match
    if (keywords.length === 0) {
      const exactMatches = await Interview.find({
        title: { $regex: new RegExp(title, 'i') }
      }).select('sessionId title creatorDetails createdAt').limit(5);
      return res.json(exactMatches);
    }

    // 3. Construct $or query for matching ANY keyword in title OR tag
    const orConditions = keywords.map(keyword => ({
      $or: [
        { title: { $regex: new RegExp(keyword, 'i') } },
        { tag: { $regex: new RegExp(keyword, 'i') } }
      ]
    }));

    // Find documents matching ANY of the keyword conditions
    const duplicates = await Interview.find({
      $or: orConditions
    }).select('sessionId title creatorDetails createdAt initials color tag').limit(5);

    res.json(duplicates);
  } catch (err) {
    console.error('Error checking duplicates:', err);
    res.status(500).json({ message: 'Failed to check duplicates' });
  }
});

// CREATE card using LangChain
router.post('/', async (req, res) => {
  const { title, tag, initials, experience, desc, color, creatorEmail } = req.body;

  if (!title || !tag || !initials || !experience || !desc || !creatorEmail) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const sessionId = uuidv4();

    // Use LangChain chain to generate Q&A
    const qaChain = await createInterviewQAChain();
    const result = await qaChain.invoke({
      title,
      tag,
      experience,
      numberOfQuestions: 5
    });

    // Parse the response
    const parsedQuestions = result.questions;

    // Transform the structured output into the format expected by the database
    const qna = parsedQuestions.map((q) => ({
      question: q.question,
      category: q.category || 'General',
      answerParts: parseAnswerIntoParts(q.answer)
    }));

    // Fetch creator details
    const user = await User.findOne({ email: creatorEmail });
    const creatorDetails = user ? {
      fullName: user.fullName,
      email: user.email,
      photo: user.photo,
      bio: user.bio,
      location: user.location,
      website: user.website,
      linkedin: user.linkedin,
      github: user.github
    } : {};

    const newCard = new Interview({
      sessionId,
      title,
      tag,
      initials,
      experience,
      desc,
      color,
      creatorEmail,
      creatorDetails,
      qna
    });

    await newCard.save();
    res.status(201).json(newCard);
  } catch (err) {
    console.error('Error creating interview card:', err);
    res.status(500).json({ message: 'Failed to create card', error: err.message });
  }
});

// CREATE card using LangGraph Workflow (with validation)
router.post('/workflow', async (req, res) => {
  const { title, tag, initials, experience, desc, color, creatorEmail } = req.body;

  if (!title || !tag || !initials || !experience || !desc || !creatorEmail) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const sessionId = uuidv4();

    // Use LangGraph workflow for more sophisticated generation
    const workflow = await createInterviewPrepWorkflow();
    const result = await workflow.invoke({
      title,
      tag,
      experience,
      description: desc,
      needsRegeneration: []
    });

    if (result.error) {
      throw new Error(result.error);
    }

    // Parse and transform the output
    const parsedQuestions = result.questions || [];

    const qna = parsedQuestions.map((q) => ({
      question: q.question,
      category: q.category || 'General',
      answerParts: parseAnswerIntoParts(q.answer)
    }));

    // Fetch creator details
    const user = await User.findOne({ email: creatorEmail });
    const creatorDetails = user ? {
      fullName: user.fullName,
      email: user.email,
      photo: user.photo,
      bio: user.bio,
      location: user.location,
      website: user.website,
      linkedin: user.linkedin,
      github: user.github
    } : {};

    const newCard = new Interview({
      sessionId,
      title,
      tag,
      initials,
      experience,
      desc,
      color,
      creatorEmail,
      creatorDetails,
      qna
    });

    await newCard.save();
    res.status(201).json(newCard);
  } catch (err) {
    console.error('Error creating interview card with workflow:', err);
    res.status(500).json({ message: 'Failed to create card', error: err.message });
  }
});

// DELETE card
router.delete('/:sessionId', async (req, res) => {
  try {
    const deleted = await Interview.findOneAndDelete({ sessionId: req.params.sessionId });
    if (!deleted) return res.status(404).json({ message: 'Card not found' });
    res.json({ message: 'Card deleted' });
  } catch {
    res.status(500).json({ message: 'Failed to delete card' });
  }
});

// PATCH regenerate a single question's answer using LangChain
router.patch('/regenerate/:sessionId/:index', async (req, res) => {
  try {
    const { sessionId, index } = req.params;
    const card = await Interview.findOne({ sessionId });

    if (!card || !card.qna[index]) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const { title, tag, experience } = card;
    const question = card.qna[index].question;

    // Use LangChain to regenerate answer
    const answerChain = await createAnswerChain();
    const answerText = await answerChain.invoke({
      question,
      title,
      tag,
      experience
    });

    const answerParts = parseAnswerIntoParts(answerText);

    card.qna[index].answerParts = answerParts;
    await card.save();

    res.json({ answerParts });
  } catch (err) {
    console.error('Failed to regenerate answer:', err);
    res.status(500).json({ message: 'Failed to regenerate answer', error: err.message });
  }
});

// PATCH to manually edit a QnA block
router.patch('/edit/:sessionId/:index', async (req, res) => {
  try {
    const { sessionId, index } = req.params;
    const { question, answerParts } = req.body;

    const card = await Interview.findOne({ sessionId });
    if (!card || !card.qna[index]) {
      return res.status(404).json({ message: 'QnA not found' });
    }

    if (question) card.qna[index].question = question;
    if (answerParts) card.qna[index].answerParts = answerParts;

    await card.save();
    res.json(card.qna[index]);
  } catch (err) {
    console.error('Error updating QnA:', err);
    res.status(500).json({ message: 'Failed to update QnA' });
  }
});

// POST to generate more QnA using LangChain
router.post('/generate-more/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Interview.findOne({ sessionId });

    if (!session) return res.status(404).json({ message: 'Session not found' });

    // Use LangChain chain to generate more questions
    const moreQuestionsChain = await createMoreQuestionsChain();
    const responseText = await moreQuestionsChain.invoke({
      title: session.title,
      tag: session.tag,
      experience: session.experience
    });

    // Parse the response
    const parsedQuestions = parseInterviewResponse(responseText);

    // Transform the output
    const generatedQnA = parsedQuestions.map((q) => ({
      question: q.question,
      answerParts: parseAnswerIntoParts(q.answer)
    }));

    session.qna.push(...generatedQnA);
    await session.save();

    res.status(200).json({ qna: generatedQnA });
  } catch (err) {
    console.error("Generate more QnA error:", err);
    res.status(500).json({ message: 'Failed to generate more questions', error: err.message });
  }
});

// POST ask endpoint - generate answer for a question
router.post('/ask', async (req, res) => {
  try {
    const { question, title, tag, experience, sessionId, index } = req.body;

    // Use LangChain to generate answer
    const answerChain = await createAnswerChain();
    const answerText = await answerChain.invoke({
      question,
      title,
      tag,
      experience
    });

    const answerParts = parseAnswerIntoParts(answerText);

    // If sessionId and index provided, update existing card
    if (sessionId && typeof index === 'number') {
      const card = await Interview.findOne({ sessionId });
      if (!card || !card.qna[index]) {
        return res.status(404).json({ message: 'Card or QnA not found' });
      }

      card.qna[index].answerParts = answerParts;
      await card.save();
    }

    res.status(200).json({ answerParts });
  } catch (err) {
    console.error('Ask endpoint failed:', err);
    res.status(500).json({ message: 'Failed to get AI answer', error: err.message });
  }
});

// POST summarize using LangChain
router.post('/summarize', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Answer text is required' });
    }

    // Use LangChain summarization chain
    const summarizeChain = await createSummarizeChain();
    const summary = await summarizeChain.invoke({ text });

    res.status(200).json({ summary });
  } catch (err) {
    console.error('Summarize endpoint failed:', err);
    res.status(500).json({ message: 'Failed to generate summary', error: err.message });
  }
});

// Request delete OTP send 
router.post('/request-delete-otp', async (req, res) => {
  const { sessionId } = req.body;
  const card = await Interview.findOne({ sessionId });
  if (!card) return res.status(404).json({ message: 'Card not found' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  card.deleteOTP = otp;
  await card.save();

  await sendOTPEmail(card.creatorEmail, otp);

  res.status(200).json({ message: 'OTP sent to creator email' });
});

// Verify delete OTP
router.post('/verify-delete-otp', async (req, res) => {
  const { sessionId, otp } = req.body;
  const card = await Interview.findOne({ sessionId });
  if (!card) return res.status(404).json({ message: 'Card not found' });

  if (card.deleteOTP !== otp) return res.status(400).json({ message: 'Invalid OTP' });

  await Interview.deleteOne({ sessionId });
  res.status(200).json({ message: 'Card deleted successfully' });
});

module.exports = router;
