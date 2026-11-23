import { useState, useRef, useEffect } from 'react';
import { Menu, Bell, Search, ChevronDown, User, Settings, LogOut, Target, Sun, Moon, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const INITIAL_NOTIFICATIONS = [
  { id: 1, type: 'goal',    icon: '🎯', title: 'Goal Completed!',        body: 'Goa Trip — New Year 2027 goal is 100% complete 🎉', time: '2h ago',  read: false },
  { id: 2, type: 'income',  icon: '💰', title: 'Salary Credited',        body: 'Monthly Salary ₹55,000 added to Income',           time: '1d ago',  read: false },
  { id: 3, type: 'expense', icon: '⚠️', title: 'High Spending Alert',    body: 'Bills category exceeded ₹25,000 this month',       time: '2d ago',  read: false },
  { id: 4, type: 'insight', icon: '💡', title: 'Savings Tip',            body: 'You can invest ₹15,000 more into mutual funds',    time: '3d ago',  read: true  },
  { id: 5, type: 'goal',    icon: '🏦', title: 'Goal Milestone Reached', body: 'Emergency Fund is 43% complete — keep going!',     time: '5d ago',  read: true  },
];

function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) => { if (!ref.current || ref.current.contains(e.target)) return; handler(); };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
}

export default function Navbar({ onMenuClick, title }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [userOpen,  setUserOpen]  = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const userRef  = useRef(null);
  const notifRef = useRef(null);

  useClickOutside(userRef,  () => setUserOpen(false));
  useClickOutside(notifRef, () => setNotifOpen(false));

  const unread   = notifications.filter(n => !n.read).length;
  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || 'U';

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead    = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const removeNotif = (id) => setNotifications(prev => prev.filter(n => n.id !== id));
  const handleLogout = () => { setUserOpen(false); logout(); navigate('/login'); };

  const hoverIn  = e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
  const hoverOut = e => e.currentTarget.style.backgroundColor = 'transparent';

  return (
    <header
      style={{ backgroundColor: 'var(--bg-navbar)', borderBottom: '1px solid var(--bg-navbar-border)' }}
      className="sticky top-0 z-40 px-5 py-3 flex items-center justify-between gap-4"
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
          <Menu size={19} />
        </button>
        <div>
          <h1 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h1>
          <p className="text-xs hidden sm:block" style={{ color: 'var(--text-muted)' }}>Your complete financial overview</p>
        </div>
      </div>

      {/* Center — search */}
      <div className="hidden md:flex flex-1 max-w-sm mx-6">
        <div className="relative w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search transactions, categories..."
            className="input-field pl-9"
            style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--bg-input-border)', color: 'var(--text-primary)' }} />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">

        {/* Theme Toggle */}
        <button onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-xl transition-all duration-200"
          style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-hover)' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? '#1e3d37' : '#d1fae5'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notification Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen(o => !o); setUserOpen(false); }}
            className="relative p-2 rounded-xl transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={hoverIn} onMouseLeave={hoverOut}
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 flex items-center justify-center rounded-full text-white text-[9px] font-bold"
                style={{ backgroundColor: '#10b981' }}>
                {unread}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl overflow-hidden z-[200]"
              style={{ backgroundColor: 'var(--bg-modal)', border: '1px solid var(--bg-card-border)', boxShadow: 'var(--shadow)' }}>
              <div className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: '1px solid var(--bg-card-border)' }}>
                <div className="flex items-center gap-2">
                  <Bell size={15} style={{ color: 'var(--text-secondary)' }} />
                  <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Notifications</span>
                  {unread > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: '#10b981' }}>{unread}</span>
                  )}
                </div>
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-xs font-semibold"
                    style={{ color: '#10b981' }}>Mark all read</button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    <Bell size={28} className="mx-auto mb-2 opacity-30" />
                    No notifications
                  </div>
                ) : notifications.map(notif => (
                  <div key={notif.id}
                    className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors"
                    style={{
                      borderBottom: '1px solid var(--bg-card-border)',
                      backgroundColor: !notif.read ? 'rgba(16,185,129,0.05)' : 'transparent'
                    }}
                    onClick={() => markRead(notif.id)}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = !notif.read ? 'rgba(16,185,129,0.05)' : 'transparent'}
                  >
                    <div className="text-xl flex-shrink-0 mt-0.5">{notif.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold truncate"
                          style={{ color: !notif.read ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: '#10b981' }} />
                        )}
                      </div>
                      <p className="text-xs mt-0.5 leading-relaxed line-clamp-2"
                        style={{ color: 'var(--text-muted)' }}>{notif.body}</p>
                      <p className="text-xs mt-1" style={{ color: '#10b981' }}>{notif.time}</p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); removeNotif(notif.id); }}
                      className="p-1 rounded-lg transition-colors flex-shrink-0"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>

              {notifications.length > 0 && (
                <div className="px-4 py-2.5 text-center"
                  style={{ borderTop: '1px solid var(--bg-card-border)' }}>
                  <button onClick={() => { setNotifOpen(false); navigate('/reports'); }}
                    className="text-xs font-semibold" style={{ color: '#10b981' }}>
                    View all activity →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Avatar + Dropdown */}
        <div ref={userRef} className="relative ml-1">
          <button
            onClick={() => { setUserOpen(o => !o); setNotifOpen(false); }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl transition-colors"
            onMouseEnter={hoverIn} onMouseLeave={hoverOut}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
              {initials}
            </div>
            <span className="hidden sm:block text-sm font-semibold max-w-[80px] truncate"
              style={{ color: 'var(--text-primary)' }}>
              {user?.name?.split(' ')[0]}
            </span>
            <ChevronDown size={14}
              className={`hidden sm:block transition-transform duration-200 ${userOpen ? 'rotate-180' : ''}`}
              style={{ color: 'var(--text-muted)' }} />
          </button>

          {/* User Dropdown */}
          {userOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl overflow-hidden z-[200]"
              style={{ backgroundColor: 'var(--bg-modal)', border: '1px solid var(--bg-card-border)', boxShadow: 'var(--shadow)' }}>

              {/* User info header */}
              <div className="px-4 py-4"
                style={{
                  borderBottom: '1px solid var(--bg-card-border)',
                  background: isDark
                    ? 'linear-gradient(135deg,#0a2318,#0d2d1f)'
                    : 'linear-gradient(135deg,#ecfdf5,#d1fae5)'
                }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
                    <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: '#10b981' }}>
                      ✓ Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="py-1.5">
                {[
                  { icon: User,     label: 'My Profile',    sub: 'Edit name & password', to: '/profile' },
                  { icon: Target,   label: 'Savings Goals', sub: 'Manage your goals',    to: '/goals'   },
                  { icon: Settings, label: 'Settings',      sub: 'Theme & preferences',  to: '/profile' },
                ].map(item => (
                  <Link key={item.to + item.label} to={item.to}
                    onClick={() => setUserOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 transition-colors"
                    onMouseEnter={hoverIn} onMouseLeave={hoverOut}
                  >
                    <div className="p-1.5 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)' }}>
                      <item.icon size={14} style={{ color: 'var(--text-secondary)' }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.sub}</p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Logout */}
              <div className="py-1.5" style={{ borderTop: '1px solid var(--bg-card-border)' }}>
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors"
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div className="p-1.5 rounded-lg" style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}>
                    <LogOut size={14} style={{ color: '#ef4444' }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Sign Out</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Log out of WealthWise</p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
