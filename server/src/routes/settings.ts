import { Router, type Request } from 'express';
import type { FinancialProfileRepository } from '../data/financialProfileRepository.js';
import { profileToCSV } from '../lib/export.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validateBody } from '../middleware/validate.js';
import { ApiError } from '../middleware/errors.js';
import { exportRequestSchema, type ExportRequestInput } from '../schemas/export.js';

export function settingsRouter(repo: FinancialProfileRepository): Router {
  const router = Router();

  router.post(
    '/export',
    validateBody(exportRequestSchema),
    asyncHandler(async (req: Request<unknown, unknown, ExportRequestInput>, res) => {
      const profile = await repo.getProfile();
      const { format } = req.body;

      if (format === 'json') {
        res.setHeader('Content-Disposition', 'attachment; filename="financial-profile.json"');
        res.json(profile);
        return;
      }

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="financial-profile.csv"');
        res.send(profileToCSV(profile));
        return;
      }

      // PDF export is deferred — no PDF generation library is wired up yet.
      // Rather than fake a PDF, fail loudly so the client can surface a
      // clear "not available yet" state instead of a silently broken file.
      throw new ApiError(
        501,
        'not_implemented',
        'PDF export is not implemented yet. Use "csv" or "json".'
      );
    })
  );

  return router;
}
