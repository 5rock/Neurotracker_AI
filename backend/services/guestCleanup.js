/**
 * guestCleanup.js
 *
 * Scheduled service that purges expired guest accounts and all their
 * associated data (ChatHistory, Topics, Roadmaps) once per hour.
 *
 * Call startGuestCleanup() once at server startup.
 */

const User = require('../models/User');
const ChatHistory = require('../models/ChatHistory');
const Topic = require('../models/Topic');
const Roadmap = require('../models/Roadmap');

const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Delete all expired guest accounts and their associated data.
 * @returns {Promise<number>} Number of guest accounts removed
 */
const runCleanup = async () => {
  try {
    const now = new Date();

    // Find all expired guest users
    const expiredGuests = await User.find({
      isGuest: true,
      guestExpiresAt: { $lte: now },
    }).select('_id');

    if (expiredGuests.length === 0) return 0;

    const expiredIds = expiredGuests.map((g) => g._id);

    // Delete associated data in parallel
    await Promise.all([
      ChatHistory.deleteMany({ userId: { $in: expiredIds } }),
      Topic.deleteMany({ userId: { $in: expiredIds } }),
      Roadmap.deleteMany({ userId: { $in: expiredIds } }),
    ]);

    // Delete the guest user documents
    const result = await User.deleteMany({ _id: { $in: expiredIds } });

    console.log(`[GuestCleanup] Removed ${result.deletedCount} expired guest account(s) at ${now.toISOString()}`);
    return result.deletedCount;
  } catch (err) {
    console.error('[GuestCleanup] Error during cleanup:', err.message);
    return 0;
  }
};

/**
 * Start the guest cleanup scheduler.
 * Runs immediately on startup, then once per hour.
 */
const startGuestCleanup = () => {
  // Run once at startup to clean any leftover expired guests
  runCleanup();

  // Then run on a recurring interval
  const intervalId = setInterval(runCleanup, CLEANUP_INTERVAL_MS);

  // Allow Node.js process to exit even if this interval is still running
  if (intervalId.unref) intervalId.unref();

  console.log('[GuestCleanup] Scheduled hourly cleanup started.');
  return intervalId;
};

module.exports = { startGuestCleanup, runCleanup };
