export const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      {label && (
        <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 4 }}>{label}</p>
      )}
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color, fontWeight: 600, fontSize: 13 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export const DemandTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p style={{ fontSize: 12, color: '#818cf8', fontWeight: 600 }}>{payload[0]?.value}% demand</p>
    </div>
  );
};
