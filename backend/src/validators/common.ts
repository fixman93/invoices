import { isValidObjectId } from 'mongoose';
import { z } from 'zod';

export const objectId = z.string().refine((value) => isValidObjectId(value), 'Neispravan ID');

const optionalText = (max = 200) => z.string().trim().max(max).optional().default('');

/** Fields shared by company, client and invoice snapshots. */
export const partyShape = {
  name: z.string().trim().min(1, 'Naziv je obavezan').max(200),
  address: optionalText(),
  city: optionalText(100),
  postalCode: optionalText(20),
  country: optionalText(100),
  taxId: optionalText(50),
  registrationNumber: optionalText(50),
  vatNumber: optionalText(50),
  email: z.union([z.literal(''), z.email('Neispravan email')]).optional().default(''),
  phone: optionalText(50),
};

export { optionalText };
