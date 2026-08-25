import type { NextFunction, Request, Response } from 'express';
import type { ApiErrorResponse } from '@fintech/shared';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: Array<{ path: string; message: string }>;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: Array<{ path: string; message: string }>
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function notFoundHandler(req: Request, res: Response) {
  const body: ApiErrorResponse = {
    error: 'not_found',
    message: `No route matches ${req.method} ${req.path}`,
  };
  res.status(404).json(body);
}

// Express 5 recognizes a 4-arg function as an error handler by arity —
// unused params must stay in the signature.
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ApiError) {
    const body: ApiErrorResponse = {
      error: err.code,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    };
    res.status(err.status).json(body);
    return;
  }

  console.error('[unhandled error]', err);
  const body: ApiErrorResponse = {
    error: 'internal_error',
    message: 'Something went wrong on our end.',
  };
  res.status(500).json(body);
}
