/**
 * GuestRecovery.jsx – Feature 4: Local Recovery System
 * Shown on the Login/Signup pages when stale guest progress is
 * detected in localStorage. Offers Restore or Start Fresh.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, Trash2, RefreshCw, Zap, Map, Compass } from 'lucide-react';
import { hasRecoverableData, clearSession, readSession } from '../../services/guestSession';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const GuestRecovery = () => {
  const navigate = useNavigate();
  const { loginAsGuest } = useAuth();
  const [restoring, setRestoring] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Only render if recoverable data actually exists
  if (dismissed || !hasRecoverableData()) return null;

  const session = readSession();
  const stats = session ? [
    session.aiAnalysesCount > 0 && { icon: Zap, label: `${session.aiAnalysesCount} AI analysis`, color: '#8b5cf6' },
    session.roadmapsCreated > 0 && { icon: Map, label: `${session.roadmapsCreated} roadmap`, color: '#10b981' },
    session.featuresExplored?.length > 0 && { icon: Compass, label: `${session.featuresExplored.length} features explored`, color: '#06b6d4' },
  ].filter(Boolean) : [];

  const handleRestore = async () => {
    setRestoring(true);
    try {
      await loginAsGuest();
      toast.success('Session restored! Welcome back 👋');
      navigate('/dashboard');
    } catch {
      toast.error('Could not restore session. Starting fresh.');
      clearSession();
      setDismissed(true);
    } finally {
      setRestoring(false);
    }
  };

  const handleStartFresh = () => {
    clearSession();
    localStorage.removeItem('neurotrack_user');
    setDismissed(true);
    toast('Starting fresh session', { icon: '🌱' });
  };

  return (
    <div
      className="page-enter"
      role="alert"
      style={{
        marginBottom: 20,
        padding: '18px 20px',
        borderRadius: 16,
        background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(239,68,68,0.04))',
        border: '1px solid rgba(245,158,11,0.25)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'rgba(245,158,11,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18,
        }}>
          💾
        </div>
        <div>
          <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>
            We found previous progress on this device
          </h4>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            Your guest session expired but your activity data is still here
          </p>
        </div>
      </div>

      {/* Stats found */}
      {stats.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {stats.map(({ icon: Icon, label, color }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 10px', borderRadius: 99,
              background: `${color}12`, border: `1px solid ${color}25`,
              fontSize: 11, fontWeight: 600, color,
            }}>
              <Icon size={11} /> {label}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          id="recovery-restore-btn"
          onClick={handleRestore}
          disabled={restoring}
          className="btn-primary"
          style={{ fontSize: 12, padding: '8px 14px', opacity: restoring ? 0.7 : 1 }}
        >
          {restoring
            ? <><RefreshCw size={13} style={{ animation: 'spin-slow 0.9s linear infinite' }} /> Restoring…</>
            : <><RotateCcw size={13} /> Restore Session</>}
        </button>
        <button
          id="recovery-fresh-btn"
          onClick={handleStartFresh}
          className="btn-ghost"
          style={{ fontSize: 12, padding: '8px 14px' }}
        >
          <Trash2 size={13} /> Start Fresh
        </button>
      </div>
    </div>
  );
};

export default GuestRecovery;
