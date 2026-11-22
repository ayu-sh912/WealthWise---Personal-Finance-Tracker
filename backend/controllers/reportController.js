const Transaction = require('../models/Transaction');

// @desc    Get financial summary
// @route   GET /api/reports/summary
// @access  Private
const getSummary = async (req, res) => {
  const { dateFrom, dateTo } = req.query;
  const filter = { user: req.user._id };

  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) filter.date.$gte = new Date(dateFrom);
    if (dateTo) filter.date.$lte = new Date(new Date(dateTo).setHours(23, 59, 59, 999));
  }

  const result = await Transaction.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  let totalIncome = 0, totalExpense = 0, incomeCount = 0, expenseCount = 0;
  result.forEach((r) => {
    if (r._id === 'income') { totalIncome = r.total; incomeCount = r.count; }
    if (r._id === 'expense') { totalExpense = r.total; expenseCount = r.count; }
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

  const result = await Transaction.aggregate([
    { $match: { user: req.user._id, date: { $gte: twelveMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          type: '$type',
        },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

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

  result.forEach(({ _id, total }) => {
    const m = months.find((mo) => mo.year === _id.year && mo.month === _id.month);
    if (m) {
      if (_id.type === 'income') m.income = total;
      if (_id.type === 'expense') m.expense = total;
    }
  });

  res.json({ success: true, data: months });
};

// @desc    Get category-wise breakdown
// @route   GET /api/reports/category
// @access  Private
const getCategoryBreakdown = async (req, res) => {
  const { type = 'expense', dateFrom, dateTo } = req.query;
  const filter = { user: req.user._id, type };

  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) filter.date.$gte = new Date(dateFrom);
    if (dateTo) filter.date.$lte = new Date(new Date(dateTo).setHours(23, 59, 59, 999));
  }

  const result = await Transaction.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
        color: { $first: '$categoryColor' },
      },
    },
    { $sort: { total: -1 } },
  ]);

  const grandTotal = result.reduce((sum, r) => sum + r.total, 0);
  const data = result.map((r) => ({
    name: r._id,
    value: r.total,
    count: r.count,
    color: r.color || '#6366f1',
    percentage: grandTotal > 0 ? ((r.total / grandTotal) * 100).toFixed(1) : 0,
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

  const result = await Transaction.aggregate([
    { $match: { user: req.user._id, date: { $gte: eightWeeksAgo } } },
    {
      $group: {
        _id: {
          week: { $week: '$date' },
          year: { $year: '$date' },
          type: '$type',
        },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.week': 1 } },
  ]);

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

  result.forEach(({ _id, total }) => {
    const w = weeks.find((wk) => wk.week === _id.week && wk.year === _id.year);
    if (w) {
      if (_id.type === 'income') w.income = total;
      if (_id.type === 'expense') w.expense = total;
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
