import type { CompanyDocument } from '../models/Company.js';

declare global {
  namespace Express {
    interface Request {
      /** Set by `requireAuth`. */
      userId?: string;
      /** Set by `loadCompany` – the company owned by the current user. */
      company?: CompanyDocument;
    }
  }
}

export {};
