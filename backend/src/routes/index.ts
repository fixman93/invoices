import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import authRoutes from './auth.routes.js';
import companyRoutes from './company.routes.js';
import healthRoutes from './health.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/companies', requireAuth, companyRoutes);

export default router;
