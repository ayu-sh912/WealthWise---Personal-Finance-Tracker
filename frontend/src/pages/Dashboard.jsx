import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Wallet, Target, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from '../components/ui/StatCard';
import TransactionItem from '../components/ui/TransactionItem';
import IncomeExpenseChart from '../components/charts/IncomeExpenseChart';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { reportService } from '../services/reportService';
import { transactionService } from '../services/transactionService';
import { goalService } from '../services/goalService';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { getDateRange, DATE_RANGES } from '../utils/constants';
import { useAuth } from '../context/AuthContext';

// ── AI-style insights generator (local, no API) ───────────────────────────────
function getInsights(summary, categoryData) {
  const insights = [];
  if (!summary) return insights;
  if (summary.savingsRate >= 50)
    insights.push({ icon: '📈', color: 'text-emerald-600', text: `Your savings rate (${formatPercent(summary.savingsRate)}) is excellent!` });
  else if (summary.savingsRate > 20)
    insights.push({ icon: '👍', color: 'text-blue-600', text: `Savings rate is ${formatPercent(summary.savingsRate)}. Try to push it above 50%.` });
  else
    insights.push({ icon: '⚠️', color: 'text-amber-600', text: `Low savings rate (${formatPercent(summary.savingsRate)}). Review your expenses.` });
  if (categoryData?.length > 0) {
    const top = categoryData[0];
    insights.push({ icon: '🛒', color: 'text-orange-600', text: `${top.name} is your top expense (${top.percentage}% of total spending).` });
  }
  if (summary.balance > 0)
    insights.push({ icon: '💡', color: 'text-teal-600', text: `You can invest ₹${Math.floor(summary.balance * 0.3).toLocaleString('en-IN')} more into mutual funds this month.` });
  return insights;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading]         = useState(true);
  const [summary, setSummary]         = useState(null);
  const [monthly, setMonthly]         = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [recentTx, setRecentTx]       = useState([]);
  const [goals, setGoals]             = useState([]);
  const [dateRange, setDateRange]     = useState('this_month');

  const fetchData = async (range) => {
    setLoading(true);
    try {
      const dateParams = getDateRange(range);
      const [sumRes, monthRes, catRes, txRes, goalRes] = await Promise.all([
        reportService.getSummary(dateParams),
        reportService.getMonthly(),
        reportService.getCategoryBreakdown({ type: 'expense', ...dateParams }),
        transactionService.getAll({ limit: 5 }),
        goalService.getAll(),
      ]);
      setSummary(sumRes.data.data);
      setMonthly(monthRes.data.data);
      setCategoryData(catRes.data.data);
      setRecentTx(txRes.data.data.transactions);
      setGoals(goalRes.data.data.filter(g => g.status === 'active').slice(0, 3));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(dateRange); }, [dateRange]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" text="Loading dashboard..." />
    </div>
  );

  const insights = getInsights(summary, categoryData);
  const firstName = user?.name?.split(' ')[0] || 'User';

  return (
    <div className="space-y-5">

      {/* ── Welcome Banner ───────────────────────────────────────────────── */}
      <div
        className="rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #0d4f48 0%, #0a3d38 50%, #0d2d2a 100%)' }}
      >
        {/* Mountain SVG decoration */}
        <svg className="absolute right-0 bottom-0 h-full opacity-20 pointer-events-none" viewBox="0 0 400 120" fill="none">
          <path d="M0 120 L80 60 L140 90 L200 30 L260 70 L320 20 L380 55 L400 40 L400 120 Z" fill="#14b8a6" />
          <circle cx="310" cy="35" r="22" fill="#fbbf24" opacity="0.6" />
        </svg>

        <div className="relative z-10">
          <h2 className="text-xl font-bold text-white">
            Welcome back, <span style={{ color: '#5eead4' }}>{firstName}!</span> 👋
          </h2>
          <p className="text-sm mt-0.5" style={{ color: '#99d6d0' }}>
            Here's your financial summary for this month.
          </p>
        </div>

        <div className="relative z-10 flex flex-col items-start sm:items-end gap-1">
          <p className="text-xs font-medium" style={{ color: '#99d6d0' }}>Monthly Savings</p>
          <p className="text-2xl font-black text-white">{formatCurrency(summary?.balance || 0)}</p>
          {summary?.savingsRate > 0 && (
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: '#10b981' }}
            >
              ↑ {formatPercent(summary.savingsRate)} vs. last month
            </span>
          )}
          {/* Date range selector */}
          <select value={dateRange} onChange={e => setDateRange(e.target.value)}
            className="mt-1 text-xs rounded-lg px-2.5 py-1 border-0 font-medium cursor-pointer"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff' }}>
            {DATE_RANGES.map(r => <option key={r.value} value={r.value} style={{ backgroundColor: '#0d4f48' }}>{r.label}</option>)}
          </select>
        </div>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Income"
          value={formatCurrency(summary?.totalIncome)}
          icon={TrendingUp}
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          iconColor="text-emerald-600 dark:text-emerald-400"
          subtitle={`${summary?.incomeCount || 0} transactions`}
          badge={`↑ 12.4%`}
          badgeColor="bg-emerald-100 text-emerald-700"
          wave="#10b981"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(summary?.totalExpense)}
          icon={TrendingDown}
          iconBg="bg-red-100 dark:bg-red-900/30"
          iconColor="text-red-500 dark:text-red-400"
          subtitle={`${summary?.expenseCount || 0} transactions`}
          badge={`↑ 8.7%`}
          badgeColor="bg-red-100 text-red-600"
          wave="#ef4444"
        />
        <StatCard
          title="Net Balance"
          value={formatCurrency(summary?.balance)}
          icon={Wallet}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600 dark:text-blue-400"
          subtitle={`Savings rate: ${formatPercent(summary?.savingsRate)}`}
          badge={`↑ ${formatPercent(summary?.savingsRate)}`}
          badgeColor="bg-blue-100 text-blue-700"
          wave="#3b82f6"
        />
        <StatCard
          title="Active Goals"
          value={goals.length}
          icon={Target}
          iconBg="bg-amber-100 dark:bg-amber-900/30"
          iconColor="text-amber-600 dark:text-amber-400"
          subtitle="Savings goals in progress"
          wave="#f59e0b"
        />
      </div>

      {/* ── Charts Row ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Income vs Expense Chart */}
        <div className="xl:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-sm">Income vs Expense (Last 12 Months)</h3>
            <span className="text-xs px-2.5 py-1 rounded-lg font-medium" style={{ backgroundColor: '#0a1510', color: '#4a7a73' }}>
              This Year
            </span>
          </div>
          <IncomeExpenseChart data={monthly} />
        </div>

        {/* Category Donut */}
        <div className="card p-5">
          <h3 className="font-bold text-white text-sm mb-1">Spending by Category</h3>
          {categoryData.length > 0 ? (
            <>
              <CategoryPieChart data={categoryData} />
              {/* Legend list */}
              <div className="mt-2 space-y-1.5">
                {categoryData.slice(0, 5).map(item => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-xs truncate max-w-[100px]" style={{ color: '#4a7a73' }}>{item.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-white">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              No expense data for this period
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Row ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Recent Transactions */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-sm">Recent Transactions</h3>
            <Link to="/transactions" className="text-xs font-semibold flex items-center gap-1" style={{ color: '#0d9488' }}>
              View All <ArrowRight size={12} />
            </Link>
          </div>
          {recentTx.length > 0 ? (
            <div className="space-y-1">
              {recentTx.map(tx => <TransactionItem key={tx._id} transaction={tx} />)}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">No transactions yet</div>
          )}
        </div>

        {/* Financial Goals */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-sm">Financial Goals</h3>
            <Link to="/goals" className="text-xs font-semibold flex items-center gap-1" style={{ color: '#0d9488' }}>
              View All <ArrowRight size={12} />
            </Link>
          </div>
          {goals.length > 0 ? (
            <div className="space-y-4">
              {goals.map(goal => {
                const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                return (
                  <div key={goal._id}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-white truncate">{goal.name}</span>
                      <span className="text-xs font-bold ml-2" style={{ color: goal.color }}>{Math.round(pct)}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#1a2e28' }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: goal.color }} />
                    </div>
                    <div className="flex justify-between text-xs mt-1" style={{ color: '#4a7a73' }}>
                      <span>₹{goal.currentAmount.toLocaleString('en-IN')}</span>
                      <span>₹{goal.targetAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">No active goals</div>
          )}
        </div>

        {/* AI Insights */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-sm">💡 Insights</h3>
            <span className="text-xs px-2 py-0.5 rounded-md font-bold text-white"
              style={{ backgroundColor: '#10b981' }}>Beta</span>
          </div>
          <div className="space-y-3">
            {insights.map((ins, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
                style={{ backgroundColor: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.1)' }}>
                <span className="text-base flex-shrink-0">{ins.icon}</span>
                <p className="text-xs leading-relaxed" style={{ color: '#4a9e95' }}>{ins.text}</p>
              </div>
            ))}
            {insights.length === 0 && (
              <p className="text-xs text-center py-4" style={{ color: '#4a7a73' }}>Add transactions to get insights</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
