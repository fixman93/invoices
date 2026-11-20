import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { invoiceService } from '@/services/invoice.service'
import type { Invoice, InvoiceInput, InvoiceStatus } from '@/types/models'

const listKey = (companyId: string) => ['companies', companyId, 'invoices'] as const
const detailKey = (companyId: string, id: string) => ['companies', companyId, 'invoices', id] as const

export const useInvoices = (companyId: string) =>
  useQuery({ queryKey: listKey(companyId), queryFn: () => invoiceService.list(companyId) })

export const useInvoice = (companyId: string, id: string | undefined) =>
  useQuery({
    queryKey: detailKey(companyId, id ?? ''),
    queryFn: () => invoiceService.get(companyId, id!),
    enabled: Boolean(id),
  })

export const useInvoiceMutations = (companyId: string) => {
  const queryClient = useQueryClient()
  const onSuccess = (invoice: Invoice) => {
    queryClient.setQueryData(detailKey(companyId, invoice._id), invoice)
    void queryClient.invalidateQueries({ queryKey: listKey(companyId), exact: true })
  }

  return {
    create: useMutation({ mutationFn: (body: InvoiceInput) => invoiceService.create(companyId, body), onSuccess }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: string; body: InvoiceInput }) => invoiceService.update(companyId, id, body),
      onSuccess,
    }),
    setStatus: useMutation({
      mutationFn: ({ id, status }: { id: string; status: InvoiceStatus }) => invoiceService.setStatus(companyId, id, status),
      onSuccess,
    }),
    remove: useMutation({
      mutationFn: (id: string) => invoiceService.remove(companyId, id),
      onSuccess: (_data, id) => {
        queryClient.removeQueries({ queryKey: detailKey(companyId, id) })
        void queryClient.invalidateQueries({ queryKey: listKey(companyId), exact: true })
      },
    }),
  }
}
