import type { QueryType } from '../types/index.js';

export type Provider = 'openai' | 'gemini';

export interface ModelRoute {
  provider: Provider;
  model: string;
}

// Adding a query type or swapping a model for one is a one-line change
// here — nothing else in the pipeline needs to know about it.
const ROUTES: Record<QueryType, ModelRoute> = {
  loan:              { provider: 'openai', model: 'gpt-4' },
  investment:        { provider: 'openai', model: 'gpt-4' },
  complex_analysis:  { provider: 'openai', model: 'gpt-4' },
  quick_advice:      { provider: 'gemini', model: 'gemini-1.5-flash' },
  general:           { provider: 'gemini', model: 'gemini-1.5-flash' },
};

export function routeForQuery(queryType: QueryType): ModelRoute {
  return ROUTES[queryType];
}
