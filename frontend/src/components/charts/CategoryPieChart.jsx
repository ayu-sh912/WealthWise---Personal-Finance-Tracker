import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

const RADIAN = Math.PI / 180;
const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value, color } = payload[0].payload;
  return (
    <div style={{ backgroundColor: '#0f1a16', border: '1px solid #1a2e28', borderRadius: 12, padding: '10px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color, display: 'inline-block' }} />
        <span style={{ color: '#fff', fontSize: 11, fontWeight: 600 }}>{name}</span>
      </div>
      <div style={{ color: '#4a7a73', fontSize: 11 }}>{formatCurrency(value)}</div>
    </div>
  );
};

export default function CategoryPieChart({ data }) {
  if (!data?.length) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 192, color: '#4a7a73', fontSize: 14 }}>
      No data available
    </div>
  );
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
          dataKey="value" labelLine={false} label={CustomLabel}>
          {data.map((entry, i) => (
            <Cell key={`cell-${i}`} fill={entry.color} stroke="none" />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
