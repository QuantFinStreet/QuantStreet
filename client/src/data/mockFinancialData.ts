// The financial profile itself now comes from GET /api/profile
// (server/src/data/financialProfile.ts is the source of truth). This file
// keeps only the Nifty 50 benchmark series used for the Investment Analysis
// comparison chart, which isn't part of FinancialProfile and has no
// dedicated endpoint yet.

// ─── Nifty 50 Benchmark Mock Data ─────────────────────────────────────────────
export const niftyBenchmarkData = [
  { month: 'Jan 24', nifty: 100 },
  { month: 'Feb 24', nifty: 103.2 },
  { month: 'Mar 24', nifty: 107.8 },
  { month: 'Apr 24', nifty: 106.1 },
  { month: 'May 24', nifty: 110.4 },
  { month: 'Jun 24', nifty: 113.7 },
  { month: 'Jul 24', nifty: 116.2 },
  { month: 'Aug 24', nifty: 114.8 },
  { month: 'Sep 24', nifty: 119.3 },
  { month: 'Oct 24', nifty: 116.5 },
  { month: 'Nov 24', nifty: 121.4 },
  { month: 'Dec 24', nifty: 124.8 },
];

export const portfolioReturnData = [
  { month: 'Jan 24', portfolio: 100 },
  { month: 'Feb 24', portfolio: 104.6 },
  { month: 'Mar 24', portfolio: 110.2 },
  { month: 'Apr 24', portfolio: 108.9 },
  { month: 'May 24', portfolio: 113.8 },
  { month: 'Jun 24', portfolio: 118.4 },
  { month: 'Jul 24', portfolio: 121.7 },
  { month: 'Aug 24', portfolio: 119.5 },
  { month: 'Sep 24', portfolio: 125.6 },
  { month: 'Oct 24', portfolio: 122.3 },
  { month: 'Nov 24', portfolio: 128.9 },
  { month: 'Dec 24', portfolio: 134.2 },
];
