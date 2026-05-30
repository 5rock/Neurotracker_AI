/**
 * SmartConversionPrompt.jsx – Feature 2: Smart Conversion Engine
 * Context-aware inline upgrade nudge. NOT a modal — renders as a
 * compact card in-place after meaningful guest actions.
 * Respects a 10-minute cooldown via guestSession service.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import { useGuestSession } from '../../hooks/useGuestSession';

const TRIGGER_COPY = {
  ai_limit_approaching: {
    emoji: '⚡',
    headline: 'You\'re getting the hang of it!',
    body: 'You\'ve used 2 of 3 daily AI analyses. Create a free account for unlimited AI access.',
    cta: 'Unlock Unlimited AI',
    color: '#8b5cf6',
  },
  roadmap_created: {
    emoji: '🗺️',
    headline: 'Great progress on your roadmap!',
    body: 'Save this roadmap permanently and track your journey over time with a free account.',
    cta: 'Save My Roadmap',
    color: '#10b981',
  },
  time_based: {
    emoji: '🚀',
    headline: 'You\'ve been exploring for a while!',
    body: 'Create a free account so your progress isn\'t lost when this session ends.',
    cta: 'Save My Progress',
    color: '#6366f1',
  },
  return_visitor: {
    emoji: '👋',
    headline: 'Welcome back, explorer!',
    body: 'You\'re clearly finding value here. A free account lets you pick up exactly where you left off.',
    cta: 'Create My Account',
    color: '#f59e0b',
  },
  default: {
    emoji: '✨',
    headline: 'Enjoying NeuroTrack AI?',
    body: 'Create a free account to save your progress and unlock all features.',
    cta: 'Sign Up Free',
    color: '#6366f1',
  },
};

const SmartConversionPrompt = ({ trigger = 'default' }) => {
  const navigate = useNavigate();
  const { shouldShowConversion } = useGuestSession();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    // Small delay so it doesn't flash on mount
    const timer = setTimeout(() => {
      if (shouldShowConversion(trigger)) {
        setVisible(true);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [trigger]); // eslint-disable-line

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
  };

  if (!visible || dismissed) return null;

  const copy = TRIGGER_COPY[trigger] || TRIGGER_COPY.default;

  return (
    <div
      className="page-enter"
      role="complementary"
      aria-label="Upgrade to registered account"
      style={{
        margin: '16px 0',
        borderRadius: 16,
        padding: '16px 18px',
        background: `linear-gradient(135deg, ${copy.color}12 0%, ${copy.color}06 100%)`,
        border: `1px solid ${copy.color}25`,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        position: 'relative',
        animation: 'fadeInUp 0.35s ease both',
      }}
    >
      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss"
        style={{
          position: 'absolute', top: 10, right: 10,
          background: 'none', border: 'none', color: 'var(--text-muted)',
          cursor: 'pointer', padding: 4, display: 'flex', borderRadius: 6,
        }}
      >
        <X size={14} />
      </button>

      {/* Emoji */}
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: `${copy.color}18`,
        border: `1px solid ${copy.color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20,
      }}>
        {copy.emoji}
      </div>

      {/* Content */}
      <div style={{ flex: 1, paddingRight: 20 }}>
        <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
          {copy.headline}
        </h4>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
          {copy.body}
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            id={`conversion-signup-${trigger}`}
            onClick={() => { handleDismiss(); navigate('/signup'); }}
            className="btn-primary"
            style={{ fontSize: 12, padding: '7px 14px' }}
          >
            <Sparkles size={13} />
            {copy.cta}
            <ArrowRight size={13} />
          </button>
          <button
            onClick={() => { handleDismiss(); navigate('/login'); }}
            className="btn-ghost"
            style={{ fontSize: 12, padding: '7px 12px' }}
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartConversionPrompt;
