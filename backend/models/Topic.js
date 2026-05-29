const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Topic name is required'],
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['programming', 'mathematics', 'science', 'language', 'other'],
      default: 'programming',
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    // SM-2 spaced repetition fields
    easeFactor: {
      type: Number,
      default: 2.5,
    },
    interval: {
      type: Number,
      default: 1, // days until next review
    },
    repetitions: {
      type: Number,
      default: 0,
    },
    // Performance
    confidenceScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    memoryRetention: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    // Study tracking
    timeSpent: {
      type: Number,
      default: 0, // minutes
    },
    revisionCount: {
      type: Number,
      default: 0,
    },
    lastStudied: {
      type: Date,
      default: null,
    },
    nextRevisionDate: {
      type: Date,
      default: Date.now,
    },
    // Mistake history
    mistakeHistory: [
      {
        date: { type: Date, default: Date.now },
        question: String,
        userAnswer: String,
        correctAnswer: String,
      },
    ],
    tags: [String],
    notes: {
      type: String,
      maxlength: 1000,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
topicSchema.index({ userId: 1, nextRevisionDate: 1 });
topicSchema.index({ userId: 1, subject: 1 });

module.exports = mongoose.model('Topic', topicSchema);
