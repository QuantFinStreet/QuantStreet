import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  trend?: number;       // positive = up, negative = down
  trendLabel?: string;
  icon?: ReactNode;
  accent?: 'gold' | 'rose' | 'amethyst' | 'success' | 'danger';
  className?: string;
  animationDelay?: number;
}

const ACCENT_COLORS = {
  gold:      'var(--accent-gold)',
  rose:      'var(--accent-rose)',
  amethyst:  'var(--accent-amethyst-light)',
  success:   'var(--success)',
  danger:    'var(--danger)',
};

export default function MetricCard({
  label,
  value,
  subValue,
  trend,
  trendLabel,
  icon,
  accent = 'gold',
  className = '',
  animationDelay = 0,
}: MetricCardProps) {
  const accentColor = ACCENT_COLORS[accent];

  const TrendIcon = trend === undefined || trend === 0
    ? Minus
    : trend > 0 ? TrendingUp : TrendingDown;
  const trendColor = trend === undefined || trend === 0
    ? 'var(--text-muted)'
    : trend > 0 ? 'var(--success)' : 'var(--danger)';

  return (
    <div
      className={`card animate-fade-in ${className}`}
      style={{
        padding: '1.4rem 1.5rem',
        animationDelay: `${animationDelay}s`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
            {label}
          </p>
          <p
            className="numeric"
            style={{
              fontSize: '1.8rem',
              fontWeight: 600,
              color: accentColor,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            {value}
          </p>
          {subValue && (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              {subValue}
            </p>
          )}
        </div>
        {icon && (
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: `${accentColor}18`,
              border: `1px solid ${accentColor}30`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: accentColor,
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        )}
      </div>

      {trend !== undefined && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            marginTop: '0.9rem',
            paddingTop: '0.9rem',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <TrendIcon size={13} style={{ color: trendColor }} />
          <span style={{ fontSize: '0.75rem', color: trendColor, fontWeight: 600 }}>
            {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
          </span>
          {trendLabel && (
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{trendLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
