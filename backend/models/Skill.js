const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['frontend', 'backend', 'database', 'devops', 'ai_ml', 'mobile', 'soft_skills', 'other'],
      default: 'other',
    },
    proficiency: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    // Industry data
    industryDemand: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    trending: {
      type: Boolean,
      default: false,
    },
    trendingRank: Number,
    // Gap analysis
    isGap: {
      type: Boolean,
      default: false,
    },
    gapPriority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    recommendedResources: [
      {
        title: String,
        url: String,
        type: { type: String, enum: ['video', 'article', 'course', 'book'] },
      },
    ],
    targetProficiency: {
      type: Number,
      default: 80,
    },
    estimatedHours: Number,
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

skillSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('Skill', skillSchema);
