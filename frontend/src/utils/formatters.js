// Currency formatter (Indian Rupee)
export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

// Date formatter
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  const defaultOptions = { day: '2-digit', month: 'short', year: 'numeric', ...options };
  return new Date(date).toLocaleDateString('en-IN', defaultOptions);
};

// Short date
export const formatDateShort = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

// Percentage formatter
export const formatPercent = (value, decimals = 1) => {
  return `${parseFloat(value || 0).toFixed(decimals)}%`;
};

// Number formatter (compact)
export const formatNumber = (num) => {
  if (num >= 1_00_00_000) return `${(num / 1_00_00_000).toFixed(1)}Cr`;
  if (num >= 1_00_000) return `${(num / 1_00_000).toFixed(1)}L`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num?.toString() || '0';
};

// Relative time
export const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

// Get month name
export const getMonthName = (month) => {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return months[month - 1] || '';
};
