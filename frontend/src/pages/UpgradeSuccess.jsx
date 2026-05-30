/**
 * UpgradeSuccess.jsx – Feature 7: Upgrade Success Experience
 * Full-screen celebration page shown after guest → account registration.
 * Animated checklist, confetti-style particles, auto-redirect after 5s.
 * Route: /upgrade-success (public, no auth guard)
 */

import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowRight } from 'lucide-react';
import { clearSession } from '../services/guestSession';

const MIGRATION_ITEMS = [
  { id: 'progress', label: 'Guest Progress Transferred', emoji: '📊', delay: 300 },
  { id: 'ai', label: 'AI Chat History Transferred', emoji: '🤖', delay: 700 },
  { id: 'roadmaps', label: 'Career Roadmaps Transferred', emoji: '🗺️', delay: 1100 },
  { id: 'analytics', label: 'Analytics Data Preserved', emoji: '📈', delay: 1500 },
  { id: 'account', label: 'Account Successfully Activated', emoji: '🎉', delay: 1900 },
];

const AUTO_REDIRECT_DELAY = 5500;

/** Floating particle for the confetti background */
const Particle = ({ style }) => (
  <div
    style={{
      position: 'absolute',
      width: 6, height: 6,
      borderRadius: '50%',
      pointerEvents: 'none',
      animation: 'particleFloat 4s ease-in-out infinite',
      ...style,
    }}
  />
);

const UpgradeSuccess = () => {
  const navigate = useNavigate();
  const [checkedItems, setCheckedItems] = useState(new Set());
  const [allDone, setAllDone] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const redirected = useRef(false);

  // Stagger checklist reveals
  useEffect(() => {
    MIGRATION_ITEMS.forEach(({ id, delay }) => {
      setTimeout(() => {
        setCheckedItems((prev) => new Set([...prev, id]));
      }, delay);
    });

    setTimeout(() => setAllDone(true), MIGRATION_ITEMS[MIGRATION_ITEMS.length - 1].delay + 200);
  }, []);

  // Auto-redirect countdown
  useEffect(() => {
    if (!allDone) return;
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, Math.ceil((AUTO_REDIRECT_DELAY - elapsed) / 1000));
      setCountdown(remaining);
      if (remaining === 0 && !redirected.current) {
        redirected.current = true;
        clearSession();
        navigate('/dashboard');
      }
    }, 200);
    return () => clearInterval(interval);
  }, [allDone, navigate]);

  // Clear guest session data on this page
  useEffect(() => {
    clearSession();
  }, []);

  const PARTICLE_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Floating particles */}
      {Array.from({ length: 18 }).map((_, i) => (
        <Particle
          key={i}
          style={{
            background: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: 0.4 + Math.random() * 0.4,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${3 + Math.random() * 3}s`,
          }}
        />
      ))}

      {/* Main card */}
      <div
        className="glass page-enter"
        style={{
          maxWidth: 480,
          width: '100%',
          padding: '48px 40px',
          borderRadius: 28,
          border: '1px solid rgba(99,102,241,0.2)',
          boxShadow: '0 0 80px rgba(99,102,241,0.12), 0 32px 64px rgba(0,0,0,0.4)',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 0 32px rgba(99,102,241,0.4)',
          animation: 'pulse-glow 2s ease-in-out infinite',
        }}>
          <Brain size={36} color="white" />
        </div>

        {/* Headline */}
        <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 8 }}>
          {allDone ? '🎉 You\'re all set!' : 'Migrating your data…'}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.6 }}>
          {allDone
            ? 'Your guest progress has been saved to your new account.'
            : 'Transferring your guest session data to your new account.'}
        </p>

        {/* Animated checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32, textAlign: 'left' }}>
          {MIGRATION_ITEMS.map(({ id, label, emoji }) => {
            const done = checkedItems.has(id);
            return (
              <div
                key={id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: done ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.02)',
                  border: done ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,255,255,0.06)',
                  transition: 'all 0.4s ease',
                  opacity: done ? 1 : 0.4,
                  transform: done ? 'translateX(0)' : 'translateX(-8px)',
                }}
              >
                {/* Check circle */}
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: done ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)',
                  border: done ? '2px solid #10b981' : '2px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: done ? 14 : 16,
                  transition: 'all 0.3s ease',
                  animation: done ? 'achievementPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both' : 'none',
                }}>
                  {done ? '✓' : emoji}
                </div>
                <span style={{
                  fontSize: 14, fontWeight: 600,
                  color: done ? 'var(--text-primary)' : 'var(--text-muted)',
                  transition: 'color 0.3s',
                }}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Action buttons */}
        {allDone && (
          <div
            style={{ animation: 'fadeInUp 0.4s ease both' }}
          >
            <button
              id="upgrade-success-dashboard-btn"
              onClick={() => { clearSession(); navigate('/dashboard'); }}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '14px', marginBottom: 12, fontSize: 15 }}
            >
              Go to Dashboard
              <ArrowRight size={16} />
            </button>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Auto-redirecting in {countdown}s…
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpgradeSuccess;
