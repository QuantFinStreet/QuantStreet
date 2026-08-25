import { Router } from 'express';
import type { AllocationResponse, SIPResponse } from '../types/index.js';
import type { FinancialProfileRepository } from '../data/financialProfileRepository.js';
import { calculatePortfolioAllocation, calculateSIPReturns } from '../lib/financial.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export function investmentsRouter(repo: FinancialProfileRepository): Router {
  const router = Router();

  router.get('/sip', asyncHandler(async (_req, res) => {
    const profile = await repo.getProfile();
    const body: SIPResponse = {
      holdings: profile.sipHoldings,
      performance: calculateSIPReturns(profile.sipHoldings),
    };
    res.json(body);
  }));

  router.get('/allocation', asyncHandler(async (_req, res) => {
    const profile = await repo.getProfile();
    const body: AllocationResponse = {
      allocation: calculatePortfolioAllocation(profile),
    };
    res.json(body);
  }));

  return router;
}
