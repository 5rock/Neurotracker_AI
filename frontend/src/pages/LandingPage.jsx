import { Link, useNavigate } from 'react-router-dom';
import {
  Brain, Zap, Map, BarChart2, MessageSquare, Shield,
  ArrowRight, Star, Check, ChevronRight, BookOpen, Trophy,
  TrendingUp, Users, Sparkles, AlertTriangle, Sun, Moon
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const features = [
  { icon: Brain, color: '#6366f1', title: 'AI Memory Intelligence', desc: 'Track retention with forgetting curves and spaced repetition.' },
  { icon: AlertTriangle, color: '#f59e0b', title: 'Weak Topic Detector', desc: 'Find weak concepts from quiz patterns and confidence scores.' },
  { icon: Zap, color: '#10b981', title: 'Skill Gap Predictor', desc: 'Compare current skills against your target career path.' },
  { icon: Map, color: '#8b5cf6', title: 'Career Roadmap', desc: 'Generate month-by-month learning plans for your goals.' },
  { icon: MessageSquare, color: '#06b6d4', title: 'AI Mentor', desc: 'Ask for study planning, revision help, and career guidance.' },
  { icon: BarChart2, color: '#ec4899', title: 'Smart Analytics', desc: 'Review retention, readiness, streaks, and quiz trends.' },
];

const stats = [
  { value: '50K+', label: 'Students', icon: Users },
  { value: '95%', label: 'Retention Boost', icon: TrendingUp },
  { value: '3x', label: 'Faster Learning', icon: Zap },
  { value: '4.9', label: 'User Rating', icon: Star },
];

const plans = [
  { name: 'Free', price: 'INR 0', features: ['5 topic trackers', 'Basic analytics', 'AI Mentor trial', 'Revision scheduler'] },
  { name: 'Pro', price: 'INR 499', features: ['Unlimited topics', 'Advanced analytics', 'Career roadmap', 'AI quiz generation'], highlighted: true },
  { name: 'Team', price: 'INR 999', features: ['Team leaderboard', 'Admin dashboard', 'Bulk analysis', 'Priority support'] },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', overflowX: 'hidden' }}>
      <nav aria-label="Public navigation" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        padding: '0 5%',
        height: 68,
        background: 'rgba(15,15,26,0.88)',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, textDecoration: 'none' }}>
          <span style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Brain size={20} color="white" />
          </span>
          <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)' }}>NeuroTrack AI</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 8,
              padding: 8,
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
            }}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <Link to="/login" className="btn-ghost" style={{ fontSize: 13, padding: '8px 16px' }}>Login</Link>
          <button type="button" onClick={() => navigate('/signup')} className="btn-primary" style={{ fontSize: 13, padding: '8px 20px' }}>
            Get Started <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      <main>
        <section className="landing-hero" style={{
          minHeight: '92vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '100px 5% 56px',
          background: 'var(--gradient-hero)',
        }}>
          <div className="page-enter" style={{ maxWidth: 840 }}>
            <div className="badge badge-primary" style={{ marginBottom: 24 }}>
              <Sparkles size={14} /> AI-powered learning intelligence
            </div>
            <h1 style={{ fontSize: 'clamp(40px, 7vw, 72px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 24, color: 'var(--text-primary)' }}>
              Learn smarter with <span className="gradient-text">memory intelligence</span>
            </h1>
            <p style={{ fontSize: 18, color: 'var(--text-secondary)', marginBottom: 36, maxWidth: 620, marginInline: 'auto', lineHeight: 1.7 }}>
              Track retention, detect weak spots, predict skill gaps, and build career roadmaps without waiting on a heavy animated hero.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => navigate('/signup')} className="btn-primary" style={{ fontSize: 15, padding: '13px 28px' }}>
                Start for Free <ArrowRight size={16} />
              </button>
              <button type="button" onClick={() => navigate('/login')} className="btn-ghost" style={{ fontSize: 15, padding: '13px 28px' }}>
                Live Demo <ChevronRight size={16} />
              </button>
            </div>
            <div style={{ marginTop: 40, display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
              {['No credit card', 'Free plan', 'Cancel anytime'].map((text) => (
                <span key={text} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13 }}>
                  <Check size={14} color="#10b981" /> {text}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section aria-label="Platform stats" style={{ padding: '48px 5%', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 24, maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label}>
                <Icon size={20} color="#818cf8" />
                <div style={{ fontSize: 34, fontWeight: 900, color: 'var(--text-primary)' }}>{value}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{label}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ padding: '84px 5%' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div className="badge badge-primary" style={{ marginBottom: 16 }}>Features</div>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>
                Everything you need to master any subject
              </h2>
              <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto' }}>
                A focused dashboard for memory, weak topics, skill growth, AI mentoring, and career planning.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              {features.map(({ icon: Icon, color, title, desc }) => (
                <article key={title} className="metric-card glass-hover" style={{ padding: 24 }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: `${color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                  }}>
                    <Icon size={22} color={color} />
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '72px 5%', background: 'rgba(99,102,241,0.03)' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: 34, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 28 }}>
              Built for focused learning
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
              {[
                { icon: BookOpen, title: 'Study what matters', text: 'Use revision priority instead of raw topic lists.' },
                { icon: Trophy, title: 'Stay consistent', text: 'Track streaks, XP, and readiness without clutter.' },
                { icon: Shield, title: 'Production-ready auth', text: 'Session cookies and protected routes keep data safer.' },
              ].map(({ icon: Icon, title, text }) => (
                <article key={title} className="glass" style={{ padding: 24 }}>
                  <Icon size={24} color="#818cf8" />
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: '12px 0 8px' }}>{title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '84px 5%' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <h2 style={{ fontSize: 34, fontWeight: 800, color: 'var(--text-primary)' }}>Choose your plan</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
              {plans.map((plan) => (
                <article key={plan.name} className={`metric-card ${plan.highlighted ? 'gradient-border' : ''}`} style={{ padding: 26 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{plan.name}</h3>
                  <div style={{ fontSize: 30, fontWeight: 900, color: 'var(--text-primary)', margin: '12px 0 18px' }}>{plan.price}</div>
                  <ul style={{ listStyle: 'none', display: 'grid', gap: 10, marginBottom: 24 }}>
                    {plan.features.map((feature) => (
                      <li key={feature} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 14 }}>
                        <Check size={15} color="#10b981" /> {feature}
                      </li>
                    ))}
                  </ul>
                  <button type="button" onClick={() => navigate('/signup')} className={plan.highlighted ? 'btn-primary' : 'btn-ghost'} style={{ width: '100%', justifyContent: 'center' }}>
                    Get Started
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
