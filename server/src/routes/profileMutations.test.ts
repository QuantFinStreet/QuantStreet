import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { TestFinancialProfileRepository } from '../test/testRepository.js';

describe('Asset CRUD', () => {
  it('creates, updates, and deletes an asset, reflected in net worth', async () => {
    const app = createApp(new TestFinancialProfileRepository());

    const before = await request(app).get('/api/profile/net-worth');
    const startingAssets = before.body.current.assets;

    const created = await request(app)
      .post('/api/profile/assets')
      .send({ name: 'New FD', category: 'fixed_deposit', currentValue: 10_000, purchaseValue: 10_000, lastUpdated: '2024-01-01' });
    expect(created.status).toBe(201);
    expect(created.body.id).toBeTruthy();

    const afterCreate = await request(app).get('/api/profile/net-worth');
    expect(afterCreate.body.current.assets).toBe(startingAssets + 10_000);

    const updated = await request(app)
      .patch(`/api/profile/assets/${created.body.id}`)
      .send({ currentValue: 25_000 });
    expect(updated.status).toBe(200);
    expect(updated.body.currentValue).toBe(25_000);
    expect(updated.body.name).toBe('New FD');

    const afterUpdate = await request(app).get('/api/profile/net-worth');
    expect(afterUpdate.body.current.assets).toBe(startingAssets + 25_000);

    const deleted = await request(app).delete(`/api/profile/assets/${created.body.id}`);
    expect(deleted.status).toBe(204);

    const afterDelete = await request(app).get('/api/profile/net-worth');
    expect(afterDelete.body.current.assets).toBe(startingAssets);
  });

  it('rejects an invalid asset category', async () => {
    const app = createApp(new TestFinancialProfileRepository());
    const res = await request(app)
      .post('/api/profile/assets')
      .send({ name: 'Bad', category: 'bitcoin_moonshot', currentValue: 1, purchaseValue: 1, lastUpdated: '2024-01-01' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('validation_error');
  });

  it('returns 404 updating a non-existent asset', async () => {
    const app = createApp(new TestFinancialProfileRepository());
    const res = await request(app).patch('/api/profile/assets/does-not-exist').send({ currentValue: 5 });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('not_found');
  });

  it('returns 404 deleting a non-existent asset', async () => {
    const app = createApp(new TestFinancialProfileRepository());
    const res = await request(app).delete('/api/profile/assets/does-not-exist');
    expect(res.status).toBe(404);
  });
});

describe('Liability CRUD', () => {
  it('creates, updates, and deletes a liability, reflected in net worth', async () => {
    const app = createApp(new TestFinancialProfileRepository());

    const before = await request(app).get('/api/profile/net-worth');
    const startingLiabilities = before.body.current.liabilities;

    const created = await request(app)
      .post('/api/profile/liabilities')
      .send({
        name: 'New Personal Loan',
        type: 'personal',
        outstandingAmount: 50_000,
        originalAmount: 50_000,
        interestRate: 12,
        monthlyEMI: 5_000,
        remainingMonths: 12,
        startDate: '2024-01-01',
      });
    expect(created.status).toBe(201);

    const afterCreate = await request(app).get('/api/profile/net-worth');
    expect(afterCreate.body.current.liabilities).toBe(startingLiabilities + 50_000);

    const updated = await request(app)
      .patch(`/api/profile/liabilities/${created.body.id}`)
      .send({ outstandingAmount: 30_000 });
    expect(updated.status).toBe(200);
    expect(updated.body.outstandingAmount).toBe(30_000);

    const deleted = await request(app).delete(`/api/profile/liabilities/${created.body.id}`);
    expect(deleted.status).toBe(204);

    const afterDelete = await request(app).get('/api/profile/net-worth');
    expect(afterDelete.body.current.liabilities).toBe(startingLiabilities);
  });

  it('rejects a negative outstanding amount', async () => {
    const app = createApp(new TestFinancialProfileRepository());
    const res = await request(app)
      .post('/api/profile/liabilities')
      .send({
        name: 'Bad',
        type: 'personal',
        outstandingAmount: -1,
        originalAmount: 1,
        interestRate: 10,
        monthlyEMI: 1,
        remainingMonths: 1,
        startDate: '2024-01-01',
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('validation_error');
  });
});
