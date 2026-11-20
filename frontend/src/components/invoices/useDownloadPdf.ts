import { useState } from 'react'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/services/api'
import { invoiceService } from '@/services/invoice.service'

/** Download / preview helpers with per-invoice loading state. */
export const useDownloadPdf = (companyId: string) => {
  const [pendingId, setPendingId] = useState<string | null>(null)

  const run = async (invoiceId: string, action: 'download' | 'preview') => {
    setPendingId(invoiceId)
    try {
      if (action === 'download') await invoiceService.downloadPdf(companyId, invoiceId)
      else await invoiceService.previewPdf(companyId, invoiceId)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setPendingId(null)
    }
  }

  return {
    pendingId,
    download: (invoiceId: string) => run(invoiceId, 'download'),
    preview: (invoiceId: string) => run(invoiceId, 'preview'),
  }
}
