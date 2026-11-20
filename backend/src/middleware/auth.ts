import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { verifyToken } from '../utils/jwt.js';

export const AUTH_COOKIE = 'token';

export const requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const cookieToken = req.cookies?.[AUTH_COOKIE] as string | undefined;
  const header = req.headers.authorization;
  const bearer = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

  const payload = verifyToken(cookieToken ?? bearer ?? '');
  if (!payload) {
    throw new ApiError(401, 'Niste prijavljeni');
  }

  req.userId = payload.sub;
  next();
};
