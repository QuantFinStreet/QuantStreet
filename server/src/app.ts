import express, { type Express } from 'express';
import cors from 'cors';
import { env } from './env.js';
import { healthRouter } from './routes/health.js';
import { profileRouter } from './routes/profile.js';
import { investmentsRouter } from './routes/investments.js';
import { loanRouter } from './routes/loan.js';
import { settingsRouter } from './routes/settings.js';
import { errorHandler, notFoundHandler } from './middleware/errors.js';
import { MockFinancialProfileRepository } from './data/financialProfile.js';
import type { FinancialProfileRepository } from './data/financialProfileRepository.js';

export function createApp(
  repo: FinancialProfileRepository = new MockFinancialProfileRepository()
): Express {
  const app = express();

  app.use(cors({ origin: env.clientOrigin }));
  app.use(express.json());

  app.use('/health', healthRouter());
  app.use('/api/profile', profileRouter(repo));
  app.use('/api/investments', investmentsRouter(repo));
  app.use('/api/loan', loanRouter(repo));
  app.use('/api/settings', settingsRouter(repo));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
