import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Calculator,
  MessageSquareText,
  Settings as SettingsIcon,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const NAV_ITEMS = [
  { to: '/',            icon: LayoutDashboard,    label: 'Dashboard' },
  { to: '/investments', icon: TrendingUp,          label: 'Investments' },
  { to: '/loans',       icon: Calculator,          label: 'Loan Calc' },
  { to: '/chat',        icon: MessageSquareText,   label: 'AI Chat' },
  { to: '/settings',    icon: SettingsIcon,        label: 'Settings' },
];

export default function Sidebar() {
  const { toggleTheme, isDark } = useTheme();

  return (
    <aside
      className="sidebar-desktop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 240,
        height: '100vh',
        background: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 1rem',
        zIndex: 50,
        overflowY: 'auto',
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: '2.5rem', padding: '0 0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, var(--accent-ui), var(--accent-ui-light))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)',
            }}
          >
            <Sparkles size={18} color="#0C0A0F" strokeWidth={2.5} />
          </div>
          <div>
            <div
              style={{
                fontSize: '1.15rem',
                fontWeight: 600,
                color: 'var(--accent-ui)',
                lineHeight: 1,
                letterSpacing: '-0.02em',
              }}
            >
              FinPilot
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              AI Finance
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 0.5rem', marginBottom: '0.5rem' }}>
          Navigation
        </div>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <Icon size={18} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Theme Toggle */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
        <button
          onClick={toggleTheme}
          className="btn-ghost"
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem', justifyContent: 'flex-start' }}
          aria-label="Toggle theme"
          id="theme-toggle-sidebar"
        >
          {isDark
            ? <><Sun size={16} /> Light Mode</>
            : <><Moon size={16} /> Dark Mode</>
          }
        </button>
      </div>

      {/* Profile stub */}
      <div
        style={{
          marginTop: '1rem',
          padding: '0.75rem',
          borderRadius: 12,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-amethyst), var(--accent-rose))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#fff',
            flexShrink: 0,
          }}
        >
          AS
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>Arjun Sharma</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Bengaluru · ₹18L/yr</div>
        </div>
      </div>
    </aside>
  );
}
