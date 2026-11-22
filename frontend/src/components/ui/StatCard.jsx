export default function StatCard({ title, value, icon: Icon, iconBg, iconColor, subtitle, badge, badgeColor, wave }) {
  return (
    <div className="card p-5 relative overflow-hidden">
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: '#4a9e95' }}>{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-xs mt-0.5" style={{ color: '#4a7a73' }}>{subtitle}</p>}
        </div>
        <div className="p-2.5 rounded-xl flex-shrink-0" style={{ backgroundColor: 'rgba(16,185,129,0.1)' }}>
          <Icon size={20} className={iconColor} />
        </div>
      </div>

      {/* Badge */}
      {badge && (
        <div className="flex items-center gap-1.5 mt-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
            {badge}
          </span>
          <span className="text-xs" style={{ color: '#4a7a73' }}>vs. last month</span>
        </div>
      )}

      {/* Decorative mini wave */}
      {wave && (
        <svg className="absolute bottom-0 right-0 w-24 h-10 opacity-20" viewBox="0 0 96 40" fill="none">
          <path d="M0 30 Q12 10 24 25 Q36 40 48 20 Q60 0 72 18 Q84 36 96 15 L96 40 L0 40 Z" fill={wave} />
        </svg>
      )}
    </div>
  );
}
