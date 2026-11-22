import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ backgroundColor: '#0f1a16', border: '1px solid #1a2e28', borderRadius: 12, padding: '10px 14px' }}>
      <p style={{ color: '#fff', fontSize: 11, fontWeight: 600, marginBottom: 6 }}>{label}</p>
      {payload.map((p) => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: p.color, display: 'inline-block' }} />
          <span style={{ color: '#4a7a73' }}>{p.name}:</span>
          <span style={{ color: p.color, fontWeight: 600 }}>{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function MonthlyTrendChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a2e28" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#4a7a73' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#4a7a73' }} axisLine={false} tickLine={false}
          tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}`} width={50} />
        <Tooltip content={<CustomTooltip />} />
        <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#4a7a73' }} />
        <Line type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2.5}
          dot={{ fill: '#10b981', r: 3 }} activeDot={{ r: 5 }} />
        <Line type="monotone" dataKey="expense" name="Expense" stroke="#f43f5e" strokeWidth={2.5}
          dot={{ fill: '#f43f5e', r: 3 }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
