const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      // Optional for guest accounts
      required: false,
      unique: true,
      sparse: true, // Allows multiple null values (multiple guests)
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      // Optional for guest accounts
      required: false,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'admin', 'guest'],
      default: 'student',
    },
    avatar: {
      type: String,
      default: '',
    },
    careerGoal: {
      type: String,
      default: 'Full Stack Developer',
    },
    bio: {
      type: String,
      maxlength: [200, 'Bio cannot exceed 200 characters'],
      default: '',
    },
    // Gamification
    streak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    totalStudyHours: {
      type: Number,
      default: 0,
    },
    xpPoints: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    badges: [
      {
        name: String,
        description: String,
        icon: String,
        earnedAt: { type: Date, default: Date.now },
      },
    ],
    // Career readiness
    careerReadinessScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    // Password reset
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    // Email verification
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,

    // ─── Guest Mode Fields ───────────────────────────────────────────────
    /** Whether this is a temporary guest account */
    isGuest: {
      type: Boolean,
      default: false,
      index: true,
    },
    /** When the guest session expires (24h from creation) */
    guestExpiresAt: {
      type: Date,
      default: null,
      index: true, // Used by cleanup service
    },
    /** Unique stable identifier for guest → real-user migration */
    guestId: {
      type: String,
      default: null,
      sparse: true,
      index: true,
    },
    /** Number of AI analyses the guest has used today */
    guestAiUsageCount: {
      type: Number,
      default: 0,
    },
    /** The date (midnight UTC) on which the current AI usage count applies */
    guestAiUsageDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving (Mongoose 7+: async hooks must not use next())
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update streak logic
userSchema.methods.updateStreak = function () {
  const now = new Date();
  const last = new Date(this.lastActive);
  const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    this.streak += 1;
    if (this.streak > this.longestStreak) this.longestStreak = this.streak;
  } else if (diffDays > 1) {
    this.streak = 1;
  }
  this.lastActive = now;
};

/**
 * Check and update guest AI usage.
 * Returns true if the guest is within the daily limit, false if exceeded.
 */
userSchema.methods.checkAndIncrementGuestAiUsage = async function (dailyLimit = 3) {
  const todayMidnight = new Date();
  todayMidnight.setUTCHours(0, 0, 0, 0);

  // Reset counter if it's a new day
  const lastUsageDay = this.guestAiUsageDate ? new Date(this.guestAiUsageDate) : null;
  if (!lastUsageDay || lastUsageDay < todayMidnight) {
    this.guestAiUsageCount = 0;
    this.guestAiUsageDate = todayMidnight;
  }

  if (this.guestAiUsageCount >= dailyLimit) {
    return false; // Limit exceeded
  }

  this.guestAiUsageCount += 1;
  await this.save({ validateBeforeSave: false });
  return true;
};

module.exports = mongoose.model('User', userSchema);
