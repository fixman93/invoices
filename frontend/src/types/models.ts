export const CURRENCIES = ['EUR', 'RSD', 'BAM', 'USD', 'CHF', 'GBP'] as const
export type Currency = (typeof CURRENCIES)[number]

export const INVOICE_STATUSES = ['unpaid', 'paid', 'cancelled'] as const
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number]

export interface User {
  id: string
  name: string
  email: string
}

export interface Party {
  name: string
  address: string
  city: string
  postalCode: string
  country: string
  taxId: string
  registrationNumber: string
  vatNumber: string
  email: string
  phone: string
}

export interface CompanyImage {
  _id: string
  key: string
  url: string
  name: string
}

export interface CompanySettings extends Party {
  website: string
  bankName: string
  bankAccount: string
  vatRate: number
  currency: Currency
  paymentTermDays: number
  invoicePrefix: string
  invoiceNote: string
  issuedBy: string
}

export interface Company extends CompanySettings {
  _id: string
  logo: CompanyImage | null
  stamps: CompanyImage[]
  createdAt: string
}

export type CompanyInput = CompanySettings

export interface Product {
  _id: string
  name: string
  description: string
  code: string
  unit: string
  /** Unit price without VAT. */
  price: number
  /** `null` = company default VAT rate. */
  vatRate: number | null
}

export type ProductInput = Omit<Product, '_id'>

export interface Client extends Party {
  _id: string
}

export type ClientInput = Party

export interface InvoiceItem {
  _id: string
  product: string | null
  name: string
  description: string
  code: string
  unit: string
  quantity: number
  unitPrice: number
  vatRate: number
  netAmount: number
  vatAmount: number
  totalAmount: number
}

export interface InvoiceParty extends Party {
  bankName?: string
  bankAccount?: string
  website?: string
}

export interface Invoice {
  _id: string
  number: string
  status: InvoiceStatus
  client: string | null
  issueDate: string
  serviceDate: string | null
  dueDate: string | null
  placeOfIssue: string
  currency: Currency
  seller: InvoiceParty
  buyer: InvoiceParty
  items: InvoiceItem[]
  subtotal: number
  vatTotal: number
  total: number
  notes: string
  issuedBy: string
  stampIds: string[]
  createdAt: string
}

export type InvoiceListItem = Pick<
  Invoice,
  '_id' | 'number' | 'status' | 'issueDate' | 'dueDate' | 'currency' | 'subtotal' | 'vatTotal' | 'total'
> & { buyer: { name: string } }

export interface InvoiceItemInput {
  productId: string
  quantity: number
  unitPrice?: number
  vatRate?: number
}

export interface InvoiceInput {
  clientId: string
  issueDate: string
  serviceDate: string | null
  dueDate: string | null
  placeOfIssue: string
  notes: string
  issuedBy: string
  stampIds: string[]
  items: InvoiceItemInput[]
}
