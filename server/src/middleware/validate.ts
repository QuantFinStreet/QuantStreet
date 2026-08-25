import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { ApiError } from './errors.js';

function formatIssues(issues: { path: PropertyKey[]; message: string }[]) {
  return issues.map((issue) => ({
    path: issue.path.join('.') || '(root)',
    message: issue.message,
  }));
}

export function validateBody<T>(schema: ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(
        new ApiError(
          400,
          'validation_error',
          'Request body failed validation.',
          formatIssues(result.error.issues)
        )
      );
      return;
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery<T>(schema: ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      next(
        new ApiError(
          400,
          'validation_error',
          'Query parameters failed validation.',
          formatIssues(result.error.issues)
        )
      );
      return;
    }
    // Express 5 makes req.query a getter-only property; stash the parsed
    // value separately instead of reassigning req.query.
    (req as Request & { validatedQuery?: T }).validatedQuery = result.data;
    next();
  };
}
