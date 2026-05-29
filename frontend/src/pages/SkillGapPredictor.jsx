import { lazy, Suspense, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { aiAPI } from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import DeferredMount from '../components/ui/DeferredMount';

const SkillDemandChart = lazy(() => import('../components/charts/SkillGapCharts'));
const chartFallback = <div className="skeleton" style={{ height: 260 }} aria-hidden="true" />;

const CAREER_GOALS = [
  'Full Stack Developer', 'Data Scientist', 'AI/ML Engineer',
  'DevOps Engineer', 'Mobile Developer', 'Cybersecurity Engineer',
  'Cloud Architect', 'Backend Developer',
];

const MOCK_ANALYSIS = {
  careerReadinessScore: 58,
  missingSkills: [
    { name: 'Docker', category: 'devops', priority: 'high', industryDemand: 88, trending: true, estimatedHours: 20 },
    { name: 'TypeScript', category: 'frontend', priority: 'high', industryDemand: 92, trending: true, estimatedHours: 30 },
    { name: 'Redis', category: 'database', priority: 'medium', industryDemand: 75, trending: false, estimatedHours: 15 },
    { name: 'System Design', category: 'backend', priority: 'critical', industryDemand: 95, trending: true, estimatedHours: 80 },
    { name: 'AWS/Cloud', category: 'devops', priority: 'high', industryDemand: 90, trending: true, estimatedHours: 40 },
  ],
  strongSkills: ['React', 'JavaScript', 'Node.js', 'MongoDB'],
  recommendations: [
    'Focus on System Design first — it\'s the #1 interview requirement',
    'Learn TypeScript before your next project to boost hirability by 40%',
    'Docker knowledge is required by 88% of job postings in your target role',
  ],
  nextSteps: ['Complete TypeScript course', 'Build 1 Docker project', 'Study System Design weekly'],
  industryTrends: [
    { name: 'TypeScript', demand: 92, trending: true },
    { name: 'Docker', demand: 88, trending: true },
    { name: 'React', demand: 85, trending: false },
    { name: 'AWS', demand: 90, trending: true },
    { name: 'System Design', demand: 95, trending: true },
    { name: 'GraphQL', demand: 65, trending: true },
  ],
};

const priorityConfig = {
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', label: 'CRITICAL' },
  high: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', label: 'HIGH' },
  medium: { color: '#6366f1', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)', label: 'MEDIUM' },
  low: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', label: 'LOW' },
};

const SkillGapPredictor = () => {
  const [analysis, setAnalysis] = useState(MOCK_ANALYSIS);
  const [loading, setLoading] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState('Full Stack Developer');

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const res = await aiAPI.skillGap(selectedGoal);
      setAnalysis(res.data.analysis);
      toast.success('Skill gap analysis complete!');
    } catch {
      setAnalysis(MOCK_ANALYSIS);
      toast.success('Analysis ready (demo mode)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header + config */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>AI Skill Gap Predictor</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 2 }}>AI analyzes your skills vs industry demand</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={selectedGoal}
            onChange={(e) => setSelectedGoal(e.target.value)}
            className="input-field"
            style={{ width: 200 }}
          >
            {CAREER_GOALS.map((g) => <option key={g}>{g}</option>)}
          </select>
          <button onClick={runAnalysis} disabled={loading} className="btn-primary">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Analyzing...' : 'Run Analysis'}
          </button>
        </div>
      </div>

      {loading && <LoadingSpinner text="AI is analyzing your skills..." />}

      {analysis && !loading && (
        <>
          {/* Career readiness score */}
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 20, marginBottom: 24 }}>
            {/* Score circle */}
            <div className="metric-card page-enter" style={{ padding: 28, textAlign: 'center', minWidth: 200 }}>
              <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 16px' }}>
                <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(99,102,241,0.1)" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r="50"
                    fill="none"
                    stroke="url(#scoreRing)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={2 * Math.PI * 50 * (1 - analysis.careerReadinessScore / 100)}
                  />
                  <defs>
                    <linearGradient id="scoreRing" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)' }}>{analysis.careerReadinessScore}%</span>
                </div>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Career Readiness</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedGoal}</p>
              <div style={{ marginTop: 12 }}>
                <span style={{
                  fontSize: 11, padding: '3px 10px', borderRadius: 99, fontWeight: 700,
                  background: analysis.careerReadinessScore >= 80 ? 'rgba(16,185,129,0.1)' : analysis.careerReadinessScore >= 60 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                  color: analysis.careerReadinessScore >= 80 ? '#34d399' : analysis.careerReadinessScore >= 60 ? '#fbbf24' : '#f87171',
                }}>
                  {analysis.careerReadinessScore >= 80 ? '🚀 Job Ready' : analysis.careerReadinessScore >= 60 ? '📈 Getting Close' : '⚡ Keep Learning'}
                </span>
              </div>
            </div>

            <div className="metric-card page-enter" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>🎯 AI Recommendations</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {analysis.recommendations?.map((rec, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#818cf8' }}>{i + 1}</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{rec}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>✅ Your Strong Skills</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {analysis.strongSkills?.map((s) => (
                    <span key={s} className="badge badge-success">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div className="chart-container page-enter">
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>⚠️ Missing Skills</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {analysis.missingSkills?.map((skill) => {
                  const cfg = priorityConfig[skill.priority] || priorityConfig.medium;
                  return (
                    <div
                      key={skill.name}
                      className="page-enter"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 14px', borderRadius: 10,
                        background: cfg.bg, border: `1px solid ${cfg.border}`,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{skill.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                            ~{skill.estimatedHours}h to learn
                            {skill.trending && ' · 🔥 Trending'}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: cfg.color }}>{skill.industryDemand}%</div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>demand</div>
                        </div>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 7px', borderRadius: 99, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="chart-container page-enter">
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>📊 Industry Skill Demand</h3>
              <DeferredMount fallback={chartFallback} minHeight={260}>
                <Suspense fallback={chartFallback}>
                  <SkillDemandChart data={analysis.industryTrends} />
                </Suspense>
              </DeferredMount>
            </div>
          </div>

          <div className="chart-container page-enter">
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>🚀 Your Next Steps</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              {analysis.nextSteps?.map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>{i + 1}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{step}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SkillGapPredictor;
