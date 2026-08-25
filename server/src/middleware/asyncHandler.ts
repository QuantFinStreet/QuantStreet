import type { NextFunction, Request, Response } from 'express';

type Handler = (req: Request, res: Response, next: NextFunction) => unknown | Promise<unknown>;

// Express 5 auto-forwards rejected promises from async handlers, but this
// keeps route handlers safe under Express 4 too and makes intent explicit.
export function asyncHandler(fn: Handler) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
