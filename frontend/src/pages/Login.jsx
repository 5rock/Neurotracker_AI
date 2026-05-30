import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Eye, EyeOff, ArrowRight, Lock, Mail, UserCircle, Loader } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import GuestRecovery from '../components/guest/GuestRecovery';
import { getAuthErrorMessage } from '../utils/authErrors';
import toast from 'react-hot-toast';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const { login, loginAsGuest } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill in all fields.');
    setLoading(true);
    console.log('[Login] Submitting login...', form.email);
    try {
      await login(form.email, form.password);
      console.log('[Login] OK — redirecting to /dashboard');
      toast.success('Welcome back! 🧠');
      navigate('/dashboard');
    } catch (err) {
      console.error('[Login] Error:', err);
      toast.error(getAuthErrorMessage(err, 'Login failed.'));
    } finally {
      setLoading(false);
    }
  };

  /** Instantly create a guest session and enter the app */
  const handleGuestLogin = async () => {
    setGuestLoading(true);
    console.log('[Login] Starting guest login...');
    try {
      await loginAsGuest();
      console.log('[Login] Guest OK — redirecting to /dashboard');
      toast.success('Welcome! Exploring as Guest 👤', { duration: 3000 });
      navigate('/dashboard');
    } catch (err) {
      console.error('[Login] Guest error:', err);
      toast.error(getAuthErrorMessage(err, 'Could not start guest session.'));
    } finally {
      setGuestLoading(false);
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
      position: 'relative',
    }}>
      {/* Background orb */}
      <div style={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
        top: '10%', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none',
      }} />

      <div
        className="page-enter"
        style={{ width: '100%', maxWidth: 420 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
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
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginTop: 16, marginBottom: 6 }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Sign in to continue your learning journey
          </p>
        </div>

        {/* Card */}
        <div className="glass" style={{ padding: 32, borderRadius: 20 }}>
          {/* Recovery UI for expired guest sessions */}
          <GuestRecovery />

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="login-email"
                  type="email"
                  className="input-field"
                  style={{ paddingLeft: 42 }}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: 12, color: '#818cf8', textDecoration: 'none' }}>Forgot password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  className="input-field"
                  style={{ paddingLeft: 42, paddingRight: 42 }}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Sign In button */}
            <button
              id="login-submit-btn"
              type="submit"
              className="btn-primary"
              disabled={loading || guestLoading}
              style={{ justifyContent: 'center', marginTop: 4, padding: '13px', opacity: loading ? 0.7 : 1 }}
            >
              {loading
                ? <><Loader size={15} style={{ animation: 'spin-slow 0.9s linear infinite' }} /> Signing in...</>
                : <>Sign In <ArrowRight size={15} /></>}
            </button>
          </form>

          {/* ── Divider ─────────────────────────────────────────────────── */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0',
          }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
          </div>

          {/* ── Continue as Guest button ─────────────────────────────────── */}
          <button
            id="guest-login-btn"
            type="button"
            onClick={handleGuestLogin}
            disabled={guestLoading || loading}
            className="btn-ghost"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '12px',
              borderStyle: 'dashed',
              gap: 10,
              opacity: guestLoading ? 0.7 : 1,
            }}
          >
            {guestLoading
              ? <><Loader size={16} style={{ animation: 'spin-slow 0.9s linear infinite' }} /> Starting guest session...</>
              : (
                <>
                  <UserCircle size={18} color="#94a3b8" />
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Continue as Guest</span>
                  <span style={{
                    fontSize: 11, fontWeight: 500, color: 'var(--text-muted)',
                    background: 'rgba(99,102,241,0.08)', borderRadius: 6,
                    padding: '2px 6px', marginLeft: 'auto',
                  }}>
                    No sign-up needed
                  </span>
                </>
              )}
          </button>

          {/* Guest limitations note */}
          <p style={{
            fontSize: 11, color: 'var(--text-muted)', textAlign: 'center',
            marginTop: 10, lineHeight: 1.6,
          }}>
            Guest sessions last 24h · Limited to 3 AI analyses/day
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-secondary)' }}>
          New here?{' '}
          <Link to="/signup" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
