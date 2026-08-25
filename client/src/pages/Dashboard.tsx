import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Lightbulb,
  Activity,
} from 'lucide-react';
import { useFinancialData } from '../data/DataContext';
import {
  calculateNetWorth,
  calculateDebtToIncome,
  calculatePortfolioAllocation,
  formatINR,
  getDTIHealth,
} from '../lib/financial';
import SectionCard from '../components/ui/SectionCard';
import MetricCard from '../components/ui/MetricCard';
import CreditGauge from '../components/ui/CreditGauge';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-medium)',
      borderRadius: 10,
      padding: '0.7rem 1rem',
      boxShadow: 'var(--shadow-md)',
      fontSize: '0.8rem',
    }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} style={{ color: entry.color, margin: '0.15rem 0' }}>
          {entry.name}: {formatINR(entry.value, true)}
        </p>
      ))}
    </div>
  );
};

const CreditTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-medium)',
      borderRadius: 10,
      padding: '0.7rem 1rem',
      boxShadow: 'var(--shadow-md)',
      fontSize: '0.8rem',
    }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: '0.3rem' }}>{label}</p>
      <p className="numeric" style={{ color: 'var(--accent-ui)', fontWeight: 600 }}>{payload[0]?.value} CIBIL</p>
    </div>
  );
};

const LiquidPieDefs = ({ alloc }: { alloc: ReturnType<typeof calculatePortfolioAllocation> }) => (
  <defs>
    {alloc.map((a) => (
      <radialGradient key={a.name} id={`liquid-${a.name.replace(/\s+/g, '')}`} cx="35%" cy="30%" r="75%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity={0.85} />
        <stop offset="18%" stopColor={a.color} stopOpacity={0.95} />
        <stop offset="100%" stopColor={a.color} stopOpacity={1} />
      </radialGradient>
    ))}
    <filter id="liquidGlow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
);

const PieLegend = ({ alloc }: { alloc: ReturnType<typeof calculatePortfolioAllocation> }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
    {alloc.map((a) => (
      <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: a.color, flexShrink: 0 }} />
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', flex: 1 }}>{a.name}</span>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 600 }}>
          {a.percentage.toFixed(1)}%
        </span>
      </div>
    ))}
  </div>
);

export default function Dashboard() {
  const { profile } = useFinancialData();
  const { total, assets, liabilities } = calculateNetWorth(profile);
  const dti = calculateDebtToIncome(profile);
  const allocation = calculatePortfolioAllocation(profile);
  const dtiHealth = getDTIHealth(dti);
  const latestScore = profile.creditScoreHistory.at(-1)?.score ?? 0;
  const prevScore = profile.creditScoreHistory.at(-2)?.score ?? latestScore;
  const scoreDelta = latestScore - prevScore;

  const nwFirst = profile.netWorthHistory[0]?.netWorth ?? 0;
  const nwLast = profile.netWorthHistory.at(-1)?.netWorth ?? 0;
  const nwTrend = nwFirst !== 0 ? ((nwLast - nwFirst) / Math.abs(nwFirst)) * 100 : 0;

  const totalEMI = profile.liabilities.reduce((s, l) => s + l.monthlyEMI, 0);

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '1.75rem' }} className="animate-fade-in">
        <h1 style={{ fontSize: '1.6rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.3rem', letterSpacing: '-0.02em' }}>
          Good evening, Arjun
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Your financial overview for December 2024
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <MetricCard
          label="Net Worth"
          value={formatINR(total, true)}
          subValue={`Assets: ${formatINR(assets, true)}`}
          trend={nwTrend}
          trendLabel="vs 14 months ago"
          icon={<Wallet size={18} />}
          accent="gold"
          animationDelay={0.05}
        />
        <MetricCard
          label="Total Assets"
          value={formatINR(assets, true)}
          subValue={`${profile.assets.length} holdings`}
          trend={8.4}
          trendLabel="vs last month"
          icon={<TrendingUp size={18} />}
          accent="success"
          animationDelay={0.1}
        />
        <MetricCard
          label="Total Liabilities"
          value={formatINR(liabilities, true)}
          subValue={`EMI: ${formatINR(totalEMI, true)}/mo`}
          trend={-1.2}
          trendLabel="reducing"
          icon={<TrendingDown size={18} />}
          accent="rose"
          animationDelay={0.15}
        />
        <MetricCard
          label="CIBIL Score"
          value={latestScore.toString()}
          subValue="Very Good — trending up"
          trend={scoreDelta}
          trendLabel="vs last month"
          icon={<CreditCard size={18} />}
          accent="amethyst"
          animationDelay={0.2}
        />
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Net Worth Trend */}
        <SectionCard
          title="Net Worth Trend"
          subtitle="Assets vs Liabilities over 14 months"
          className="stagger-1"
          style={{ animationDelay: '0.2s' }}
        >
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={profile.netWorthHistory} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="assetsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="liabGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C2185B" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#C2185B" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => formatINR(v, true)} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="assets" name="Assets" stroke="#059669" strokeWidth={2} fill="url(#assetsGrad)" dot={false} />
              <Area type="monotone" dataKey="liabilities" name="Liabilities" stroke="#C2185B" strokeWidth={2} fill="url(#liabGrad)" dot={false} />
              <Area type="monotone" dataKey="netWorth" name="Net Worth" stroke="#10B981" strokeWidth={2.5} fill="url(#nwGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* Asset Allocation — Liquid Glass Donut */}
        <SectionCard title="Asset Allocation" subtitle="By category" style={{ animationDelay: '0.25s' }}>
          <div
            style={{
              position: 'relative',
              borderRadius: 20,
              overflow: 'hidden',
              background: 'linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01))',
              border: '1px solid var(--border-subtle)',
              padding: '0.5rem 0 0',
            }}
          >
            {/* floating liquid blobs */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: -30,
                left: -20,
                width: 140,
                height: 140,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${allocation[0]?.color ?? '#7C3AED'}55, transparent 70%)`,
                filter: 'blur(18px)',
                animation: 'liquidFloat 7s ease-in-out infinite',
                pointerEvents: 'none',
              }}
            />
            <div
              aria-hidden
              style={{
                position: 'absolute',
                bottom: -35,
                right: -25,
                width: 160,
                height: 160,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${allocation[1]?.color ?? '#10B981'}45, transparent 70%)`,
                filter: 'blur(22px)',
                animation: 'liquidFloat 9s ease-in-out infinite reverse',
                pointerEvents: 'none',
              }}
            />

            <div style={{ position: 'relative' }}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <LiquidPieDefs alloc={allocation} />
                  <Pie
                    data={allocation}
                    cx="50%"
                    cy="50%"
                    innerRadius={54}
                    outerRadius={84}
                    paddingAngle={4}
                    cornerRadius={10}
                    dataKey="value"
                    filter="url(#liquidGlow)"
                    isAnimationActive
                    animationDuration={900}
                    animationEasing="ease-out"
                  >
                    {allocation.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={`url(#liquid-${entry.name.replace(/\s+/g, '')})`}
                        stroke="rgba(255,255,255,0.5)"
                        strokeWidth={1.5}
                        style={{ filter: `drop-shadow(0 4px 10px ${entry.color}66)` }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: unknown) => [formatINR(val as number, true), '']}
                    contentStyle={{
                      background: 'rgba(255,255,255,0.85)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                    labelStyle={{ color: 'var(--text-muted)' }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* center glass readout */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -55%)',
                  textAlign: 'center',
                  pointerEvents: 'none',
                }}
              >
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.02em' }}>
                  Total
                </div>
                <div
                  className="numeric"
                  style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}
                >
                  {formatINR(assets, true)}
                </div>
              </div>
            </div>
          </div>
          <PieLegend alloc={allocation} />
        </SectionCard>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Credit Score History */}
        <SectionCard title="CIBIL Score History" subtitle="Monthly tracking — target: 800+" style={{ animationDelay: '0.3s' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2rem' }}>
            <div style={{ flex: 1 }}>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={profile.creditScoreHistory} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="creditGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[680, 800]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CreditTooltip />} />
                  <Area type="monotone" dataKey="score" name="CIBIL Score" stroke="#7C3AED" strokeWidth={2.5} fill="url(#creditGrad)" dot={{ fill: '#7C3AED', r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <CreditGauge score={latestScore} size={140} />
              <div className="badge badge-gold" style={{ marginTop: '0.25rem' }}>↑ {scoreDelta > 0 ? '+' : ''}{scoreDelta} this month</div>
            </div>
          </div>
        </SectionCard>

        {/* DTI Card */}
        <SectionCard title="Debt-to-Income Ratio" subtitle="Monthly EMI vs income" style={{ animationDelay: '0.35s' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div
              className="numeric"
              style={{
                fontSize: '2.75rem',
                fontWeight: 600,
                color: dtiHealth.color,
                lineHeight: 1,
                letterSpacing: '-0.02em',
                textShadow: `0 0 20px ${dtiHealth.color}40`,
              }}
            >
              {(dti * 100).toFixed(0)}%
            </div>
            <div className={`badge ${dtiHealth.badgeClass}`} style={{ marginTop: '0.5rem' }}>
              {dtiHealth.label}
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ height: 8, background: 'var(--border-medium)', borderRadius: 999, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(dti * 100 * 2, 100)}%`,
                  background: `linear-gradient(90deg, var(--success), ${dtiHealth.color})`,
                  borderRadius: 999,
                  transition: 'width 0.8s ease',
                  boxShadow: `0 0 8px ${dtiHealth.color}50`,
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>0%</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--warning)' }}>50% limit</span>
            </div>
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
            {dtiHealth.description}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {profile.liabilities.map((l) => (
              <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{l.name.split('—')[0].trim()}</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{formatINR(l.monthlyEMI, true)}/mo</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* AI Insight Card */}
      <SectionCard
        title="AI Insight"
        glow="gold"
        style={{ animationDelay: '0.4s' }}
        actions={
          <div className="badge badge-amethyst">
            <Activity size={10} />
            Live Analysis
          </div>
        }
      >
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'linear-gradient(135deg, var(--accent-gold-muted), var(--accent-amethyst))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Lightbulb size={18} color="#fff" />
          </div>
          <div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.7, marginBottom: '0.75rem' }}>
              Your <strong style={{ color: 'var(--accent-ui)' }}>car loan closes in 20 months</strong>. 
              Redirecting that ₹9,800/mo EMI into your SIP portfolio at your current 16.8% XIRR could grow to 
              <strong style={{ color: 'var(--success)' }}> ₹35.2L in 10 years</strong> — consider setting up a step-up SIP now to automate this.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span className="badge badge-success">✓ CIBIL Rising</span>
              <span className="badge badge-gold">₹ Net Worth Positive</span>
              <span className="badge badge-warning">⚑ 20mo to car loan freedom</span>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
