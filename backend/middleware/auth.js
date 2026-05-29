const jwt = require('jsonwebtoken');
const User = require('../models/User');

const TOKEN_COOKIE_NAME = 'neurotrack_token';

/**
 * Protect routes - verify JWT token and attach user to request
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
 * Restrict to specific roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route.`,
      });
    }
    next();
  };
};

/**
 * Generate JWT Token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const cookieMaxAge = () => {
  const days = Number(process.env.JWT_COOKIE_EXPIRES_DAYS || 7);
  return days * 24 * 60 * 60 * 1000;
};

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: cookieMaxAge(),
  path: '/',
});

const setTokenCookie = (res, token) => {
  res.cookie(TOKEN_COOKIE_NAME, token, cookieOptions());
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
  generateToken,
  setTokenCookie,
  clearTokenCookie,
  TOKEN_COOKIE_NAME,
};
