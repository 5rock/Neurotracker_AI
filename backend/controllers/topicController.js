const Topic = require('../models/Topic');
const RevisionHistory = require('../models/RevisionHistory');
const { calculateSM2, calculateRetention, getTodayRevisions } = require('../ai/spacedRepetition');

/**
 * @desc    Get all topics for user
 * @route   GET /api/topics
 * @access  Private
 */
const getTopics = async (req, res, next) => {
  try {
    const { subject, difficulty, archived } = req.query;
    const filter = { userId: req.user._id };

    if (subject) filter.subject = subject;
    if (difficulty) filter.difficulty = difficulty;
    filter.isArchived = archived === 'true';

    const topics = await Topic.find(filter).sort({ nextRevisionDate: 1 });

    // Calculate retention for each topic
    const topicsWithRetention = topics.map((topic) => {
      const daysSinceStudy = topic.lastStudied
        ? Math.floor((new Date() - new Date(topic.lastStudied)) / (1000 * 60 * 60 * 24))
        : 30;
      const retention = calculateRetention(daysSinceStudy, topic.repetitions, topic.easeFactor);
      return { ...topic.toObject(), memoryRetention: retention };
    });

    res.json({ success: true, count: topics.length, topics: topicsWithRetention });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add new topic
 * @route   POST /api/topics
 * @access  Private
 */
const addTopic = async (req, res, next) => {
  try {
    const topic = await Topic.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ success: true, message: 'Topic added!', topic });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update topic
 * @route   PUT /api/topics/:id
 * @access  Private
 */
const updateTopic = async (req, res, next) => {
  try {
    const topic = await Topic.findOne({ _id: req.params.id, userId: req.user._id });
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found.' });
    }

    const updated = await Topic.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, message: 'Topic updated!', topic: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete topic
 * @route   DELETE /api/topics/:id
 * @access  Private
 */
const deleteTopic = async (req, res, next) => {
  try {
    const topic = await Topic.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found.' });
    }
    res.json({ success: true, message: 'Topic deleted.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Complete a study session for a topic (SM-2 update)
 * @route   POST /api/topics/:id/study
 * @access  Private
 */
const studyTopic = async (req, res, next) => {
  try {
    const { qualityRating, timeSpent } = req.body; // qualityRating 0-5
    const topic = await Topic.findOne({ _id: req.params.id, userId: req.user._id });

    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found.' });
    }

    // Apply SM-2 algorithm
    const sm2Result = calculateSM2(
      qualityRating,
      topic.repetitions,
      topic.easeFactor,
      topic.interval
    );

    // Update confidence score
    const confidenceDelta = (qualityRating / 5) * 10 - 5;
    const newConfidence = Math.max(0, Math.min(100, topic.confidenceScore + confidenceDelta));

    // Update topic
    topic.repetitions = sm2Result.repetitions;
    topic.easeFactor = sm2Result.easeFactor;
    topic.interval = sm2Result.interval;
    topic.nextRevisionDate = sm2Result.nextDate;
    topic.lastStudied = new Date();
    topic.revisionCount += 1;
    topic.confidenceScore = Math.round(newConfidence);
    topic.timeSpent += timeSpent || 0;

    await topic.save();

    // Log revision
    await RevisionHistory.create({
      userId: req.user._id,
      topicId: topic._id,
      topicName: topic.name,
      subject: topic.subject,
      scheduledDate: new Date(),
      completedDate: new Date(),
      status: 'completed',
      qualityRating,
      newInterval: sm2Result.interval,
      newEaseFactor: sm2Result.easeFactor,
    });

    res.json({
      success: true,
      message: 'Study session recorded!',
      topic,
      nextRevision: sm2Result.nextDate,
      interval: sm2Result.interval,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get today's revision topics
 * @route   GET /api/topics/today
 * @access  Private
 */
const getTodayTopics = async (req, res, next) => {
  try {
    const allTopics = await Topic.find({ userId: req.user._id, isArchived: false });
    const todayTopics = getTodayRevisions(allTopics);

    res.json({ success: true, count: todayTopics.length, topics: todayTopics });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTopics, addTopic, updateTopic, deleteTopic, studyTopic, getTodayTopics };
