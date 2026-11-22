import { useState, useRef, useEffect } from 'react';
import { Menu, Bell, Search, ChevronDown, User, Settings, LogOut, Target, Sun, Check, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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
  const navigate = useNavigate();

  const [userOpen,  setUserOpen]  = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const userRef  = useRef(null);
  const notifRef = useRef(null);

  useClickOutside(userRef,  () => setUserOpen(false));
  useClickOutside(notifRef, () => setNotifOpen(false));

  const unread = notifications.filter(n => !n.read).length;
  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead    = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const removeNotif = (id) => setNotifications(prev => prev.filter(n => n.id !== id));
  const handleLogout = () => { setUserOpen(false); logout(); navigate('/login'); };

  return (
    <header
      style={{ backgroundColor: '#0a1510', borderBottom: '1px solid #1a2e28' }}
      className="sticky top-0 z-40 px-5 py-3 flex items-center justify-between gap-4"
    >
      {/* Left — title */}
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-gray-400 transition-colors"
          style={{ '--hover-bg': '#1a2e28' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1a2e28'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Menu size={19} />
        </button>
        <div>
          <h1 className="text-base font-bold text-white">{title}</h1>
          <p className="text-xs hidden sm:block" style={{ color: '#4a9e95' }}>Your complete financial overview</p>
        </div>
      </div>

      {/* Center — search */}
      <div className="hidden md:flex flex-1 max-w-sm mx-6">
        <div className="relative w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#4a7a73' }} />
          <input
            type="text"
            placeholder="Search transactions, categories..."
            style={{ backgroundColor: '#060d0b', border: '1px solid #1a2e28', color: '#e2ede9' }}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">

        {/* Theme icon (decorative — always dark) */}
        <button
          className="p-2 rounded-xl transition-colors"
          style={{ color: '#4a9e95' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1a2e28'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Sun size={18} />
        </button>

        {/* ── Notification Bell ── */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen(o => !o); setUserOpen(false); }}
            className="relative p-2 rounded-xl transition-colors"
            style={{ color: '#4a9e95' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1a2e28'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
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
            <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl shadow-2xl overflow-hidden z-[100]"
              style={{ backgroundColor: '#0f1a16', border: '1px solid #1a2e28' }}>
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #1a2e28' }}>
                <div className="flex items-center gap-2">
                  <Bell size={15} style={{ color: '#4a9e95' }} />
                  <span className="font-bold text-sm text-white">Notifications</span>
                  {unread > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#10b981' }}>
                      {unread}
                    </span>
                  )}
                </div>
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-xs font-semibold" style={{ color: '#10b981' }}>
                    Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-10 text-center text-sm" style={{ color: '#4a7a73' }}>
                    <Bell size={28} className="mx-auto mb-2 opacity-30" />
                    No notifications
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div
                      key={notif.id}
                      className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors"
                      style={{
                        borderBottom: '1px solid #1a2e28',
                        backgroundColor: !notif.read ? 'rgba(16,185,129,0.05)' : 'transparent'
                      }}
                      onClick={() => markRead(notif.id)}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#0a1510'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = !notif.read ? 'rgba(16,185,129,0.05)' : 'transparent'}
                    >
                      <div className="text-xl flex-shrink-0 mt-0.5">{notif.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className={`text-xs font-bold truncate ${!notif.read ? 'text-white' : 'text-gray-500'}`}>
                            {notif.title}
                          </p>
                          {!notif.read && (
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#10b981' }} />
                          )}
                        </div>
                        <p className="text-xs mt-0.5 leading-relaxed line-clamp-2" style={{ color: '#4a7a73' }}>
                          {notif.body}
                        </p>
                        <p className="text-xs mt-1" style={{ color: '#10b981' }}>{notif.time}</p>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); removeNotif(notif.id); }}
                        className="p-1 rounded-lg transition-colors flex-shrink-0"
                        style={{ color: '#4a7a73' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1a2e28'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#4a7a73'; }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-4 py-2.5 text-center" style={{ borderTop: '1px solid #1a2e28' }}>
                  <button onClick={() => { setNotifOpen(false); navigate('/reports'); }}
                    className="text-xs font-semibold" style={{ color: '#10b981' }}>
                    View all activity →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── User Avatar + Dropdown ── */}
        <div ref={userRef} className="relative ml-1">
          <button
            onClick={() => { setUserOpen(o => !o); setNotifOpen(false); }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl transition-colors"
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1a2e28'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}
            >
              {initials}
            </div>
            <span className="hidden sm:block text-sm font-semibold text-white max-w-[80px] truncate">
              {user?.name?.split(' ')[0]}
            </span>
            <ChevronDown size={14} className={`text-gray-500 transition-transform duration-200 hidden sm:block ${userOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* User Dropdown */}
          {userOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl shadow-2xl overflow-hidden z-[100]"
              style={{ backgroundColor: '#0f1a16', border: '1px solid #1a2e28' }}>
              {/* User info */}
              <div className="px-4 py-4" style={{ borderBottom: '1px solid #1a2e28', background: 'linear-gradient(135deg,#0a2318,#0d2d1f)' }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-white truncate">{user?.name}</p>
                    <p className="text-xs truncate" style={{ color: '#4a9e95' }}>{user?.email}</p>
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
                    className="flex items-center gap-3 px-4 py-2.5 transition-colors group"
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1a2e28'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div className="p-1.5 rounded-lg transition-colors" style={{ backgroundColor: '#1a2e28' }}>
                      <item.icon size={14} style={{ color: '#4a9e95' }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-xs" style={{ color: '#4a7a73' }}>{item.sub}</p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Logout */}
              <div className="py-1.5" style={{ borderTop: '1px solid #1a2e28' }}>
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors group"
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div className="p-1.5 rounded-lg" style={{ backgroundColor: '#1a2e28' }}>
                    <LogOut size={14} style={{ color: '#ef4444' }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Sign Out</p>
                    <p className="text-xs" style={{ color: '#4a7a73' }}>Log out of WealthWise</p>
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
