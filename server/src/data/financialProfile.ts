import type {
  FinancialProfile,
  Asset,
  Liability,
  NetWorthSnapshot,
  CreditScoreEntry,
  SIPHolding,
} from '../types/index.js';
import type { FinancialProfileRepository } from './financialProfileRepository.js';

// ─── Assets ──────────────────────────────────────────────────────────────────
const assets: Asset[] = [
  {
    id: 'a1',
    name: 'HDFC Flexi Cap Fund',
    category: 'mutual_fund',
    currentValue: 485000,
    purchaseValue: 360000,
    lastUpdated: '2024-12-01',
  },
  {
    id: 'a2',
    name: 'Axis Bluechip Fund',
    category: 'mutual_fund',
    currentValue: 212000,
    purchaseValue: 180000,
    lastUpdated: '2024-12-01',
  },
  {
    id: 'a3',
    name: 'Nifty 50 Index Fund (SBI)',
    category: 'mutual_fund',
    currentValue: 154000,
    purchaseValue: 120000,
    lastUpdated: '2024-12-01',
  },
  {
    id: 'a4',
    name: 'ICICI Prudential Mid Cap',
    category: 'mutual_fund',
    currentValue: 98000,
    purchaseValue: 72000,
    lastUpdated: '2024-12-01',
  },
  {
    id: 'a5',
    name: 'Reliance & Infosys Stocks',
    category: 'stock',
    currentValue: 320000,
    purchaseValue: 240000,
    lastUpdated: '2024-12-01',
  },
  {
    id: 'a6',
    name: 'SBI Fixed Deposit',
    category: 'fixed_deposit',
    currentValue: 250000,
    purchaseValue: 220000,
    lastUpdated: '2024-12-01',
  },
  {
    id: 'a7',
    name: 'Gold ETF (Nippon)',
    category: 'gold',
    currentValue: 185000,
    purchaseValue: 130000,
    lastUpdated: '2024-12-01',
  },
  {
    id: 'a8',
    name: 'PPF Account',
    category: 'ppf',
    currentValue: 420000,
    purchaseValue: 350000,
    lastUpdated: '2024-12-01',
  },
  {
    id: 'a9',
    name: 'Savings & Emergency Fund',
    category: 'savings',
    currentValue: 180000,
    purchaseValue: 180000,
    lastUpdated: '2024-12-01',
  },
];

// ─── Liabilities ─────────────────────────────────────────────────────────────
const liabilities: Liability[] = [
  {
    id: 'l1',
    name: 'Home Loan — HDFC',
    type: 'home',
    outstandingAmount: 2800000,
    originalAmount: 3500000,
    interestRate: 8.5,
    monthlyEMI: 32500,
    remainingMonths: 156,
    startDate: '2021-06-01',
  },
  {
    id: 'l2',
    name: 'Car Loan — SBI',
    type: 'car',
    outstandingAmount: 185000,
    originalAmount: 450000,
    interestRate: 9.2,
    monthlyEMI: 9800,
    remainingMonths: 20,
    startDate: '2022-08-01',
  },
];

// ─── Net Worth History (14 months) ───────────────────────────────────────────
const netWorthHistory: NetWorthSnapshot[] = [
  { month: 'Nov 23', assets: 2100000, liabilities: 3210000, netWorth: -1110000 },
  { month: 'Dec 23', assets: 2180000, liabilities: 3170000, netWorth: -990000 },
  { month: 'Jan 24', assets: 2290000, liabilities: 3128000, netWorth: -838000 },
  { month: 'Feb 24', assets: 2420000, liabilities: 3085000, netWorth: -665000 },
  { month: 'Mar 24', assets: 2580000, liabilities: 3042000, netWorth: -462000 },
  { month: 'Apr 24', assets: 2650000, liabilities: 3002000, netWorth: -352000 },
  { month: 'May 24', assets: 2740000, liabilities: 2964000, netWorth: -224000 },
  { month: 'Jun 24', assets: 2890000, liabilities: 2924000, netWorth: -34000 },
  { month: 'Jul 24', assets: 2980000, liabilities: 2887000, netWorth: 93000 },
  { month: 'Aug 24', assets: 3060000, liabilities: 2850000, netWorth: 210000 },
  { month: 'Sep 24', assets: 3140000, liabilities: 2820000, netWorth: 320000 },
  { month: 'Oct 24', assets: 3210000, liabilities: 2990000, netWorth: 220000 },
  { month: 'Nov 24', assets: 3280000, liabilities: 2960000, netWorth: 320000 },
  { month: 'Dec 24', assets: 2304000, liabilities: 2985000, netWorth: 319000 },
];

// ─── Credit Score History ─────────────────────────────────────────────────────
const creditScoreHistory: CreditScoreEntry[] = [
  { month: 'Jan 24', score: 718 },
  { month: 'Feb 24', score: 722 },
  { month: 'Mar 24', score: 719 },
  { month: 'Apr 24', score: 728 },
  { month: 'May 24', score: 735 },
  { month: 'Jun 24', score: 731 },
  { month: 'Jul 24', score: 740 },
  { month: 'Aug 24', score: 745 },
  { month: 'Sep 24', score: 748 },
  { month: 'Oct 24', score: 752 },
  { month: 'Nov 24', score: 758 },
  { month: 'Dec 24', score: 763 },
];

// ─── SIP Holdings ─────────────────────────────────────────────────────────────
const sipHoldings: SIPHolding[] = [
  {
    id: 's1',
    fundName: 'HDFC Flexi Cap Fund – Direct Growth',
    fundHouse: 'HDFC Mutual Fund',
    category: 'flexi_cap',
    monthlyContribution: 10000,
    totalInvested: 360000,
    currentValue: 485000,
    xirr: 18.4,
    startDate: '2021-01-01',
    units: 1842.6,
    nav: 263.25,
  },
  {
    id: 's2',
    fundName: 'Axis Bluechip Fund – Direct Growth',
    fundHouse: 'Axis Mutual Fund',
    category: 'large_cap',
    monthlyContribution: 5000,
    totalInvested: 180000,
    currentValue: 212000,
    xirr: 14.2,
    startDate: '2021-01-01',
    units: 4528.4,
    nav: 46.82,
  },
  {
    id: 's3',
    fundName: 'SBI Nifty 50 Index Fund – Direct',
    fundHouse: 'SBI Mutual Fund',
    category: 'index',
    monthlyContribution: 5000,
    totalInvested: 120000,
    currentValue: 154000,
    xirr: 19.1,
    startDate: '2022-01-01',
    units: 6124.8,
    nav: 25.15,
  },
  {
    id: 's4',
    fundName: 'ICICI Pru Midcap 150 Index Fund',
    fundHouse: 'ICICI Prudential',
    category: 'mid_cap',
    monthlyContribution: 3000,
    totalInvested: 72000,
    currentValue: 98000,
    xirr: 22.7,
    startDate: '2022-06-01',
    units: 2941.2,
    nav: 33.32,
  },
  {
    id: 's5',
    fundName: 'Mirae Asset Emerging Bluechip',
    fundHouse: 'Mirae Asset',
    category: 'mid_cap',
    monthlyContribution: 4000,
    totalInvested: 96000,
    currentValue: 118000,
    xirr: 16.8,
    startDate: '2022-01-01',
    units: 1562.4,
    nav: 75.53,
  },
  {
    id: 's6',
    fundName: 'HDFC Corporate Bond Fund',
    fundHouse: 'HDFC Mutual Fund',
    category: 'debt',
    monthlyContribution: 2000,
    totalInvested: 48000,
    currentValue: 51200,
    xirr: 7.4,
    startDate: '2022-06-01',
    units: 2040.8,
    nav: 25.09,
  },
];

// ─── Financial Profile ────────────────────────────────────────────────────────
const mockFinancialProfile: FinancialProfile = {
  id: 'fp_001',
  name: 'Arjun Sharma',
  age: 32,
  annualIncome: 1800000,   // ₹18 LPA
  monthlyIncome: 150000,
  city: 'Bengaluru',
  assets,
  liabilities,
  netWorthHistory,
  creditScoreHistory,
  sipHoldings,
  lastUpdated: new Date().toISOString(),
};

// ─── Repository ────────────────────────────────────────────────────────────────
export class MockFinancialProfileRepository implements FinancialProfileRepository {
  async getProfile(): Promise<FinancialProfile> {
    return mockFinancialProfile;
  }
}
