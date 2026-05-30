/**
 * GuestUpgradeModal.jsx
 *
 * Modal shown when a guest user tries to access a restricted/premium feature.
 * Provides Sign Up and Login CTAs to convert the guest.
 */

import { useNavigate } from 'react-router-dom';
import { X, Lock, Sparkles, ArrowRight, LogIn } from 'lucide-react';
import { useEffect } from 'react';

const GuestUpgradeModal = ({ open, featureName = 'this feature', onClose }) => {
  const navigate = useNavigate();

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSignUp = () => { onClose(); navigate('/signup'); };
  const handleLogin = () => { onClose(); navigate('/login'); };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="guest-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(6px)',
        animation: 'fadeIn 0.2s ease both',
      }}
    >
      <div
        className="glass"
        style={{
          maxWidth: 440,
          width: '100%',
          padding: 36,
          borderRadius: 24,
          position: 'relative',
          border: '1px solid rgba(99,102,241,0.25)',
          boxShadow: '0 0 60px rgba(99,102,241,0.15), 0 24px 48px rgba(0,0,0,0.4)',
          animation: 'fadeInUp 0.3s ease both',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-color)',
            borderRadius: 8,
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            transition: 'all 0.2s',
          }}
        >
          <X size={16} />
        </button>

        {/* Icon */}
        <div style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
          border: '1px solid rgba(99,102,241,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}>
          <Lock size={28} color="#818cf8" />
        </div>

        {/* Heading */}
        <h2
          id="guest-modal-title"
          style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}
        >
          Unlock <span className="gradient-text">{featureName}</span>
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 28 }}>
          Create a free account to unlock{' '}
          <strong style={{ color: 'var(--text-primary)' }}>{featureName}</strong> and save your
          progress permanently. No credit card required.
        </p>

        {/* Feature highlights */}
        <div style={{
          marginBottom: 28,
          padding: '14px 16px',
          background: 'rgba(99,102,241,0.06)',
          border: '1px solid rgba(99,102,241,0.12)',
          borderRadius: 12,
        }}>
          {[
            '✦ Unlimited AI analyses',
            '✦ Permanent data storage',
            '✦ Export reports & insights',
            '✦ Advanced analytics & streaks',
          ].map((item) => (
            <p key={item} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
              {item}
            </p>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            id="guest-modal-signup-btn"
            onClick={handleSignUp}
            className="btn-primary"
            style={{ justifyContent: 'center', padding: '13px' }}
          >
            <Sparkles size={16} />
            Create Free Account
            <ArrowRight size={15} />
          </button>
          <button
            id="guest-modal-login-btn"
            onClick={handleLogin}
            className="btn-ghost"
            style={{ justifyContent: 'center', padding: '12px' }}
          >
            <LogIn size={16} />
            Sign In to Existing Account
          </button>
        </div>

        <p style={{
          textAlign: 'center',
          fontSize: 12,
          color: 'var(--text-muted)',
          marginTop: 16,
        }}>
          Your guest session data will be preserved when you create an account.
        </p>
      </div>
    </div>
  );
};

export default GuestUpgradeModal;
