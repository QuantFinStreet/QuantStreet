import type { FinancialProfile } from '../types/index.js';

function csvEscape(value: string | number): string {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function csvRow(values: Array<string | number>): string {
  return values.map(csvEscape).join(',') + '\n';
}

// Flattens the profile into a handful of labeled CSV sections rather than
// one wide table — the entity shapes (assets, liabilities, SIPs, history)
// don't share columns.
export function profileToCSV(profile: FinancialProfile): string {
  let out = '';

  out += csvRow(['Profile']);
  out += csvRow(['id', 'name', 'age', 'annualIncome', 'monthlyIncome', 'city', 'lastUpdated']);
  out += csvRow([profile.id, profile.name, profile.age, profile.annualIncome, profile.monthlyIncome, profile.city, profile.lastUpdated]);
  out += '\n';

  out += csvRow(['Assets']);
  out += csvRow(['id', 'name', 'category', 'currentValue', 'purchaseValue', 'lastUpdated']);
  for (const a of profile.assets) {
    out += csvRow([a.id, a.name, a.category, a.currentValue, a.purchaseValue, a.lastUpdated]);
  }
  out += '\n';

  out += csvRow(['Liabilities']);
  out += csvRow(['id', 'name', 'type', 'outstandingAmount', 'originalAmount', 'interestRate', 'monthlyEMI', 'remainingMonths', 'startDate']);
  for (const l of profile.liabilities) {
    out += csvRow([l.id, l.name, l.type, l.outstandingAmount, l.originalAmount, l.interestRate, l.monthlyEMI, l.remainingMonths, l.startDate]);
  }
  out += '\n';

  out += csvRow(['SIP Holdings']);
  out += csvRow(['id', 'fundName', 'fundHouse', 'category', 'monthlyContribution', 'totalInvested', 'currentValue', 'xirr', 'startDate', 'units', 'nav']);
  for (const s of profile.sipHoldings) {
    out += csvRow([s.id, s.fundName, s.fundHouse, s.category, s.monthlyContribution, s.totalInvested, s.currentValue, s.xirr, s.startDate, s.units, s.nav]);
  }
  out += '\n';

  out += csvRow(['Net Worth History']);
  out += csvRow(['month', 'assets', 'liabilities', 'netWorth']);
  for (const n of profile.netWorthHistory) {
    out += csvRow([n.month, n.assets, n.liabilities, n.netWorth]);
  }
  out += '\n';

  out += csvRow(['Credit Score History']);
  out += csvRow(['month', 'score']);
  for (const c of profile.creditScoreHistory) {
    out += csvRow([c.month, c.score]);
  }

  return out;
}
