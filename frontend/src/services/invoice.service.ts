import type { ApiResponse } from '@/types/api'
import type { Invoice, InvoiceInput, InvoiceListItem, InvoiceStatus } from '@/types/models'
import { api } from './api'

const base = (companyId: string) => `/companies/${companyId}/invoices`

const fetchPdf = async (companyId: string, id: string) => {
  const res = await api.get<Blob>(`${base(companyId)}/${id}/pdf`, { responseType: 'blob' })
  const disposition = String(res.headers['content-disposition'] ?? '')
  const fileName = /filename="([^"]+)"/.exec(disposition)?.[1] ?? 'faktura.pdf'
  return { blob: res.data, fileName }
}

export const invoiceService = {
  list: async (companyId: string) => (await api.get<ApiResponse<InvoiceListItem[]>>(base(companyId))).data.data,
  get: async (companyId: string, id: string) =>
    (await api.get<ApiResponse<Invoice>>(`${base(companyId)}/${id}`)).data.data,
  create: async (companyId: string, body: InvoiceInput) =>
    (await api.post<ApiResponse<Invoice>>(base(companyId), body)).data.data,
  update: async (companyId: string, id: string, body: InvoiceInput) =>
    (await api.put<ApiResponse<Invoice>>(`${base(companyId)}/${id}`, body)).data.data,
  setStatus: async (companyId: string, id: string, status: InvoiceStatus) =>
    (await api.patch<ApiResponse<Invoice>>(`${base(companyId)}/${id}/status`, { status })).data.data,
  remove: async (companyId: string, id: string) => {
    await api.delete(`${base(companyId)}/${id}`)
  },

  downloadPdf: async (companyId: string, id: string) => {
    const { blob, fileName } = await fetchPdf(companyId, id)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  },

  /** Opens the PDF in a new tab. The tab is opened synchronously so popup blockers allow it. */
  previewPdf: async (companyId: string, id: string) => {
    const tab = window.open('', '_blank')
    try {
      const { blob } = await fetchPdf(companyId, id)
      const url = URL.createObjectURL(blob)
      if (tab) tab.location.href = url
      else window.location.href = url
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch (error) {
      tab?.close()
      throw error
    }
  },
}
