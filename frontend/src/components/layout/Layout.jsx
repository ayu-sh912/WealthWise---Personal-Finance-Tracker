import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  '/dashboard':    'Dashboard',
  '/transactions': 'Transactions',
  '/income':       'Income',
  '/expenses':     'Expenses',
  '/categories':   'Categories',
  '/goals':        'Goals',
  '/reports':      'Reports',
  '/profile':      'Profile',
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'WealthWise';

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-main)' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto p-5" style={{ backgroundColor: 'var(--bg-main)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
