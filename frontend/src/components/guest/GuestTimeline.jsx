/**
 * GuestTimeline.jsx – Feature 8: Activity Timeline
 * Chronological event log grouped by relative day.
 * Collapsible section. Shows up to 20 most recent events.
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useGuestSession } from '../../hooks/useGuestSession';

const formatTimeAgo = (timestamp) => {
  const now = Date.now();
  const diff = now - timestamp;
  const secs = Math.floor(diff / 1000);
  const mins = Math.floor(secs / 60);
  const hours = Math.floor(mins / 60);

  if (secs < 60) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return 'earlier';
};

const getRelativeDay = (timestamp) => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} Days Ago`;
};

const groupByDay = (events) => {
  const groups = {};
  events.forEach((evt) => {
    const day = getRelativeDay(evt.time);
    if (!groups[day]) groups[day] = [];
    groups[day].push(evt);
  });
  return Object.entries(groups);
};

const EVENT_COLORS = {
  session_start: '#6366f1',
  ai_analysis: '#8b5cf6',
  roadmap_created: '#10b981',
  feature_visit: '#06b6d4',
  default: '#64748b',
};

const GuestTimeline = () => {
  const { timeline } = useGuestSession();
  const [collapsed, setCollapsed] = useState(false);

  if (!timeline || timeline.length === 0) return null;

  const grouped = groupByDay(timeline);

  return (
    <div
      className="page-enter"
      style={{
        borderRadius: 20,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        marginBottom: 24,
      }}
    >
      {/* Header */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          background: 'none', border: 'none', cursor: 'pointer',
          borderBottom: collapsed ? 'none' : '1px solid var(--border-color)',
          transition: 'border 0.2s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 16 }}>📋</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>
              Activity Timeline
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
              {timeline.length} event{timeline.length !== 1 ? 's' : ''} this session
            </div>
          </div>
        </div>
        <div style={{ color: 'var(--text-muted)' }}>
          {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </div>
      </button>

      {!collapsed && (
        <div style={{ padding: '16px 20px' }}>
          {grouped.map(([day, events]) => (
            <div key={day} style={{ marginBottom: 16 }}>
              {/* Day label */}
              <div style={{
                fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
                letterSpacing: '0.8px', textTransform: 'uppercase',
                marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
                {day}
                <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
              </div>

              {/* Events */}
              <div style={{ position: 'relative', paddingLeft: 24 }}>
                {/* Vertical connector */}
                {events.length > 1 && (
                  <div style={{
                    position: 'absolute',
                    left: 7, top: 14, bottom: 14,
                    width: 2,
                    background: 'linear-gradient(180deg, var(--border-color), transparent)',
                  }} />
                )}

                {events.map((evt, i) => {
                  const color = EVENT_COLORS[evt.type] || EVENT_COLORS.default;
                  return (
                    <div
                      key={`${evt.time}-${i}`}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 12,
                        marginBottom: i < events.length - 1 ? 12 : 0,
                        position: 'relative',
                      }}
                    >
                      {/* Timeline dot */}
                      <div style={{
                        width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                        background: `${color}20`,
                        border: `2px solid ${color}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 8, position: 'absolute', left: -24, top: 2,
                        boxShadow: `0 0 8px ${color}30`,
                      }}>
                        <span>{evt.emoji}</span>
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                            {evt.label}
                          </span>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>
                            {formatTimeAgo(evt.time)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GuestTimeline;
