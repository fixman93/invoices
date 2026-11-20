import type { CompanyInput, Party } from '@/types/models'

export const emptyParty: Party = {
  name: '',
  address: '',
  city: '',
  postalCode: '',
  country: '',
  taxId: '',
  registrationNumber: '',
  vatNumber: '',
  email: '',
  phone: '',
}

export const emptyCompany: CompanyInput = {
  ...emptyParty,
  website: '',
  bankName: '',
  bankAccount: '',
  vatRate: 21,
  currency: 'EUR',
  paymentTermDays: 15,
  invoicePrefix: '',
  invoiceNote: '',
  issuedBy: '',
}

/** Copies only the keys of `template` from `source` (e.g. strips `_id`, `logo`… from a full document). */
export const pickFields = <T extends object>(template: T, source: Partial<T>): T => {
  const result = { ...template }
  for (const key of Object.keys(template) as (keyof T)[]) {
    result[key] = source[key] ?? template[key]
  }
  return result
}

export const toCompanyInput = (source: CompanyInput): CompanyInput => pickFields(emptyCompany, source)
