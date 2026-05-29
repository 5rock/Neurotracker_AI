const express = require('express');
const router = express.Router();
const {
  chat, getChatSessions, getChatSession,
  generateCareerRoadmap, getRoadmaps,
  skillGapAnalysis, generateAIQuiz, analyzeTopicWeakness
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.use(protect);

// Chatbot
router.post('/chat', chat);
router.get('/chat/sessions', getChatSessions);
router.get('/chat/:sessionId', getChatSession);

// Roadmap
router.post('/roadmap', generateCareerRoadmap);
router.get('/roadmap', getRoadmaps);

// Skills
router.post('/skill-gap', skillGapAnalysis);

// Quiz
router.post('/quiz', generateAIQuiz);

// Weakness Analysis
router.post('/analyze-weakness', analyzeTopicWeakness);

module.exports = router;
