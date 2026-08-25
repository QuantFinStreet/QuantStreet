import rateLimit, { type RateLimitRequestHandler } from 'express-rate-limit';
import { env } from '../env.js';
import { ApiError } from './errors.js';

// Chat routes hit paid external APIs — this is the one place abuse has a
// direct dollar cost, so it gets its own (tighter) limiter rather than a
// blanket one on the whole API. Factory (rather than a bare instance) so
// tests can spin up an app with a tiny limit instead of firing 20+ requests.
export function createChatRateLimiter(limitPerMinute: number): RateLimitRequestHandler {
  return rateLimit({
    windowMs: 60_000,
    limit: limitPerMinute,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, _res, next) => {
      next(new ApiError(429, 'rate_limit_exceeded', `Too many chat requests — limit is ${limitPerMinute} per minute. Please slow down.`));
    },
  });
}

export const chatRateLimiter = createChatRateLimiter(env.chatRateLimitPerMinute);
