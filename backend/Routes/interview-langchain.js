const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Interview = require('../models/Interview');
const User = require('../models/User');
const {
  createInterviewQAChain,
  createAnswerChain,
  createMoreQuestionsChain,
  createSummarizeChain
} = require('../utils/langchain-chains');
const { createInterviewPrepWorkflow } = require('../utils/langgraph-workflows');
const { sendOTPEmail } = require('../utils/emailService');
const { authenticateToken, identifyUser } = require('../middlewares/auth');
const Notification = require('../models/Notification');
const { checkFeatureEnabled } = require('../middlewares/featureAuth');
const { logAIUsage } = require('../utils/aiLogger');

// GET pending approvals for the logged-in user (creator)
router.get('/data/pending-approvals', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;

    // Find all interviews created by this user that have at least one pending question
    const interviews = await Interview.find({
      creatorEmail: userEmail,
      'qna.status': 'pending'
    }).select('sessionId title qna');

    let pendingRequests = [];

    interviews.forEach(interview => {
      // Filter out only the pending questions from each interview
      const pendingQuestions = interview.qna.filter(q => q.status === 'pending');

      // Map them to a structured format
      const formattedRequests = pendingQuestions.map(q => ({
        _id: q._id,
        sessionId: interview.sessionId,
        interviewTitle: interview.title,
        question: q.question,
        category: q.category,
        status: q.status,
        requestedBy: q.requestedBy,
        createdAt: q.createdAt,
        answerParts: q.answerParts
      }));

      pendingRequests = [...pendingRequests, ...formattedRequests];
    });

    res.json(pendingRequests);
  } catch (err) {
    console.error('Error fetching pending approvals:', err);
    res.status(500).json({ message: 'Failed to fetch pending approvals' });
  }
});

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

// GET single card with visibility filtering
router.get('/:sessionId', identifyUser, async (req, res) => {
  try {
    const card = await Interview.findOne({ sessionId: req.params.sessionId }).lean();
    if (!card) return res.status(404).json({ message: 'Card not found' });

    // Filter QnA based on visibility
    if (card.qna && card.qna.length > 0) {
      card.qna = card.qna.filter(q => {
        // Always show approved (or legacy/undefined status)
        if (!q.status || q.status === 'approved' || q.status === 'rejected') return true;

        // For pending, only show to:
        // 1. Admin
        // 2. Session Creator
        // 3. The requester
        if (q.status === 'pending') {
          if (!req.user) return false;

          const isAdmin = req.user.role === 'admin';
          const isCreator = req.user.email === card.creatorEmail;
          const isRequester = q.requestedBy && req.user._id.toString() === q.requestedBy.toString();

          return isAdmin || isCreator || isRequester;
        }

        return true;
      });
    }

    res.json(card);
  } catch (err) {
    console.error('Error fetching card:', err);
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
router.post('/', checkFeatureEnabled('ai_interview_generation'), async (req, res) => {
  const { title, tag, initials, experience, desc, color, creatorEmail, requestApproval } = req.body;

  if (!title || !tag || !initials || !experience || !desc || !creatorEmail) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check for exact duplicates (same title, tag, and creator)
    const exactDuplicate = await Interview.findOne({
      title: { $regex: new RegExp(`^${title.trim()}$`, 'i') },
      tag: { $regex: new RegExp(`^${tag.trim()}$`, 'i') },
      creatorEmail
    });

    if (exactDuplicate) {
      return res.status(409).json({
        message: 'You have already created a session with this exact title and tag.',
        duplicate: {
          sessionId: exactDuplicate.sessionId,
          title: exactDuplicate.title,
          tag: exactDuplicate.tag,
          createdAt: exactDuplicate.createdAt
        }
      });
    }

    const sessionId = uuidv4();

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

    // Handle Approval Request (Skip AI)
    if (requestApproval) {
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
        status: 'pending',
        qna: [] // No QnA yet
      });

      await newCard.save();

      // Notify Admins
      await Notification.create({
        userId: 'admin', // Placeholder
        type: 'info',
        title: 'New Session Request',
        message: `${creatorDetails.fullName || creatorEmail} requested a new session: "${title}"`,
        recipientType: 'broadcast',
        targetAudience: 'admins',
        action: 'review_session',
        actionUrl: `/admin/dashboard`,
        metadata: { sessionId, type: 'session_request' }
      });

      return res.status(201).json({ message: 'Request sent to admin', session: newCard });
    }

    // Use LangChain chain to generate Q&A
    const qaChain = await createInterviewQAChain();
    const result = await qaChain.invoke({
      title,
      tag,
      experience,
      numberOfQuestions: 5
    });

    // Log AI Usage
    if (creatorEmail) {
      User.findOne({ email: creatorEmail }).then(user => {
        if (user) logAIUsage(user._id, 'openrouter', 'gpt-4o-mini', 'success');
      }).catch(err => console.error('Error logging usage:', err));
    }

    // Parse the response
    const parsedQuestions = result.questions || [];

    // Transform the structured output into the format expected by the database
    const qna = parsedQuestions.map((q) => ({
      question: q.question,
      category: q.category || 'General',
      answerParts: parseAnswerIntoParts(q.answer)
    }));

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
      status: 'approved',
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
router.post('/workflow', checkFeatureEnabled('ai_interview_generation'), async (req, res) => {
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

    // Log AI Usage
    if (creatorEmail) {
      User.findOne({ email: creatorEmail }).then(user => {
        if (user) logAIUsage(user._id, 'openrouter', 'gpt-4o-mini', 'success');
      }).catch(err => console.error('Error logging usage:', err));
    }

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

// PUT Update Session Metadata (Protected - Admin, Owner, or Creator only)
router.put('/session/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { title, tag, experience, desc, color, initials } = req.body;

    const session = await Interview.findOne({ sessionId });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    // Check permissions: Admin, Owner, or Creator
    const isAdmin = req.user.role === 'admin';
    const isOwner = req.user.role === 'owner';
    const isCreator = session.creatorEmail === req.user.email;

    if (!isAdmin && !isOwner && !isCreator) {
      return res.status(403).json({ message: 'Unauthorized. Only admin, owner, or session creator can edit this session.' });
    }

    // Update fields if provided
    if (title) session.title = title;
    if (tag) session.tag = tag;
    if (experience) session.experience = experience;
    if (desc) session.desc = desc;
    if (color) session.color = color;
    if (initials) session.initials = initials;

    // If edited by non-creator admin/owner, optionally log or notify
    if ((isAdmin || isOwner) && !isCreator) {
      const creator = await User.findOne({ email: session.creatorEmail });
      if (creator) {
        await Notification.create({
          userId: creator._id,
          type: 'info',
          title: 'Session Updated',
          message: `Your interview session "${session.title}" was edited by an ${isOwner ? 'owner' : 'administrator'}.`,
          recipientType: 'individual',
          metadata: { sessionId }
        });
      }
    }

    await session.save();
    res.json({ message: 'Session updated successfully', session });
  } catch (err) {
    console.error('Error updating session:', err);
    res.status(500).json({ message: 'Failed to update session' });
  }
});

// DELETE card (Protected - Admin, Owner, or Creator only)
router.delete('/:sessionId', authenticateToken, async (req, res) => {
  try {
    const session = await Interview.findOne({ sessionId: req.params.sessionId });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    // Check permissions: Admin, Owner, or Creator
    const isAdmin = req.user.role === 'admin';
    const isOwner = req.user.role === 'owner';
    const isCreator = session.creatorEmail === req.user.email;

    if (!isAdmin && !isOwner && !isCreator) {
      return res.status(403).json({ message: 'Unauthorized. Only admin, owner, or session creator can delete this session.' });
    }

    await Interview.findOneAndDelete({ sessionId: req.params.sessionId });

    // Notify creator if deleted by admin/owner
    if ((isAdmin || isOwner) && !isCreator) {
      const creator = await User.findOne({ email: session.creatorEmail });
      if (creator) {
        await Notification.create({
          userId: creator._id,
          type: 'warning',
          title: 'Session Deleted',
          message: `Your interview session "${session.title}" was deleted by an ${isOwner ? 'owner' : 'administrator'}.`,
          recipientType: 'individual'
        });
      }
    }

    res.json({ message: 'Session deleted successfully' });
  } catch (err) {
    console.error('Error deleting session:', err);
    res.status(500).json({ message: 'Failed to delete session' });
  }
});

// PATCH regenerate a single question's answer using LangChain
router.patch('/regenerate/:sessionId/:index', checkFeatureEnabled('ai_interview_generation'), async (req, res) => {
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

// PATCH to manually edit a QnA block (Protected - Admin, Owner, or Creator)
router.patch('/edit/:sessionId/:index', authenticateToken, async (req, res) => {
  try {
    const { sessionId, index } = req.params;
    const { question, answerParts, category } = req.body;

    const card = await Interview.findOne({ sessionId });
    if (!card || !card.qna[index]) {
      return res.status(404).json({ message: 'QnA not found' });
    }

    // Check permissions (Creator, Admin, or Owner)
    // We allow anyone logged in to REQUEST an update (via pendingUpdate)
    // But only Admins/Owners (and maybe Creator depending on policy) can apply directly.

    const isCreator = card.creatorEmail === req.user.email;
    const isAdmin = req.user.role === 'admin';
    const isOwner = req.user.role === 'owner';

    // REMOVED: Strict 403 check because we want to allow "Request Update"

    // Status Management:
    // - Admin/Owner: Auto-approve changes (Direct Edit)
    // - Everyone else (Creator + Users): Changes go to pending
    //   (Note: You might want Creators to auto-approve too, but requirement implied approval flow. 
    //    If Creators should auto-approve, add '|| isCreator' to the if condition below)

    const canDirectlyEdit = isAdmin || isOwner || isCreator; // Adding isCreator here to allow creators to edit their own stuff directly? 
    // Wait, previous code put Creator in "pending" path. 
    // Let's stick to the safe bet: Admin/Owner = Direct. Creator/User = Pending (or Creator = Direct?)
    // Usually Creator should be able to edit their own session. 
    // Let's allow Creator to Direct Edit for better UX, effectively reverting them to "Admin-like" for their own session.
    // If requirement was strict "Approval Flow", maybe Creator needs approval from Admin?
    // "send first request to admin and that session creator" -> implies Creator is an approver. Approvers can usually edit.

    if (canDirectlyEdit) {
      // Direct Apply
      if (question) card.qna[index].question = question;
      if (answerParts) card.qna[index].answerParts = answerParts;
      if (category) card.qna[index].category = category;
      card.qna[index].status = 'approved';

      // Clear any pending if applying direct
      card.qna[index].pendingUpdate = undefined;

    } else {
      // Standard User Requesting Update
      // Save to pendingUpdate

      const pendingUpdate = {
        question: question || card.qna[index].question,
        answerParts: answerParts || card.qna[index].answerParts,
        category: category || card.qna[index].category,
        requestedBy: req.user._id,
        requestedAt: new Date(),
        status: 'pending'
      };

      card.qna[index].pendingUpdate = pendingUpdate;

      // Notify Session Creator + Admins
      // 1. Notify Creator (if it's not the creator themselves - clearly not since we are in else block of canDirectlyEdit)
      const creatorUser = await User.findOne({ email: card.creatorEmail });
      if (creatorUser) {
        await Notification.create({
          userId: creatorUser._id,
          type: 'info',
          title: 'Q&A Update Request',
          message: `${req.user.fullName || req.user.email} requested to update a question in your session "${card.title}"`,
          action: 'review_qna',
          metadata: { sessionId, qnaId: card.qna[index]._id }
        });
      }

      // 2. Notify Admins
      await Notification.create({
        userId: 'admin',
        type: 'info',
        title: 'Q&A Update Request',
        message: `${req.user.fullName || req.user.email} requested to update a Q&A in "${card.title}"`,
        recipientType: 'broadcast',
        targetAudience: 'admins',
        action: 'review_qna',
        actionUrl: `/admin/qna-requests`,
        metadata: { sessionId, qnaId: card.qna[index]._id }
      });
    }

    await card.save();
    res.json({
      message: canDirectlyEdit ? 'Q&A updated and approved' : 'Update request sent for approval',
      qna: card.qna[index]
    });
  } catch (err) {
    console.error('Error updating QnA:', err);
    res.status(500).json({ message: 'Failed to update QnA' });
  }
});

// PATCH Approve Question Update (Admin/Creator)
router.patch('/approve-question/:sessionId/:qnaId', authenticateToken, async (req, res) => {
  try {
    const { sessionId, qnaId } = req.params;

    const session = await Interview.findOne({ sessionId });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const isAdmin = req.user.role === 'admin' || req.user.role === 'owner';
    const isCreator = session.creatorEmail.toLowerCase() === req.user.email.toLowerCase();

    console.log('Approve Debug:', {
      admin: isAdmin,
      creator: isCreator,
      userEmail: req.user.email,
      creatorEmail: session.creatorEmail,
      role: req.user.role
    });

    if (!isAdmin && !isCreator) {
      return res.status(403).json({ message: 'Unauthorized', debug: { user: req.user.email, creator: session.creatorEmail } });
    }

    const qnaIndex = session.qna.findIndex(q => q._id.toString() === qnaId);
    if (qnaIndex === -1) return res.status(404).json({ message: 'Question not found' });

    const qna = session.qna[qnaIndex];

    // Check if there is a pending update
    if (qna.pendingUpdate && qna.pendingUpdate.status === 'pending') {
      // Apply Update
      qna.question = qna.pendingUpdate.question;
      qna.answerParts = qna.pendingUpdate.answerParts;
      qna.category = qna.pendingUpdate.category;

      // Clear pending
      qna.pendingUpdate = undefined;
      qna.status = 'approved';

      await session.save(); // Save first

      // Notify Requester
      if (qna.pendingUpdate && qna.pendingUpdate.requestedBy) {
        try {
          // Find requester? We might need to store requestedBy properly as ID... 
          // schema says String, assuming ID string.
          const requester = await User.findById(qna.pendingUpdate.requestedBy);
          if (requester) {
            await Notification.create({
              userId: requester._id,
              type: 'success',
              title: 'Update Approved',
              message: `Your update for question in "${session.title}" has been approved.`,
              action: 'view_session',
              metadata: { sessionId }
            });
          }
        } catch (e) { console.error("Notify requester error", e); }
      }

      return res.json({ message: 'Update approved', qna });
    }

    // Check if the question itself is pending (new question)
    if (qna.status === 'pending') {
      qna.status = 'approved';
      await session.save();
      return res.json({ message: 'Question approved', qna });
    }

    return res.status(400).json({ message: 'No pending updates for this question' });

  } catch (err) {
    console.error('Error approving question:', err);
    res.status(500).json({ message: 'Failed to approve' });
  }
});

// PATCH Reject Question Update (Admin/Creator)
router.patch('/reject-question/:sessionId/:qnaId', authenticateToken, async (req, res) => {
  try {
    const { sessionId, qnaId } = req.params;

    const session = await Interview.findOne({ sessionId });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const isAdmin = req.user.role === 'admin' || req.user.role === 'owner';
    const isCreator = session.creatorEmail.toLowerCase() === req.user.email.toLowerCase();

    console.log('Reject Debug:', {
      admin: isAdmin,
      creator: isCreator,
      userEmail: req.user.email,
      creatorEmail: session.creatorEmail,
      role: req.user.role
    });

    if (!isAdmin && !isCreator) {
      return res.status(403).json({ message: 'Unauthorized', debug: { user: req.user.email, creator: session.creatorEmail } });
    }

    const qnaIndex = session.qna.findIndex(q => q._id.toString() === qnaId);
    if (qnaIndex === -1) return res.status(404).json({ message: 'Question not found' });

    const qna = session.qna[qnaIndex];

    if (qna.pendingUpdate && qna.pendingUpdate.status === 'pending') {
      // Mark as rejected or remove? User requirement: "remove updation but exist previous Q&A so as it is"
      // So just clear pendingUpdate or mark it rejected

      qna.pendingUpdate.status = 'rejected';
      // Ideally we clear it to clean up, but keeping as rejected lets user know? 
      // Let's just remove the pending update object or set to rejected state so they see "Rejected"
      // Requirement: "if rejected... user will be able to delete the session" -> that was for Session.
      // For Q&A: "remove updation but exist previous Q&A so as it is"

      qna.pendingUpdate = undefined; // Simply discard the update

      await session.save();

      // Notify Requester
      // (Similar notification logic)

      return res.json({ message: 'Update rejected', qna });
    }

    if (qna.status === 'pending') {
      qna.status = 'rejected'; // For new questions, maybe set to rejected
      await session.save();
      return res.json({ message: 'Question rejected', qna });
    }

    return res.status(400).json({ message: 'No pending updates' });

  } catch (err) {
    console.error('Error rejecting question:', err);
    res.status(500).json({ message: 'Failed to reject' });
  }
});

// POST to generate more QnA using LangChain
router.post('/generate-more/:sessionId', checkFeatureEnabled('ai_interview_generation'), async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Interview.findOne({ sessionId });

    if (!session) return res.status(404).json({ message: 'Session not found' });

    // Use LangChain chain to generate more questions
    const moreQuestionsChain = await createMoreQuestionsChain();
    const responseText = await moreQuestionsChain.invoke({
      title: session.title,
      tag: session.tag,
      experience: session.experience,
      topic: req.body.topic // Pass specific topic if provided
    });

    // Log AI Usage
    // Note: generate-more route uses 'checkFeatureEnabled' but currently doesn't have 'authenticateToken'
    // But let's check if we can get user from somewhere or just skip if no user.
    // 'checkFeatureEnabled' doesn't authenticate.
    // However, usually detailed generation routes are protected. This one might need auth.
    // For now, safe check.
    // Log AI Usage
    if (session && session.creatorEmail) {
      User.findOne({ email: session.creatorEmail }).then(user => {
        if (user) logAIUsage(user._id, 'openrouter', 'gpt-4o-mini', 'success');
      }).catch(err => console.error('Error logging usage:', err));
    }

    // Parse the response
    const parsedQuestions = parseInterviewResponse(responseText);

    // Transform the output
    const generatedQnA = parsedQuestions.map((q) => ({
      question: q.question,
      category: req.body.topic || 'General', // Use specific topic as category
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
router.post('/ask', checkFeatureEnabled('ai_interview_generation'), async (req, res) => {
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
router.post('/summarize', checkFeatureEnabled('ai_interview_generation'), async (req, res) => {
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

// POST Request to add a new QnA (Pending Approval)
router.post('/add-question/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { question, answerParts, category } = req.body;
    const userId = req.user._id;

    if (!question) {
      return res.status(400).json({ message: 'Question is required' });
    }

    const session = await Interview.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check if user is the creator or admin (auto-approve)
    // For now, let's strictly follow the requirement: "send first request to admin and that session creator"
    // implies even if I add it, it goes to approval? 
    // Usually creator adding to own text is auto-approved.
    const isCreator = session.creatorEmail === req.user.email;
    const isAdmin = req.user.role === 'admin';

    const status = (isCreator || isAdmin) ? 'approved' : 'pending';

    const newQnA = {
      question,
      answerParts: answerParts || [],
      category: category || 'General',
      status: status,
      requestedBy: userId,
      createdAt: new Date()
    };

    session.qna.push(newQnA);
    await session.save();

    // If pending, send notifications
    if (status === 'pending') {
      // Notify Session Creator
      // Need to find creator User ID by email
      const creator = await User.findOne({ email: session.creatorEmail });
      if (creator) {
        await Notification.create({
          userId: creator._id,
          type: 'info',
          title: 'New Q&A Request',
          message: `User ${req.user.fullName} requested to add a new question to your session "${session.title}".`,
          action: 'review_qna',
          metadata: { sessionId, qnaId: newQnA._id, interviewTitle: session.title }
        });
      }

      // Notify Admins
      const admins = await User.find({ role: 'admin' });
      const adminNotifications = admins.map(admin => ({
        userId: admin._id,
        type: 'info',
        title: 'New Q&A Request',
        message: `User ${req.user.fullName} requested to add a new question to session "${session.title}".`,
        action: 'review_qna',
        metadata: { sessionId, qnaId: newQnA._id, interviewTitle: session.title }
      }));
      if (adminNotifications.length > 0) {
        await Notification.insertMany(adminNotifications);
      }
    }

    res.status(201).json({ message: isCreator || isAdmin ? 'Question added successfully' : 'Question submitted for approval', qna: newQnA });
  } catch (err) {
    console.error('Error adding question:', err);
    res.status(500).json({ message: 'Failed to add question', error: err.message });
  }
});

// PATCH Approve QnA Request
router.patch('/approve-question/:sessionId/:qnaId', authenticateToken, async (req, res) => {
  try {
    const { sessionId, qnaId } = req.params;
    const session = await Interview.findOne({ sessionId });

    if (!session) return res.status(404).json({ message: 'Session not found' });

    // Find the QnA item
    const qnaItem = session.qna.id(qnaId);
    if (!qnaItem) return res.status(404).json({ message: 'Question not found' });

    // Check permissions: Admin or Session Creator
    const isCreator = session.creatorEmail === req.user.email;
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: 'You do not have permission to approve this request' });
    }

    qnaItem.status = 'approved';
    await session.save();

    // Notify requester
    if (qnaItem.requestedBy) {
      await Notification.create({
        userId: qnaItem.requestedBy,
        type: 'success',
        title: 'Q&A Approved',
        message: `Your question "${qnaItem.question.substring(0, 30)}..." has been approved in "${session.title}".`,
        metadata: { sessionId, qnaId }
      });
    }

    res.json({ message: 'Question approved', qna: qnaItem });
  } catch (err) {
    console.error('Error approving question:', err);
    res.status(500).json({ message: 'Failed to approve question' });
  }
});

// PATCH Reject QnA Request
router.patch('/reject-question/:sessionId/:qnaId', authenticateToken, async (req, res) => {
  try {
    const { sessionId, qnaId } = req.params;
    const session = await Interview.findOne({ sessionId });

    if (!session) return res.status(404).json({ message: 'Session not found' });

    const qnaItem = session.qna.id(qnaId);
    if (!qnaItem) return res.status(404).json({ message: 'Question not found' });

    // Check permissions
    const isCreator = session.creatorEmail === req.user.email;
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    qnaItem.status = 'rejected';
    await session.save();

    // Notify requester
    if (qnaItem.requestedBy) {
      await Notification.create({
        userId: qnaItem.requestedBy,
        type: 'warning',
        title: 'Q&A Rejected',
        message: `Your question "${qnaItem.question.substring(0, 30)}..." was rejected in "${session.title}".`,
        metadata: { sessionId, qnaId }
      });
    }

    res.json({ message: 'Question rejected', qna: qnaItem });
  } catch (err) {
    console.error('Error rejecting question:', err);
    res.status(500).json({ message: 'Failed to reject question' });
  }
});

// DELETE a specific question (Protected - Admin, Owner, or Creator)
router.delete('/:sessionId/questions/:qnaId', authenticateToken, async (req, res) => {
  try {
    const { sessionId, qnaId } = req.params;
    const session = await Interview.findOne({ sessionId });

    if (!session) return res.status(404).json({ message: 'Session not found' });

    // Check permissions: Admin, Owner, or Creator
    const isCreator = session.creatorEmail === req.user.email;
    const isAdmin = req.user.role === 'admin';
    const isOwner = req.user.role === 'owner';

    if (!isCreator && !isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Unauthorized. Only admin, owner, or session creator can delete Q&A.' });
    }

    // Find the question before deletion for notification
    const questionToDelete = session.qna.find(q => q._id.toString() === qnaId);

    // Filter out the question
    const originalLength = session.qna.length;
    session.qna = session.qna.filter(q => q._id.toString() !== qnaId);

    if (session.qna.length === originalLength) {
      return res.status(404).json({ message: 'Question not found' });
    }

    await session.save();

    // Notify creator if deleted by admin/owner
    if ((isAdmin || isOwner) && !isCreator && questionToDelete) {
      const creator = await User.findOne({ email: session.creatorEmail });
      if (creator) {
        await Notification.create({
          userId: creator._id,
          type: 'warning',
          title: 'Q&A Deleted',
          message: `A question "${questionToDelete.question.substring(0, 40)}..." was deleted from your session "${session.title}" by an ${isOwner ? 'owner' : 'administrator'}.`,
          recipientType: 'individual',
          metadata: { sessionId }
        });
      }
    }

    res.json({ message: 'Question deleted successfully' });
  } catch (err) {
    console.error('Error deleting question:', err);
    res.status(500).json({ message: 'Failed to delete question' });
  }
});


// INITIALIZE Session (Generate QnA for approved session)
router.post('/initialize/:sessionId', checkFeatureEnabled('ai_interview_generation'), async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Interview.findOne({ sessionId });

    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.status !== 'approved') return res.status(400).json({ message: 'Session not approved' });
    if (session.qna && session.qna.length > 0) return res.status(400).json({ message: 'Session already initialized' });

    console.log(`Initializing session ${sessionId}...`);

    // Use LangChain chain to generate Q&A
    const qaChain = await createInterviewQAChain();
    const result = await qaChain.invoke({
      title: session.title,
      tag: session.tag,
      experience: session.experience,
      numberOfQuestions: 5
    });

    const parsedQuestions = result.questions || [];

    const qna = parsedQuestions.map((q) => ({
      question: q.question,
      category: q.category || 'General',
      answerParts: parseAnswerIntoParts(q.answer)
    }));

    session.qna = qna;
    await session.save();

    // Log AI Usage
    if (session.creatorEmail) {
      User.findOne({ email: session.creatorEmail }).then(user => {
        if (user) logAIUsage(user._id, 'openrouter', 'gpt-4o-mini', 'success');
      }).catch(err => console.error('Error logging usage:', err));
    }

    res.status(200).json({ message: 'Session initialized', session });
  } catch (err) {
    console.error('Error initializing session:', err);
    res.status(500).json({ message: 'Failed to initialize session' });
  }
});

// APPROVE Session
router.post('/approve-session/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Interview.findOne({ sessionId });

    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (req.user.role !== 'admin' && req.user.role !== 'owner') return res.status(403).json({ message: 'Unauthorized' });

    session.status = 'approved';
    await session.save();

    // Notify User
    const user = await User.findOne({ email: session.creatorEmail });
    if (user) {
      await Notification.create({
        userId: user._id,
        type: 'success',
        title: 'Session Request Accepted',
        message: `Admin accepted your request for "${session.title}". You can now create the content.`,
        action: 'view_session',
        actionUrl: `/interview-prep/${sessionId}`,
        metadata: { sessionId }
      });
    }

    res.status(200).json({ message: 'Session approved', session });
  } catch (err) {
    console.error('Error approving session:', err);
    res.status(500).json({ message: 'Failed to approve session' });
  }
});

// REJECT Session
router.post('/reject-session/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Interview.findOne({ sessionId });

    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (req.user.role !== 'admin' && req.user.role !== 'owner') return res.status(403).json({ message: 'Unauthorized' });

    session.status = 'rejected';
    await session.save();

    // Notify User
    const user = await User.findOne({ email: session.creatorEmail });
    if (user) {
      await Notification.create({
        userId: user._id,
        type: 'error',
        title: 'Session Request Rejected',
        message: `Admin rejected your request for "${session.title}".`,
        action: 'view_session',
        actionUrl: `/interview-prep/${sessionId}`,
        metadata: { sessionId }
      });
    }

    res.status(200).json({ message: 'Session rejected', session });
  } catch (err) {
    console.error('Error rejecting session:', err);
    res.status(500).json({ message: 'Failed to reject session' });
  }
});

module.exports = router;
