import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartTooltip } from './ChartTooltip';

export const RetentionLineChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={260}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
      <Tooltip content={<ChartTooltip />} />
      <Line type="monotone" dataKey="retention" name="Retention %" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} />
    </LineChart>
  </ResponsiveContainer>
);

export const StudyHoursBarChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={260}>
    <BarChart data={data}>
      <defs>
        <linearGradient id="barColor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
      <Tooltip content={<ChartTooltip />} />
      <Bar dataKey="hours" name="Hours" fill="url(#barColor)" radius={[6, 6, 0, 0]} barSize={24} />
    </BarChart>
  </ResponsiveContainer>
);

export const GrowthAreaChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={260}>
    <AreaChart data={data}>
      <defs>
        <linearGradient id="growthColor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
      <Tooltip content={<ChartTooltip />} />
      <Area type="monotone" dataKey="score" name="Readiness Score %" stroke="#6366f1" strokeWidth={3} fill="url(#growthColor)" dot={{ fill: '#6366f1', r: 4 }} />
    </AreaChart>
  </ResponsiveContainer>
);
