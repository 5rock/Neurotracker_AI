const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    careerGoal: {
      type: String,
      required: true,
    },
    title: String,
    description: String,
    totalDuration: {
      type: Number,
      default: 6, // months
    },
    milestones: [
      {
        month: Number,
        title: String,
        description: String,
        skills: [String],
        resources: [
          {
            title: String,
            url: String,
            type: String,
          },
        ],
        status: {
          type: String,
          enum: ['locked', 'in_progress', 'completed'],
          default: 'locked',
        },
        completedAt: Date,
        progressPercent: {
          type: Number,
          default: 0,
        },
      },
    ],
    overallProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    aiRecommendations: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Roadmap', roadmapSchema);
