import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { createChatRateLimiter } from '../middleware/rateLimit.js';
import { TestFinancialProfileRepository } from '../test/testRepository.js';

const { callProviderMock, ProviderConfigError, ProviderCallError } = vi.hoisted(() => {
  class ProviderConfigError extends Error {}
  class ProviderCallError extends Error {
    override cause: unknown;
    constructor(message: string, cause: unknown) {
      super(message);
      this.cause = cause;
    }
  }
  return { callProviderMock: vi.fn(), ProviderConfigError, ProviderCallError };
});

vi.mock('../lib/providers.js', () => ({
  callProvider: callProviderMock,
  ProviderConfigError,
  ProviderCallError,
}));

beforeEach(() => {
  callProviderMock.mockReset();
});

describe('POST /api/chat', () => {
  const app = createApp(new TestFinancialProfileRepository());

  it.each([
    ['Can I afford a home loan?', 'loan'],
    ['How is my SIP doing?', 'investment'],
    ['Give me a detailed breakdown, please', 'complex_analysis'],
    ['Give me a quick tip', 'quick_advice'],
    ['How is everything looking?', 'general'],
  ])('returns a classified response for "%s" -> %s', async (message, expectedType) => {
    callProviderMock.mockResolvedValueOnce('Mocked AI response.');
    const res = await request(app).post('/api/chat').send({ message });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Mocked AI response.');
    expect(res.body.queryType).toBe(expectedType);
    expect(callProviderMock).toHaveBeenCalledTimes(1);
  });

  it('returns a typed 400 for an empty message', async () => {
    const res = await request(app).post('/api/chat').send({ message: '' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('validation_error');
    expect(callProviderMock).not.toHaveBeenCalled();
  });

  it('returns a typed 503 when the provider is not configured, without leaking details', async () => {
    callProviderMock.mockRejectedValueOnce(new ProviderConfigError('OPENAI_API_KEY is not configured on the server.'));
    const res = await request(app).post('/api/chat').send({ message: 'Can I get a loan?' });

    expect(res.status).toBe(503);
    expect(res.body.error).toBe('provider_not_configured');
    expect(JSON.stringify(res.body)).not.toMatch(/sk-|API_KEY/);
  });

  it('returns a typed 502 when the provider call fails, without leaking the raw provider error', async () => {
    callProviderMock.mockRejectedValueOnce(new ProviderCallError('OpenAI request failed.', { secret: 'sk-should-not-leak' }));
    const res = await request(app).post('/api/chat').send({ message: 'Can I get a loan?' });

    expect(res.status).toBe(502);
    expect(res.body.error).toBe('provider_error');
    expect(JSON.stringify(res.body)).not.toMatch(/sk-should-not-leak/);
  });
});

describe('POST /api/chat rate limiting', () => {
  it('returns 429 once the per-minute limit is exceeded', async () => {
    const limitedApp = createApp(new TestFinancialProfileRepository(), {
      chatRateLimiter: createChatRateLimiter(2),
    });
    callProviderMock.mockResolvedValue('ok');

    const first = await request(limitedApp).post('/api/chat').send({ message: 'hi' });
    const second = await request(limitedApp).post('/api/chat').send({ message: 'hi' });
    const third = await request(limitedApp).post('/api/chat').send({ message: 'hi' });

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(third.status).toBe(429);
    expect(third.body.error).toBe('rate_limit_exceeded');
  });
});
