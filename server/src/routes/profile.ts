import { Router } from 'express';
import type {
  AssetsResponse,
  CreditScoreResponse,
  LiabilitiesResponse,
  NetWorthResponse,
} from '../types/index.js';
import type { FinancialProfileRepository } from '../data/financialProfileRepository.js';
import { calculateNetWorth } from '../lib/financial.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export function profileRouter(repo: FinancialProfileRepository): Router {
  const router = Router();

  router.get('/', asyncHandler(async (_req, res) => {
    const profile = await repo.getProfile();
    res.json(profile);
  }));

  router.get('/net-worth', asyncHandler(async (_req, res) => {
    const profile = await repo.getProfile();
    const body: NetWorthResponse = {
      history: profile.netWorthHistory,
      current: calculateNetWorth(profile),
    };
    res.json(body);
  }));

  router.get('/assets', asyncHandler(async (_req, res) => {
    const profile = await repo.getProfile();
    const body: AssetsResponse = {
      assets: profile.assets,
      total: profile.assets.reduce((s, a) => s + a.currentValue, 0),
    };
    res.json(body);
  }));

  router.get('/liabilities', asyncHandler(async (_req, res) => {
    const profile = await repo.getProfile();
    const body: LiabilitiesResponse = {
      liabilities: profile.liabilities,
      total: profile.liabilities.reduce((s, l) => s + l.outstandingAmount, 0),
    };
    res.json(body);
  }));

  router.get('/credit-score', asyncHandler(async (_req, res) => {
    const profile = await repo.getProfile();
    const body: CreditScoreResponse = {
      history: profile.creditScoreHistory,
      latest: profile.creditScoreHistory.at(-1)?.score ?? 0,
    };
    res.json(body);
  }));

  return router;
}
