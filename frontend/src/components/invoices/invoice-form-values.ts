import type { Company, Invoice } from '@/types/models'
import { addDays, toDateInput } from '@/utils/format'

export interface Line {
  key: string
  productId: string
  quantity: string
  /** Set only for lines loaded from an existing invoice, so editing keeps the price it was issued with. */
  lockedPrice?: number
  lockedVatRate?: number
  /** Name stored on the invoice, shown if the product was deleted since. */
  storedName?: string
}

export interface InvoiceFormValues {
  clientId: string
  issueDate: string
  serviceDate: string
  dueDate: string
  placeOfIssue: string
  notes: string
  issuedBy: string
  stampIds: string[]
  lines: Line[]
}

export const newLine = (): Line => ({ key: crypto.randomUUID(), productId: '', quantity: '1' })

export const initialValues = (company: Company, invoice?: Invoice): InvoiceFormValues => {
  if (invoice) {
    return {
      clientId: invoice.client ?? '',
      issueDate: toDateInput(invoice.issueDate),
      serviceDate: toDateInput(invoice.serviceDate),
      dueDate: toDateInput(invoice.dueDate),
      placeOfIssue: invoice.placeOfIssue,
      notes: invoice.notes,
      issuedBy: invoice.issuedBy ?? '',
      stampIds: invoice.stampIds,
      lines: invoice.items.map((item) => ({
        key: item._id,
        productId: item.product ?? '',
        quantity: String(item.quantity),
        lockedPrice: item.unitPrice,
        lockedVatRate: item.vatRate,
        storedName: item.name,
      })),
    }
  }

  const today = toDateInput(new Date())
  return {
    clientId: '',
    issueDate: today,
    serviceDate: today,
    dueDate: addDays(today, company.paymentTermDays),
    placeOfIssue: company.city,
    notes: company.invoiceNote,
    issuedBy: company.issuedBy ?? '',
    stampIds: company.stamps.map((stamp) => stamp._id),
    lines: [newLine()],
  }
}

