import { describe, it, expect } from 'vitest';
import { classifyQuery } from './queryClassifier.js';

describe('classifyQuery', () => {
  it.each([
    ['Can I afford a home loan of 50 lakhs?', 'loan'],
    ['What EMI would I pay on a car loan?', 'loan'],
    ['How is my SIP portfolio performing?', 'investment'],
    ['Should I switch my mutual fund allocation?', 'investment'],
    ['Give me a detailed breakdown of my finances', 'complex_analysis'],
    ['Can you do a deep dive comparison, please?', 'complex_analysis'],
    ['Give me a quick tip to save money', 'quick_advice'],
    ['Should I pay off debt first?', 'quick_advice'],
    ['How am I doing overall?', 'general'],
    ['Tell me about my net worth trend', 'general'],
  ])('classifies "%s" as %s', (message, expected) => {
    expect(classifyQuery(message)).toBe(expected);
  });
});
