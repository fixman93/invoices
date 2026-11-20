import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';

/** Validates and normalises `req.body` with the given Zod schema. Errors are handled by `errorHandler`. */
export const validate =
  (schema: ZodType) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    req.body = schema.parse(req.body ?? {});
    next();
  };
