import { useState } from 'react';
import { Mail, Award, MapPin, Briefcase, Camera, Edit2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || 'Student Name',
    careerGoal: user?.careerGoal || 'Full Stack Developer',
    location: 'Remote',
    bio: 'Passionate learner tracking my progress with NeuroTrack AI.',
  });

  const handleSave = () => {
    // Mock save
    setEditing(false);
    toast.success('Profile updated successfully!');
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Profile Header */}
      <div className="glass page-enter" style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 24 }}>
        {/* Cover */}
        <div style={{ height: 160, background: 'linear-gradient(135deg, rgba(99,102,241,0.5), rgba(139,92,246,0.5))', position: 'relative' }}>
          <button type="button" aria-label="Change cover image" style={{ position: 'absolute', right: 16, bottom: 16, background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', padding: 8, borderRadius: '50%', cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
            <Camera size={16} />
          </button>
        </div>

        {/* Avatar & Info */}
        <div style={{ padding: '0 32px 32px', position: 'relative', marginTop: -50 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
            <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--bg-card)', padding: 4 }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 800, color: 'white' }}>
                {form.name.charAt(0)}
              </div>
            </div>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="btn-ghost" style={{ padding: '8px 16px', fontSize: 13 }}>
                <Edit2 size={14} style={{ marginRight: 6 }} /> Edit Profile
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setEditing(false)} className="btn-ghost" style={{ padding: '8px 16px', fontSize: 13 }}>Cancel</button>
                <button onClick={handleSave} className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>Save Changes</button>
              </div>
            )}
          </div>

          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 500 }}>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Full Name</label>
                <input className="input-field" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Career Goal</label>
                <input className="input-field" value={form.careerGoal} onChange={(e) => setForm({...form, careerGoal: e.target.value})} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Bio</label>
                <textarea className="input-field" rows={3} value={form.bio} onChange={(e) => setForm({...form, bio: e.target.value})} />
              </div>
            </div>
          ) : (
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>{form.name}</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 16 }}>{form.bio}</p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, color: 'var(--text-muted)', fontSize: 14 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Briefcase size={16} /> {form.careerGoal}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={16} /> {form.location}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={16} /> {user?.email || 'student@example.com'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
        {/* Badges/Achievements */}
        <div className="metric-card page-enter" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Award size={18} color="#f59e0b" /> Your Badges
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {['🔥 7-Day Streak', '🧠 Fast Learner', '🎯 Perfect Score', '🚀 100 Topics'].map((b) => (
              <div key={b} style={{ padding: '8px 12px', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', borderRadius: 10, fontSize: 13, fontWeight: 600, border: '1px solid rgba(245,158,11,0.2)' }}>
                {b}
              </div>
            ))}
          </div>
        </div>

        {/* Account Settings placeholder */}
        <div className="metric-card page-enter" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Preferences</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-primary)', borderRadius: 10 }}>
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Email Notifications</span>
              <input type="checkbox" defaultChecked style={{ accentColor: '#6366f1' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-primary)', borderRadius: 10 }}>
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Daily Reminders</span>
              <input type="checkbox" defaultChecked style={{ accentColor: '#6366f1' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
