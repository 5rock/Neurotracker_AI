/**
 * guestSession.js
 * ═══════════════════════════════════════════════════════════════
 * Central localStorage service for all guest-mode features.
 * Pure JS — no React. Used by useGuestSession hook + components.
 *
 * Storage layout (localStorage key: neurotrack_guest_session):
 * {
 *   startTime, lastActive, visitCount,
 *   aiAnalysesCount, roadmapsCreated,
 *   featuresExplored: string[],
 *   achievements: { id, unlockedAt }[],
 *   activityTimeline: { type, label, emoji, time }[],
 *   conversionCooldown: timestamp | null,
 *   demoModeDismissed: boolean
 * }
 * ═══════════════════════════════════════════════════════════════
 */

export const SESSION_KEY = 'neurotrack_guest_session';
export const UPDATE_EVENT = 'neurotrack:guest-session-update';
const VISIT_SESSION_KEY = 'nt_visit_counted';
const MAX_TIMELINE_EVENTS = 30;

// ── Achievement Definitions ──────────────────────────────────────────────────
export const ACHIEVEMENT_DEFS = [
  {
    id: 'welcome',
    emoji: '👋',
    title: 'Welcome Explorer',
    desc: 'Started your NeuroTrack AI journey',
    auto: true,
  },
  {
    id: 'first_analysis',
    emoji: '🏆',
    title: 'First Analysis',
    desc: 'Completed your first AI analysis',
    check: (s) => s.aiAnalysesCount >= 1,
  },
  {
    id: 'ai_power',
    emoji: '⚡',
    title: 'AI Power User',
    desc: 'Completed 3 AI sessions in a day',
    check: (s) => s.aiAnalysesCount >= 3,
  },
  {
    id: 'roadmap',
    emoji: '🗺️',
    title: 'Road Mapper',
    desc: 'Generated your first career roadmap',
    check: (s) => s.roadmapsCreated >= 1,
  },
  {
    id: 'explorer',
    emoji: '🔍',
    title: 'Platform Explorer',
    desc: 'Explored 5 different features',
    check: (s) => s.featuresExplored.length >= 5,
  },
  {
    id: 'tenacity',
    emoji: '🚀',
    title: 'Productivity Starter',
    desc: 'Spent 10+ minutes on NeuroTrack AI',
    check: (s) => (Date.now() - s.startTime) >= 10 * 60 * 1000,
  },
  {
    id: 'goal_setter',
    emoji: '🎯',
    title: 'Goal Setter',
    desc: 'Viewed your career roadmap',
    check: (s) => s.featuresExplored.includes('/career-roadmap'),
  },
  {
    id: 'profile_explorer',
    emoji: '👤',
    title: 'Profile Explorer',
    desc: 'Visited the profile section',
    check: (s) => s.featuresExplored.includes('/profile'),
  },
];

// ── Default state ─────────────────────────────────────────────────────────────
const defaultSession = () => ({
  startTime: Date.now(),
  lastActive: Date.now(),
  visitCount: 1,
  aiAnalysesCount: 0,
  roadmapsCreated: 0,
  featuresExplored: [],
  achievements: [{ id: 'welcome', unlockedAt: Date.now() }], // auto-unlock on creation
  activityTimeline: [
    { type: 'session_start', label: 'Guest Session Started', emoji: '🌟', time: Date.now() },
  ],
  conversionCooldown: null,
  demoModeDismissed: false,
});

// ── Read / Write ──────────────────────────────────────────────────────────────
export const readSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeSession = (data) => {
  try {
    data.lastActive = Date.now();
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
    // Notify all hook subscribers
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: data }));
  } catch {}
};

// ── Initialize / Get ──────────────────────────────────────────────────────────
export const getOrCreateSession = () => {
  const existing = readSession();
  if (existing) {
    // Track returning visits (once per browser tab session)
    if (!sessionStorage.getItem(VISIT_SESSION_KEY)) {
      sessionStorage.setItem(VISIT_SESSION_KEY, '1');
      const updated = { ...existing, visitCount: (existing.visitCount || 1) + 1 };
      writeSession(updated);
      return updated;
    }
    return existing;
  }

  sessionStorage.setItem(VISIT_SESSION_KEY, '1');
  const fresh = defaultSession();
  writeSession(fresh);
  return fresh;
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(VISIT_SESSION_KEY);
};

// ── Track Feature Visit ───────────────────────────────────────────────────────
export const trackFeatureVisit = (path) => {
  const session = readSession();
  if (!session) return;

  const PAGE_LABELS = {
    '/dashboard': { label: 'Visited Dashboard', emoji: '📊' },
    '/ai-mentor': { label: 'Chatted with AI Mentor', emoji: '🤖' },
    '/memory-tracker': { label: 'Opened Memory Tracker', emoji: '📖' },
    '/weak-topics': { label: 'Explored Weak Topics', emoji: '🔴' },
    '/revision-scheduler': { label: 'Opened Revision Planner', emoji: '📅' },
    '/skill-gap': { label: 'Ran Skill Gap Analysis', emoji: '⚡' },
    '/career-roadmap': { label: 'Viewed Career Roadmap', emoji: '🗺️' },
    '/analytics': { label: 'Opened Analytics', emoji: '📈' },
    '/profile': { label: 'Visited Profile', emoji: '👤' },
    '/leaderboard': { label: 'Checked Leaderboard', emoji: '🏆' },
  };

  const already = session.featuresExplored.includes(path);
  const meta = PAGE_LABELS[path];

  const updatedExplored = already
    ? session.featuresExplored
    : [...session.featuresExplored, path];

  const newEvent = meta && !already
    ? [{ type: 'feature_visit', label: meta.label, emoji: meta.emoji, time: Date.now() }]
    : [];

  const updated = {
    ...session,
    featuresExplored: updatedExplored,
    activityTimeline: [...newEvent, ...session.activityTimeline].slice(0, MAX_TIMELINE_EVENTS),
  };

  writeSession(checkAndUnlockAchievements(updated));
};

// ── Track AI Analysis ─────────────────────────────────────────────────────────
export const trackAIAnalysis = () => {
  const session = readSession();
  if (!session) return;

  const updated = {
    ...session,
    aiAnalysesCount: session.aiAnalysesCount + 1,
    activityTimeline: [
      { type: 'ai_analysis', label: 'AI Analysis Completed', emoji: '🤖', time: Date.now() },
      ...session.activityTimeline,
    ].slice(0, MAX_TIMELINE_EVENTS),
  };

  writeSession(checkAndUnlockAchievements(updated));
};

// ── Track Roadmap Creation ────────────────────────────────────────────────────
export const trackRoadmapCreated = () => {
  const session = readSession();
  if (!session) return;

  const updated = {
    ...session,
    roadmapsCreated: session.roadmapsCreated + 1,
    activityTimeline: [
      { type: 'roadmap_created', label: 'Career Roadmap Generated', emoji: '🗺️', time: Date.now() },
      ...session.activityTimeline,
    ].slice(0, MAX_TIMELINE_EVENTS),
  };

  writeSession(checkAndUnlockAchievements(updated));
};

// ── Achievement Engine ─────────────────────────────────────────────────────────
const checkAndUnlockAchievements = (session) => {
  let changed = false;
  const earnedIds = new Set(session.achievements.map((a) => a.id));
  const newlyUnlocked = [];

  for (const def of ACHIEVEMENT_DEFS) {
    if (def.auto) continue; // auto-unlocked on session create
    if (earnedIds.has(def.id)) continue;
    if (def.check && def.check(session)) {
      newlyUnlocked.push({ id: def.id, unlockedAt: Date.now() });
      changed = true;
    }
  }

  if (!changed) return session;

  // Fire unlock events so components can show toast/animation
  newlyUnlocked.forEach((a) => {
    window.dispatchEvent(new CustomEvent('neurotrack:achievement-unlocked', { detail: a }));
  });

  return {
    ...session,
    achievements: [...session.achievements, ...newlyUnlocked],
  };
};

// ── Manually unlock (for tenacity timer) ──────────────────────────────────────
export const checkTimedAchievements = () => {
  const session = readSession();
  if (!session) return;
  const updated = checkAndUnlockAchievements(session);
  if (updated !== session) writeSession(updated);
};

// ── Dismiss Demo Mode ─────────────────────────────────────────────────────────
export const dismissDemoMode = () => {
  const session = readSession();
  if (!session) return;
  writeSession({ ...session, demoModeDismissed: true });
};

// ── Conversion Cooldown ───────────────────────────────────────────────────────
const COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes

export const canShowConversion = () => {
  const session = readSession();
  if (!session) return false;
  if (!session.conversionCooldown) return true;
  return Date.now() > session.conversionCooldown + COOLDOWN_MS;
};

export const recordConversionShown = () => {
  const session = readSession();
  if (!session) return;
  writeSession({ ...session, conversionCooldown: Date.now() });
};

// ── Computed Metrics ──────────────────────────────────────────────────────────
export const computeMetrics = (session) => {
  if (!session) return null;

  const sessionSecs = Math.floor((Date.now() - session.startTime) / 1000);
  const sessionMins = Math.floor(sessionSecs / 60);
  const hours = Math.floor(sessionSecs / 3600);
  const mins = Math.floor((sessionSecs % 3600) / 60);
  const secs = sessionSecs % 60;

  const timeStr = hours > 0
    ? `${hours}h ${mins}m`
    : mins > 0
    ? `${mins}m ${secs}s`
    : `${secs}s`;

  // Productivity score: weighted blend of activities
  const aiScore = Math.min(60, session.aiAnalysesCount * 20);
  const roadmapScore = Math.min(30, session.roadmapsCreated * 30);
  const explorerScore = Math.min(25, session.featuresExplored.length * 5);
  const timeScore = sessionMins >= 10 ? 15 : Math.floor(sessionMins * 1.5);
  const returnScore = session.visitCount > 1 ? 10 : 0;
  const productivityScore = Math.min(100, aiScore + roadmapScore + explorerScore + timeScore + returnScore);

  // Goal completion
  const aiGoal = Math.min(100, Math.round((session.aiAnalysesCount / 3) * 100));
  const explorerGoal = Math.min(100, Math.round((session.featuresExplored.length / 8) * 100));
  const overallGoal = Math.round((aiGoal + explorerGoal) / 2);

  // Profile completion (guest starts at 20%)
  const profileCompletion = Math.min(100,
    20 +
    (session.aiAnalysesCount >= 1 ? 20 : 0) +
    (session.roadmapsCreated >= 1 ? 30 : 0) +
    (session.featuresExplored.length >= 5 ? 20 : 0) +
    (session.visitCount > 1 ? 10 : 0)
  );

  // Personalized recommendations
  const recommendations = getRecommendations(session);

  return {
    sessionTime: timeStr,
    sessionSecs,
    aiAnalysesCount: session.aiAnalysesCount,
    roadmapsCreated: session.roadmapsCreated,
    featuresExplored: session.featuresExplored.length,
    productivityScore,
    profileCompletion,
    goalCompletion: overallGoal,
    visitCount: session.visitCount,
    recommendations,
    isReturnVisitor: session.visitCount > 1,
  };
};

// ── Personalized Recommendations ─────────────────────────────────────────────
const getRecommendations = (session) => {
  const recs = [];

  if (session.aiAnalysesCount === 0) {
    recs.push({ emoji: '🤖', text: 'Chat with AI Mentor for personalized guidance', path: '/ai-mentor' });
  }
  if (session.roadmapsCreated === 0) {
    recs.push({ emoji: '🗺️', text: 'Generate your AI career roadmap', path: '/career-roadmap' });
  }
  if (!session.featuresExplored.includes('/skill-gap')) {
    recs.push({ emoji: '⚡', text: 'Run a Skill Gap Analysis to see where you stand', path: '/skill-gap' });
  }
  if (!session.featuresExplored.includes('/memory-tracker')) {
    recs.push({ emoji: '📖', text: 'Track topics with the Memory Tracker', path: '/memory-tracker' });
  }
  if (!session.featuresExplored.includes('/analytics')) {
    recs.push({ emoji: '📈', text: 'View Advanced Analytics for deeper insights', path: '/analytics' });
  }

  return recs.slice(0, 3);
};

// ── Check for Recoverable Stale Data ────────────────────────────────────────
export const hasRecoverableData = () => {
  try {
    const userRaw = localStorage.getItem('neurotrack_user');
    const sessionRaw = localStorage.getItem(SESSION_KEY);
    if (!userRaw || !sessionRaw) return false;

    const user = JSON.parse(userRaw);
    if (!user?.isGuest) return false;

    const expiry = user?.guestExpiresAt ? new Date(user.guestExpiresAt) : null;
    const isExpired = expiry && new Date() > expiry;
    if (!isExpired) return false; // Session still valid, no recovery needed

    const session = JSON.parse(sessionRaw);
    const hasActivity = (session?.aiAnalysesCount || 0) > 0 ||
      (session?.roadmapsCreated || 0) > 0 ||
      (session?.featuresExplored?.length || 0) > 2;

    return hasActivity;
  } catch {
    return false;
  }
};
