import { describe, it, expect } from 'vitest';
import { testProfile } from '../test/fixtures.js';
import {
  calculateNetWorth,
  calculateDebtToIncome,
  calculateEMI,
  assessLoanEligibility,
  calculateSIPReturns,
  calculatePortfolioAllocation,
} from './financial.js';

describe('calculateNetWorth', () => {
  it('sums assets minus liabilities', () => {
    expect(calculateNetWorth(testProfile)).toEqual({
      total: 150_000,
      assets: 250_000,
      liabilities: 100_000,
    });
  });
});

describe('calculateDebtToIncome', () => {
  it('divides total monthly EMI by monthly income', () => {
    expect(calculateDebtToIncome(testProfile)).toBeCloseTo(0.1);
  });
});

describe('calculateEMI', () => {
  it('computes EMI via the reducing-balance formula', () => {
    expect(calculateEMI(100_000, 12, 12)).toBe(8885);
  });

  it.each([
    [0, 12, 12],
    [100_000, 0, 12],
    [100_000, 12, 0],
    [-100, 12, 12],
  ])('returns 0 for invalid input (%d, %d, %d)', (principal, rate, tenure) => {
    expect(calculateEMI(principal, rate, tenure)).toBe(0);
  });
});

describe('assessLoanEligibility', () => {
  it('approves a loan that keeps DTI well under 50%', () => {
    const result = assessLoanEligibility(testProfile, {
      type: 'personal',
      amount: 200_000,
      annualInterestRate: 10,
      tenureMonths: 24,
    });
    expect(result.eligible).toBe(true);
    expect(result.monthlyEMI).toBe(9229);
    expect(result.riskLevel).toBe('low');
    expect(result.newDebtToIncome).toBeCloseTo(0.19229, 4);
  });

  it('rejects a loan that pushes DTI over 50%', () => {
    const result = assessLoanEligibility(testProfile, {
      type: 'personal',
      amount: 2_000_000,
      annualInterestRate: 10,
      tenureMonths: 24,
    });
    expect(result.eligible).toBe(false);
    expect(result.riskLevel).toBe('very_high');
    expect(result.reasoning).toMatch(/50% safe threshold/);
  });

  it('rejects when credit score is below 700', () => {
    const lowScoreProfile = {
      ...testProfile,
      creditScoreHistory: [{ month: 'Feb 24', score: 650 }],
    };
    const result = assessLoanEligibility(lowScoreProfile, {
      type: 'personal',
      amount: 50_000,
      annualInterestRate: 10,
      tenureMonths: 12,
    });
    expect(result.eligible).toBe(false);
    expect(result.reasoning).toMatch(/CIBIL score of 650/);
  });

  it('rejects non-home loans exceeding 10x annual income', () => {
    const result = assessLoanEligibility(testProfile, {
      type: 'personal',
      amount: testProfile.annualIncome * 11,
      annualInterestRate: 10,
      tenureMonths: 60,
    });
    expect(result.eligible).toBe(false);
    expect(result.reasoning).toMatch(/exceeds 10× annual income/);
  });
});

describe('calculateSIPReturns', () => {
  it('computes gain and gain percent per holding', () => {
    const [result] = calculateSIPReturns(testProfile.sipHoldings);
    expect(result).toMatchObject({ id: 's1', gain: 20_000 });
    expect(result?.gainPercent).toBeCloseTo(20, 4);
  });
});

describe('calculatePortfolioAllocation', () => {
  it('groups asset value by category with correct percentages', () => {
    const allocation = calculatePortfolioAllocation(testProfile);
    const mutualFund = allocation.find((a) => a.name === 'Mutual Funds');
    const gold = allocation.find((a) => a.name === 'Gold');
    expect(mutualFund?.percentage).toBeCloseTo(80, 4);
    expect(gold?.percentage).toBeCloseTo(20, 4);
  });
});
