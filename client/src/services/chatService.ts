import type { QueryType } from '@fintech/shared';

// sendChatMessage now hits POST /api/chat for real (server classifies,
// routes to a model, and injects the relevant profile slice) — see
// ../lib/api/chat.ts. Re-exported here so AIChat.tsx's import doesn't change.
export { sendChatMessage } from '../lib/api/chat';

// Client-side classification is kept only for an optimistic queryType
// label before the server's (authoritative) classification comes back
// in the response.
export function detectQueryType(message: string): QueryType {
  const lower = message.toLowerCase();
  if (/loan|emi|borrow|credit|mortgage|home loan|car loan/.test(lower)) return 'loan';
  if (/invest|sip|portfolio|fund|mutual|stock|nifty|return|xirr/.test(lower)) return 'investment';
  if (/analys|breakdown|deep dive|detail|compare|project/.test(lower)) return 'complex_analysis';
  if (/quick|tip|advice|suggest|should i/.test(lower)) return 'quick_advice';
  return 'general';
}
