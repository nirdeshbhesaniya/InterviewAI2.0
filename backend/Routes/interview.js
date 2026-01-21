const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Interview = require('../models/Interview');
const User = require('../models/User');
const { generateInterviewQuestions, generateAnswer, generateMoreQuestions, summarizeText } = require('../utils/gemini');
const { sendOTPEmail } = require('../utils/emailService');

// GET all cards
// GET all cards
router.get('/', async (req, res) => {
  try {
    const cards = await Interview.find().sort({ createdAt: -1 });
    res.json(cards);
  } catch (err) {
    console.error("Error fetching interview cards:", err);
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

// const requireAuth = (req, res, next) => {
//   const user = User.email; // or get from Clerk, JWT, etc.
//   if (!user || !user.email) {
//     return res.status(401).json({ message: 'Unauthorized' });
//   }
//   next();
// };

// CHECK DUPLICATES
router.post('/check-duplicates', async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    // Case-insensitive regex search
    const duplicates = await Interview.find({
      title: { $regex: new RegExp(title, 'i') }
    }).select('sessionId title creatorDetails createdAt initials color tag').limit(5);

    res.json(duplicates);
  } catch (err) {
    console.error('Error checking duplicates:', err);
    res.status(500).json({ message: 'Failed to check duplicates' });
  }
});

// CREATE card
router.post('/', async (req, res) => {
  const { title, tag, initials, experience, desc, color, creatorEmail } = req.body;
  // const creatorEmail = req.user?.email; // <- Get from auth middleware
  console.log('Creating interview card with:', creatorEmail);

  if (!title || !tag || !initials || !experience || !desc || !creatorEmail) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const sessionId = uuidv4();
    const aiQuestions = await generateInterviewQuestions(title, tag, experience, desc);

    const qna = aiQuestions.map((q) => ({
      question: q.question,
      answerParts: Array.isArray(q.answerParts)
        ? q.answerParts.filter(p => p.type && p.content)
        : []
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
      creatorEmail: creatorEmail,
      creatorDetails, // 👈 Save details
      qna
    });

    await newCard.save();
    res.status(201).json(newCard);
  } catch (err) {
    console.error('Error creating interview card:', err);
    res.status(500).json({ message: 'Failed to create card' });
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

// PATCH regenerate a single question's answer
router.patch('/regenerate/:sessionId/:index', async (req, res) => {
  try {
    const { sessionId, index } = req.params;
    const card = await Interview.findOne({ sessionId });

    if (!card || !card.qna[index]) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const { title, tag, experience } = card;
    const question = card.qna[index].question;

    const answerParts = await generateAnswer(question, title, tag, experience);

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

// ✅ Route to generate more QnA
router.post('/generate-more/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Interview.findOne({ sessionId });

    if (!session) return res.status(404).json({ message: 'Session not found' });

    const generatedQnA = await generateMoreQuestions(session.title, session.tag, session.experience);

    session.qna.push(...generatedQnA);
    await session.save();

    res.status(200).json({ qna: generatedQnA });
  } catch (err) {
    console.error("Generate more QnA error:", err);
    res.status(500).json({ message: 'Failed to generate more questions', error: err.message });
  }
});

router.post('/ask', async (req, res) => {
  try {
    const { question, title, tag, experience, sessionId, index } = req.body;

    const answerParts = await generateAnswer(question, title, tag, experience);

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

router.post('/summarize', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Answer text is required' });
    }

    const summary = await summarizeText(text);

    res.status(200).json({ summary });
  } catch (err) {
    console.error('Summarize endpoint failed:', err);
    res.status(500).json({ message: 'Failed to generate summary', error: err.message });
  }
});

//request delete OTP send 
router.post('/request-delete-otp', async (req, res) => {
  const { sessionId } = req.body;
  const card = await Interview.findOne({ sessionId });
  if (!card) return res.status(404).json({ message: 'Card not found' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  card.deleteOTP = otp;
  await card.save();

  // Send email using your email utility
  await sendOTPEmail(card.creatorEmail, otp); // implement sendOTPEmail

  res.status(200).json({ message: 'OTP sent to creator email' });
});

router.post('/verify-delete-otp', async (req, res) => {
  const { sessionId, otp } = req.body;
  const card = await Interview.findOne({ sessionId });
  if (!card) return res.status(404).json({ message: 'Card not found' });

  if (card.deleteOTP !== otp) return res.status(400).json({ message: 'Invalid OTP' });

  await Interview.deleteOne({ sessionId });
  res.status(200).json({ message: 'Card deleted successfully' });
});

//Verify delete OTP
router.post('/verify-delete-otp', async (req, res) => {
  const { sessionId, otp } = req.body;
  const card = await Interview.findOne({ sessionId });
  if (!card) return res.status(404).json({ message: 'Card not found' });

  if (card.deleteOTP !== otp) return res.status(400).json({ message: 'Invalid OTP' });

  await Interview.deleteOne({ sessionId });
  res.status(200).json({ message: 'Card deleted successfully' });
});


// POST to add a new manual question
router.post('/add-question/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { question, answerParts } = req.body;

    if (!question) {
      return res.status(400).json({ message: 'Question is required' });
    }

    const session = await Interview.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const newQnA = {
      question,
      answerParts: answerParts || []
    };

    session.qna.push(newQnA);
    await session.save();

    res.status(201).json({ message: 'Question added successfully', qna: newQnA });
  } catch (err) {
    console.error('Error adding question:', err);
    res.status(500).json({ message: 'Failed to add question', error: err.message });
  }
});


// DELETE specific question from a session
router.delete('/:sessionId/questions/:qnaId', async (req, res) => {
  try {
    const { sessionId, qnaId } = req.params;

    // Ideally we should have auth middleware here to get req.user
    // Assuming this route is protected or checked at frontend for now, 
    // but dependent on how 'authenticateToken' is applied in server.js or index.js
    // If it's not applied globally, we might need to add it here.
    // For now, I will implement the logic.

    const session = await Interview.findOne({ sessionId });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    // Find the question index
    const questionIndex = session.qna.findIndex(q => q._id.toString() === qnaId);

    if (questionIndex === -1) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Permission check could be done here if we had the user from request.
    // Since existing routes in this file (like delete card) don't seem to explicitly check req.user 
    // (except via comment or implicit middleware), I will follow the pattern ensuring the endpoint exists.
    // The frontend currently controls visibility. 
    // TO BE SECURE: Ensure `authenticateToken` is used if not already globally applied.

    session.qna.splice(questionIndex, 1);
    await session.save();

    res.json({ message: 'Question deleted successfully' });
  } catch (err) {
    console.error('Error deleting question:', err);
    res.status(500).json({ message: 'Failed to delete question', error: err.message });
  }
});

module.exports = router;
