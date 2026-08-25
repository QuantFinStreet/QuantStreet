import type {
  FinancialProfile,
  LoanQuery,
  LoanResult,
  PortfolioAllocation,
  SIPHolding,
} from '../types/index.js';

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

// ─── EMI — Reducing Balance Formula ──────────────────────────────────────────
export function calculateEMI(
  principal: number,
  annualRate: number,
  tenureMonths: number
): number {
  if (principal <= 0 || annualRate <= 0 || tenureMonths <= 0) return 0;
  const r = annualRate / 12 / 100;
  const emi = (principal * r * Math.pow(1 + r, tenureMonths)) /
              (Math.pow(1 + r, tenureMonths) - 1);
  return Math.round(emi);
}

// ─── Loan Eligibility ─────────────────────────────────────────────────────────
export function assessLoanEligibility(
  profile: FinancialProfile,
  query: LoanQuery
): LoanResult {
  const newEMI = calculateEMI(query.amount, query.annualInterestRate, query.tenureMonths);
  const totalInterest = newEMI * query.tenureMonths - query.amount;
  const totalPayment = newEMI * query.tenureMonths;

  const existingEMIs = profile.liabilities.reduce((s, l) => s + l.monthlyEMI, 0);
  const currentDTI = existingEMIs / profile.monthlyIncome;
  const newDTI = (existingEMIs + newEMI) / profile.monthlyIncome;

  // Max eligible: total EMI burden ≤ 50% of monthly income
  const maxMonthlyEMIRoom = profile.monthlyIncome * 0.5 - existingEMIs;
  const monthlyRate = query.annualInterestRate / 12 / 100;
  const maxEligibleAmount = Math.max(
    0,
    Math.round(
      (maxMonthlyEMIRoom * (Math.pow(1 + monthlyRate, query.tenureMonths) - 1)) /
      (monthlyRate * Math.pow(1 + monthlyRate, query.tenureMonths))
    )
  );

  const latestCreditScore = profile.creditScoreHistory.at(-1)?.score ?? 700;

  let eligible = true;
  const reasons: string[] = [];

  if (newDTI > 0.5) {
    eligible = false;
    reasons.push(`Your total EMI-to-income ratio would reach ${(newDTI * 100).toFixed(0)}% — above the 50% safe threshold.`);
  }
  if (latestCreditScore < 700) {
    eligible = false;
    reasons.push(`Your CIBIL score of ${latestCreditScore} is below the minimum 700 required.`);
  }
  if (query.amount > profile.annualIncome * 10 && query.type !== 'home') {
    eligible = false;
    reasons.push(`Loan amount exceeds 10× annual income for a ${query.type} loan.`);
  }

  if (eligible) {
    reasons.push(`Excellent! Your CIBIL score of ${latestCreditScore} qualifies you for preferential rates.`);
    if (newDTI < 0.35) reasons.push('Your debt-to-income ratio remains healthy after this loan.');
    else reasons.push('Your debt-to-income ratio is acceptable but approaching caution zone.');
  }

  let riskLevel: LoanResult['riskLevel'] = 'low';
  if (newDTI > 0.5) riskLevel = 'very_high';
  else if (newDTI > 0.4) riskLevel = 'high';
  else if (newDTI > 0.3) riskLevel = 'medium';

  return {
    eligible,
    monthlyEMI: newEMI,
    totalInterest,
    totalPayment,
    maxEligibleAmount,
    newDebtToIncome: newDTI,
    currentDebtToIncome: currentDTI,
    reasoning: reasons.join(' '),
    riskLevel,
  };
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
