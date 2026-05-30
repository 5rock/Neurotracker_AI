const jwt = require('jsonwebtoken');
const User = require('../models/User');

const TOKEN_COOKIE_NAME = 'neurotrack_token';

/**
 * Protect routes - verify JWT token and attach user to request.
 * Supports both regular and guest users.
 * Automatically rejects expired guest sessions.
 */
const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.[TOKEN_COOKIE_NAME];

    // Temporary fallback for older clients during migration.
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. No token provided.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token is invalid.',
      });
    }

    // ── Guest expiry check ──────────────────────────────────────────────
    if (user.isGuest && user.guestExpiresAt && new Date() > new Date(user.guestExpiresAt)) {
      // Clear the cookie so the client doesn't keep retrying
      clearTokenCookie(res);
      return res.status(401).json({
        success: false,
        code: 'GUEST_EXPIRED',
        message: 'Your guest session has expired. Please create a free account to continue.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please login again.' });
    }
    next(error);
  }
};

/**
 * Restrict to specific roles.
 * Example: authorize('student', 'admin') – blocks 'guest' role.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        code: 'GUEST_RESTRICTED',
        message: `This feature requires a registered account. Create a free account to access it.`,
      });
    }
    next();
  };
};

/**
 * Middleware: block guest users from accessing a route.
 * Sends a structured response the frontend can intercept to show the upgrade modal.
 */
const requireRegistered = (req, res, next) => {
  if (req.user?.isGuest) {
    return res.status(403).json({
      success: false,
      code: 'GUEST_RESTRICTED',
      message: 'Create an account to unlock this feature and save your progress permanently.',
    });
  }
  next();
};

const GUEST_AI_DAILY_LIMIT = 3;

/**
 * Enforce daily AI usage cap for guest accounts on expensive AI routes.
 */
const enforceGuestAiLimit = async (req, res, next) => {
  if (!req.user?.isGuest) return next();

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found. Token is invalid.' });
    }

    const withinLimit = await user.checkAndIncrementGuestAiUsage(GUEST_AI_DAILY_LIMIT);
    if (!withinLimit) {
      return res.status(429).json({
        success: false,
        code: 'GUEST_AI_LIMIT',
        message: `Guest users are limited to ${GUEST_AI_DAILY_LIMIT} AI analyses per day. Create a free account for unlimited access.`,
        limit: GUEST_AI_DAILY_LIMIT,
        used: user.guestAiUsageCount,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Generate JWT Token
 * @param {string} id - User ID
 * @param {string} [customExpiry] - Override default expiry (e.g. '24h' for guests)
 */
const generateToken = (id, customExpiry) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: customExpiry || process.env.JWT_EXPIRES_IN || '7d',
  });
};

const cookieMaxAge = (customMs) => {
  if (customMs) return customMs;
  const days = Number(process.env.JWT_COOKIE_EXPIRES_DAYS || 7);
  return days * 24 * 60 * 60 * 1000;
};

const cookieOptions = (customMaxAgeMs) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: cookieMaxAge(customMaxAgeMs),
  path: '/',
});

const setTokenCookie = (res, token, customMaxAgeMs) => {
  res.cookie(TOKEN_COOKIE_NAME, token, cookieOptions(customMaxAgeMs));
};

const clearTokenCookie = (res) => {
  res.clearCookie(TOKEN_COOKIE_NAME, {
    ...cookieOptions(),
    maxAge: undefined,
  });
};

module.exports = {
  protect,
  authorize,
  requireRegistered,
  enforceGuestAiLimit,
  generateToken,
  setTokenCookie,
  clearTokenCookie,
  TOKEN_COOKIE_NAME,
};
