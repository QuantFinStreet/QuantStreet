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
} from 'recharts';
import { TrendingUp, TrendingDown, Award } from 'lucide-react';
import { useFinancialData } from '../data/DataContext';
import { calculateSIPReturns, calculatePortfolioAllocation, formatINR, formatPercent } from '../lib/financial';
import { niftyBenchmarkData, portfolioReturnData } from '../data/mockFinancialData';
import SectionCard from '../components/ui/SectionCard';

const MERGED_BENCHMARK = portfolioReturnData.map((p, i) => ({
  month: p.month,
  portfolio: p.portfolio,
  nifty: niftyBenchmarkData[i]?.nifty ?? 100,
}));

const CATEGORY_LABELS: Record<string, string> = {
  large_cap:  'Large Cap',
  mid_cap:    'Mid Cap',
  small_cap:  'Small Cap',
  flexi_cap:  'Flexi Cap',
  debt:       'Debt',
  index:      'Index',
};

export default function InvestmentAnalysis() {
  const { profile } = useFinancialData();
  const sipReturns = calculateSIPReturns(profile.sipHoldings);
  const allocation = calculatePortfolioAllocation(profile);

  const totalInvested = profile.sipHoldings.reduce((s, h) => s + h.totalInvested, 0);
  const totalCurrent  = profile.sipHoldings.reduce((s, h) => s + h.currentValue, 0);
  const totalGain     = totalCurrent - totalInvested;
  const totalGainPct  = (totalGain / totalInvested) * 100;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }} className="animate-fade-in">
        <h1 style={{ fontSize: '1.6rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.3rem', letterSpacing: '-0.02em' }}>
          Investment Analysis
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          SIP performance, portfolio composition & benchmark comparison
        </p>
      </div>

      {/* Summary Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Invested', value: formatINR(totalInvested, true), color: 'var(--text-primary)' },
          { label: 'Current Value', value: formatINR(totalCurrent, true), color: 'var(--accent-ui)' },
          { label: 'Absolute Gain', value: formatINR(totalGain, true), color: totalGain >= 0 ? 'var(--success)' : 'var(--danger)' },
          { label: 'Overall Return', value: formatPercent(totalGainPct), color: totalGainPct >= 0 ? 'var(--success)' : 'var(--danger)' },
        ].map((m, i) => (
          <div key={m.label} className="card animate-fade-in" style={{ padding: '1.25rem 1.5rem', animationDelay: `${i * 0.06}s` }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>
              {m.label}
            </p>
            <p className="numeric" style={{ fontSize: '1.5rem', fontWeight: 600, color: m.color, lineHeight: 1 }}>
              {m.value}
            </p>
          </div>
        ))}
      </div>

      {/* Benchmark Chart */}
      <SectionCard
        title="Portfolio vs Nifty 50 Benchmark"
        subtitle="Indexed performance (Jan 2024 = 100)"
        style={{ marginBottom: '1.5rem', animationDelay: '0.2s' }}
        actions={
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-ui)' }}>
              <span style={{ width: 12, height: 2, background: 'var(--accent-ui)', display: 'inline-block', borderRadius: 1 }} />
              Your Portfolio
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-amethyst-light)' }}>
              <span style={{ width: 12, height: 2, background: 'var(--accent-amethyst-light)', display: 'inline-block', borderRadius: 1 }} />
              Nifty 50
            </span>
          </div>
        }
      >
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={MERGED_BENCHMARK} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.30} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="niftyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
            <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[90, 145]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}`} />
            <Tooltip
              contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', borderRadius: 8, fontSize: 12 }}
              itemStyle={{ color: 'var(--text-primary)' }}
              labelStyle={{ color: 'var(--text-muted)' }}
              formatter={(val: unknown, name: unknown) => [`${(val as number).toFixed(1)}`, name === 'portfolio' ? 'Your Portfolio' : 'Nifty 50']}
            />
            <Area type="monotone" dataKey="portfolio" name="portfolio" stroke="#059669" strokeWidth={2.5} fill="url(#portGrad)" dot={false} />
            <Area type="monotone" dataKey="nifty" name="nifty" stroke="#7C3AED" strokeWidth={2} fill="url(#niftyGrad)" dot={false} strokeDasharray="5 3" />
          </AreaChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* SIP Table + Donut */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
        {/* SIP Holdings Table */}
        <SectionCard title="SIP Holdings" subtitle={`${profile.sipHoldings.length} active funds`} noPadding>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  {['Fund', 'Category', 'Monthly SIP', 'Invested', 'Current Value', 'Gain', 'XIRR'].map((h) => (
                    <th key={h} style={{ padding: '0.85rem 1.25rem', textAlign: 'left', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {profile.sipHoldings.map((h, i) => {
                  const ret = sipReturns.find((r) => r.id === h.id)!;
                  const isPos = ret.gain >= 0;
                  return (
                    <tr
                      key={h.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background 0.15s',
                        animationDelay: `${i * 0.05}s`,
                      }}
                      className="animate-fade-in"
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.15rem', maxWidth: 220 }}>{h.fundName}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{h.fundHouse}</div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span className="badge badge-amethyst" style={{ fontSize: '0.66rem' }}>{CATEGORY_LABELS[h.category]}</span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.82rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {formatINR(h.monthlyContribution, true)}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.82rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {formatINR(h.totalInvested, true)}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent-ui)', whiteSpace: 'nowrap' }}>
                        {formatINR(h.currentValue, true)}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: isPos ? 'var(--success)' : 'var(--danger)' }}>
                          {isPos ? <TrendingUp size={12} style={{ display: 'inline', marginRight: 3 }} /> : <TrendingDown size={12} style={{ display: 'inline', marginRight: 3 }} />}
                          {formatPercent(ret.gainPercent)}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          {h.xirr >= 15 && <Award size={12} style={{ color: 'var(--accent-gold)' }} />}
                          <span className="numeric" style={{ fontSize: '0.82rem', fontWeight: 600, color: h.xirr >= 15 ? 'var(--accent-gold)' : 'var(--text-primary)' }}>
                            {h.xirr.toFixed(1)}%
                          </span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Allocation Donut */}
        <SectionCard title="Category Mix" subtitle="By asset class">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={allocation}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percentage }: { name?: string; percentage?: number }) => percentage != null ? `${percentage.toFixed(0)}%` : ''}
                labelLine={false}
              >
                {allocation.map((a) => (
                  <Cell key={a.name} fill={a.color} stroke="var(--bg-surface)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: unknown) => [formatINR(val as number, true), '']}
                contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', borderRadius: 8, fontSize: 12 }}
                itemStyle={{ color: 'var(--text-primary)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.75rem' }}>
            {allocation.map((a) => (
              <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.color, flexShrink: 0 }} />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', flex: 1 }}>{a.name}</span>
                <span className="numeric" style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{a.percentage.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
