import { z } from 'zod';
import { CURRENCIES } from '../models/Company.js';
import { optionalText, partyShape } from './common.js';

export const companySchema = z.object({
  ...partyShape,
  website: optionalText(200),
  bankName: optionalText(100),
  bankAccount: optionalText(100),
  vatRate: z.coerce.number().min(0).max(100),
  currency: z.enum(CURRENCIES),
  paymentTermDays: z.coerce.number().int().min(0).max(365).optional().default(15),
  invoicePrefix: optionalText(20),
  invoiceNote: optionalText(2000),
  issuedBy: optionalText(100),
});

export const companyUpdateSchema = companySchema.partial();

export const stampNameSchema = z.object({
  name: z.string().trim().max(100).optional().default(''),
});
