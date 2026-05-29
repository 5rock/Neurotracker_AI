import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { DemandTooltip } from './ChartTooltip';

const SkillDemandChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={260}>
    <BarChart data={data} layout="vertical" barSize={14}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
      <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} width={90} />
      <Tooltip content={<DemandTooltip />} />
      <Bar dataKey="demand" fill="url(#demandGrad)" radius={[0, 6, 6, 0]} />
      <defs>
        <linearGradient id="demandGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
    </BarChart>
  </ResponsiveContainer>
);

export default SkillDemandChart;
