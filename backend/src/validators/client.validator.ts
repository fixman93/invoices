import { z } from 'zod';
import { partyShape } from './common.js';

export const clientSchema = z.object(partyShape);
export const clientUpdateSchema = clientSchema.partial();
