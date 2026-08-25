import type { QueryType } from '../types/index.js';

// Deterministic keyword/pattern classification — no LLM round-trip needed
// just to decide which model to route to. Order matters: more specific
// intents (loan/investment/analysis/advice) are checked before falling
// back to 'general'.
const PATTERNS: Array<{ type: QueryType; pattern: RegExp }> = [
  { type: 'loan', pattern: /loan|emi|borrow|credit|mortgage|home loan|car loan/i },
  { type: 'investment', pattern: /invest|sip|portfolio|fund|mutual|stock|nifty|return|xirr/i },
  { type: 'complex_analysis', pattern: /analys|breakdown|deep dive|detail|compare|project/i },
  { type: 'quick_advice', pattern: /quick|tip|advice|suggest|should i/i },
];

export function classifyQuery(message: string): QueryType {
  for (const { type, pattern } of PATTERNS) {
    if (pattern.test(message)) return type;
  }
  return 'general';
}
