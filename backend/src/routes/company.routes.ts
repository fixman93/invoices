import { Router } from 'express';
import {
  addStamp,
  createCompany,
  deleteCompany,
  deleteLogo,
  deleteStamp,
  getCompanyById,
  listCompanies,
  updateCompany,
  uploadLogo,
} from '../controllers/company.controller.js';
import { loadCompany } from '../middleware/loadCompany.js';
import { imageUpload } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { companySchema, companyUpdateSchema } from '../validators/company.validator.js';
import clientRoutes from './client.routes.js';
import invoiceRoutes from './invoice.routes.js';
import productRoutes from './product.routes.js';

const router = Router();

router.get('/', listCompanies);
router.post('/', validate(companySchema), createCompany);

// Everything below requires the company to belong to the current user.
router.use('/:companyId', loadCompany);

router.get('/:companyId', getCompanyById);
router.patch('/:companyId', validate(companyUpdateSchema), updateCompany);
router.delete('/:companyId', deleteCompany);

router.post('/:companyId/logo', imageUpload.single('file'), uploadLogo);
router.delete('/:companyId/logo', deleteLogo);
router.post('/:companyId/stamps', imageUpload.single('file'), addStamp);
router.delete('/:companyId/stamps/:stampId', deleteStamp);

router.use('/:companyId/products', productRoutes);
router.use('/:companyId/clients', clientRoutes);
router.use('/:companyId/invoices', invoiceRoutes);

export default router;
