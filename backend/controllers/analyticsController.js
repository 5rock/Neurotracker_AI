const Topic = require('../models/Topic');
const QuizResult = require('../models/QuizResult');
const RevisionHistory = require('../models/RevisionHistory');
const Analytics = require('../models/Analytics');
const User = require('../models/User');
const { calculateRetention } = require('../ai/spacedRepetition');

/**
 * @desc    Get full dashboard analytics
 * @route   GET /api/analytics/dashboard
 * @access  Private
 */
const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [topics, quizResults, user, analytics] = await Promise.all([
      Topic.find({ userId, isArchived: false }),
      QuizResult.find({ userId }).sort({ attemptedAt: -1 }).limit(20),
      User.findById(userId),
      Analytics.findOne({ userId }),
    ]);

    // Calculate memory retention across all topics
    let totalRetention = 0;
    let weakTopics = [];

    const topicsData = topics.map((topic) => {
      const daysSinceStudy = topic.lastStudied
        ? Math.floor((new Date() - new Date(topic.lastStudied)) / (1000 * 60 * 60 * 24))
        : 30;
      const retention = calculateRetention(daysSinceStudy, topic.repetitions, topic.easeFactor);
      totalRetention += retention;

      if (retention < 50 || topic.confidenceScore < 50) {
        weakTopics.push({
          topicId: topic._id,
          name: topic.name,
          subject: topic.subject,
          weaknessScore: Math.round(100 - (retention + topic.confidenceScore) / 2),
          retention,
          confidenceScore: topic.confidenceScore,
        });
      }

      return { ...topic.toObject(), memoryRetention: retention };
    });

    const avgRetention = topics.length > 0 ? Math.round(totalRetention / topics.length) : 0;

    // Quiz stats
    const avgQuizScore =
      quizResults.length > 0
        ? Math.round(quizResults.reduce((a, b) => a + b.percentage, 0) / quizResults.length)
        : 0;

    // Today's revisions due
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const dueTodayCount = topics.filter((t) => new Date(t.nextRevisionDate) <= today).length;

    // Study hours this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyMinutes = topics.reduce((acc, t) => acc + (t.timeSpent || 0), 0);

    // Subjects breakdown
    const subjectMap = {};
    topics.forEach((t) => {
      if (!subjectMap[t.subject]) subjectMap[t.subject] = { count: 0, avgConfidence: 0 };
      subjectMap[t.subject].count++;
      subjectMap[t.subject].avgConfidence += t.confidenceScore;
    });
    const subjects = Object.entries(subjectMap).map(([name, data]) => ({
      name,
      topicCount: data.count,
      avgConfidence: Math.round(data.avgConfidence / data.count),
    }));

    // Recent activity
    const recentRevisions = await RevisionHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(7)
      .populate('topicId', 'name subject');

    const dashboardData = {
      overview: {
        totalTopics: topics.length,
        masteredTopics: topics.filter((t) => t.confidenceScore >= 80).length,
        memoryRetention: avgRetention,
        avgQuizScore,
        streak: user.streak,
        longestStreak: user.longestStreak,
        xpPoints: user.xpPoints,
        level: user.level,
        totalStudyHours: Math.round(weeklyMinutes / 60),
        careerReadinessScore: user.careerReadinessScore,
        dueTodayCount,
      },
      weakTopics: weakTopics.sort((a, b) => b.weaknessScore - a.weaknessScore).slice(0, 5),
      subjects,
      recentActivity: recentRevisions,
      badges: user.badges,
      quizTrend: quizResults.slice(0, 10).map((q) => ({
        date: q.attemptedAt,
        score: q.percentage,
        topic: q.topicName,
      })),
    };

    res.json({ success: true, data: dashboardData });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get heatmap data (topic weakness by subject)
 * @route   GET /api/analytics/heatmap
 * @access  Private
 */
const getHeatmap = async (req, res, next) => {
  try {
    const topics = await Topic.find({ userId: req.user._id, isArchived: false });

    const heatmapData = topics.map((topic) => {
      const daysSinceStudy = topic.lastStudied
        ? Math.floor((new Date() - new Date(topic.lastStudied)) / (1000 * 60 * 60 * 24))
        : 30;
      const retention = calculateRetention(daysSinceStudy, topic.repetitions, topic.easeFactor);
      const weaknessScore = Math.round(100 - (retention + topic.confidenceScore) / 2);

      return {
        topic: topic.name,
        subject: topic.subject,
        weaknessScore,
        retention,
        confidence: topic.confidenceScore,
        lastStudied: topic.lastStudied,
      };
    });

    res.json({ success: true, data: heatmapData });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get retention curve data over time
 * @route   GET /api/analytics/retention
 * @access  Private
 */
const getRetentionCurve = async (req, res, next) => {
  try {
    const revisions = await RevisionHistory.find({
      userId: req.user._id,
      status: 'completed',
    })
      .sort({ completedDate: 1 })
      .limit(30);

    const curveData = revisions.map((r) => ({
      date: r.completedDate,
      retention: r.retentionAfter || 0,
      topic: r.topicName,
    }));

    res.json({ success: true, data: curveData });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get leaderboard
 * @route   GET /api/analytics/leaderboard
 * @access  Private
 */
const getLeaderboard = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'student' })
      .select('name avatar streak xpPoints level careerReadinessScore careerGoal')
      .sort({ xpPoints: -1 })
      .limit(20);

    const leaderboard = users.map((u, index) => ({
      rank: index + 1,
      ...u.toObject(),
    }));

    res.json({ success: true, leaderboard });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, getHeatmap, getRetentionCurve, getLeaderboard };
