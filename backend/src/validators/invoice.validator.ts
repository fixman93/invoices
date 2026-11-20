import { z } from 'zod';
import { INVOICE_STATUSES } from '../models/Invoice.js';
import { objectId } from './common.js';

const dateInput = z.coerce.date();

export const invoiceItemInputSchema = z.object({
  productId: objectId,
  quantity: z.coerce.number().positive('Količina mora biti veća od 0').max(1_000_000),
  /** Optional – defaults to the current product price. Used to keep the original price when editing. */
  unitPrice: z.coerce.number().min(0).optional(),
  /** Optional – defaults to the product / company VAT rate. */
  vatRate: z.coerce.number().min(0).max(100).optional(),
});

export const invoiceSchema = z.object({
  clientId: objectId,
  issueDate: dateInput,
  serviceDate: dateInput.nullable().optional().default(null),
  dueDate: dateInput.nullable().optional(),
  placeOfIssue: z.string().trim().max(100).optional().default(''),
  notes: z.string().trim().max(2000).optional(),
  issuedBy: z.string().trim().max(100).optional(),
  status: z.enum(INVOICE_STATUSES).optional().default('unpaid'),
  stampIds: z.array(objectId).optional(),
  items: z.array(invoiceItemInputSchema).min(1, 'Faktura mora imati bar jednu stavku').max(200),
});

export const invoiceStatusSchema = z.object({
  status: z.enum(INVOICE_STATUSES),
});

export type InvoiceInput = z.infer<typeof invoiceSchema>;
