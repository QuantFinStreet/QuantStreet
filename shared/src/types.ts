// ─── Asset & Liability ───────────────────────────────────────────────────────
export type AssetCategory =
  | 'mutual_fund'
  | 'stock'
  | 'fixed_deposit'
  | 'gold'
  | 'ppf'
  | 'real_estate'
  | 'savings'
  | 'crypto';

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  currentValue: number;   // INR
  purchaseValue: number;  // INR
  lastUpdated: string;    // ISO date
}

export interface Liability {
  id: string;
  name: string;
  type: LoanType;
  outstandingAmount: number;  // INR
  originalAmount: number;     // INR
  interestRate: number;       // annual %
  monthlyEMI: number;         // INR
  remainingMonths: number;
  startDate: string;
}

// ─── Net Worth & Credit ──────────────────────────────────────────────────────
export interface NetWorthSnapshot {
  month: string;   // "Jan 24"
  netWorth: number;
  assets: number;
  liabilities: number;
}

export interface CreditScoreEntry {
  month: string;
  score: number;   // CIBIL scale 300–900
}

// ─── Investments ─────────────────────────────────────────────────────────────
export interface SIPHolding {
  id: string;
  fundName: string;
  fundHouse: string;
  category: 'large_cap' | 'mid_cap' | 'small_cap' | 'flexi_cap' | 'debt' | 'index';
  monthlyContribution: number;  // INR
  totalInvested: number;        // INR
  currentValue: number;         // INR
  xirr: number;                 // % annualised
  startDate: string;
  units: number;
  nav: number;
}

export interface PortfolioAllocation {
  name: string;
  value: number;      // INR
  percentage: number;
  color: string;
}

// ─── Loans ───────────────────────────────────────────────────────────────────
export type LoanType = 'home' | 'car' | 'personal' | 'education';

export interface LoanQuery {
  type: LoanType;
  amount: number;          // INR
  annualInterestRate: number;  // %
  tenureMonths: number;
}

export interface LoanResult {
  eligible: boolean;
  monthlyEMI: number;
  totalInterest: number;
  totalPayment: number;
  maxEligibleAmount: number;
  newDebtToIncome: number;
  currentDebtToIncome: number;
  reasoning: string;
  riskLevel: 'low' | 'medium' | 'high' | 'very_high';
}

// ─── AI Chat ─────────────────────────────────────────────────────────────────
export type QueryType =
  | 'loan'
  | 'investment'
  | 'general'
  | 'complex_analysis'
  | 'quick_advice';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  queryType?: QueryType;
}

export interface ChatRequest {
  message: string;
  queryType: QueryType;
  context?: Partial<FinancialProfile>;
}

export interface ChatResponse {
  message: string;
  queryType: QueryType;
  relatedData?: Record<string, unknown>;
  confidence: number;  // 0–1
}

// ─── Financial Profile ───────────────────────────────────────────────────────
export interface FinancialProfile {
  id: string;
  name: string;
  age: number;
  annualIncome: number;           // INR
  monthlyIncome: number;          // INR
  city: string;
  assets: Asset[];
  liabilities: Liability[];
  netWorthHistory: NetWorthSnapshot[];
  creditScoreHistory: CreditScoreEntry[];
  sipHoldings: SIPHolding[];
  lastUpdated: string;
}

// ─── API ─────────────────────────────────────────────────────────────────────
// Shapes for endpoints that return more than a bare entity/array.
export interface NetWorthResponse {
  history: NetWorthSnapshot[];
  current: {
    total: number;
    assets: number;
    liabilities: number;
  };
}

export interface AssetsResponse {
  assets: Asset[];
  total: number;
}

export interface LiabilitiesResponse {
  liabilities: Liability[];
  total: number;
}

export interface CreditScoreResponse {
  history: CreditScoreEntry[];
  latest: number;
}

export interface SIPPerformanceEntry {
  id: string;
  gain: number;
  gainPercent: number;
  absoluteReturn: number;
}

export interface SIPResponse {
  holdings: SIPHolding[];
  performance: SIPPerformanceEntry[];
}

export interface AllocationResponse {
  allocation: PortfolioAllocation[];
}

export type ExportFormat = 'csv' | 'json' | 'pdf';

export interface ExportRequest {
  format: ExportFormat;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
  details?: Array<{ path: string; message: string }>;
}
