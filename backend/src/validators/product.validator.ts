import { z } from 'zod';
import { optionalText } from './common.js';

export const productSchema = z.object({
  name: z.string().trim().min(1, 'Naziv je obavezan').max(200),
  description: optionalText(1000),
  code: optionalText(50),
  unit: z.string().trim().min(1).max(20).optional().default('kom'),
  price: z.coerce.number().min(0, 'Cijena ne može biti negativna'),
  vatRate: z.coerce.number().min(0).max(100).nullable().optional().default(null),
});

export const productUpdateSchema = productSchema.partial();
