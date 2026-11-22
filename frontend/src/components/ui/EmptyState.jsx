export default function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="p-4 rounded-2xl mb-4" style={{ backgroundColor: '#0a1510' }}>
          <Icon size={32} style={{ color: '#4a7a73' }} />
        </div>
      )}
      <h3 className="font-semibold text-white mb-1">{title}</h3>
      {subtitle && <p className="text-sm mb-4 max-w-xs" style={{ color: '#4a7a73' }}>{subtitle}</p>}
      {action && action}
    </div>
  );
}
