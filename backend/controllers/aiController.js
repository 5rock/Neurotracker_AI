const ChatHistory = require('../models/ChatHistory');
const Roadmap = require('../models/Roadmap');
const Skill = require('../models/Skill');
const Topic = require('../models/Topic');
const User = require('../models/User');
const { v4: uuidv4 } = require('crypto');
const {
  chatWithMentor,
  generateRoadmap,
  analyzeSkillGaps,
  generateQuiz,
  analyzeWeakness,
} = require('../ai/openaiService');
const { calculateRetention } = require('../ai/spacedRepetition');

/**
 * @desc    Chat with AI Mentor
 * @route   POST /api/ai/chat
 * @access  Private
 */
const chat = async (req, res, next) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user._id;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    // Find or create session
    const sid = sessionId || Math.random().toString(36).substr(2, 9);
    let session = await ChatHistory.findOne({ userId, sessionId: sid });

    if (!session) {
      session = await ChatHistory.create({
        userId,
        sessionId: sid,
        title: message.substring(0, 50),
        messages: [],
      });
    }

    // Get user context for personalization
    const [user, topics] = await Promise.all([
      User.findById(userId),
      Topic.find({ userId, isArchived: false }),
    ]);

    const weakTopics = topics
      .filter((t) => t.confidenceScore < 50)
      .map((t) => t.name)
      .slice(0, 5);

    const userContext = {
      name: user.name,
      careerGoal: user.careerGoal,
      streak: user.streak,
      careerReadinessScore: user.careerReadinessScore,
      weakTopics,
    };

    // Build message history for context
    const messageHistory = session.messages.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    }));
    messageHistory.push({ role: 'user', content: message });

    // Get AI response
    const aiResponse = await chatWithMentor(messageHistory, userContext);

    // Save messages
    session.messages.push(
      { role: 'user', content: message, timestamp: new Date() },
      { role: 'assistant', content: aiResponse, timestamp: new Date() }
    );
    await session.save();

    res.json({
      success: true,
      sessionId: sid,
      response: aiResponse,
      messageId: session.messages.length,
    });
  } catch (error) {
    // Handle OpenAI API errors gracefully
    if (error.status === 401) {
      return res.status(503).json({
        success: false,
        message: 'AI service unavailable. Please check your OpenAI API key.',
      });
    }
    next(error);
  }
};

/**
 * @desc    Get chat history sessions
 * @route   GET /api/ai/chat/sessions
 * @access  Private
 */
const getChatSessions = async (req, res, next) => {
  try {
    const sessions = await ChatHistory.find({ userId: req.user._id })
      .select('sessionId title updatedAt messages')
      .sort({ updatedAt: -1 })
      .limit(20);

    res.json({ success: true, sessions });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single chat session
 * @route   GET /api/ai/chat/:sessionId
 * @access  Private
 */
const getChatSession = async (req, res, next) => {
  try {
    const session = await ChatHistory.findOne({
      userId: req.user._id,
      sessionId: req.params.sessionId,
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    res.json({ success: true, session });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate Career Roadmap
 * @route   POST /api/ai/roadmap
 * @access  Private
 */
const generateCareerRoadmap = async (req, res, next) => {
  try {
    const { careerGoal, experienceLevel } = req.body;
    const userId = req.user._id;

    // Get current skills
    const skills = await Skill.find({ userId });
    const currentSkills = skills.map((s) => s.name);

    // Generate roadmap using AI
    const roadmapData = await generateRoadmap(
      careerGoal || req.user.careerGoal,
      currentSkills,
      experienceLevel || 1
    );

    // Save roadmap
    const roadmap = await Roadmap.create({
      userId,
      careerGoal: careerGoal || req.user.careerGoal,
      ...roadmapData,
      milestones: roadmapData.milestones.map((m, i) => ({
        ...m,
        status: i === 0 ? 'in_progress' : 'locked',
      })),
    });

    res.status(201).json({ success: true, roadmap });
  } catch (error) {
    if (error.status === 401) {
      return res.status(503).json({
        success: false,
        message: 'AI service unavailable. Please add your OpenAI API key.',
      });
    }
    next(error);
  }
};

/**
 * @desc    Get user's roadmaps
 * @route   GET /api/ai/roadmap
 * @access  Private
 */
const getRoadmaps = async (req, res, next) => {
  try {
    const roadmaps = await Roadmap.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, roadmaps });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Analyze skill gaps
 * @route   POST /api/ai/skill-gap
 * @access  Private
 */
const skillGapAnalysis = async (req, res, next) => {
  try {
    const { careerGoal } = req.body;
    const userId = req.user._id;

    const [user, skills] = await Promise.all([User.findById(userId), Skill.find({ userId })]);

    const currentSkills = skills.map((s) => ({ name: s.name, proficiency: s.proficiency }));
    const analysis = await analyzeSkillGaps(careerGoal || user.careerGoal, currentSkills);

    // Update career readiness score
    await User.findByIdAndUpdate(userId, {
      careerReadinessScore: analysis.careerReadinessScore,
    });

    // Save/update skill gaps
    for (const missingSkill of analysis.missingSkills || []) {
      await Skill.findOneAndUpdate(
        { userId, name: missingSkill.name },
        {
          userId,
          ...missingSkill,
          isGap: true,
          gapPriority: missingSkill.priority,
        },
        { upsert: true, new: true }
      );
    }

    res.json({ success: true, analysis });
  } catch (error) {
    if (error.status === 401) {
      return res.status(503).json({
        success: false,
        message: 'AI service unavailable. Please add your OpenAI API key.',
      });
    }
    next(error);
  }
};

/**
 * @desc    Generate AI Quiz
 * @route   POST /api/ai/quiz
 * @access  Private
 */
const generateAIQuiz = async (req, res, next) => {
  try {
    const { topicName, difficulty, count } = req.body;

    if (!topicName) {
      return res.status(400).json({ success: false, message: 'Topic name is required.' });
    }

    const quiz = await generateQuiz(topicName, difficulty || 'intermediate', count || 5);
    res.json({ success: true, quiz });
  } catch (error) {
    if (error.status === 401) {
      return res.status(503).json({ success: false, message: 'AI service unavailable.' });
    }
    next(error);
  }
};

/**
 * @desc    Analyze weakness for a topic
 * @route   POST /api/ai/analyze-weakness
 * @access  Private
 */
const analyzeTopicWeakness = async (req, res, next) => {
  try {
    const { topicId } = req.body;

    const topic = await Topic.findOne({ _id: topicId, userId: req.user._id });
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found.' });
    }

    const analysis = await analyzeWeakness(topic.name, topic.mistakeHistory);
    res.json({ success: true, analysis, topic: topic.name });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  chat,
  getChatSessions,
  getChatSession,
  generateCareerRoadmap,
  getRoadmaps,
  skillGapAnalysis,
  generateAIQuiz,
  analyzeTopicWeakness,
};
