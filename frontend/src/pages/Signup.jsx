import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Eye, EyeOff, ArrowRight, Lock, Mail, User, Target, UserCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAuthState } from '../hooks/useAuthState';
import GuestRecovery from '../components/guest/GuestRecovery';
import { getAuthErrorMessage } from '../utils/authErrors';
import toast from 'react-hot-toast';

const careerGoals = [
  'Full Stack Developer', 'Data Scientist', 'AI/ML Engineer',
  'DevOps Engineer', 'Mobile Developer', 'Cybersecurity Engineer',
  'Cloud Architect', 'Blockchain Developer',
];

const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', careerGoal: 'Full Stack Developer' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const { register, loginAsGuest } = useAuth();
  const { user } = useAuthState();
  const navigate = useNavigate();

  const handleGuestLogin = async () => {
    setGuestLoading(true);
    console.log('[Signup] Starting guest login...');
    try {
      await loginAsGuest();
      console.log('[Signup] Guest login OK — redirecting to /dashboard');
      toast.success('Welcome! Exploring as Guest 👤', { duration: 3000 });
      navigate('/dashboard');
    } catch (err) {
      console.error('[Signup] Guest login error:', err);
      toast.error(getAuthErrorMessage(err, 'Could not start guest session.'));
    } finally {
      setGuestLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill in all fields.');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters.');

    // Capture guest state BEFORE register clears it
    const wasGuest = Boolean(user?.isGuest);
    const guestId = user?.guestId;

    setLoading(true);
    console.log('[Signup] Submitting registration...', { email: form.email, wasGuest, guestId });
    try {
      const result = await register({ ...form, guestId: guestId || undefined });
      console.log('[Signup] Registration OK:', result);
      console.log('[Signup] Auth state updated — redirecting...');
      toast.success('Welcome to NeuroTrack AI! 🎉');
      if (wasGuest && guestId) {
        console.log('[Signup] Redirect → /upgrade-success');
        navigate('/upgrade-success');
      } else {
        console.log('[Signup] Redirect → /dashboard');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('[Signup] Registration error:', err);
      toast.error(getAuthErrorMessage(err, 'Registration failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--gradient-hero)',
      padding: 20,
    }}>
      <div style={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
        bottom: '10%', right: '10%', pointerEvents: 'none',
      }} />

      <div
        className="page-enter"
        style={{ width: '100%', maxWidth: 440 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(99,102,241,0.4)',
            }}>
              <Brain size={26} color="white" />
            </div>
          </Link>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginTop: 14, marginBottom: 6 }}>
            Create your account
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Start your AI-powered learning journey today</p>
        </div>

        <div className="glass" style={{ padding: 28, borderRadius: 20 }}>
          {/* Recovery UI for expired guest sessions */}
          <GuestRecovery />

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7 }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" className="input-field" style={{ paddingLeft: 42 }} placeholder="Your full name"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7 }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="email" className="input-field" style={{ paddingLeft: 42 }} placeholder="you@example.com"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7 }}>Career Goal</label>
              <div style={{ position: 'relative' }}>
                <Target size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                <select
                  className="input-field"
                  style={{ paddingLeft: 42, appearance: 'none', cursor: 'pointer' }}
                  value={form.careerGoal}
                  onChange={(e) => setForm({ ...form, careerGoal: e.target.value })}
                >
                  {careerGoals.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type={showPass ? 'text' : 'password'} className="input-field" style={{ paddingLeft: 42, paddingRight: 42 }} placeholder="Min 6 characters"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <button type="button" aria-label={showPass ? 'Hide password' : 'Show password'} onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}
              style={{ justifyContent: 'center', marginTop: 4, padding: '13px', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creating account...' : <>Create Account <ArrowRight size={15} /></>}
            </button>
          </form>

          <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 16 }}>
            By signing up, you agree to our Terms & Privacy Policy
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: 18, fontSize: 14, color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>

        {/* Guest shortcut */}
        <p style={{ textAlign: 'center', marginTop: 10, fontSize: 13, color: 'var(--text-muted)' }}>
          Just exploring?{' '}
          <button
            id="signup-guest-shortcut-btn"
            type="button"
            onClick={handleGuestLogin}
            disabled={guestLoading}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#818cf8', fontWeight: 600, fontSize: 'inherit',
              padding: 0, display: 'inline-flex', alignItems: 'center', gap: 4,
            }}
          >
            <UserCircle size={14} />
            Continue as Guest &rarr;
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;
