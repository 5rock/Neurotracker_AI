/**
 * useGuestSession.js
 * ───────────────────────────────────────────────────────────────
 * Reactive React hook wrapping guestSession.js.
 * Components subscribe to a single UPDATE_EVENT — every write
 * to localStorage triggers a re-render in all consumers.
 * ───────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthState } from './useAuthState';
import {
  UPDATE_EVENT,
  ACHIEVEMENT_DEFS,
  getOrCreateSession,
  readSession,
  trackFeatureVisit,
  trackAIAnalysis,
  trackRoadmapCreated,
  dismissDemoMode,
  canShowConversion,
  recordConversionShown,
  computeMetrics,
  checkTimedAchievements,
} from '../services/guestSession';
import toast from 'react-hot-toast';

export const useGuestSession = () => {
  const { user } = useAuthState();
  const isGuest = Boolean(user?.isGuest);

  const [session, setSession] = useState(() =>
    isGuest ? getOrCreateSession() : null
  );

  // ── Subscribe to storage updates ──────────────────────────────
  useEffect(() => {
    if (!isGuest) return;

    // Ensure session is initialized
    const current = readSession();
    if (!current) {
      setSession(getOrCreateSession());
    } else {
      setSession(current);
    }

    const handleUpdate = (e) => {
      setSession(e.detail || readSession());
    };

    window.addEventListener(UPDATE_EVENT, handleUpdate);
    return () => window.removeEventListener(UPDATE_EVENT, handleUpdate);
  }, [isGuest]);

  // ── Achievement toast notifications ──────────────────────────
  useEffect(() => {
    if (!isGuest) return;

    const handleAchievement = (e) => {
      const { id } = e.detail;
      const def = ACHIEVEMENT_DEFS.find((d) => d.id === id);
      if (!def) return;

      toast.custom(
        (t) => (
          <div
            onClick={() => toast.dismiss(t.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.95), rgba(139,92,246,0.95))',
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
              cursor: 'pointer',
              animation: 'achievementPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
              maxWidth: 320,
            }}
          >
            <span style={{ fontSize: 28, lineHeight: 1 }}>{def.emoji}</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                Achievement Unlocked!
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'white', marginTop: 2 }}>
                {def.title}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
                {def.desc}
              </div>
            </div>
          </div>
        ),
        { duration: 4000, position: 'bottom-right' }
      );
    };

    window.addEventListener('neurotrack:achievement-unlocked', handleAchievement);
    return () => window.removeEventListener('neurotrack:achievement-unlocked', handleAchievement);
  }, [isGuest]);

  // ── Timed achievement check every 60 seconds ────────────────
  const timerRef = useRef(null);
  useEffect(() => {
    if (!isGuest) return;
    timerRef.current = setInterval(checkTimedAchievements, 60_000);
    return () => clearInterval(timerRef.current);
  }, [isGuest]);

  // ── Computed metrics ─────────────────────────────────────────
  const [metrics, setMetrics] = useState(() => computeMetrics(session));

  // Live-update metrics every second (for session timer)
  useEffect(() => {
    if (!isGuest || !session) return;
    setMetrics(computeMetrics(session));
    const id = setInterval(() => setMetrics(computeMetrics(session)), 1000);
    return () => clearInterval(id);
  }, [isGuest, session]);

  // ── Actions ──────────────────────────────────────────────────
  const trackFeature = useCallback((path) => {
    if (isGuest) trackFeatureVisit(path);
  }, [isGuest]);

  const trackAI = useCallback(() => {
    if (isGuest) trackAIAnalysis();
  }, [isGuest]);

  const trackRoadmap = useCallback(() => {
    if (isGuest) trackRoadmapCreated();
  }, [isGuest]);

  const dismissDemo = useCallback(() => {
    if (isGuest) dismissDemoMode();
  }, [isGuest]);

  const shouldShowConversion = useCallback((trigger) => {
    if (!isGuest) return false;
    const allowed = canShowConversion();
    if (allowed) recordConversionShown();
    return allowed;
  }, [isGuest]);

  const earnedIds = new Set((session?.achievements || []).map((a) => a.id));

  return {
    session,
    metrics,
    isGuest,
    achievements: ACHIEVEMENT_DEFS.map((def) => ({
      ...def,
      earned: earnedIds.has(def.id),
      earnedAt: session?.achievements?.find((a) => a.id === def.id)?.unlockedAt,
    })),
    timeline: session?.activityTimeline || [],
    trackFeature,
    trackAI,
    trackRoadmap,
    dismissDemo,
    shouldShowConversion,
    demoModeDismissed: session?.demoModeDismissed || false,
  };
};
