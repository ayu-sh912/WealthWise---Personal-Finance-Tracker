import { Target, Calendar } from 'lucide-react';
import { formatCurrency, formatDate, formatPercent } from '../../utils/formatters';

export default function GoalCard({ goal, onContribute, onEdit, onDelete }) {
  const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  const remaining = goal.targetAmount - goal.currentAmount;

  const statusStyle = {
    active:    { backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981' },
    completed: { backgroundColor: 'rgba(16,185,129,0.2)', color: '#34d399' },
    paused:    { backgroundColor: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
  };

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${goal.color}20` }}>
            <Target size={20} style={{ color: goal.color }} />
          </div>
          <div>
            <h3 className="font-semibold text-white">{goal.name}</h3>
            {goal.deadline && (
              <div className="flex items-center gap-1 text-xs mt-0.5" style={{ color: '#4a7a73' }}>
                <Calendar size={11} />
                <span>{formatDate(goal.deadline)}</span>
              </div>
            )}
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full font-medium"
          style={statusStyle[goal.status] || statusStyle.active}>
          {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1.5">
          <span style={{ color: '#4a7a73' }}>{formatCurrency(goal.currentAmount)} saved</span>
          <span className="font-medium" style={{ color: goal.color }}>{formatPercent(progress, 0)}</span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: '#1a2e28' }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: goal.color }} />
        </div>
        <div className="flex justify-between text-xs mt-1.5" style={{ color: '#4a7a73' }}>
          <span>Target: {formatCurrency(goal.targetAmount)}</span>
          {remaining > 0 && <span>{formatCurrency(remaining)} to go</span>}
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        {goal.status !== 'completed' && onContribute && (
          <button onClick={() => onContribute(goal)} className="flex-1 btn-primary text-xs py-2">
            + Add Money
          </button>
        )}
        {onEdit && (
          <button onClick={() => onEdit(goal)} className="btn-secondary text-xs py-2 px-3">
            Edit
          </button>
        )}
        {onDelete && (
          <button onClick={() => onDelete(goal._id)}
            className="text-xs py-2 px-3 rounded-xl transition-colors"
            style={{ color: '#ef4444' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
