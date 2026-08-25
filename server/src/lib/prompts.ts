import type { FinancialProfile, QueryType } from '../types/index.js';
import {
  calculateDebtToIncome,
  calculateNetWorth,
  calculatePortfolioAllocation,
  calculateSIPReturns,
} from './financial.js';

const SYSTEM_PREAMBLE =
  'You are FinPilot AI, a personal finance co-pilot for an Indian user. ' +
  'Respond in 1-3 concise, actionable sentences. Use ₹ (INR) for all amounts. ' +
  'Ground every claim in the financial data provided below — do not invent numbers.';

function profileBasics(profile: FinancialProfile): string {
  return [
    `Name: ${profile.name}, Age: ${profile.age}, City: ${profile.city}`,
    `Annual income: ₹${profile.annualIncome.toLocaleString('en-IN')}, Monthly income: ₹${profile.monthlyIncome.toLocaleString('en-IN')}`,
  ].join('\n');
}

function loanSlice(profile: FinancialProfile): string {
  const dti = calculateDebtToIncome(profile);
  const liabilities = profile.liabilities
    .map((l) => `- ${l.name}: ₹${l.outstandingAmount.toLocaleString('en-IN')} outstanding, EMI ₹${l.monthlyEMI.toLocaleString('en-IN')}/mo at ${l.interestRate}%`)
    .join('\n');
  const latestScore = profile.creditScoreHistory.at(-1)?.score ?? 'unknown';
  return [
    `Current debt-to-income ratio: ${(dti * 100).toFixed(1)}%`,
    `CIBIL score: ${latestScore}`,
    'Liabilities:',
    liabilities || '(none)',
  ].join('\n');
}

function investmentSlice(profile: FinancialProfile): string {
  const allocation = calculatePortfolioAllocation(profile);
  const sipReturns = calculateSIPReturns(profile.sipHoldings);
  const allocLines = allocation
    .map((a) => `- ${a.name}: ₹${a.value.toLocaleString('en-IN')} (${a.percentage.toFixed(1)}%)`)
    .join('\n');
  const sipLines = profile.sipHoldings
    .map((h) => {
      const perf = sipReturns.find((r) => r.id === h.id);
      return `- ${h.fundName} (${h.category}): invested ₹${h.totalInvested.toLocaleString('en-IN')}, now ₹${h.currentValue.toLocaleString('en-IN')}, XIRR ${h.xirr}%, gain ${perf?.gainPercent.toFixed(1)}%`;
    })
    .join('\n');
  return [
    'Portfolio allocation:',
    allocLines || '(no assets)',
    'SIP holdings:',
    sipLines || '(no SIPs)',
  ].join('\n');
}

function netWorthSlice(profile: FinancialProfile): string {
  const { total, assets, liabilities } = calculateNetWorth(profile);
  const trend = profile.netWorthHistory
    .slice(-3)
    .map((n) => `${n.month}: ₹${n.netWorth.toLocaleString('en-IN')}`)
    .join(', ');
  return [
    `Net worth: ₹${total.toLocaleString('en-IN')} (assets ₹${assets.toLocaleString('en-IN')}, liabilities ₹${liabilities.toLocaleString('en-IN')})`,
    `Recent trend: ${trend}`,
  ].join('\n');
}

// Each QueryType gets only the profile slice relevant to it, keeping
// prompts small and the model's attention on the right numbers.
export function buildPrompt(queryType: QueryType, message: string, profile: FinancialProfile): string {
  const sections = [SYSTEM_PREAMBLE, '', 'User profile:', profileBasics(profile)];

  switch (queryType) {
    case 'loan':
      sections.push('', loanSlice(profile));
      break;
    case 'investment':
      sections.push('', investmentSlice(profile));
      break;
    case 'complex_analysis':
      sections.push('', netWorthSlice(profile), '', investmentSlice(profile), '', loanSlice(profile));
      break;
    case 'quick_advice':
    case 'general':
      sections.push('', netWorthSlice(profile));
      break;
  }

  sections.push('', `User question: ${message}`);
  return sections.join('\n');
}
