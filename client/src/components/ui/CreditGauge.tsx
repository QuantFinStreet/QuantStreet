import React from 'react';

interface CreditGaugeProps {
  score: number;       // 300–900
  size?: number;
  showLabel?: boolean;
}

function scoreToAngle(score: number): number {
  // Map 300–900 → -135deg to +135deg (270deg arc)
  const clamped = Math.max(300, Math.min(900, score));
  return ((clamped - 300) / 600) * 270 - 135;
}

function scoreToColor(score: number): string {
  if (score >= 800) return '#10B981';
  if (score >= 750) return '#34D399';
  if (score >= 700) return '#D4A853';
  if (score >= 650) return '#F59E0B';
  return '#EF4444';
}

function getLabel(score: number): string {
  if (score >= 800) return 'Excellent';
  if (score >= 750) return 'Very Good';
  if (score >= 700) return 'Good';
  if (score >= 650) return 'Fair';
  return 'Poor';
}

export default function CreditGauge({ score, size = 180, showLabel = true }: CreditGaugeProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const strokeWidth = size * 0.085;

  // Arc math — 270° arc from 135° to 405° (clockwise)
  const arcStart = 135; // degrees
  const arcEnd   = 405;
  const arcRange  = arcEnd - arcStart;

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const arcPath = (startDeg: number, endDeg: number) => {
    const s = toRad(startDeg);
    const e = toRad(endDeg);
    const x1 = cx + r * Math.cos(s);
    const y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e);
    const y2 = cy + r * Math.sin(e);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const fillPercent = (score - 300) / 600;
  const fillDeg = arcStart + fillPercent * arcRange;

  const color = scoreToColor(score);
  const needleAngle = scoreToAngle(score);
  const needleLen = r * 0.75;
  const needleRad = toRad(arcStart + fillPercent * arcRange);
  const nx = cx + needleLen * Math.cos(needleRad);
  const ny = cy + needleLen * Math.sin(needleRad);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <svg width={size} height={size * 0.72} viewBox={`0 0 ${size} ${size * 0.72}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="40%" stopColor="#F59E0B" />
            <stop offset="70%" stopColor="#D4A853" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>

        {/* Track */}
        <path
          d={arcPath(arcStart, arcEnd)}
          fill="none"
          stroke="var(--border-medium)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Fill */}
        <path
          d={arcPath(arcStart, fillDeg)}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
        />

        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={nx}
          y2={ny}
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={5} fill={color} />
        <circle cx={cx} cy={cy} r={2.5} fill="var(--bg-surface)" />

        {/* Score text */}
        <text
          x={cx}
          y={cy + 28}
          textAnchor="middle"
          fontFamily="Inter, system-ui, -apple-system, sans-serif"
          fontSize={size * 0.14}
          fontWeight="600"
          fill={color}
          style={{ fontVariantNumeric: 'tabular-nums', fontFeatureSettings: "'tnum'" }}
        >
          {score}
        </text>
        {showLabel && (
          <text
            x={cx}
            y={cy + 42}
            textAnchor="middle"
            fontFamily="Inter, system-ui, -apple-system, sans-serif"
            fontSize={size * 0.065}
            fontWeight="500"
            fill="var(--text-muted)"
          >
            {getLabel(score)}
          </text>
        )}

        {/* Range labels */}
        <text x={cx - r - strokeWidth / 2 - 4} y={cy + 14} textAnchor="end" fontSize="9" fill="var(--text-faint)">300</text>
        <text x={cx + r + strokeWidth / 2 + 4} y={cy + 14} textAnchor="start" fontSize="9" fill="var(--text-faint)">900</text>
      </svg>
    </div>
  );
}
