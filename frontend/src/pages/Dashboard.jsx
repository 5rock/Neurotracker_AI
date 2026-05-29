import { lazy, Suspense, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain, BookOpen, Zap, TrendingUp, Calendar,
  ArrowRight, Flame, Star, Target, Clock
} from 'lucide-react';
import { analyticsAPI } from '../services/api';
import { useAuthState } from '../hooks/useAuthState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import DeferredMount from '../components/ui/DeferredMount';

const QuizTrendChart = lazy(() => import('../components/charts/DashboardCharts').then((m) => ({ default: m.QuizTrendChart })));
const SkillRadarChart = lazy(() => import('../components/charts/DashboardCharts').then((m) => ({ default: m.SkillRadarChart })));
const SubjectConfidenceChart = lazy(() => import('../components/charts/DashboardCharts').then((m) => ({ default: m.SubjectConfidenceChart })));

const chartFallback = <div className="skeleton" style={{ height: 220 }} aria-hidden="true" />;

const MOCK_DATA = {
  overview: {
    totalTopics: 24,
    masteredTopics: 9,
    memoryRetention: 73,
    avgQuizScore: 68,
    streak: 7,
    longestStreak: 12,
    xpPoints: 2450,
    level: 4,
    totalStudyHours: 38,
    careerReadinessScore: 62,
    dueTodayCount: 5,
  },
  weakTopics: [
    { name: 'Dynamic Programming', subject: 'DSA', weaknessScore: 82 },
    { name: 'DBMS Joins', subject: 'Database', weaknessScore: 71 },
    { name: 'System Design', subject: 'Architecture', weaknessScore: 64 },
    { name: 'Recursion', subject: 'DSA', weaknessScore: 58 },
    { name: 'OS Scheduling', subject: 'OS', weaknessScore: 47 },
  ],
  quizTrend: [
    { date: '2024-01-01', score: 55, topic: 'Arrays' },
    { date: '2024-01-03', score: 62, topic: 'Trees' },
    { date: '2024-01-06', score: 58, topic: 'DP' },
    { date: '2024-01-09', score: 70, topic: 'Graphs' },
    { date: '2024-01-12', score: 68, topic: 'OS' },
    { date: '2024-01-15', score: 75, topic: 'DBMS' },
    { date: '2024-01-18', score: 72, topic: 'CN' },
  ],
  subjects: [
    { name: 'DSA', avgConfidence: 52 },
    { name: 'Database', avgConfidence: 45 },
    { name: 'OS', avgConfidence: 60 },
    { name: 'CN', avgConfidence: 68 },
    { name: 'React', avgConfidence: 78 },
    { name: 'Node.js', avgConfidence: 72 },
  ],
};

const MetricCard = ({ icon: Icon, label, value, unit, color, sub }) => (
  <div className="metric-card page-enter" style={{ position: 'relative', overflow: 'hidden' }}>
    <div style={{
      position: 'absolute', top: 0, right: 0,
      width: 80, height: 80, borderRadius: '0 16px 0 80px',
      background: `${color}15`,
    }} />
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 500 }}>{label}</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</span>
          {unit && <span style={{ fontSize: 16, color: color, fontWeight: 600 }}>{unit}</span>}
        </div>
        {sub && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{sub}</p>}
      </div>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: `${color}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={22} color={color} />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [data, setData] = useState(MOCK_DATA);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthState();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const fetchDashboard = async () => {
      try {
        const res = await analyticsAPI.getDashboard();
        if (!cancelled) setData(res.data.data);
      } catch {
        if (!cancelled) setData(MOCK_DATA);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const run = () => fetchDashboard();
    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(run, { timeout: 800 });
      return () => {
        cancelled = true;
        cancelIdleCallback(id);
      };
    }

    const timer = setTimeout(run, 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  if (loading) return <LoadingSpinner text="Loading your dashboard..." />;

  const overview = data?.overview ?? MOCK_DATA.overview;
  const weakTopics = data?.weakTopics ?? MOCK_DATA.weakTopics;
  const quizTrend = data?.quizTrend?.length ? data.quizTrend : MOCK_DATA.quizTrend;
  const subjects = data?.subjects?.length ? data.subjects : MOCK_DATA.subjects;

  const metrics = [
    { icon: Brain, label: 'Memory Retention', value: overview.memoryRetention, unit: '%', color: '#6366f1', sub: 'Avg across all topics' },
    { icon: Flame, label: 'Learning Streak', value: overview.streak, unit: ' days', color: '#f59e0b', sub: `Best: ${overview.longestStreak} days` },
    { icon: Target, label: 'Career Readiness', value: overview.careerReadinessScore, unit: '%', color: '#10b981', sub: user?.careerGoal },
    { icon: Star, label: 'XP Points', value: overview.xpPoints?.toLocaleString(), unit: '', color: '#8b5cf6', sub: `Level ${overview.level}` },
    { icon: BookOpen, label: 'Topics Tracked', value: overview.totalTopics, unit: '', color: '#06b6d4', sub: `${overview.masteredTopics} mastered` },
    { icon: Clock, label: 'Study Hours', value: overview.totalStudyHours, unit: 'h', color: '#ec4899', sub: 'This week' },
  ];

  const radarData = subjects.slice(0, 6).map((s) => ({
    subject: s.name,
    A: s.avgConfidence,
    fullMark: 100,
  }));

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  })();

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <header className="page-enter" style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
          Good {greeting},{' '}
          <span className="gradient-text">{user?.name?.split(' ')[0]} 👋</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
          {overview.dueTodayCount > 0
            ? `You have ${overview.dueTodayCount} topics due for revision today. Keep up the streak!`
            : "You're all caught up! Great work on your learning streak."}
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 28 }}>
        {metrics.map((m) => <MetricCard key={m.label} {...m} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="chart-container page-enter">
          <div className="section-header">
            <div>
              <h3 className="section-title">Quiz Performance Trend</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Last 7 quiz attempts</p>
            </div>
            <div className="badge badge-success">+{Math.round((quizTrend[quizTrend.length - 1]?.score || 0) - (quizTrend[0]?.score || 0))}%</div>
          </div>
          <DeferredMount fallback={chartFallback}>
            <Suspense fallback={chartFallback}>
              <QuizTrendChart quizTrend={quizTrend} />
            </Suspense>
          </DeferredMount>
        </div>

        <div className="chart-container page-enter">
          <div className="section-header">
            <h3 className="section-title">Skill Radar</h3>
            <span className="badge badge-primary">Live</span>
          </div>
          <DeferredMount fallback={chartFallback}>
            <Suspense fallback={chartFallback}>
              <SkillRadarChart radarData={radarData} />
            </Suspense>
          </DeferredMount>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="chart-container page-enter">
          <div className="section-header">
            <div>
              <h3 className="section-title">🔴 Weak Topics</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Needs immediate attention</p>
            </div>
            <button type="button" onClick={() => navigate('/weak-topics')} className="btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }}>
              View All <ArrowRight size={12} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {weakTopics.slice(0, 5).map((topic, i) => (
              <div key={topic.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: topic.weaknessScore > 70 ? 'rgba(239,68,68,0.1)' : topic.weaknessScore > 50 ? 'rgba(245,158,11,0.1)' : 'rgba(99,102,241,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700,
                  color: topic.weaknessScore > 70 ? '#f87171' : topic.weaknessScore > 50 ? '#fbbf24' : '#818cf8',
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {topic.name}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: topic.weaknessScore > 70 ? '#f87171' : '#fbbf24', flexShrink: 0, marginLeft: 8 }}>
                      {topic.weaknessScore}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ '--progress': `${topic.weaknessScore}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-container page-enter">
          <div className="section-header">
            <div>
              <h3 className="section-title">Subject Confidence</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Avg confidence per subject</p>
            </div>
          </div>
          <DeferredMount fallback={chartFallback}>
            <Suspense fallback={chartFallback}>
              <SubjectConfidenceChart subjects={subjects} />
            </Suspense>
          </DeferredMount>
        </div>
      </div>

      <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {[
          { label: "Today's Revisions", icon: Calendar, path: '/revision-scheduler', color: '#6366f1', count: overview.dueTodayCount },
          { label: 'AI Mentor Chat', icon: Brain, path: '/ai-mentor', color: '#8b5cf6' },
          { label: 'Generate Quiz', icon: Zap, path: '/memory-tracker', color: '#10b981' },
          { label: 'Career Roadmap', icon: TrendingUp, path: '/career-roadmap', color: '#f59e0b' },
        ].map(({ label, icon: Icon, path, color, count }) => (
          <button
            key={label}
            type="button"
            onClick={() => navigate(path)}
            className="glass-hover"
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
              background: 'var(--bg-card)', border: '1px solid var(--border-color)',
              borderRadius: 12, cursor: 'pointer', textAlign: 'left',
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={18} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
              {count !== undefined && (
                <div style={{ fontSize: 11, color: color, fontWeight: 600 }}>{count} pending</div>
              )}
            </div>
            <ArrowRight size={14} color="var(--text-muted)" style={{ marginLeft: 'auto' }} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
