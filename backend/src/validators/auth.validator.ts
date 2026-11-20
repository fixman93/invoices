import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Ime mora imati bar 2 karaktera').max(100),
  email: z.email('Neispravan email').trim().toLowerCase().max(254),
  password: z.string().min(8, 'Lozinka mora imati bar 8 karaktera').max(128),
});

export const loginSchema = z.object({
  email: z.email('Neispravan email').trim().toLowerCase(),
  password: z.string().min(1, 'Lozinka je obavezna'),
});
