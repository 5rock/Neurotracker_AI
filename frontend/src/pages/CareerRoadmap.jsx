import { useState } from 'react';
import { Check, Lock, Play, Sparkles, Star } from 'lucide-react';
import { aiAPI } from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const CAREER_GOALS = [
  'Full Stack Developer', 'Data Scientist', 'AI/ML Engineer',
  'DevOps Engineer', 'Mobile Developer', 'Backend Developer',
];

const MOCK_ROADMAP = {
  careerGoal: 'Full Stack Developer',
  title: 'Full Stack Developer Roadmap 2024',
  description: 'A comprehensive 6-month journey from foundations to job-ready full-stack developer.',
  totalDuration: 6,
  overallProgress: 33,
  milestones: [
    { month: 1, title: 'Web Foundations', description: 'Master HTML5, CSS3, and JavaScript ES6+', skills: ['HTML5', 'CSS3', 'JavaScript', 'Flexbox', 'Grid'], status: 'completed', progressPercent: 100, resources: [{ title: 'MDN Web Docs', url: 'https://developer.mozilla.org', type: 'article' }] },
    { month: 2, title: 'React & Modern Frontend', description: 'Build interactive UIs with React, hooks, and state management', skills: ['React.js', 'Hooks', 'Redux', 'React Router', 'Tailwind CSS'], status: 'in_progress', progressPercent: 60, resources: [{ title: 'React Documentation', url: 'https://react.dev', type: 'article' }] },
    { month: 3, title: 'Backend with Node.js', description: 'Build REST APIs with Node.js, Express, and databases', skills: ['Node.js', 'Express.js', 'REST APIs', 'Authentication', 'JWT'], status: 'locked', progressPercent: 0, resources: [] },
    { month: 4, title: 'Databases & DevOps', description: 'Master MongoDB, SQL, Docker, and deployment', skills: ['MongoDB', 'PostgreSQL', 'Docker', 'AWS', 'CI/CD'], status: 'locked', progressPercent: 0, resources: [] },
    { month: 5, title: 'Advanced Topics', description: 'System Design, TypeScript, and performance optimization', skills: ['TypeScript', 'System Design', 'Redis', 'GraphQL', 'WebSockets'], status: 'locked', progressPercent: 0, resources: [] },
    { month: 6, title: 'Job Ready', description: 'Build portfolio, prepare for interviews, and land your dream job', skills: ['Portfolio', 'DSA', 'LLD', 'Resume', 'Mock Interviews'], status: 'locked', progressPercent: 0, resources: [] },
  ],
  aiRecommendations: [
    'Practice DSA on LeetCode daily alongside your frontend learning',
    'Build real projects at each step — not just tutorials',
    'Join communities like GitHub, Dev.to, and LinkedIn to network',
  ],
};

const statusConfig = {
  completed: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', icon: Check, label: 'Completed' },
  in_progress: { color: '#6366f1', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)', icon: Play, label: 'In Progress' },
  locked: { color: '#64748b', bg: 'rgba(100,116,139,0.05)', border: 'rgba(100,116,139,0.1)', icon: Lock, label: 'Locked' },
};

const CareerRoadmap = () => {
  const [roadmap, setRoadmap] = useState(MOCK_ROADMAP);
  const [generating, setGenerating] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState('Full Stack Developer');

  const generateNew = async () => {
    setGenerating(true);
    try {
      const res = await aiAPI.generateRoadmap({ careerGoal: selectedGoal, experienceLevel: 1 });
      setRoadmap(res.data.roadmap);
      toast.success('Personalized roadmap generated! 🗺️');
    } catch {
      toast.success('Roadmap ready! (Demo mode)');
      setRoadmap({ ...MOCK_ROADMAP, careerGoal: selectedGoal });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>AI Career Roadmap</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 2 }}>AI-generated personalized learning path</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select value={selectedGoal} onChange={(e) => setSelectedGoal(e.target.value)} className="input-field" style={{ width: 200 }}>
            {CAREER_GOALS.map((g) => <option key={g}>{g}</option>)}
          </select>
          <button onClick={generateNew} disabled={generating} className="btn-primary">
            <Sparkles size={15} /> {generating ? 'Generating...' : 'Generate with AI'}
          </button>
        </div>
      </div>

      {generating && <LoadingSpinner text="AI is crafting your personalized roadmap..." />}

      {roadmap && !generating && (
        <>
          {/* Progress overview */}
          <div className="metric-card page-enter" style={{ marginBottom: 24, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{roadmap.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{roadmap.description}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#6366f1' }}>{roadmap.overallProgress || 0}%</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Overall Progress</div>
              </div>
            </div>
            <div className="progress-bar" style={{ height: 8 }}>
              <div
                className="progress-fill"
                style={{ '--progress': `${roadmap.overallProgress || 0}%` }}
              />
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
              {[['completed', '✅ Completed', roadmap.milestones?.filter((m) => m.status === 'completed').length || 0],
                ['in_progress', '🔵 In Progress', roadmap.milestones?.filter((m) => m.status === 'in_progress').length || 0],
                ['locked', '🔒 Remaining', roadmap.milestones?.filter((m) => m.status === 'locked').length || 0]].map(([, label, count]) => (
                <div key={label} style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{count}</strong> {label}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div style={{ position: 'relative' }}>
            {/* Vertical line */}
            <div style={{
              position: 'absolute', left: 32, top: 0, bottom: 0, width: 2,
              background: 'linear-gradient(180deg, #6366f1, #8b5cf6, rgba(99,102,241,0.1))',
              zIndex: 0,
            }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingLeft: 0 }}>
              {roadmap.milestones?.map((milestone, i) => {
                const cfg = statusConfig[milestone.status] || statusConfig.locked;
                const Icon = cfg.icon;
                return (
                  <div
                    key={i}
                    className="page-enter"
                    style={{ display: 'flex', gap: 20, alignItems: 'flex-start', position: 'relative', zIndex: 1 }}
                  >
                    {/* Timeline node */}
                    <div style={{
                      width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
                      background: cfg.bg, border: `2px solid ${cfg.border}`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      boxShadow: milestone.status !== 'locked' ? `0 0 20px ${cfg.color}30` : 'none',
                    }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', lineHeight: 1 }}>MONTH</span>
                      <span style={{ fontSize: 18, fontWeight: 900, color: cfg.color, lineHeight: 1.2 }}>{milestone.month}</span>
                    </div>

                    {/* Content card */}
                    <div
                      className="metric-card"
                      style={{
                        flex: 1, padding: 20,
                        opacity: milestone.status === 'locked' ? 0.65 : 1,
                        border: `1px solid ${milestone.status !== 'locked' ? cfg.border : 'var(--border-color)'}`,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{milestone.title}</h3>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99,
                          background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                        }}>
                          <Icon size={9} style={{ display: 'inline', marginRight: 3 }} />
                          {cfg.label}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>{milestone.description}</p>

                      {/* Skills */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: milestone.progressPercent > 0 ? 12 : 0 }}>
                        {milestone.skills?.map((skill) => (
                          <span key={skill} className="badge badge-primary" style={{ fontSize: 10 }}>{skill}</span>
                        ))}
                      </div>

                      {/* Progress bar for in_progress */}
                      {milestone.progressPercent > 0 && (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 5 }}>
                            <span>Progress</span>
                            <span style={{ fontWeight: 700, color: cfg.color }}>{milestone.progressPercent}%</span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{ '--progress': `${milestone.progressPercent}%`, background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}88)` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Recommendations */}
          {roadmap.aiRecommendations?.length > 0 && (
            <div className="chart-container page-enter" style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
                <Star size={16} color="#f59e0b" style={{ display: 'inline', marginRight: 6 }} />
                AI Pro Tips
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {roadmap.aiRecommendations.map((tip, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.1)' }}>
                    <span style={{ fontSize: 12 }}>💡</span>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CareerRoadmap;
