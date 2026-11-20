import type { Request, Response } from 'express';
import { getDbStatus } from '../config/db.js';

export const getHealth = (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'Backend API is running!',
    database: getDbStatus(),
  });
};
