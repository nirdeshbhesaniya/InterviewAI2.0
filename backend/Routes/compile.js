const express = require('express');
const router = express.Router();
const axios = require('axios');

const JUDGE0_API = 'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true';

router.post('/', async (req, res) => {
  const { source_code, language_id, stdin } = req.body;

  // Validate required fields
  if (!source_code || !language_id) {
    return res.status(400).json({
      message: 'Missing required fields: source_code and language_id are required'
    });
  }

  // Check if RAPIDAPI_KEY is configured
  if (!process.env.RAPIDAPI_KEY) {
    return res.status(500).json({
      message: 'Server configuration error: RAPIDAPI_KEY not found. Please configure Judge0 API key in environment variables.'
    });
  }

  try {
    const response = await axios.post(JUDGE0_API, {
      source_code,
      language_id,
      stdin,
    }, {
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
        'content-type': 'application/json',
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Compilation error:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      return res.status(500).json({
        message: 'Invalid API key: Please check your RapidAPI Judge0 subscription and key'
      });
    } else if (error.response?.status === 429) {
      return res.status(500).json({
        message: 'API rate limit exceeded: Please upgrade your RapidAPI plan or try again later'
      });
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(500).json({
        message: 'Network error: Unable to connect to Judge0 API service'
      });
    }

    res.status(500).json({
      message: error.response?.data?.message || 'Failed to compile code. Please try again.'
    });
  }
});

module.exports = router;
