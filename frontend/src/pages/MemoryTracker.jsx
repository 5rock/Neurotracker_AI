import { useState, useEffect } from 'react';
import { Plus, BookOpen, Clock, CheckCircle, Trash2, Play, Zap } from 'lucide-react';
import { topicsAPI, aiAPI } from '../services/api';
import toast from 'react-hot-toast';

const SUBJECTS = ['DSA', 'Database', 'Operating System', 'Computer Networks', 'React', 'Node.js', 'Python', 'System Design', 'Mathematics', 'Other'];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

const MOCK_TOPICS = [
  { _id: '1', name: 'Binary Search', subject: 'DSA', difficulty: 'intermediate', confidenceScore: 78, memoryRetention: 82, revisionCount: 5, nextRevisionDate: new Date(), lastStudied: new Date(Date.now() - 86400000) },
  { _id: '2', name: 'Dynamic Programming', subject: 'DSA', difficulty: 'advanced', confidenceScore: 32, memoryRetention: 28, revisionCount: 2, nextRevisionDate: new Date(), lastStudied: new Date(Date.now() - 5 * 86400000) },
  { _id: '3', name: 'SQL Joins', subject: 'Database', difficulty: 'intermediate', confidenceScore: 55, memoryRetention: 61, revisionCount: 3, nextRevisionDate: new Date(Date.now() + 2 * 86400000), lastStudied: new Date(Date.now() - 2 * 86400000) },
  { _id: '4', name: 'React Hooks', subject: 'React', difficulty: 'intermediate', confidenceScore: 85, memoryRetention: 88, revisionCount: 8, nextRevisionDate: new Date(Date.now() + 5 * 86400000), lastStudied: new Date(Date.now() - 86400000) },
  { _id: '5', name: 'Process Scheduling', subject: 'Operating System', difficulty: 'advanced', confidenceScore: 40, memoryRetention: 35, revisionCount: 1, nextRevisionDate: new Date(), lastStudied: new Date(Date.now() - 7 * 86400000) },
];

const AddTopicModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({ name: '', subject: 'DSA', difficulty: 'beginner', notes: '' });
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!form.name) return toast.error('Topic name required');
    setLoading(true);
    try {
      const res = await topicsAPI.add(form);
      onAdd(res.data.topic);
      toast.success('Topic added!');
      onClose();
    } catch {
      // Add mock topic for demo
      onAdd({ ...form, _id: Date.now().toString(), confidenceScore: 50, memoryRetention: 100, revisionCount: 0, nextRevisionDate: new Date() });
      toast.success('Topic added!');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="glass page-enter" style={{ width: 440, padding: 28, borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>Add New Topic</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 7 }}>Topic Name</label>
            <input className="input-field" placeholder="e.g., Binary Search Trees" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 7 }}>Subject</label>
              <select className="input-field" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 7 }}>Difficulty</label>
              <select className="input-field" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                {DIFFICULTIES.map((d) => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 7 }}>Notes (optional)</label>
            <textarea className="input-field" rows={3} placeholder="Add any notes or resources..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button onClick={onClose} className="btn-ghost" style={{ padding: '9px 18px' }}>Cancel</button>
            <button onClick={handleAdd} disabled={loading} className="btn-primary" style={{ padding: '9px 18px', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Adding...' : 'Add Topic'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StudyModal = ({ topic, onClose, onStudied }) => {
  const [rating, setRating] = useState(4);
  const [time, setTime] = useState(30);
  const [loading, setLoading] = useState(false);

  const handleStudy = async () => {
    setLoading(true);
    try {
      await topicsAPI.study(topic._id, { qualityRating: rating, timeSpent: time });
      toast.success(`Great! Next revision in ${rating >= 4 ? '6+ days' : rating >= 3 ? '3 days' : '1 day'}`);
      onStudied(topic._id);
      onClose();
    } catch {
      toast.success('Study session recorded! (Demo mode)');
      onStudied(topic._id);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const ratingLabels = ['', 'Blackout 😵', 'Incorrect 😕', 'Hard 😓', 'Correct 👍', 'Easy 😊', 'Perfect 🎯'];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="glass page-enter" style={{ width: 400, padding: 28, borderRadius: 20 }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Record Study Session</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>{topic.name}</p>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 10 }}>
            How well did you recall this? ({ratingLabels[rating]})
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[0, 1, 2, 3, 4, 5].map((r) => (
              <button key={r} onClick={() => setRating(r)} style={{
                flex: 1, padding: '8px 0', borderRadius: 8,
                background: rating === r ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'var(--bg-card)',
                color: rating === r ? 'white' : 'var(--text-secondary)',
                cursor: 'pointer', fontWeight: 700, fontSize: 14,
                border: `1px solid ${rating === r ? 'transparent' : 'var(--border-color)'}`,
              }}>{r}</button>
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>0 = Forgot completely → 5 = Perfect recall</p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Time Spent (minutes): {time}</label>
          <input type="range" min={5} max={120} step={5} value={time} onChange={(e) => setTime(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#6366f1' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
            <span>5 min</span><span>120 min</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '9px 18px' }}>Cancel</button>
          <button onClick={handleStudy} disabled={loading} className="btn-primary" style={{ padding: '9px 18px' }}>
            {loading ? 'Saving...' : 'Record Session'}
          </button>
        </div>
      </div>
    </div>
  );
};

const getRetentionColor = (r) => {
  if (r >= 70) return '#10b981';
  if (r >= 40) return '#f59e0b';
  return '#ef4444';
};

const MemoryTracker = () => {
  const [topics, setTopics] = useState(MOCK_TOPICS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [studyTopic, setStudyTopic] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await topicsAPI.getAll();
        if (res.data.topics?.length > 0) setTopics(res.data.topics);
      } catch {
        // Demo data remains available when the API is offline.
      }
    };
    fetchTopics();
  }, []);

  const filteredTopics = topics.filter((t) => {
    if (filter === 'weak') return t.memoryRetention < 50 || t.confidenceScore < 50;
    if (filter === 'due') return new Date(t.nextRevisionDate) <= new Date();
    return true;
  });

  const handleDelete = async (id) => {
    setTopics((prev) => prev.filter((t) => t._id !== id));
    try {
      await topicsAPI.delete(id);
    } catch {
      // Topic was already removed optimistically.
    }
    toast.success('Topic removed');
  };

  const generateQuiz = async (topic) => {
    try {
      await aiAPI.generateQuiz({ topicName: topic.name, difficulty: topic.difficulty, count: 5 });
      toast.success('Quiz generated.');
    } catch {
      toast.error('Quiz generation is unavailable right now.');
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>Memory Tracker</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 2 }}>Track topics using SM-2 spaced repetition</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          <Plus size={16} /> Add Topic
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Topics', value: topics.length, color: '#6366f1' },
          { label: 'Mastered (>80%)', value: topics.filter((t) => t.confidenceScore >= 80).length, color: '#10b981' },
          { label: 'Need Revision', value: topics.filter((t) => new Date(t.nextRevisionDate) <= new Date()).length, color: '#f59e0b' },
          { label: 'Weak Topics', value: topics.filter((t) => t.memoryRetention < 50).length, color: '#ef4444' },
        ].map(({ label, value, color }) => (
          <div key={label} className="metric-card" style={{ padding: 18 }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{label}</p>
            <p style={{ fontSize: 28, fontWeight: 800, color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['all', 'All Topics'], ['weak', 'Weak (<50%)'], ['due', 'Due Today']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)} style={{
            padding: '7px 16px', borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            background: filter === val ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'var(--bg-card)',
            color: filter === val ? 'white' : 'var(--text-secondary)',
            border: `1px solid ${filter === val ? 'transparent' : 'var(--border-color)'}`,
            transition: 'all 0.2s',
          }}>
            {label}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)', alignSelf: 'center' }}>
          {filteredTopics.length} topics
        </span>
      </div>

      {/* Topics grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {filteredTopics.map((topic) => (
          <div
            key={topic._id}
            className="metric-card glass-hover page-enter"
            style={{ padding: 20 }}
          >
            {/* Topic header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{topic.name}</h3>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span className="badge badge-primary" style={{ fontSize: 10 }}>{topic.subject}</span>
                  <span style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 99, fontWeight: 600,
                    background: topic.difficulty === 'advanced' ? 'rgba(239,68,68,0.1)' : topic.difficulty === 'intermediate' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                    color: topic.difficulty === 'advanced' ? '#f87171' : topic.difficulty === 'intermediate' ? '#fbbf24' : '#34d399',
                    border: `1px solid ${topic.difficulty === 'advanced' ? 'rgba(239,68,68,0.2)' : topic.difficulty === 'intermediate' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'}`,
                  }}>
                    {topic.difficulty}
                  </span>
                </div>
              </div>
              <button aria-label={`Delete ${topic.name}`} onClick={() => handleDelete(topic._id)} style={{
                background: 'none', border: 'none', color: 'var(--text-muted)',
                cursor: 'pointer', padding: 4, borderRadius: 6, transition: 'all 0.2s',
              }}
                onMouseOver={(e) => e.target.style.color = '#ef4444'}
                onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Memory retention */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Memory Retention</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: getRetentionColor(topic.memoryRetention || 0) }}>
                  {topic.memoryRetention || 0}%
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${topic.memoryRetention || 0}%`,
                    background: `linear-gradient(90deg, ${getRetentionColor(topic.memoryRetention || 0)}, ${getRetentionColor(topic.memoryRetention || 0)}88)`,
                  }}
                />
              </div>
            </div>

            {/* Confidence */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Confidence Score</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: getRetentionColor(topic.confidenceScore) }}>
                  {topic.confidenceScore}%
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${topic.confidenceScore}%`,
                    background: `linear-gradient(90deg, ${getRetentionColor(topic.confidenceScore)}, ${getRetentionColor(topic.confidenceScore)}88)`,
                  }}
                />
              </div>
            </div>

            {/* Meta */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                <CheckCircle size={12} /> {topic.revisionCount} revisions
              </div>
              {topic.nextRevisionDate && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: new Date(topic.nextRevisionDate) <= new Date() ? '#f59e0b' : 'var(--text-muted)' }}>
                  <Clock size={12} />
                  {new Date(topic.nextRevisionDate) <= new Date()
                    ? 'Due now!'
                    : `Due ${new Date(topic.nextRevisionDate).toLocaleDateString()}`}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setStudyTopic(topic)} className="btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 12, padding: '8px' }}>
                <Play size={13} /> Study
              </button>
              <button onClick={() => generateQuiz(topic)} className="btn-ghost" style={{ flex: 1, justifyContent: 'center', fontSize: 12, padding: '8px' }}>
                <Zap size={13} /> Quiz
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTopics.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <BookOpen size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
          <p>No topics found. Add your first topic!</p>
        </div>
      )}

      {/* Modals */}
      {showAddModal && <AddTopicModal onClose={() => setShowAddModal(false)} onAdd={(t) => setTopics((prev) => [...prev, t])} />}
      {studyTopic && <StudyModal topic={studyTopic} onClose={() => setStudyTopic(null)} onStudied={(id) => {
        setTopics((prev) => prev.map((t) => t._id === id ? { ...t, revisionCount: t.revisionCount + 1 } : t));
      }} />}
    </div>
  );
};

export default MemoryTracker;
