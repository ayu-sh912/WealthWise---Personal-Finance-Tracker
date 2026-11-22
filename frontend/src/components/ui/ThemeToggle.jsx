import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle({ size = 'md' }) {
  const { isDark, toggleTheme } = useTheme();
  const dim = size === 'sm' ? 'w-8 h-8 p-1.5' : 'w-10 h-10 p-2';
  const icon = size === 'sm' ? 15 : 18;

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`${dim} rounded-xl flex items-center justify-center transition-all duration-200`}
      style={{
        backgroundColor: isDark ? '#1a3530' : '#f1f5f4',
        color: isDark ? '#5eead4' : '#0f766e',
      }}
      onMouseEnter={e => { e.currentTarget.style.backgroundColor = isDark ? '#1e3d37' : '#d1fae5'; }}
      onMouseLeave={e => { e.currentTarget.style.backgroundColor = isDark ? '#1a3530' : '#f1f5f4'; }}
    >
      {isDark ? <Sun size={icon} /> : <Moon size={icon} />}
    </button>
  );
}
