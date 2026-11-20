import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';

interface TokenPayload {
  sub: string;
}

export const signToken = (userId: string): string =>
  jwt.sign({ sub: userId } satisfies TokenPayload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'],
  });

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    return typeof payload === 'object' && typeof payload.sub === 'string' ? { sub: payload.sub } : null;
  } catch {
    return null;
  }
};
