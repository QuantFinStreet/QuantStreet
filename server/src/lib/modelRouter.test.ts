import { describe, it, expect } from 'vitest';
import { routeForQuery } from './modelRouter.js';
import type { QueryType } from '../types/index.js';

describe('routeForQuery', () => {
  it.each([
    ['loan', 'openai'],
    ['investment', 'openai'],
    ['complex_analysis', 'openai'],
    ['quick_advice', 'gemini'],
    ['general', 'gemini'],
  ] satisfies Array<[QueryType, string]>)('routes %s to %s', (queryType, provider) => {
    expect(routeForQuery(queryType).provider).toBe(provider);
  });

  it('routes loan queries to a GPT-4 model', () => {
    expect(routeForQuery('loan').model).toBe('gpt-4');
  });

  it('routes general queries to Gemini Flash', () => {
    expect(routeForQuery('general').model).toBe('gemini-1.5-flash');
  });
});
