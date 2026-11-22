import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function TransactionItem({ transaction, onEdit, onDelete }) {
  const isIncome = transaction.type === 'income';
  return (
    <div className="flex items-center gap-4 p-3.5 rounded-xl transition-colors group cursor-default"
      style={{ '--hover': '#0a1510' }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#0a1510'}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <div className="p-2.5 rounded-xl flex-shrink-0"
        style={{ backgroundColor: isIncome ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}>
        {isIncome
          ? <TrendingUp size={18} style={{ color: '#10b981' }} />
          : <TrendingDown size={18} style={{ color: '#ef4444' }} />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-white truncate">
            {transaction.description || transaction.category}
          </span>
          <span
            className="px-2 py-0.5 rounded-full text-xs font-medium text-white flex-shrink-0"
            style={{ backgroundColor: transaction.categoryColor || '#6366f1' }}
          >
            {transaction.category}
          </span>
        </div>
        <div className="text-xs mt-0.5" style={{ color: '#4a7a73' }}>
          {formatDate(transaction.date)}
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <div className="font-semibold text-sm" style={{ color: isIncome ? '#10b981' : '#ef4444' }}>
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
        </div>
      </div>

      {(onEdit || onDelete) && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button onClick={() => onEdit(transaction)}
              className="px-2 py-1 rounded-lg text-xs font-medium transition-colors"
              style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.2)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.1)'}
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(transaction._id)}
              className="px-2 py-1 rounded-lg text-xs font-medium transition-colors"
              style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.2)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'}
            >
              Del
            </button>
          )}
        </div>
      )}
    </div>
  );
}
