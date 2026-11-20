import bcrypt from 'bcryptjs';
import type { CookieOptions, Request, Response } from 'express';
import { isProduction } from '../config/env.js';
import { AUTH_COOKIE } from '../middleware/auth.js';
import { UserModel, type UserDocument } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { signToken } from '../utils/jwt.js';

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

// In production the frontend (Vercel) and API (Heroku) are on different sites, so the cookie must be SameSite=None.
const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/',
};

const toPublicUser = (user: UserDocument) => ({ id: user.id as string, name: user.name, email: user.email });

const sendAuth = (res: Response, user: UserDocument, status = 200) => {
  res.cookie(AUTH_COOKIE, signToken(user.id as string), { ...cookieOptions, maxAge: COOKIE_MAX_AGE });
  res.status(status).json({ success: true, message: 'OK', data: toPublicUser(user) });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body as { name: string; email: string; password: string };

  if (await UserModel.exists({ email })) {
    throw new ApiError(409, 'Nalog sa ovim emailom već postoji');
  }

  const user = await UserModel.create({ name, email, password: await bcrypt.hash(password, 12) });
  sendAuth(res, user, 201);
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string };

  const user = await UserModel.findOne({ email }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, 'Pogrešan email ili lozinka');
  }

  sendAuth(res, user);
};

export const logout = (_req: Request, res: Response): void => {
  res.clearCookie(AUTH_COOKIE, cookieOptions);
  res.json({ success: true, message: 'Odjavljeni ste' });
};

export const me = async (req: Request, res: Response): Promise<void> => {
  const user = await UserModel.findById(req.userId);
  if (!user) {
    throw new ApiError(401, 'Niste prijavljeni');
  }
  res.json({ success: true, message: 'OK', data: toPublicUser(user) });
};
