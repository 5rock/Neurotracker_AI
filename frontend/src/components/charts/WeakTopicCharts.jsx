import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const WeakTopicScatter = ({ scatter, getColor }) => (
  <ResponsiveContainer width="100%" height={300}>
    <ScatterChart>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
      <XAxis dataKey="x" name="Retention" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} label={{ value: 'Memory Retention %', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 11 }} />
      <YAxis dataKey="y" name="Confidence" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} label={{ value: 'Confidence %', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }} />
      <Tooltip content={({ payload }) => payload?.[0] ? (
        <div className="custom-tooltip">
          <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{payload[0].payload.topic}</p>
          <p style={{ fontSize: 12, color: '#818cf8' }}>Retention: {payload[0].payload.x}%</p>
          <p style={{ fontSize: 12, color: '#06b6d4' }}>Confidence: {payload[0].payload.y}%</p>
        </div>
      ) : null} />
      <Scatter data={scatter} fill="#6366f1">
        {scatter.map((entry, i) => (
          <Cell key={i} fill={getColor(entry.weakness)} opacity={0.8} />
        ))}
      </Scatter>
    </ScatterChart>
  </ResponsiveContainer>
);

export default WeakTopicScatter;
