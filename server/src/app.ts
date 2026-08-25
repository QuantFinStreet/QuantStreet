import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './env.js';
import { healthRouter } from './routes/health.js';
import { profileRouter } from './routes/profile.js';
import { investmentsRouter } from './routes/investments.js';
import { loanRouter } from './routes/loan.js';
import { settingsRouter } from './routes/settings.js';
import { chatRouter, openAIChatRouter } from './routes/chat.js';
import { chatRateLimiter as defaultChatRateLimiter } from './middleware/rateLimit.js';
import { ApiError, errorHandler, notFoundHandler } from './middleware/errors.js';
import { MockFinancialProfileRepository } from './data/financialProfile.js';
import type { FinancialProfileRepository } from './data/financialProfileRepository.js';
import type { RequestHandler } from 'express';

export interface CreateAppOptions {
  // Override for tests that need a tiny limit instead of firing 20+ requests.
  chatRateLimiter?: RequestHandler;
}

export function createApp(
  repo: FinancialProfileRepository = new MockFinancialProfileRepository(),
  options: CreateAppOptions = {}
): Express {
  const chatRateLimiter = options.chatRateLimiter ?? defaultChatRateLimiter;
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        // No Origin header (curl, server-to-server, same-origin) — allow.
        if (!origin || env.allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new ApiError(403, 'cors_forbidden', `Origin ${origin} is not allowed.`));
      },
    })
  );
  app.use(express.json());

  app.use('/health', healthRouter());
  app.use('/api/profile', profileRouter(repo));
  app.use('/api/investments', investmentsRouter(repo));
  app.use('/api/loan', loanRouter(repo));
  app.use('/api/settings', settingsRouter(repo));
  app.use('/api/chat', chatRateLimiter, chatRouter(repo));
  app.use('/api/openai-chat', chatRateLimiter, openAIChatRouter());

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
