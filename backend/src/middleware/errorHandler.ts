import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import { ZodError } from 'zod';
import { isProduction } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

interface ErrorBody {
  success: false;
  message: string;
  errors?: { path: string; message: string }[];
}

const toResponse = (err: unknown): { status: number; body: ErrorBody } => {
  if (err instanceof ApiError) {
    return { status: err.statusCode, body: { success: false, message: err.message } };
  }

  if (err instanceof ZodError) {
    const errors = err.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }));
    return { status: 400, body: { success: false, message: errors[0]?.message ?? 'Neispravni podaci', errors } };
  }

  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'Slika je prevelika (najviše 2 MB)' : err.message;
    return { status: 400, body: { success: false, message } };
  }

  if (err instanceof mongoose.Error.CastError) {
    return { status: 400, body: { success: false, message: 'Neispravan ID' } };
  }

  if (err instanceof mongoose.Error.ValidationError) {
    return { status: 400, body: { success: false, message: err.message } };
  }

  if (typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000) {
    return { status: 409, body: { success: false, message: 'Zapis sa ovim podacima već postoji' } };
  }

  if (typeof err === 'object' && err !== null && (err as { type?: string }).type === 'entity.parse.failed') {
    return { status: 400, body: { success: false, message: 'Neispravan JSON' } };
  }

  return {
    status: 500,
    body: {
      success: false,
      message: !isProduction && err instanceof Error ? err.message : 'Došlo je do greške na serveru',
    },
  };
};

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
  const { status, body } = toResponse(err);
  if (status >= 500) {
    console.error(err);
  }
  res.status(status).json(body);
};
