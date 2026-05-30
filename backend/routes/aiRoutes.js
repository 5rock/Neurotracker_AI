const express = require('express');
const router = express.Router();
const {
  chat, getChatSessions, getChatSession,
  generateCareerRoadmap, getRoadmaps,
  skillGapAnalysis, generateAIQuiz, analyzeTopicWeakness
} = require('../controllers/aiController');
const { protect, enforceGuestAiLimit } = require('../middleware/auth');

router.use(protect);

// Chatbot
router.post('/chat', enforceGuestAiLimit, chat);
router.get('/chat/sessions', getChatSessions);
router.get('/chat/:sessionId', getChatSession);

// Roadmap
router.post('/roadmap', enforceGuestAiLimit, generateCareerRoadmap);
router.get('/roadmap', getRoadmaps);

// Skills
router.post('/skill-gap', enforceGuestAiLimit, skillGapAnalysis);

// Quiz
router.post('/quiz', enforceGuestAiLimit, generateAIQuiz);

// Weakness Analysis
router.post('/analyze-weakness', enforceGuestAiLimit, analyzeTopicWeakness);

module.exports = router;
