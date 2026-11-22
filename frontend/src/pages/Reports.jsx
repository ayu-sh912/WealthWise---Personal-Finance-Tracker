import { useState, useEffect } from 'react';
import { BarChart2 } from 'lucide-react';
import IncomeExpenseChart from '../components/charts/IncomeExpenseChart';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import MonthlyTrendChart from '../components/charts/MonthlyTrendChart';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { reportService } from '../services/reportService';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { getDateRange, DATE_RANGES } from '../utils/constants';

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [expCat, setExpCat] = useState([]);
  const [incCat, setIncCat] = useState([]);
  const [dateRange, setDateRange] = useState('this_month');

  const fetchAll = async (range) => {
    setLoading(true);
    try {
      const dateParams = getDateRange(range);
      const [sumRes, monthRes, expRes, incRes] = await Promise.all([
        reportService.getSummary(dateParams),
        reportService.getMonthly(),
        reportService.getCategoryBreakdown({ type: 'expense', ...dateParams }),
        reportService.getCategoryBreakdown({ type: 'income', ...dateParams }),
      ]);
      setSummary(sumRes.data.data);
      setMonthly(monthRes.data.data);
      setExpCat(expRes.data.data);
      setIncCat(incRes.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(dateRange); }, [dateRange]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" text="Generating reports..." />
    </div>
  );

  const summaryCards = summary ? [
    { label: 'Total Income',   value: formatCurrency(summary.totalIncome),  color: '#10b981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.15)' },
    { label: 'Total Expenses', value: formatCurrency(summary.totalExpense), color: '#ef4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.15)'  },
    { label: 'Net Balance',    value: formatCurrency(summary.balance),      color: '#3b82f6', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.15)' },
    { label: 'Savings Rate',   value: formatPercent(summary.savingsRate),   color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.15)' },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm" style={{ color: '#4a7a73' }}>Financial insights and trends</p>
        <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="input-field w-auto text-sm">
          {DATE_RANGES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {summaryCards.map((item) => (
            <div key={item.label} className="rounded-2xl p-4"
              style={{ backgroundColor: item.bg, border: `1px solid ${item.border}` }}>
              <p className="text-xs mb-1" style={{ color: '#4a7a73' }}>{item.label}</p>
              <p className="text-xl font-bold" style={{ color: item.color }}>{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Monthly Trend — Line Chart */}
      <div className="card p-5">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart2 size={18} style={{ color: '#10b981' }} /> Monthly Trend (Last 12 Months)
        </h3>
        <MonthlyTrendChart data={monthly} />
      </div>

      {/* Monthly Bar Chart */}
      <div className="card p-5">
        <h3 className="font-semibold text-white mb-4">Income vs Expense Comparison</h3>
        <IncomeExpenseChart data={monthly} />
      </div>

      {/* Category Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-4">Expense by Category</h3>
          <CategoryPieChart data={expCat} />
          {expCat.length > 0 && (
            <div className="mt-4 space-y-2">
              {expCat.slice(0, 5).map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="truncate" style={{ color: '#4a7a73' }}>{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs" style={{ color: '#4a7a73' }}>{item.percentage}%</span>
                    <span className="font-medium" style={{ color: '#ef4444' }}>{formatCurrency(item.value)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-white mb-4">Income by Source</h3>
          <CategoryPieChart data={incCat} />
          {incCat.length > 0 && (
            <div className="mt-4 space-y-2">
              {incCat.slice(0, 5).map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="truncate" style={{ color: '#4a7a73' }}>{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs" style={{ color: '#4a7a73' }}>{item.percentage}%</span>
                    <span className="font-medium" style={{ color: '#10b981' }}>{formatCurrency(item.value)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
