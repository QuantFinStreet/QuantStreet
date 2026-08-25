import type { QueryType } from '../types/index.js';

export type Provider = 'openai' | 'gemini';

export interface ModelRoute {
  provider: Provider;
  model: string;
}

// Adding a query type or swapping a model for one is a one-line change
// here — nothing else in the pipeline needs to know about it.
// Model names: 'gpt-4' and 'gemini-1.5-flash' are both retired on current
// API accounts. 'gpt-4o' is OpenAI's current GPT-4-class model. For Gemini,
// the 'gemini-flash-latest' moving alias was tried first (so version bumps
// wouldn't require a code change) but consistently hung for 50s+ against
// the real API — 'gemini-3.6-flash' is pinned instead because it was
// verified to respond correctly (~12s). Revisit if it's deprecated.
const ROUTES: Record<QueryType, ModelRoute> = {
  loan:              { provider: 'openai', model: 'gpt-4o' },
  investment:        { provider: 'openai', model: 'gpt-4o' },
  complex_analysis:  { provider: 'openai', model: 'gpt-4o' },
  quick_advice:      { provider: 'gemini', model: 'gemini-3.6-flash' },
  general:           { provider: 'gemini', model: 'gemini-3.6-flash' },
};

export function routeForQuery(queryType: QueryType): ModelRoute {
  return ROUTES[queryType];
}
