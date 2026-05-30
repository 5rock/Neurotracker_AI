import { memo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, UserCircle, ArrowRight } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuthState } from '../../hooks/useAuthState';

const pageNames = {
  '/dashboard': 'Dashboard',
  '/memory-tracker': 'Memory Tracker',
  '/weak-topics': 'Weak Topic Analyzer',
  '/revision-scheduler': 'Revision Scheduler',
  '/skill-gap': 'Skill Gap Predictor',
  '/career-roadmap': 'Career Roadmap',
  '/ai-mentor': 'AI Mentor',
  '/analytics': 'Analytics',
  '/profile': 'Profile',
  '/leaderboard': 'Leaderboard',
};

const Navbar = ({ onMenuToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuthState();

  const pageName = pageNames[location.pathname] || 'NeuroTrack AI';

  return (
    <header className="header-blur-safe" style={{
      height: 64,
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      gap: 16,
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      {/* Menu toggle */}
      <button
        onClick={onMenuToggle}
        aria-label="Toggle navigation menu"
        style={{
          background: 'transparent',
          border: '1px solid var(--border-color)',
          borderRadius: 8,
          padding: '6px',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Menu size={18} />
      </button>

      {/* Page title */}
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{pageName}</h1>
      </div>

      {/* Right side actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Guest Mode badge – shown when user is a guest */}
        {user?.isGuest && (
          <button
            id="navbar-guest-badge-btn"
            type="button"
            onClick={() => navigate('/signup')}
            title="Create a free account to save your progress"
            aria-label="Guest mode active – click to create an account"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(239,68,68,0.08))',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 700,
              color: '#fbbf24',
              cursor: 'pointer',
              transition: 'all 0.2s',
              animation: 'pulse-glow-amber 2s ease-in-out infinite',
            }}
          >
            <UserCircle size={14} />
            Guest Mode
            <ArrowRight size={11} style={{ opacity: 0.7 }} />
          </button>
        )}

        {/* Streak badge – only for registered users with a streak */}
        {!user?.isGuest && user?.streak > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 12px',
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: 99,
            fontSize: 13,
            fontWeight: 600,
            color: '#fbbf24',
          }}>
            🔥 {user.streak} day streak
          </div>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 8,
            padding: '7px',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.2s',
          }}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* User avatar */}
        {user && (
          <button
            onClick={() => navigate('/profile')}
            aria-label="Open profile"
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 700,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(99,102,241,0.3)',
            }}
          >
            {user.name?.charAt(0).toUpperCase()}
          </button>
        )}
      </div>
    </header>
  );
};

export default memo(Navbar);
