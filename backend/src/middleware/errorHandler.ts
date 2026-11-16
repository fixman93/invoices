import type { NextFunction, Request, Response } from 'express';
import { isProduction } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const message =
    err instanceof ApiError || !isProduction
      ? err instanceof Error
        ? err.message
        : 'Unknown error'
      : 'Internal server error';

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({ success: false, message });
};
