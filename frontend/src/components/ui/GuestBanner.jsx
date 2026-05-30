/**
 * GuestBanner.jsx
 *
 * Non-intrusive sticky conversion banner for guest users.
 * Appears after 30 seconds of engagement and can be dismissed.
 * Dismissed state is stored in sessionStorage so it only hides per session.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, X, ArrowRight } from 'lucide-react';

const DISMISSED_KEY = 'neurotrack_guest_banner_dismissed';

const GuestBanner = () => {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Don't show if already dismissed this session
    if (sessionStorage.getItem(DISMISSED_KEY)) return;

    // Show after 30 seconds of engagement
    const timer = setTimeout(() => setVisible(true), 30_000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="complementary"
      aria-label="Upgrade from guest to registered account"
      className="guest-banner"
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 900,
        width: 'calc(100% - 48px)',
        maxWidth: 640,
        animation: 'slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
      }}
    >
      <div
        className="glass"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '16px 20px',
          borderRadius: 16,
          border: '1px solid rgba(99,102,241,0.25)',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(99,102,241,0.15)',
          flexWrap: 'wrap',
        }}
      >
        {/* Icon */}
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 0 16px rgba(99,102,241,0.4)',
        }}>
          <Sparkles size={18} color="white" />
        </div>

        {/* Message */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
            Enjoying NeuroTrack AI?
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Create a free account to save your progress permanently — no credit card needed.
          </p>
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button
            id="guest-banner-learn-more-btn"
            onClick={() => { handleDismiss(); navigate('/'); }}
            className="btn-ghost"
            style={{ fontSize: 12, padding: '8px 14px' }}
          >
            Learn More
          </button>
          <button
            id="guest-banner-signup-btn"
            onClick={() => { handleDismiss(); navigate('/signup'); }}
            className="btn-primary"
            style={{ fontSize: 12, padding: '8px 14px' }}
          >
            Sign Up Free <ArrowRight size={13} />
          </button>
        </div>

        {/* Dismiss */}
        <button
          onClick={handleDismiss}
          aria-label="Dismiss upgrade banner"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
            borderRadius: 6,
            transition: 'color 0.2s',
          }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default GuestBanner;
