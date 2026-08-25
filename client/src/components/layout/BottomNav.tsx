import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Calculator, MessageSquareText, Settings as SettingsIcon, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const NAV_ITEMS = [
  { to: '/',            icon: LayoutDashboard,  label: 'Dashboard' },
  { to: '/investments', icon: TrendingUp,        label: 'Invest' },
  { to: '/loans',       icon: Calculator,        label: 'Loans' },
  { to: '/chat',        icon: MessageSquareText, label: 'AI Chat' },
  { to: '/settings',    icon: SettingsIcon,      label: 'Settings' },
];

export default function BottomNav() {
  const { toggleTheme, isDark } = useTheme();

  return (
    <nav
      className="bottom-nav-mobile"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 0.5rem',
        zIndex: 50,
        backdropFilter: 'blur(12px)',
      }}
    >
      {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
        >
          <Icon size={20} strokeWidth={1.8} />
          <span>{label}</span>
        </NavLink>
      ))}
      <button
        onClick={toggleTheme}
        className="bottom-nav-item"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        aria-label="Toggle theme"
        id="theme-toggle-bottom"
      >
        {isDark ? <Sun size={20} strokeWidth={1.8} /> : <Moon size={20} strokeWidth={1.8} />}
        <span>Theme</span>
      </button>
    </nav>
  );
}
