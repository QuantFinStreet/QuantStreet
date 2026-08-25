import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { TestFinancialProfileRepository } from '../test/testRepository.js';
import { testProfile } from '../test/fixtures.js';

const app = createApp(new TestFinancialProfileRepository());

describe('GET /api/profile', () => {
  it('returns the full financial profile', async () => {
    const res = await request(app).get('/api/profile');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(testProfile.id);
    expect(res.body.assets).toHaveLength(testProfile.assets.length);
  });
});

describe('GET /api/profile/net-worth', () => {
  it('returns history and computed current net worth', async () => {
    const res = await request(app).get('/api/profile/net-worth');
    expect(res.status).toBe(200);
    expect(res.body.current).toEqual({ total: 150_000, assets: 250_000, liabilities: 100_000 });
    expect(res.body.history).toHaveLength(testProfile.netWorthHistory.length);
  });
});

describe('GET /api/profile/assets', () => {
  it('returns assets and their total value', async () => {
    const res = await request(app).get('/api/profile/assets');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(250_000);
  });
});

describe('GET /api/profile/liabilities', () => {
  it('returns liabilities and their total outstanding', async () => {
    const res = await request(app).get('/api/profile/liabilities');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(100_000);
  });
});

describe('GET /api/profile/credit-score', () => {
  it('returns history and the latest score', async () => {
    const res = await request(app).get('/api/profile/credit-score');
    expect(res.status).toBe(200);
    expect(res.body.latest).toBe(740);
  });
});

describe('GET /api/investments/sip', () => {
  it('returns SIP holdings with computed performance', async () => {
    const res = await request(app).get('/api/investments/sip');
    expect(res.status).toBe(200);
    expect(res.body.performance[0]).toMatchObject({ id: 's1', gain: 20_000 });
  });
});

describe('GET /api/investments/allocation', () => {
  it('returns portfolio allocation by category', async () => {
    const res = await request(app).get('/api/investments/allocation');
    expect(res.status).toBe(200);
    const mutualFund = res.body.allocation.find((a: { name: string }) => a.name === 'Mutual Funds');
    expect(mutualFund.percentage).toBeCloseTo(80, 4);
  });
});

describe('unknown route', () => {
  it('returns a typed 404', async () => {
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('not_found');
  });
});
