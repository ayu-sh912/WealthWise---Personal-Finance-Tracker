import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ArrowLeftRight, TrendingUp, TrendingDown,
  Tag, Target, BarChart2, LogOut, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/transactions', icon: ArrowLeftRight,  label: 'Transactions' },
  { to: '/income',       icon: TrendingUp,      label: 'Income'       },
  { to: '/expenses',     icon: TrendingDown,    label: 'Expenses'     },
  { to: '/categories',   icon: Tag,             label: 'Categories'   },
  { to: '/goals',        icon: Target,          label: 'Goals'        },
  { to: '/reports',      icon: BarChart2,       label: 'Reports'      },
];

export default function Sidebar({ isOpen, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={onClose} />
      )}

      <aside
        style={{ backgroundColor: 'var(--bg-sidebar)', borderRight: '1px solid rgba(255,255,255,0.08)' }}
        className={`
          fixed top-0 left-0 z-30 h-screen w-60 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 pt-6 pb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
              <img src="/logo.png" alt="WealthWise Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">WealthWise</p>
              <p className="text-xs leading-tight" style={{ color: '#6aada4' }}>Personal Finance Tracker</p>
            </div>
          </div>
          <button onClick={onClose}
            className="lg:hidden p-1 rounded-lg hover:bg-white/10 text-white/60 transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to} to={to} onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                  isActive ? 'nav-active' : ''
                }`
              }
              style={({ isActive }) => isActive ? {} : { color: '#6aada4' }}
              onMouseEnter={e => { if (!e.currentTarget.classList.contains('nav-active')) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={e => { if (!e.currentTarget.classList.contains('nav-active')) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} style={{ color: isActive ? '#fff' : '#6aada4' }} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Promo card */}
        <div className="mx-3 mb-4 rounded-2xl p-4 overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg,#0d3d30,#0a2a22)', border: '1px solid #1a4d3c' }}>
          <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30 pointer-events-none"
            style={{ background: 'linear-gradient(to top, #10b981, transparent)' }} />
          <div className="relative z-10">
            <div className="text-2xl mb-2">📈</div>
            <p className="text-white font-bold text-sm leading-tight">Track Smarter</p>
            <p className="font-bold text-sm leading-tight mb-3" style={{ color: '#10b981' }}>Grow Faster</p>
            <button onClick={() => { navigate('/goals'); onClose?.(); }}
              className="w-full py-2 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
              Set a Goal →
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="px-3 pb-5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 mt-3 rounded-xl text-sm transition-all duration-150"
            style={{ color: '#6aada4' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#f87171'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#6aada4'; }}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
