/**
 * SM-2 Spaced Repetition Algorithm
 *
 * Quality ratings (0-5):
 * 5 - Perfect response
 * 4 - Correct response after hesitation
 * 3 - Correct response with serious difficulty
 * 2 - Incorrect, but upon seeing correct answer, it was easy
 * 1 - Incorrect, but correct answer seemed easy
 * 0 - Complete blackout
 */

/**
 * Calculate next review interval using SM-2 algorithm
 * @param {number} quality - Rating 0-5
 * @param {number} repetitions - Number of successful reviews
 * @param {number} easeFactor - Current ease factor (default 2.5)
 * @param {number} interval - Current interval in days
 * @returns {{ interval, repetitions, easeFactor, nextDate }}
 */
const calculateSM2 = (quality, repetitions, easeFactor = 2.5, interval = 1) => {
  let newEaseFactor = easeFactor;
  let newInterval = interval;
  let newRepetitions = repetitions;

  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * easeFactor);
    }
    newRepetitions = repetitions + 1;
  } else {
    // Incorrect response - reset
    newRepetitions = 0;
    newInterval = 1;
  }

  // Update ease factor
  newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // Minimum ease factor is 1.3
  if (newEaseFactor < 1.3) newEaseFactor = 1.3;
  newEaseFactor = Math.round(newEaseFactor * 100) / 100;

  // Calculate next review date
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + newInterval);

  return {
    interval: newInterval,
    repetitions: newRepetitions,
    easeFactor: newEaseFactor,
    nextDate,
  };
};

/**
 * Calculate memory retention using Ebbinghaus forgetting curve
 * Retention = 100 * e^(-t/S)
 * where t = time since last study (days), S = stability factor
 * @param {number} daysSinceStudy
 * @param {number} repetitions - more repetitions = higher stability
 * @returns {number} retention percentage (0-100)
 */
const calculateRetention = (daysSinceStudy, repetitions = 0, easeFactor = 2.5) => {
  const stability = Math.max(1, repetitions * easeFactor * 2);
  const retention = 100 * Math.exp(-daysSinceStudy / stability);
  return Math.max(0, Math.min(100, Math.round(retention)));
};

/**
 * Get priority level based on retention and next review date
 * @param {number} retention
 * @param {Date} nextRevisionDate
 * @returns {string} 'critical' | 'high' | 'medium' | 'low'
 */
const getPriority = (retention, nextRevisionDate) => {
  const daysUntilRevision = Math.floor(
    (new Date(nextRevisionDate) - new Date()) / (1000 * 60 * 60 * 24)
  );

  if (retention < 30 || daysUntilRevision < 0) return 'critical';
  if (retention < 50 || daysUntilRevision === 0) return 'high';
  if (retention < 70 || daysUntilRevision <= 2) return 'medium';
  return 'low';
};

/**
 * Generate study recommendations for today
 * @param {Array} topics - Array of topic documents
 * @returns {Array} Sorted topics to study today
 */
const getTodayRevisions = (topics) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return topics
    .filter((topic) => {
      const nextRevision = new Date(topic.nextRevisionDate);
      return nextRevision <= tomorrow;
    })
    .map((topic) => {
      const daysSinceStudy = topic.lastStudied
        ? Math.floor((new Date() - new Date(topic.lastStudied)) / (1000 * 60 * 60 * 24))
        : 30;
      const retention = calculateRetention(daysSinceStudy, topic.repetitions, topic.easeFactor);
      const priority = getPriority(retention, topic.nextRevisionDate);

      return { ...topic.toObject(), retention, priority, daysSinceStudy };
    })
    .sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
};

module.exports = { calculateSM2, calculateRetention, getPriority, getTodayRevisions };
