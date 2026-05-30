/**
 * DemoModeCard.jsx – Feature 5: Demo Student Mode
 * Shows a "you're in demo mode" card for first-time guests.
 * Auto-dismisses after 60 seconds. Shows quick-start CTAs.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, X, Brain, Map, Zap, ChevronRight } from 'lucide-react';
import { useGuestSession } from '../../hooks/useGuestSession';

const SAMPLE_STUDENT = {
  name: 'Alex Chen',
  role: 'Full Stack Developer',
  readiness: 72,
  streak: 7,
  level: 4,
};

const QUICK_STARTS = [
  { emoji: '🤖', label: 'Ask the AI Mentor', sub: 'Get personalized guidance', path: '/ai-mentor', color: '#6366f1' },
  { emoji: '🗺️', label: 'Generate Roadmap', sub: 'AI-crafted career path', path: '/career-roadmap', color: '#8b5cf6' },
  { emoji: '⚡', label: 'Skill Gap Analysis', sub: 'See where you stand', path: '/skill-gap', color: '#06b6d4' },
];

const DemoModeCard = () => {
  const navigate = useNavigate();
  const { dismissDemo, demoModeDismissed, trackFeature } = useGuestSession();
  const [timeLeft, setTimeLeft] = useState(60);
  const [visible, setVisible] = useState(!demoModeDismissed);

  // Countdown auto-dismiss
  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          handleDismiss();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [visible]); // eslint-disable-line

  const handleDismiss = () => {
    setVisible(false);
    dismissDemo();
  };

  const handleQuickStart = (path) => {
    handleDismiss();
    trackFeature(path);
    navigate(path);
  };

  if (!visible) return null;

  return (
    <div
      className="page-enter"
      role="region"
      aria-label="Demo mode introduction"
      style={{
        marginBottom: 24,
        borderRadius: 20,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 50%, rgba(6,182,212,0.06) 100%)',
        border: '1px solid rgba(99,102,241,0.2)',
        position: 'relative',
      }}
    >
      {/* Animated gradient orb */}
      <div style={{
        position: 'absolute', right: -40, top: -40,
        width: 200, height: 200, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ padding: '20px 24px' }}>
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px rgba(99,102,241,0.4)',
              animation: 'pulse-glow 2s ease-in-out infinite',
            }}>
              <Sparkles size={18} color="white" />
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                You're in Demo Mode
                <span style={{
                  fontSize: 10, padding: '2px 8px', borderRadius: 99,
                  background: 'rgba(16,185,129,0.15)', color: '#34d399',
                  border: '1px solid rgba(16,185,129,0.2)', fontWeight: 700,
                }}>LIVE PREVIEW</span>
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                Explore NeuroTrack AI as <strong style={{ color: '#818cf8' }}>{SAMPLE_STUDENT.name}</strong> — a sample student
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            {/* Countdown */}
            <div style={{
              fontSize: 11, color: 'var(--text-muted)', fontWeight: 600,
              padding: '4px 10px', background: 'rgba(255,255,255,0.05)',
              borderRadius: 99, border: '1px solid var(--border-color)',
            }}>
              Auto-closes in {timeLeft}s
            </div>
            <button
              onClick={handleDismiss}
              aria-label="Dismiss demo mode card"
              style={{
                background: 'none', border: 'none', color: 'var(--text-muted)',
                cursor: 'pointer', padding: 4, display: 'flex',
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Sample profile stats */}
        <div style={{
          display: 'flex', gap: 16, marginBottom: 16,
          padding: '12px 16px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.06)',
          flexWrap: 'wrap',
        }}>
          {[
            { label: 'Career Goal', value: SAMPLE_STUDENT.role },
            { label: 'Career Readiness', value: `${SAMPLE_STUDENT.readiness}%` },
            { label: 'Learning Streak', value: `${SAMPLE_STUDENT.streak} days 🔥` },
            { label: 'Level', value: `Level ${SAMPLE_STUDENT.level}` },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Quick-start CTAs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8 }}>
          {QUICK_STARTS.map(({ emoji, label, sub, path, color }) => (
            <button
              key={path}
              onClick={() => handleQuickStart(path)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px',
                background: `${color}0d`,
                border: `1px solid ${color}25`,
                borderRadius: 12, cursor: 'pointer',
                transition: 'all 0.2s', textAlign: 'left',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = `${color}18`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = `${color}0d`; e.currentTarget.style.transform = ''; }}
            >
              <span style={{ fontSize: 20 }}>{emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</div>
              </div>
              <ChevronRight size={12} color={color} />
            </button>
          ))}
        </div>

        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12, textAlign: 'center' }}>
          👆 This is what your real data will look like once you create a free account
        </p>
      </div>
    </div>
  );
};

export default DemoModeCard;
