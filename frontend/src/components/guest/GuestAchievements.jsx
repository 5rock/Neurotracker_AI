/**
 * GuestAchievements.jsx – Feature 3: Achievement & Gamification System
 * Horizontally scrollable achievement shelf. Locked achievements show
 * hint text. Earned ones glow and animate on first view.
 */

import { useNavigate } from 'react-router-dom';
import { useGuestSession } from '../../hooks/useGuestSession';
import { Lock, ChevronRight } from 'lucide-react';

const AchievementBadge = ({ achievement }) => {
  const { earned, emoji, title, desc, id } = achievement;

  return (
    <div
      title={earned ? `${title}: ${desc}` : `Locked: ${desc}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: '16px 12px',
        width: 110,
        flexShrink: 0,
        borderRadius: 16,
        background: earned
          ? 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))'
          : 'rgba(255,255,255,0.02)',
        border: earned
          ? '1px solid rgba(99,102,241,0.25)'
          : '1px solid rgba(255,255,255,0.06)',
        opacity: earned ? 1 : 0.55,
        position: 'relative',
        transition: 'all 0.3s ease',
        cursor: 'default',
        animation: earned ? `achievementGlow 3s ease-in-out infinite` : 'none',
      }}
    >
      {/* Badge icon */}
      <div style={{
        width: 52,
        height: 52,
        borderRadius: '50%',
        background: earned
          ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))'
          : 'rgba(255,255,255,0.04)',
        border: earned ? '2px solid rgba(99,102,241,0.3)' : '2px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: earned ? '0 0 16px rgba(99,102,241,0.25)' : 'none',
        fontSize: 24,
        position: 'relative',
      }}>
        {earned ? emoji : <Lock size={18} color="var(--text-muted)" />}
        {/* Earned checkmark */}
        {earned && (
          <div style={{
            position: 'absolute',
            bottom: -2, right: -2,
            width: 16, height: 16, borderRadius: '50%',
            background: '#10b981',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, color: 'white', fontWeight: 900,
            border: '2px solid var(--bg-primary)',
          }}>✓</div>
        )}
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: earned ? 'var(--text-primary)' : 'var(--text-muted)', lineHeight: 1.3 }}>
          {earned ? title : '???'}
        </div>
        {earned && (
          <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.3 }}>
            {desc.length > 28 ? desc.slice(0, 28) + '…' : desc}
          </div>
        )}
        {!earned && (
          <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 3 }}>
            Keep exploring!
          </div>
        )}
      </div>
    </div>
  );
};

const GuestAchievements = () => {
  const navigate = useNavigate();
  const { achievements } = useGuestSession();
  const earned = achievements.filter((a) => a.earned).length;
  const total = achievements.length;

  return (
    <div
      className="page-enter"
      style={{
        marginBottom: 24,
        borderRadius: 20,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 20px 14px',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            🏆 Achievements
            <span style={{
              fontSize: 11, padding: '2px 8px', borderRadius: 99,
              background: 'rgba(245,158,11,0.12)', color: '#fbbf24',
              border: '1px solid rgba(245,158,11,0.2)', fontWeight: 700,
            }}>{earned}/{total}</span>
          </h3>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            Complete activities to unlock achievements during your guest session
          </p>
        </div>
        <button
          onClick={() => navigate('/signup')}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 11, color: '#818cf8', fontWeight: 600,
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            flexShrink: 0,
          }}
        >
          Save Achievements <ChevronRight size={13} />
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ padding: '8px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="progress-bar" style={{ flex: 1, height: 4 }}>
            <div
              className="progress-fill"
              style={{ '--progress': `${Math.round((earned / total) * 100)}%` }}
            />
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, flexShrink: 0 }}>
            {Math.round((earned / total) * 100)}%
          </span>
        </div>
      </div>

      {/* Horizontal scrollable shelf */}
      <div style={{
        display: 'flex',
        gap: 10,
        padding: '16px 20px 20px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
      }}>
        {achievements.map((ach) => (
          <AchievementBadge key={ach.id} achievement={ach} />
        ))}
      </div>

      {/* Locked CTA */}
      {earned < total && (
        <div style={{
          margin: '0 20px 18px',
          padding: '10px 14px',
          background: 'rgba(99,102,241,0.05)',
          border: '1px solid rgba(99,102,241,0.12)',
          borderRadius: 10,
          fontSize: 12, color: 'var(--text-muted)',
          textAlign: 'center',
        }}>
          🔐 Create a free account to permanently save your {earned} achievement{earned !== 1 ? 's' : ''} and unlock more rewards
        </div>
      )}
    </div>
  );
};

export default GuestAchievements;
