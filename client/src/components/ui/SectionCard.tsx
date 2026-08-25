import React from 'react';
import type { ReactNode, CSSProperties } from 'react';

interface SectionCardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  actions?: ReactNode;
  noPadding?: boolean;
  glow?: 'gold' | 'rose' | 'none';
}

export default function SectionCard({
  title,
  subtitle,
  children,
  className = '',
  style,
  actions,
  noPadding = false,
  glow = 'none',
}: SectionCardProps) {
  const glowClass = glow === 'gold' ? 'glow-gold' : glow === 'rose' ? 'glow-rose' : '';

  return (
    <div
      className={`card ${glowClass} animate-fade-in ${className}`}
      style={{ overflow: 'hidden', ...style }}
    >
      {(title || actions) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            padding: noPadding ? '1.25rem 1.5rem 1rem' : '1.25rem 1.5rem 0',
            gap: '1rem',
          }}
        >
          <div>
            {title && (
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  margin: 0,
                  letterSpacing: '-0.01em',
                }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div style={{ flexShrink: 0 }}>{actions}</div>}
        </div>
      )}
      <div style={noPadding ? {} : { padding: '1.25rem 1.5rem' }}>
        {children}
      </div>
    </div>
  );
}
