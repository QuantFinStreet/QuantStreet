import type { FinancialProfile } from '../types/index.js';

// Small, deterministic profile for unit/integration tests — intentionally
// simpler than the mock production profile so expected numbers are easy
// to hand-verify in test assertions.
export const testProfile: FinancialProfile = {
  id: 'test-1',
  name: 'Test User',
  age: 30,
  annualIncome: 1_200_000,
  monthlyIncome: 100_000,
  city: 'Bengaluru',
  assets: [
    { id: 'a1', name: 'Mutual Fund A', category: 'mutual_fund', currentValue: 200_000, purchaseValue: 150_000, lastUpdated: '2024-01-01' },
    { id: 'a2', name: 'Gold', category: 'gold', currentValue: 50_000, purchaseValue: 40_000, lastUpdated: '2024-01-01' },
  ],
  liabilities: [
    { id: 'l1', name: 'Car Loan', type: 'car', outstandingAmount: 100_000, originalAmount: 200_000, interestRate: 9, monthlyEMI: 10_000, remainingMonths: 12, startDate: '2023-01-01' },
  ],
  netWorthHistory: [
    { month: 'Jan 24', assets: 200_000, liabilities: 120_000, netWorth: 80_000 },
    { month: 'Feb 24', assets: 250_000, liabilities: 100_000, netWorth: 150_000 },
  ],
  creditScoreHistory: [
    { month: 'Jan 24', score: 720 },
    { month: 'Feb 24', score: 740 },
  ],
  sipHoldings: [
    { id: 's1', fundName: 'Fund A', fundHouse: 'House A', category: 'large_cap', monthlyContribution: 5000, totalInvested: 100_000, currentValue: 120_000, xirr: 15, startDate: '2022-01-01', units: 1000, nav: 120 },
  ],
  lastUpdated: '2024-02-01',
};
