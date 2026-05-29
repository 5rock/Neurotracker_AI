import { lazy, Suspense, useEffect, useState } from 'react';
import { analyticsAPI } from '../services/api';
import { Brain } from 'lucide-react';
import DeferredMount from '../components/ui/DeferredMount';

const WeakTopicScatter = lazy(() => import('../components/charts/WeakTopicCharts'));
const chartFallback = <div className="skeleton" style={{ height: 300 }} aria-hidden="true" />;

const MOCK_HEATMAP = [
  { topic: 'Dynamic Programming', subject: 'DSA', weaknessScore: 88, retention: 22, confidence: 30 },
  { topic: 'DBMS Joins', subject: 'Database', weaknessScore: 74, retention: 38, confidence: 42 },
  { topic: 'System Design', subject: 'Architecture', weaknessScore: 70, retention: 42, confidence: 38 },
  { topic: 'OS Scheduling', subject: 'OS', weaknessScore: 65, retention: 48, confidence: 45 },
  { topic: 'Graph Algorithms', subject: 'DSA', weaknessScore: 60, retention: 52, confidence: 50 },
  { topic: 'Recursion', subject: 'DSA', weaknessScore: 55, retention: 56, confidence: 55 },
  { topic: 'Network Protocols', subject: 'CN', weaknessScore: 48, retention: 62, confidence: 58 },
  { topic: 'React Hooks', subject: 'React', weaknessScore: 20, retention: 85, confidence: 82 },
  { topic: 'Binary Search', subject: 'DSA', weaknessScore: 15, retention: 88, confidence: 85 },
  { topic: 'Node.js Basics', subject: 'Node', weaknessScore: 18, retention: 84, confidence: 80 },
];

const getColor = (score) => {
  if (score >= 70) return '#ef4444';
  if (score >= 50) return '#f59e0b';
  if (score >= 30) return '#6366f1';
  return '#10b981';
};

const WeakTopicAnalyzer = () => {
  const [heatmap, setHeatmap] = useState(MOCK_HEATMAP);
  const [selected, setSelected] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    analyticsAPI.getHeatmap().then((res) => {
      if (res.data.data?.length > 0) setHeatmap(res.data.data);
    }).catch(() => {});
  }, []);

  const analyzeWeakness = async (topic) => {
    setSelected(topic);
    setAnalyzing(true);
    setAnalysis(null);
    try {
      setAnalysis(`## Why You're Struggling with ${topic.topic}\n\n**Root Causes:**\n1. Insufficient practice with recursive subproblems\n2. Difficulty visualizing state transitions\n3. Lack of pattern recognition\n\n**Study Strategy:**\n- Start with simpler problems (Fibonacci, Climbing Stairs)\n- Practice 1 DP problem daily\n- Use memoization visualization tools\n\n**Recommended Resources:**\n- [Dynamic Programming on LeetCode](https://leetcode.com)\n- Striver's A-Z DSA Sheet\n- Visualgo.net for visualization\n\n*Keep going! DP clicks after ~20 problems. 💪*`);
    } finally {
      setAnalyzing(false);
    }
  };

  const sorted = [...heatmap].sort((a, b) => b.weaknessScore - a.weaknessScore);
  const scatter = heatmap.map((t) => ({ x: t.retention || 0, y: t.confidence || 0, topic: t.topic, weakness: t.weaknessScore }));

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <header style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>Weak Topic Analyzer</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 2 }}>AI identifies your weakest concepts using quiz and retention data</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="chart-container page-enter">
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>🔥 Weakness Heatmap</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sorted.map((topic, i) => (
              <button
                key={topic.topic}
                type="button"
                className="page-enter"
                onClick={() => analyzeWeakness(topic)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                  borderRadius: 10, cursor: 'pointer', transition: 'border-color 0.2s, background 0.2s',
                  background: selected?.topic === topic.topic ? 'rgba(99,102,241,0.08)' : 'var(--bg-card)',
                  border: `1px solid ${selected?.topic === topic.topic ? 'rgba(99,102,241,0.3)' : 'var(--border-color)'}`,
                  width: '100%', textAlign: 'left',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                  background: `${getColor(topic.weaknessScore)}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, color: getColor(topic.weaknessScore),
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{topic.topic}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: getColor(topic.weaknessScore) }}>{topic.weaknessScore}%</span>
                  </div>
                  <div className="progress-bar" style={{ marginTop: 4 }}>
                    <div
                      className="progress-fill"
                      style={{ '--progress': `${topic.weaknessScore}%`, background: `linear-gradient(90deg, ${getColor(topic.weaknessScore)}, ${getColor(topic.weaknessScore)}88)` }}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="chart-container page-enter">
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Retention vs Confidence Matrix</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Bottom-left = Most critical topics to revise</p>
          <DeferredMount fallback={chartFallback} minHeight={300}>
            <Suspense fallback={chartFallback}>
              <WeakTopicScatter scatter={scatter} getColor={getColor} />
            </Suspense>
          </DeferredMount>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
            {[['#ef4444', 'Critical'], ['#f59e0b', 'Weak'], ['#6366f1', 'Fair'], ['#10b981', 'Strong']].map(([color, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />{label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <div className="chart-container page-enter">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={18} color="white" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>AI Analysis: {selected.topic}</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Click any topic to get AI-powered weakness analysis</p>
            </div>
          </div>
          {analyzing ? (
            <div style={{ display: 'flex', gap: 6, padding: 16, alignItems: 'center' }}>
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 8 }}>AI is analyzing...</span>
            </div>
          ) : analysis && (
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {analysis.split('\n').map((line) => {
                if (line.startsWith('## ')) return <h3 key={line} style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{line.slice(3)}</h3>;
                if (line.startsWith('**') && line.endsWith('**')) return <p key={line} style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{line.slice(2, -2)}</p>;
                if (line.startsWith('- ')) return <p key={line} style={{ paddingLeft: 16, color: 'var(--text-secondary)', marginBottom: 2 }}>• {line.slice(2)}</p>;
                if (line.match(/^\d\. /)) return <p key={line} style={{ paddingLeft: 16, color: 'var(--text-secondary)', marginBottom: 2 }}>{line}</p>;
                if (line.trim() === '') return <div key={line} style={{ height: 8 }} />;
                return <p key={line} style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>{line}</p>;
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WeakTopicAnalyzer;
