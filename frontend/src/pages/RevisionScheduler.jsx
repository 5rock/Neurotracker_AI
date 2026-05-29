import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle, AlertTriangle, Play, Check } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { topicsAPI } from '../services/api';
import toast from 'react-hot-toast';

const enrichTopics = (topics) => {
  const now = Date.now();
  return topics.map((topic) => ({
    ...topic,
    daysSinceStudy: topic.lastStudied
      ? Math.floor((now - new Date(topic.lastStudied).getTime()) / 86400000)
      : null,
  }));
};

const MOCK_REVISIONS = enrichTopics([
  { _id: '1', name: 'System Design Basics', subject: 'Architecture', priority: 'critical', memoryRetention: 28, lastStudied: new Date(Date.now() - 7 * 86400000) },
  { _id: '2', name: 'Dynamic Programming', subject: 'DSA', priority: 'high', memoryRetention: 42, lastStudied: new Date(Date.now() - 5 * 86400000) },
  { _id: '3', name: 'React Context API', subject: 'React', priority: 'medium', memoryRetention: 65, lastStudied: new Date(Date.now() - 3 * 86400000) },
  { _id: '4', name: 'SQL Indexing', subject: 'Database', priority: 'medium', memoryRetention: 68, lastStudied: new Date(Date.now() - 2 * 86400000) },
]);

const priorityConfig = {
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', icon: AlertTriangle, label: 'Critical' },
  high: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', icon: Clock, label: 'High' },
  medium: { color: '#6366f1', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)', icon: CheckCircle, label: 'Medium' },
  low: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', icon: Check, label: 'Low' },
};

const RevisionScheduler = () => {
  const [revisions, setRevisions] = useState(MOCK_REVISIONS);
  const [loading, setLoading] = useState(true);
  const [todayLabel] = useState(() =>
    new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
  );

  useEffect(() => {
    topicsAPI.getToday()
      .then((res) => {
        if (res.data.topics?.length > 0) setRevisions(enrichTopics(res.data.topics));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markDone = async (id) => {
    // In real app, open Study Modal. Here we just mark done for UI
    setRevisions(prev => prev.filter(t => t._id !== id));
    toast.success('Revision marked as completed!');
  };

  if (loading) return <LoadingSpinner text="Loading today's revisions..." />;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>Smart Revision Scheduler</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 2 }}>Topics due for revision today based on spaced repetition</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-card)', padding: '8px 16px', borderRadius: 99, border: '1px solid var(--border-color)' }}>
          <CalendarIcon size={16} color="#6366f1" />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
            {todayLabel}
          </span>
        </div>
      </div>

      {revisions.length === 0 ? (
        <div className="metric-card page-enter" style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Check size={32} color="#10b981" />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>All caught up!</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>You have completed all your scheduled revisions for today. Great job!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {revisions.map((topic) => {
            const cfg = priorityConfig[topic.priority] || priorityConfig.medium;
            const Icon = cfg.icon;
            
            return (
              <div
                key={topic._id}
                className="metric-card glass-hover page-enter"
                style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {/* Priority indicator */}
                  <div style={{ 
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: cfg.bg, border: `1px solid ${cfg.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Icon size={20} color={cfg.color} />
                  </div>
                  
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{topic.name}</h3>
                      <span className="badge badge-primary">{topic.subject}</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color }} />
                        {cfg.label} Priority
                      </span>
                      <span>•</span>
                      <span>Retention: <strong style={{ color: cfg.color }}>{topic.memoryRetention}%</strong></span>
                      <span>•</span>
                      <span>Last studied: {topic.daysSinceStudy ?? '?'} days ago</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => markDone(topic._id)} className="btn-primary" style={{ padding: '10px 20px', fontSize: 13 }}>
                    <Play size={14} /> Review Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RevisionScheduler;
