const mongoose = require('mongoose');

const revisionHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
    },
    topicName: String,
    subject: String,
    scheduledDate: {
      type: Date,
      required: true,
    },
    completedDate: Date,
    status: {
      type: String,
      enum: ['pending', 'completed', 'skipped', 'overdue'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    retentionBefore: {
      type: Number,
      min: 0,
      max: 100,
    },
    retentionAfter: {
      type: Number,
      min: 0,
      max: 100,
    },
    qualityRating: {
      type: Number,
      min: 0,
      max: 5, // SM-2 quality rating
    },
    notes: String,
    // SM-2 results
    newInterval: Number,
    newEaseFactor: Number,
  },
  { timestamps: true }
);

revisionHistorySchema.index({ userId: 1, scheduledDate: 1 });
revisionHistorySchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('RevisionHistory', revisionHistorySchema);
