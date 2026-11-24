const express = require('express');
const axios = require('axios');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');

const router = express.Router();

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

const SYSTEM_PROMPT =
  'You are SkillSphere Assistant, a friendly guide on a peer-to-peer skill exchange and mentorship ' +
  'platform for students. Help with learning plans, choosing skills to learn, preparing for mentorship ' +
  'sessions, and study strategies. Keep answers concise, practical and encouraging.';

async function askGemini(prompt) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  const { data } = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    },
    { headers: { 'x-goog-api-key': key }, timeout: 20000 }
  );
  return data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || null;
}

// POST /api/ai/chat  { message }
router.post(
  '/chat',
  protect,
  asyncHandler(async (req, res) => {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const context =
      `Student profile — skills offered: ${req.user.skillsOffered.map((s) => s.name).join(', ') || 'none'}; ` +
      `skills wanted: ${req.user.skillsWanted.join(', ') || 'none'}.\n\nQuestion: ${message}`;

    try {
      const reply = await askGemini(context);
      if (reply) return res.json({ success: true, reply, source: 'gemini' });
    } catch (err) {
      console.error('Gemini error:', err.response?.data?.error?.message || err.message);
    }

    const reply = process.env.GEMINI_API_KEY
      ? "I couldn't reach the AI service just now. Please try again in a moment."
      : 'The AI assistant is not configured yet. Add GEMINI_API_KEY to backend/.env to enable it. ' +
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
      return res.json({ success: true, recommendations: [], hint: 'Add skills you want to learn to get matches.' });
    }

    const candidates = await User.find({ _id: { $ne: req.user._id }, 'skillsOffered.0': { $exists: true } });

    const scored = candidates
      .map((u) => {
        const matches = u.skillsOffered.filter((s) =>
          wanted.some((w) => s.name.toLowerCase().includes(w) || w.includes(s.name.toLowerCase()))
        );
        // Bonus when they also want something I offer (a true swap)
        const mine = req.user.skillsOffered.map((s) => s.name.toLowerCase());
        const swap = (u.skillsWanted || []).some((w) => mine.some((m) => m.includes(w.toLowerCase()) || w.toLowerCase().includes(m)));
        return { user: u, matches, swap, score: matches.length * 10 + (swap ? 5 : 0) + u.rating };
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
