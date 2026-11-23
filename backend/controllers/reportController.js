const pool = require('../config/db');

// @desc    Get financial summary
// @route   GET /api/reports/summary
// @access  Private
const getSummary = async (req, res) => {
  const { dateFrom, dateTo } = req.query;
  const params = [req.user._id];
  const conditions = ['user_id = $1'];

  if (dateFrom) {
    params.push(new Date(dateFrom));
    conditions.push(`date >= $${params.length}`);
  }
  if (dateTo) {
    params.push(new Date(new Date(dateTo).setHours(23, 59, 59, 999)));
    conditions.push(`date <= $${params.length}`);
  }

  const query = `
    SELECT type, SUM(amount)::numeric AS total, COUNT(*)::int AS count
    FROM transactions
    WHERE ${conditions.join(' AND ')}
    GROUP BY type
  `;

  const result = await pool.query(query, params);

  let totalIncome = 0, totalExpense = 0, incomeCount = 0, expenseCount = 0;
  result.rows.forEach((r) => {
    if (r.type === 'income') {
      totalIncome = parseFloat(r.total) || 0;
      incomeCount = parseInt(r.count) || 0;
    }
    if (r.type === 'expense') {
      totalExpense = parseFloat(r.total) || 0;
      expenseCount = parseInt(r.count) || 0;
    }
  });

  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0;

  res.json({
    success: true,
    data: {
      totalIncome,
      totalExpense,
      balance,
      savingsRate: parseFloat(savingsRate),
      incomeCount,
      expenseCount,
      totalTransactions: incomeCount + expenseCount,
    },
  });
};

// @desc    Get monthly breakdown (last 12 months)
// @route   GET /api/reports/monthly
// @access  Private
const getMonthly = async (req, res) => {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const query = `
    SELECT 
      EXTRACT(YEAR FROM date)::int AS year,
      EXTRACT(MONTH FROM date)::int AS month,
      type,
      SUM(amount)::numeric AS total
    FROM transactions
    WHERE user_id = $1 AND date >= $2
    GROUP BY 1, 2, 3
    ORDER BY 1 ASC, 2 ASC
  `;

  const result = await pool.query(query, [req.user._id, twelveMonthsAgo]);

  // Build 12-month array
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      monthName: d.toLocaleString('en-IN', { month: 'short' }),
      label: `${d.toLocaleString('en-IN', { month: 'short' })} ${d.getFullYear()}`,
      income: 0,
      expense: 0,
    });
  }

  result.rows.forEach(({ year, month, type, total }) => {
    const m = months.find((mo) => mo.year === year && mo.month === month);
    if (m) {
      if (type === 'income') m.income = parseFloat(total) || 0;
      if (type === 'expense') m.expense = parseFloat(total) || 0;
    }
  });

  res.json({ success: true, data: months });
};

// @desc    Get category-wise breakdown
// @route   GET /api/reports/category
// @access  Private
const getCategoryBreakdown = async (req, res) => {
  const { type = 'expense', dateFrom, dateTo } = req.query;
  const params = [req.user._id, type];
  const conditions = ['user_id = $1', 'type = $2'];

  if (dateFrom) {
    params.push(new Date(dateFrom));
    conditions.push(`date >= $${params.length}`);
  }
  if (dateTo) {
    params.push(new Date(new Date(dateTo).setHours(23, 59, 59, 999)));
    conditions.push(`date <= $${params.length}`);
  }

  const query = `
    SELECT 
      category AS name,
      category_color AS color,
      SUM(amount)::numeric AS total,
      COUNT(*)::int AS count
    FROM transactions
    WHERE ${conditions.join(' AND ')}
    GROUP BY category, category_color
    ORDER BY total DESC
  `;

  const result = await pool.query(query, params);

  const grandTotal = result.rows.reduce((sum, r) => sum + (parseFloat(r.total) || 0), 0);
  const data = result.rows.map((r) => ({
    name: r.name,
    value: parseFloat(r.total) || 0,
    count: parseInt(r.count) || 0,
    color: r.color || '#6366f1',
    percentage: grandTotal > 0 ? (((parseFloat(r.total) || 0) / grandTotal) * 100).toFixed(1) : 0,
  }));

  res.json({ success: true, data, grandTotal });
};

// @desc    Get weekly trends (last 8 weeks)
// @route   GET /api/reports/trends
// @access  Private
const getTrends = async (req, res) => {
  const eightWeeksAgo = new Date();
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
  eightWeeksAgo.setHours(0, 0, 0, 0);

  const query = `
    SELECT type, amount, date
    FROM transactions
    WHERE user_id = $1 AND date >= $2
  `;

  const result = await pool.query(query, [req.user._id, eightWeeksAgo]);

  // Build 8-week array
  const weeks = [];
  for (let i = 7; i >= 0; i--) {
    const start = new Date();
    start.setDate(start.getDate() - i * 7);
    const weekNum = getWeekNumber(start);
    weeks.push({
      week: weekNum,
      year: start.getFullYear(),
      label: `W${weekNum}`,
      income: 0,
      expense: 0,
    });
  }

  result.rows.forEach(({ type, amount, date }) => {
    const d = new Date(date);
    const weekNum = getWeekNumber(d);
    const year = d.getFullYear();
    const w = weeks.find((wk) => wk.week === weekNum && wk.year === year);
    if (w) {
      const val = parseFloat(amount) || 0;
      if (type === 'income') w.income += val;
      if (type === 'expense') w.expense += val;
    }
  });

  res.json({ success: true, data: weeks });
};

function getWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
}

module.exports = { getSummary, getMonthly, getCategoryBreakdown, getTrends };
