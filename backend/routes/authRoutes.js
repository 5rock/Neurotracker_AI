const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const {
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
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const isDev = process.env.NODE_ENV !== 'production';

/**
 * Strict rate limiter for the guest endpoint.
 * Higher limit in development to avoid blocking local testing.
 */
const guestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDev ? 100 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 'GUEST_RATE_LIMIT',
    message: 'Guest login limit reached. Please try again later or create a free account.',
  },
});

// Public routes — health first (diagnostics)
router.get('/health', healthCheck);
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Guest routes (public, rate-limited)
router.post('/guest', guestLimiter, guestLogin);

// Protected routes (requires valid JWT, works for both guests and registered users)
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// Guest migration (protected – called right after registration to transfer guest data)
router.post('/migrate-guest', protect, migrateGuest);

module.exports = router;
