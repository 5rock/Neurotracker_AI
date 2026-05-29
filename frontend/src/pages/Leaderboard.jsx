import { useState } from 'react';
import { Trophy, Flame } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const MOCK_LEADERBOARD = [
  { id: 1, name: 'Alex Johnson', score: 14500, streak: 45, level: 24, isUser: false },
  { id: 2, name: 'Sarah Chen', score: 13200, streak: 32, level: 22, isUser: false },
  { id: 3, name: 'Mike Smith', score: 12800, streak: 28, level: 21, isUser: false },
  { id: 4, name: 'Current User', score: 11500, streak: 15, level: 19, isUser: true },
  { id: 5, name: 'Emma Davis', score: 10900, streak: 12, level: 18, isUser: false },
  { id: 6, name: 'James Wilson', score: 9800, streak: 8, level: 16, isUser: false },
  { id: 7, name: 'Lisa Taylor', score: 8500, streak: 5, level: 14, isUser: false },
];

const Leaderboard = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState('global'); // 'global' | 'friends'

  // Replace mock "Current User" with actual name if available
  const leaderboard = MOCK_LEADERBOARD.map(u => u.isUser ? { ...u, name: user?.name || 'You' } : u);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 30px rgba(245,158,11,0.3)' }}>
          <Trophy size={32} color="white" />
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)' }}>Leaderboard</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginTop: 4 }}>Compete with learners worldwide</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
        <button onClick={() => setFilter('global')} style={{ padding: '8px 24px', borderRadius: 99, fontSize: 14, fontWeight: 600, background: filter === 'global' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'var(--bg-card)', color: filter === 'global' ? 'white' : 'var(--text-secondary)', border: `1px solid ${filter === 'global' ? 'transparent' : 'var(--border-color)'}` }}>Global</button>
        <button onClick={() => setFilter('friends')} style={{ padding: '8px 24px', borderRadius: 99, fontSize: 14, fontWeight: 600, background: filter === 'friends' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'var(--bg-card)', color: filter === 'friends' ? 'white' : 'var(--text-secondary)', border: `1px solid ${filter === 'friends' ? 'transparent' : 'var(--border-color)'}` }}>Friends</button>
      </div>

      <div className="metric-card" style={{ padding: 0, overflow: 'hidden' }}>
        {leaderboard.map((u, i) => (
          <div
            key={u.id}
            className="page-enter"
            style={{
              display: 'flex', alignItems: 'center', padding: '16px 24px',
              borderBottom: i !== leaderboard.length - 1 ? '1px solid var(--border-color)' : 'none',
              background: u.isUser ? 'rgba(99,102,241,0.08)' : 'transparent',
            }}
          >
            {/* Rank */}
            <div style={{ width: 40, fontSize: 16, fontWeight: 800, color: i < 3 ? '#f59e0b' : 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
            </div>

            {/* Avatar & Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg, ${u.isUser ? '#6366f1, #8b5cf6' : '#475569, #334155'})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14 }}>
                {u.name.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: u.isUser ? 700 : 600, color: 'var(--text-primary)' }}>
                  {u.name} {u.isUser && <span style={{ fontSize: 11, color: '#818cf8', fontWeight: 700, marginLeft: 4 }}>(You)</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Lvl {u.level}</div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 24, textAlign: 'right' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Flame size={14} color="#f59e0b" /> {u.streak}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Streak</div>
              </div>
              <div style={{ width: 70 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#818cf8' }}>{u.score.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>XP</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
