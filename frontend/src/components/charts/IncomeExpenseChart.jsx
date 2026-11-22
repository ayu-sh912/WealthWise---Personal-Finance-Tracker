import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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

export default function IncomeExpenseChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }} barSize={10} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a2e28" vertical={false} />
        <XAxis dataKey="monthName" tick={{ fontSize: 11, fill: '#4a7a73' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#4a7a73' }} axisLine={false} tickLine={false}
          tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}`} width={50} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#4a7a73' }} />
        <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
