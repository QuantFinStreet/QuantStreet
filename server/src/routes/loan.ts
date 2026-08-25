import { Router, type Request } from 'express';
import type { LoanResult } from '../types/index.js';
import type { FinancialProfileRepository } from '../data/financialProfileRepository.js';
import { assessLoanEligibility } from '../lib/financial.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validateBody } from '../middleware/validate.js';
import { loanQuerySchema, type LoanQueryInput } from '../schemas/loan.js';

export function loanRouter(repo: FinancialProfileRepository): Router {
  const router = Router();

  router.post(
    '/calculate',
    validateBody(loanQuerySchema),
    asyncHandler(async (req: Request<unknown, LoanResult, LoanQueryInput>, res) => {
      const profile = await repo.getProfile();
      const result = assessLoanEligibility(profile, req.body);
      res.json(result);
    })
  );

  return router;
}
