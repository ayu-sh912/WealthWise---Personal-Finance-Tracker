import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';

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

function CustomTooltip({ active, payload, isDark }) {
  if (!active || !payload?.length) return null;
  const { name, value, color } = payload[0].payload;
  return (
    <div style={{ backgroundColor: isDark ? '#0f1a16' : '#ffffff', border: `1px solid ${isDark ? '#1a2e28' : '#e8edf0'}`, borderRadius: 12, padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color, display: 'inline-block' }} />
        <span style={{ color: isDark ? '#fff' : '#0f1f1c', fontSize: 11, fontWeight: 600 }}>{name}</span>
      </div>
      <div style={{ color: isDark ? '#4a7a73' : '#94a3b0', fontSize: 11 }}>{formatCurrency(value)}</div>
    </div>
  );
}

export default function CategoryPieChart({ data }) {
  const { isDark } = useTheme();
  if (!data?.length) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 192, color: 'var(--text-muted)', fontSize: 14 }}>
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
        <Tooltip content={<CustomTooltip isDark={isDark} />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
