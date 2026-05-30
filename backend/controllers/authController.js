const User = require('../models/User');
const Analytics = require('../models/Analytics');
const ChatHistory = require('../models/ChatHistory');
const Topic = require('../models/Topic');
const Roadmap = require('../models/Roadmap');
const { generateToken, setTokenCookie, clearTokenCookie } = require('../middleware/auth');
const crypto = require('crypto');

/** Serialize user for API responses */
const serializeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  careerGoal: user.careerGoal,
  avatar: user.avatar,
  streak: user.streak,
  xpPoints: user.xpPoints,
  level: user.level,
  careerReadinessScore: user.careerReadinessScore,
  badges: user.badges,
  // Guest fields
  isGuest: user.isGuest || false,
  guestId: user.guestId || null,
  guestExpiresAt: user.guestExpiresAt || null,
  guestAiUsageCount: user.guestAiUsageCount || 0,
});

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, careerGoal, guestId } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    // Create user
    const user = await User.create({ name, email, password, careerGoal });

    // Create initial analytics record
    await Analytics.create({ userId: user._id });

    // ── Migrate guest data if a guestId was provided ─────────────────────
    if (guestId) {
      await migrateGuestData(guestId, user._id);
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      user: serializeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    // Find user with password
    const user = await User.findOne({ email, isGuest: { $ne: true } }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Update streak
    user.updateStreak();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.json({
      success: true,
      message: 'Login successful!',
      user: serializeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Guest login – create a temporary guest session
 * @route   POST /api/auth/guest
 * @access  Public
 */
const guestLogin = async (req, res, next) => {
  try {
    const GUEST_EXPIRY_HOURS = 24;
    const guestExpiresAt = new Date(Date.now() + GUEST_EXPIRY_HOURS * 60 * 60 * 1000);

    // Generate a stable unique ID for migration tracking
    const guestId = crypto.randomBytes(16).toString('hex');

    // Create a temporary guest user document
    const guest = await User.create({
      name: 'Guest User',
      email: undefined,    // No email for guests
      password: undefined, // No password for guests
      role: 'guest',
      isGuest: true,
      guestId,
      guestExpiresAt,
      careerGoal: 'Full Stack Developer',
    });

    // Generate a 24h JWT and align cookie lifetime with token expiry
    const guestCookieMs = 24 * 60 * 60 * 1000;
    const token = generateToken(guest._id, '24h');
    setTokenCookie(res, token, guestCookieMs);

    res.status(201).json({
      success: true,
      message: 'Guest session created!',
      user: serializeUser(guest),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Migrate guest data to a newly registered account
 * @route   POST /api/auth/migrate-guest
 * @access  Private
 */
const migrateGuest = async (req, res, next) => {
  try {
    const { guestId } = req.body;
    if (!guestId) {
      return res.status(400).json({ success: false, message: 'guestId is required.' });
    }

    await migrateGuestData(guestId, req.user._id);

    res.json({ success: true, message: 'Guest data migrated successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Internal helper: Transfer guest data → real user, then delete the guest.
 */
const migrateGuestData = async (guestId, newUserId) => {
  try {
    // Find the guest user document
    const guestUser = await User.findOne({ guestId, isGuest: true });
    if (!guestUser) return; // No guest to migrate (may have expired)

    const guestUserId = guestUser._id;

    // Re-associate all guest data to the new real user in parallel
    await Promise.all([
      ChatHistory.updateMany({ userId: guestUserId }, { $set: { userId: newUserId } }),
      Topic.updateMany({ userId: guestUserId }, { $set: { userId: newUserId } }),
      Roadmap.updateMany({ userId: guestUserId }, { $set: { userId: newUserId } }),
    ]);

    // Clean up the temporary guest user document
    await User.findByIdAndDelete(guestUserId);

    console.log(`[GuestMigration] Migrated guest ${guestId} → user ${newUserId}`);
  } catch (err) {
    // Non-fatal: log but don't block registration
    console.error(`[GuestMigration] Failed for guestId ${guestId}:`, err.message);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout current user
 * @route   POST /api/auth/logout
 * @access  Public
 */
const logout = async (req, res, next) => {
  try {
    clearTokenCookie(res);
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, careerGoal, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, careerGoal, avatar },
      { new: true, runValidators: true }
    );

    res.json({ success: true, message: 'Profile updated!', user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully!' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot password - generate reset token
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email, isGuest: { $ne: true } });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with that email.' });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save({ validateBeforeSave: false });

    // In production, send email here
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    res.json({
      success: true,
      message: 'Password reset link sent to your email!',
      // Include in dev only
      ...(process.env.NODE_ENV === 'development' && { resetUrl }),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password/:token
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = generateToken(user._id);
    setTokenCookie(res, token);
    res.json({ success: true, message: 'Password reset successful!', user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Auth Health Check
 * @route   GET /api/auth/health
 * @access  Public
 */
const healthCheck = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const dbWorks = mongoose.connection.readyState === 1;

    res.json({
      success: true,
      auth: 'healthy',
      database: dbWorks,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      auth: 'unhealthy',
      error: err.message,
    });
  }
};

module.exports = {
  register,
  login,
  guestLogin,
  migrateGuest,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  healthCheck,
};
