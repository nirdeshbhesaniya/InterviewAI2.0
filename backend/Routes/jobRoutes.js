const express = require('express');
const router = express.Router();
const { generateJobs } = require('../utils/gemini');

// @route   GET /api/jobs/search
// @desc    Get realistic job postings using Gemini AI
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { role, branch } = req.query;
    if (!role) {
      return res.status(400).json({ message: 'Role is required for job search' });
    }

    const jobsData = await generateJobs(role, branch);
    res.json(jobsData);
  } catch (error) {
    console.error('Error generating jobs:', error);
    res.status(500).json({ message: 'Failed to fetch job postings' });
  }
});

module.exports = router;
