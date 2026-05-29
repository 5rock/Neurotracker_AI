import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 4 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color, fontWeight: 600, fontSize: 13 }}>
          {p.name}: {p.value}{p.name === 'retention' || p.name === 'score' ? '%' : ''}
        </p>
      ))}
    </div>
  );
};

export const QuizTrendChart = ({ quizTrend }) => (
  <ResponsiveContainer width="100%" height={220}>
    <AreaChart data={quizTrend.map((q, i) => ({ name: `Quiz ${i + 1}`, score: q.score, topic: q.topic }))}>
      <defs>
        <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
      <Tooltip content={<CustomTooltip />} />
      <Area type="monotone" dataKey="score" name="score" stroke="#6366f1" strokeWidth={2.5} fill="url(#scoreGrad)" dot={{ fill: '#6366f1', r: 4 }} />
    </AreaChart>
  </ResponsiveContainer>
);

export const SkillRadarChart = ({ radarData }) => (
  <ResponsiveContainer width="100%" height={220}>
    <RadarChart data={radarData}>
      <PolarGrid stroke="rgba(255,255,255,0.06)" />
      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
      <Radar name="Confidence" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
    </RadarChart>
  </ResponsiveContainer>
);

export const SubjectConfidenceChart = ({ subjects }) => (
  <ResponsiveContainer width="100%" height={220}>
    <BarChart data={subjects} barSize={20}>
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
      <Tooltip content={<CustomTooltip />} />
      <Bar dataKey="avgConfidence" name="confidence" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);
