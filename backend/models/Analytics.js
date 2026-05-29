const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // Memory & Retention
    memoryRetention: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    averageConfidence: {
      type: Number,
      default: 0,
    },
    // Study stats
    totalStudyHours: {
      type: Number,
      default: 0,
    },
    totalTopics: {
      type: Number,
      default: 0,
    },
    masteredTopics: {
      type: Number,
      default: 0,
    },
    // Streak
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    // Career
    careerReadinessScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    // Weak topics
    weakTopics: [
      {
        topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
        name: String,
        subject: String,
        weaknessScore: Number, // 0-100, higher = weaker
      },
    ],
    // Skill growth over time
    skillGrowth: [
      {
        date: Date,
        score: Number,
      },
    ],
    // Daily study hours
    dailyStudyData: [
      {
        date: { type: Date },
        hours: { type: Number, default: 0 },
        topicsRevised: { type: Number, default: 0 },
      },
    ],
    // Retention curve
    retentionCurve: [
      {
        date: Date,
        retention: Number,
      },
    ],
    lastCalculated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Analytics', analyticsSchema);
