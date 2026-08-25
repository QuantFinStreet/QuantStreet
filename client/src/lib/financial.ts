import type { FinancialProfile, PortfolioAllocation, SIPHolding } from '@fintech/shared';

// Loan EMI/eligibility math now lives server-side (server/src/lib/financial.ts)
// as the authoritative source — see client/src/lib/api/loan.ts. Net worth,
// DTI, SIP returns, and portfolio allocation stay here too since Dashboard
// and Investment Analysis derive them client-side from the already-fetched
// profile rather than making a dedicated request per metric.

// ─── Formatting Helpers ───────────────────────────────────────────────────────
export const formatINR = (value: number, compact = false): string => {
  if (compact) {
    if (Math.abs(value) >= 10_000_000) return `₹${(value / 10_000_000).toFixed(2)}Cr`;
    if (Math.abs(value) >= 100_000)   return `₹${(value / 100_000).toFixed(2)}L`;
    if (Math.abs(value) >= 1_000)     return `₹${(value / 1_000).toFixed(1)}K`;
    return `₹${value.toFixed(0)}`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatPercent = (value: number, decimals = 1): string =>
  `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;

// ─── Net Worth ────────────────────────────────────────────────────────────────
export function calculateNetWorth(profile: FinancialProfile): {
  total: number;
  assets: number;
  liabilities: number;
} {
  const assets = profile.assets.reduce((s, a) => s + a.currentValue, 0);
  const liabilities = profile.liabilities.reduce((s, l) => s + l.outstandingAmount, 0);
  return { total: assets - liabilities, assets, liabilities };
}

// ─── Debt-to-Income Ratio ─────────────────────────────────────────────────────
export function calculateDebtToIncome(profile: FinancialProfile): number {
  const totalMonthlyEMI = profile.liabilities.reduce((s, l) => s + l.monthlyEMI, 0);
  return totalMonthlyEMI / profile.monthlyIncome;
}

// ─── SIP Returns ──────────────────────────────────────────────────────────────
export function calculateSIPReturns(holdings: SIPHolding[]): Array<{
  id: string;
  gain: number;
  gainPercent: number;
  absoluteReturn: number;
}> {
  return holdings.map((h) => {
    const gain = h.currentValue - h.totalInvested;
    const gainPercent = (gain / h.totalInvested) * 100;
    return { id: h.id, gain, gainPercent, absoluteReturn: gainPercent };
  });
}

// ─── Portfolio Allocation ─────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  mutual_fund: '#D4A853',
  stock:       '#C2185B',
  fixed_deposit: '#7C3AED',
  gold:        '#F59E0B',
  ppf:         '#10B981',
  savings:     '#3B82F6',
  real_estate: '#6B7280',
  crypto:      '#EC4899',
};

const CATEGORY_LABELS: Record<string, string> = {
  mutual_fund:   'Mutual Funds',
  stock:         'Equities',
  fixed_deposit: 'Fixed Deposits',
  gold:          'Gold',
  ppf:           'PPF',
  savings:       'Savings',
  real_estate:   'Real Estate',
  crypto:        'Crypto',
};

export function calculatePortfolioAllocation(
  profile: FinancialProfile
): PortfolioAllocation[] {
  const totals: Record<string, number> = {};
  for (const asset of profile.assets) {
    totals[asset.category] = (totals[asset.category] ?? 0) + asset.currentValue;
  }
  const grand = Object.values(totals).reduce((s, v) => s + v, 0);
  return Object.entries(totals).map(([cat, value]) => ({
    name:       CATEGORY_LABELS[cat] ?? cat,
    value,
    percentage: grand > 0 ? (value / grand) * 100 : 0,
    color:      CATEGORY_COLORS[cat] ?? '#6B7280',
  }));
}

// ─── CIBIL Score Label ────────────────────────────────────────────────────────
export function getCreditScoreLabel(score: number): {
  label: string;
  color: string;
  description: string;
} {
  if (score >= 800) return { label: 'Excellent', color: '#10B981', description: 'Top tier — best loan rates available.' };
  if (score >= 750) return { label: 'Very Good', color: '#34D399', description: 'Strong score — most lenders will approve you.' };
  if (score >= 700) return { label: 'Good',      color: '#D4A853', description: 'Solid score — standard interest rates.' };
  if (score >= 650) return { label: 'Fair',      color: '#F59E0B', description: 'Moderate — some lenders may hesitate.' };
  return                   { label: 'Poor',      color: '#EF4444', description: 'Needs improvement — work on payment history.' };
}

// ─── DTI Health ───────────────────────────────────────────────────────────────
export function getDTIHealth(ratio: number): {
  label: string;
  color: string;
  badgeClass: string;
  description: string;
} {
  if (ratio < 0.2)  return { label: 'Excellent', color: '#10B981', badgeClass: 'badge-success', description: 'Very low debt burden — excellent financial health.' };
  if (ratio < 0.35) return { label: 'Good',      color: '#D4A853', badgeClass: 'badge-gold',    description: 'Healthy debt-to-income — manageable obligations.' };
  if (ratio < 0.5)  return { label: 'Caution',   color: '#F59E0B', badgeClass: 'badge-warning',  description: 'Approaching limit — be cautious with new debt.' };
  return                   { label: 'High Risk',  color: '#EF4444', badgeClass: 'badge-danger',  description: 'Over 50% — very high debt burden. Avoid new loans.' };
}
