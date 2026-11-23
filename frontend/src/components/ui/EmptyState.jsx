export default function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="p-4 rounded-2xl mb-4" style={{ backgroundColor: 'var(--bg-hover)' }}>
          <Icon size={32} style={{ color: 'var(--text-muted)' }} />
        </div>
      )}
      <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      {subtitle && <p className="text-sm mb-4 max-w-xs" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
      {action && action}
    </div>
  );
}
