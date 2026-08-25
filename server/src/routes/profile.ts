import { Router, type Request } from 'express';
import type {
  Asset,
  AssetsResponse,
  CreditScoreResponse,
  Liability,
  LiabilitiesResponse,
  NetWorthResponse,
} from '../types/index.js';
import { RepositoryNotFoundError, type FinancialProfileRepository } from '../data/financialProfileRepository.js';
import { calculateNetWorth } from '../lib/financial.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { ApiError } from '../middleware/errors.js';
import { assetInputSchema, assetUpdateSchema, type AssetInputBody, type AssetUpdateBody } from '../schemas/asset.js';
import { liabilityInputSchema, liabilityUpdateSchema, type LiabilityInputBody, type LiabilityUpdateBody } from '../schemas/liability.js';
import { idParamSchema } from '../schemas/common.js';

function toApiError(err: unknown): ApiError {
  if (err instanceof RepositoryNotFoundError) {
    return new ApiError(404, 'not_found', err.message);
  }
  if (err instanceof ApiError) return err;
  console.error('[profile] unexpected repository error:', err);
  return new ApiError(500, 'internal_error', 'Something went wrong updating your profile.');
}

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

  router.post(
    '/assets',
    validateBody(assetInputSchema),
    asyncHandler(async (req: Request<unknown, Asset, AssetInputBody>, res) => {
      const asset = await repo.addAsset(req.body);
      res.status(201).json(asset);
    })
  );

  router.patch(
    '/assets/:id',
    validateParams(idParamSchema),
    validateBody(assetUpdateSchema),
    asyncHandler(async (req: Request<unknown, Asset, AssetUpdateBody>, res) => {
      try {
        const { id } = req.params as { id: string };
        const asset = await repo.updateAsset(id, req.body);
        res.json(asset);
      } catch (err) {
        throw toApiError(err);
      }
    })
  );

  router.delete(
    '/assets/:id',
    validateParams(idParamSchema),
    asyncHandler(async (req, res) => {
      try {
        const { id } = req.params as { id: string };
        await repo.deleteAsset(id);
        res.status(204).send();
      } catch (err) {
        throw toApiError(err);
      }
    })
  );

  router.get('/liabilities', asyncHandler(async (_req, res) => {
    const profile = await repo.getProfile();
    const body: LiabilitiesResponse = {
      liabilities: profile.liabilities,
      total: profile.liabilities.reduce((s, l) => s + l.outstandingAmount, 0),
    };
    res.json(body);
  }));

  router.post(
    '/liabilities',
    validateBody(liabilityInputSchema),
    asyncHandler(async (req: Request<unknown, Liability, LiabilityInputBody>, res) => {
      const liability = await repo.addLiability(req.body);
      res.status(201).json(liability);
    })
  );

  router.patch(
    '/liabilities/:id',
    validateParams(idParamSchema),
    validateBody(liabilityUpdateSchema),
    asyncHandler(async (req: Request<unknown, Liability, LiabilityUpdateBody>, res) => {
      try {
        const { id } = req.params as { id: string };
        const liability = await repo.updateLiability(id, req.body);
        res.json(liability);
      } catch (err) {
        throw toApiError(err);
      }
    })
  );

  router.delete(
    '/liabilities/:id',
    validateParams(idParamSchema),
    asyncHandler(async (req, res) => {
      try {
        const { id } = req.params as { id: string };
        await repo.deleteLiability(id);
        res.status(204).send();
      } catch (err) {
        throw toApiError(err);
      }
    })
  );

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
