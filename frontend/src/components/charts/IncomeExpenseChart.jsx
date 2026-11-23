import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';

function CustomTooltip({ active, payload, label, isDark }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ backgroundColor: isDark ? '#0f1a16' : '#ffffff', border: `1px solid ${isDark ? '#1a2e28' : '#e8edf0'}`, borderRadius: 12, padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
      <p style={{ color: isDark ? '#fff' : '#0f1f1c', fontSize: 11, fontWeight: 600, marginBottom: 6 }}>{label}</p>
      {payload.map((p) => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: p.color, display: 'inline-block' }} />
          <span style={{ color: isDark ? '#4a7a73' : '#94a3b0' }}>{p.name}:</span>
          <span style={{ color: p.color, fontWeight: 600 }}>{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function IncomeExpenseChart({ data }) {
  const { isDark } = useTheme();
  const gridColor  = isDark ? '#1a2e28' : '#e8edf0';
  const tickColor  = isDark ? '#4a7a73' : '#94a3b0';

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }} barSize={10} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis dataKey="monthName" tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: tickColor }} axisLine={false} tickLine={false}
          tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}`} width={50} />
        <Tooltip content={<CustomTooltip isDark={isDark} />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
        <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px', color: tickColor }} />
        <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
