/**
 * GuestProgressCard.jsx – Feature 1 + 6: Progress Tracker + Guest Analytics
 * Visual dashboard card with circular SVG rings, live session timer,
 * productivity score, analytics metrics, and personalized recommendations.
 */

import { useNavigate } from 'react-router-dom';
import { useGuestSession } from '../../hooks/useGuestSession';
import { Clock, Zap, Map, Compass, TrendingUp, ChevronRight, Lock } from 'lucide-react';

/** Circular SVG progress ring */
const Ring = ({ value, max = 100, size = 80, stroke = 8, color = '#6366f1', label, sublabel }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(1, value / max);
  const dash = circ * pct;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke}
          />
          {/* Progress */}
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.6s ease', filter: `drop-shadow(0 0 4px ${color}60)` }}
          />
        </svg>
        {/* Center label */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: size > 72 ? 16 : 14, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
            {value}
          </span>
          {max !== 100 && (
            <span style={{ fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.2 }}>/ {max}</span>
          )}
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>{label}</div>
        {sublabel && <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{sublabel}</div>}
      </div>
    </div>
  );
};

/** Mini stat tile */
const StatTile = ({ icon: Icon, label, value, color }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 14px',
    background: `${color}08`,
    border: `1px solid ${color}20`,
    borderRadius: 12,
    flex: 1, minWidth: 120,
  }}>
    <div style={{
      width: 32, height: 32, borderRadius: 9,
      background: `${color}15`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <Icon size={15} color={color} />
    </div>
    <div>
      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
    </div>
  </div>
);

const GuestProgressCard = () => {
  const navigate = useNavigate();
  const { metrics } = useGuestSession();

  if (!metrics) return null;

  const {
    sessionTime, aiAnalysesCount, roadmapsCreated,
    featuresExplored, productivityScore, profileCompletion,
    goalCompletion, recommendations,
  } = metrics;

  return (
    <div
      className="glass page-enter"
      style={{
        borderRadius: 20,
        padding: '22px 24px',
        marginBottom: 24,
        border: '1px solid rgba(99,102,241,0.15)',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.04) 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background shimmer */}
      <div style={{
        position: 'absolute', top: -80, right: -80,
        width: 240, height: 240, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            Guest Progress
            <span style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 99,
              background: 'rgba(245,158,11,0.15)', color: '#fbbf24',
              border: '1px solid rgba(245,158,11,0.25)', fontWeight: 700,
            }}>LIVE</span>
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            Your activity this session · {sessionTime} elapsed
          </p>
        </div>
        <button
          onClick={() => navigate('/signup')}
          className="btn-primary"
          style={{ fontSize: 11, padding: '7px 14px', whiteSpace: 'nowrap' }}
        >
          Save Progress
        </button>
      </div>

      {/* Circular rings row */}
      <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
        <Ring value={aiAnalysesCount} max={3} size={88} color="#6366f1" label="AI Analyses" sublabel={`${aiAnalysesCount}/3 today`} />
        <Ring value={roadmapsCreated} max={3} size={88} color="#8b5cf6" label="Roadmaps" sublabel="Created" />
        <Ring value={featuresExplored} max={10} size={88} color="#06b6d4" label="Explored" sublabel="Features" />
        <Ring value={productivityScore} max={100} size={88} color="#10b981" label="Productivity" sublabel="Score" />
      </div>

      {/* Stat tiles */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        <StatTile icon={Clock} label="Session Time" value={sessionTime} color="#f59e0b" />
        <StatTile icon={TrendingUp} label="Profile Setup" value={`${profileCompletion}%`} color="#6366f1" />
        <StatTile icon={Zap} label="Goal Progress" value={`${goalCompletion}%`} color="#10b981" />
      </div>

      {/* Locked analytics teaser */}
      <div style={{
        padding: '12px 16px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12,
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
      }}>
        <Lock size={14} color="var(--text-muted)" />
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Advanced analytics (heatmaps, retention curves, skill growth) unlock when you
          </span>{' '}
          <button
            onClick={() => navigate('/signup')}
            style={{ background: 'none', border: 'none', color: '#818cf8', fontWeight: 700, fontSize: 12, cursor: 'pointer', padding: 0 }}
          >
            create a free account
          </button>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Recommended Next Steps
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {recommendations.map((rec) => (
              <button
                key={rec.path}
                onClick={() => navigate(rec.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px',
                  background: 'rgba(99,102,241,0.05)',
                  border: '1px solid rgba(99,102,241,0.1)',
                  borderRadius: 10, cursor: 'pointer',
                  transition: 'all 0.2s', textAlign: 'left',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.05)'; }}
              >
                <span style={{ fontSize: 16 }}>{rec.emoji}</span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{rec.text}</span>
                <ChevronRight size={13} color="var(--text-muted)" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestProgressCard;
