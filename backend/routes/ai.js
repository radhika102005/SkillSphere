
const express = require('express');
const axios = require('axios');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');

const router = express.Router();

const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT =
  'You are SkillSphere Assistant, a friendly guide on a peer-to-peer skill exchange and mentorship ' +
  'platform for students. Help with learning plans, choosing skills to learn, preparing for mentorship ' +
  'sessions, and study strategies. Keep answers concise, practical and encouraging.';

async function askGroq(prompt) {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;

  const { data } = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_completion_tokens: 1024,
    },
    {
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      timeout: 20000,
    }
  );

  return data?.choices?.[0]?.message?.content || null;
}

// POST /api/ai/chat { message }
router.post(
  '/chat',
  protect,
  asyncHandler(async (req, res) => {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    const context =
      `Student profile — skills offered: ${req.user.skillsOffered.map((s) => s.name).join(', ') || 'none'}; ` +
      `skills wanted: ${req.user.skillsWanted.join(', ') || 'none'}.\n\nQuestion: ${message}`;

    try {
      const reply = await askGroq(context);
      if (reply) {
        return res.json({ success: true, reply, source: 'groq' });
      }
    } catch (err) {
      console.error(
        'Groq error:',
        err.response?.data?.error?.message || err.message
      );
    }

    const reply = process.env.GROQ_API_KEY
      ? "I couldn't reach the AI service just now. Please try again in a moment."
      : 'The AI assistant is not configured yet. Add GROQ_API_KEY to backend/.env to enable it. ' +
        'In the meantime, try the Explore page to find peers who teach what you want to learn.';

    res.json({ success: true, reply, source: 'fallback' });
  })
);

// GET /api/ai/recommendations — peers whose offered skills match what I want
// (plain matching, works without an API key)
router.get(
  '/recommendations',
  protect,
  asyncHandler(async (req, res) => {
    const wanted = (req.user.skillsWanted || []).map((s) => s.toLowerCase());

    if (!wanted.length) {
      return res.json({
        success: true,
        recommendations: [],
        hint: 'Add skills you want to learn to get matches.',
      });
    }

    const candidates = await User.find({
      _id: { $ne: req.user._id },
      'skillsOffered.0': { $exists: true },
    });

    const scored = candidates
      .map((u) => {
        const matches = u.skillsOffered.filter((s) =>
          wanted.some(
            (w) =>
              s.name.toLowerCase().includes(w) ||
              w.includes(s.name.toLowerCase())
          )
        );

        const mine = req.user.skillsOffered.map((s) => s.name.toLowerCase());

        const swap = (u.skillsWanted || []).some((w) =>
          mine.some(
            (m) =>
              m.includes(w.toLowerCase()) ||
              w.toLowerCase().includes(m)
          )
        );

        return {
          user: u,
          matches,
          swap,
          score: matches.length * 10 + (swap ? 5 : 0) + u.rating,
        };
      })
      .filter((r) => r.matches.length)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((r) => ({
        user: r.user,
        matchedSkills: r.matches.map((s) => s.name),
        skillSwap: r.swap,
      }));

    res.json({ success: true, recommendations: scored });
  })
);

module.exports = router;
