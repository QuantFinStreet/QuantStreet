import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { TestFinancialProfileRepository } from '../test/testRepository.js';

const app = createApp(new TestFinancialProfileRepository());

describe('POST /api/loan/calculate', () => {
  it('returns EMI and eligibility for a valid loan query', async () => {
    const res = await request(app)
      .post('/api/loan/calculate')
      .send({ type: 'personal', amount: 200_000, annualInterestRate: 10, tenureMonths: 24 });

    expect(res.status).toBe(200);
    expect(res.body.eligible).toBe(true);
    expect(res.body.monthlyEMI).toBe(9229);
  });

  it('rejects an amount below the minimum with a typed validation error', async () => {
    const res = await request(app)
      .post('/api/loan/calculate')
      .send({ type: 'home', amount: 100, annualInterestRate: 8.5, tenureMonths: 240 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('validation_error');
    expect(res.body.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: 'amount' })])
    );
  });

  it('rejects an invalid loan type', async () => {
    const res = await request(app)
      .post('/api/loan/calculate')
      .send({ type: 'yacht', amount: 50_000, annualInterestRate: 8.5, tenureMonths: 12 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('validation_error');
  });

  it('rejects a missing body entirely', async () => {
    const res = await request(app).post('/api/loan/calculate').send({});
    expect(res.status).toBe(400);
    expect(res.body.details.length).toBeGreaterThan(0);
  });
});
