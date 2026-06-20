const express = require('express');
const router = express.Router();

// POST /api/grok/diet
router.post('/diet', async (req, res) => {
  const { prompt, apiKey } = req.body;

  if (!prompt || !apiKey) {
    return res.status(400).json({ message: 'prompt and apiKey are required' });
  }

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [
          { role: 'system', content: 'You are an expert Indian nutritionist. Return only valid JSON, no markdown.' },
          { role: 'user',   content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 1200,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Pass the exact Grok error + a no_credits flag so frontend can use fallback
      const isNoCreds = JSON.stringify(data).toLowerCase().includes('credit') || JSON.stringify(data).toLowerCase().includes('license');
      return res.status(response.status).json({
        message: data.error?.message || data.error || JSON.stringify(data),
        no_credits: isNoCreds,
      });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to reach Grok API' });
  }
});

module.exports = router;
