import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { useFinancialDataStatus } from '../../data/DataContext';

const PAGE_TITLES: Record<string, string> = {
  '/':            'Dashboard',
  '/investments': 'Investment Analysis',
  '/loans':       'Loan Calculator',
  '/chat':        'AI Chat',
};

function CenteredState({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        flex: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      {children}
    </div>
  );
}

export default function AppLayout() {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] ?? 'FinPilot';
  const { profile, isLoading, error, refreshProfile } = useFinancialDataStatus();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main
        className="main-with-sidebar"
        style={{
          flex: 1,
          marginLeft: 240,
          minHeight: '100vh',
          background: 'var(--bg-base)',
          overflowX: 'hidden',
        }}
      >
        {/* Mobile TopBar */}
        <header
          style={{
            display: 'none',
            position: 'sticky',
            top: 0,
            zIndex: 40,
            padding: '1rem 1.25rem',
            background: 'rgba(255,255,255,0.80)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid var(--border-subtle)',
            alignItems: 'center',
          }}
          className="mobile-topbar"
        >
          <span
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--accent-ui)',
              letterSpacing: '-0.02em',
            }}
          >
            FinPilot
          </span>
          <span
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              marginLeft: 'auto',
            }}
          >
            {title}
          </span>
        </header>

        <div style={{ padding: '2rem 2rem 2rem', maxWidth: 1280, margin: '0 auto' }}>
          {error ? (
            <CenteredState>
              <AlertTriangle size={28} style={{ color: 'var(--danger)' }} />
              <p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Couldn't load your financial data</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: 360 }}>{error}</p>
              <button onClick={refreshProfile} className="btn-gold" style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RefreshCw size={14} /> Retry
              </button>
            </CenteredState>
          ) : isLoading || !profile ? (
            <CenteredState>
              <RefreshCw size={24} className="animate-spin" style={{ color: 'var(--accent-ui)' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading your financial profile…</p>
            </CenteredState>
          ) : (
            <Outlet />
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
