import { memo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Brain, LayoutDashboard, BookOpen, AlertTriangle, Calendar,
  Zap, Map, MessageSquare, BarChart2, User, Trophy, ChevronLeft,
  UserCircle, ArrowRight
} from 'lucide-react';
import { useAuthState } from '../../hooks/useAuthState';
import { useAuthActions } from '../../hooks/useAuthActions';
import { prefetchRoute } from '../../utils/prefetchRoute';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/memory-tracker', icon: BookOpen, label: 'Memory Tracker' },
  { to: '/weak-topics', icon: AlertTriangle, label: 'Weak Topics' },
  { to: '/revision-scheduler', icon: Calendar, label: 'Revision Planner' },
  { to: '/skill-gap', icon: Zap, label: 'Skill Gap' },
  { to: '/career-roadmap', icon: Map, label: 'Career Roadmap' },
  { to: '/ai-mentor', icon: MessageSquare, label: 'AI Mentor' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const Sidebar = ({ isOpen, onToggle }) => {
  const { user } = useAuthState();
  const { logout } = useAuthActions();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <aside
      aria-label="Dashboard navigation"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: isOpen ? 256 : 72,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        overflow: 'hidden',
        transition: 'width 0.25s ease',
      }}
    >
      <div style={{
        padding: '20px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        borderBottom: '1px solid var(--border-color)',
        minHeight: 72,
      }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 0 20px rgba(99,102,241,0.3)',
        }}>
          <Brain size={22} color="white" />
        </div>
        {isOpen && (
          <div className="sidebar-label">
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
              NeuroTrack
            </div>
            <div style={{ fontSize: 11, color: '#818cf8', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
              AI Platform
            </div>
          </div>
        )}
      </div>

      <nav style={{ flex: 1, padding: '16px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            title={!isOpen ? label : ''}
            aria-label={label}
            style={{ marginBottom: 4, overflow: 'hidden' }}
            onMouseEnter={() => prefetchRoute(to)}
            onFocus={() => prefetchRoute(to)}
          >
            <Icon size={20} style={{ flexShrink: 0 }} />
            {isOpen && (
              <span className="sidebar-label" style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
                {label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border-color)' }}>
        <button
          type="button"
          onClick={onToggle}
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isOpen ? 'flex-end' : 'center',
            gap: 8,
            padding: '8px 12px',
            background: 'transparent',
            border: '1px solid var(--border-color)',
            borderRadius: 10,
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginBottom: 8,
          }}
        >
          <span style={{
            display: 'inline-flex',
            transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)',
            transition: 'transform 0.25s ease',
          }}>
            <ChevronLeft size={16} />
          </span>
          {isOpen && (
            <span className="sidebar-label" style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
              Collapse
            </span>
          )}
        </button>

        {user && (
          user.isGuest ? (
            /* Guest sidebar bottom section */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {/* Guest avatar + label */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 10,
                background: 'rgba(245,158,11,0.06)',
                border: '1px solid rgba(245,158,11,0.15)',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <UserCircle size={20} color="white" />
                </div>
                {isOpen && (
                  <div className="sidebar-label" style={{ overflow: 'hidden', flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24', whiteSpace: 'nowrap' }}>
                      Guest Mode
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      Session expires in 24h
                    </div>
                  </div>
                )}
              </div>

              {/* Sign Up CTA button */}
              {isOpen && (
                <button
                  id="sidebar-guest-signup-btn"
                  type="button"
                  onClick={() => navigate('/signup')}
                  aria-label="Create a free account"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '9px 12px',
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    border: 'none',
                    color: 'white',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 0 14px rgba(99,102,241,0.3)',
                    transition: 'all 0.2s',
                  }}
                >
                  <ArrowRight size={13} />
                  Sign Up Free
                </button>
              )}

              {/* End guest session button */}
              <button
                type="button"
                onClick={handleLogout}
                aria-label="End guest session"
                title="End guest session"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isOpen ? 'center' : 'center',
                  gap: 6,
                  padding: '8px 12px',
                  borderRadius: 10,
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                {isOpen ? 'End Session' : '✕'}
              </button>
            </div>
          ) : (
            /* Regular user sidebar bottom section */
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Log out"
              title="Log out"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 10,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                overflow: 'hidden',
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, fontSize: 14, fontWeight: 700, color: 'white',
              }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              {isOpen && (
                <div className="sidebar-label" style={{ overflow: 'hidden', flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    Logout
                  </div>
                </div>
              )}
            </button>
          )
        )}
      </div>
    </aside>
  );
};

export default memo(Sidebar);
