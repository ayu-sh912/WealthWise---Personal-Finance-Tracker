export const CATEGORY_COLORS = {
  'Salary': '#10b981',
  'Business': '#6366f1',
  'Freelance': '#8b5cf6',
  'Investment': '#f59e0b',
  'Other Income': '#06b6d4',
  'Food': '#f97316',
  'Transport': '#3b82f6',
  'Shopping': '#ec4899',
  'Bills': '#ef4444',
  'Health': '#10b981',
  'Entertainment': '#8b5cf6',
  'Education': '#f59e0b',
  'Housing': '#6366f1',
  'Other': '#6b7280',
};

export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
};

export const GOAL_STATUSES = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  PAUSED: 'paused',
};

export const DATE_RANGES = [
  { label: 'This Month', value: 'this_month' },
  { label: 'Last Month', value: 'last_month' },
  { label: 'Last 3 Months', value: 'last_3_months' },
  { label: 'Last 6 Months', value: 'last_6_months' },
  { label: 'This Year', value: 'this_year' },
  { label: 'All Time', value: 'all_time' },
];

export const getDateRange = (range) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (range) {
    case 'this_month':
      return {
        dateFrom: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
        dateTo: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0],
      };
    case 'last_month': {
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return {
        dateFrom: lm.toISOString().split('T')[0],
        dateTo: new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0],
      };
    }
    case 'last_3_months': {
      const d = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      return { dateFrom: d.toISOString().split('T')[0], dateTo: today.toISOString().split('T')[0] };
    }
    case 'last_6_months': {
      const d = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      return { dateFrom: d.toISOString().split('T')[0], dateTo: today.toISOString().split('T')[0] };
    }
    case 'this_year':
      return {
        dateFrom: new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0],
        dateTo: today.toISOString().split('T')[0],
      };
    default:
      return {};
  }
};
