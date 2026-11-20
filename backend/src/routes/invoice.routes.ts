import { Router } from 'express';
import {
  createInvoice,
  deleteInvoice,
  downloadInvoicePdf,
  getInvoice,
  listInvoices,
  updateInvoice,
  updateInvoiceStatus,
} from '../controllers/invoice.controller.js';
import { validate } from '../middleware/validate.js';
import { invoiceSchema, invoiceStatusSchema } from '../validators/invoice.validator.js';

const router = Router({ mergeParams: true });

router.get('/', listInvoices);
router.post('/', validate(invoiceSchema), createInvoice);
router.get('/:invoiceId', getInvoice);
router.put('/:invoiceId', validate(invoiceSchema), updateInvoice);
router.patch('/:invoiceId/status', validate(invoiceStatusSchema), updateInvoiceStatus);
router.delete('/:invoiceId', deleteInvoice);
router.get('/:invoiceId/pdf', downloadInvoicePdf);

export default router;
