import { ChevronLeft } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ErrorState } from '@/components/ErrorState'
import { InvoiceForm } from '@/components/invoices/InvoiceForm'
import { initialValues } from '@/components/invoices/invoice-form-values'
import { LoadingState } from '@/components/LoadingState'
import { PageHeader } from '@/components/PageHeader'
import { useClients } from '@/hooks/useClients'
import { useInvoice, useInvoiceMutations } from '@/hooks/useInvoices'
import { useProducts } from '@/hooks/useProducts'
import { useCurrentCompany } from '@/layouts/company-context'
import { getApiErrorMessage } from '@/services/api'
import type { InvoiceInput } from '@/types/models'

const InvoiceEditorPage = () => {
  const company = useCurrentCompany()
  const { invoiceId } = useParams()
  const navigate = useNavigate()

  const products = useProducts(company._id)
  const clients = useClients(company._id)
  const invoice = useInvoice(company._id, invoiceId)
  const { create, update } = useInvoiceMutations(company._id)

  const queries = [products, clients, ...(invoiceId ? [invoice] : [])]
  const failed = queries.find((q) => q.error)

  if (failed) return <ErrorState error={failed.error} onRetry={() => queries.forEach((q) => void q.refetch())} />
  if (queries.some((q) => q.isLoading) || !products.data || !clients.data || (invoiceId && !invoice.data)) {
    return <LoadingState />
  }

  const handleSubmit = (input: InvoiceInput) => {
    const options = {
      onSuccess: (saved: { _id: string; number: string }) => {
        toast.success(invoiceId ? 'Faktura je sačuvana' : `Faktura ${saved.number} je kreirana`)
        navigate(`/companies/${company._id}/invoices/${saved._id}`)
      },
      onError: (error: unknown) => toast.error(getApiErrorMessage(error)),
    }
    if (invoiceId) update.mutate({ id: invoiceId, body: input }, options)
    else create.mutate(input, options)
  }

  return (
    <div className="space-y-6">
      <Link
        to={invoiceId ? `/companies/${company._id}/invoices/${invoiceId}` : `/companies/${company._id}/invoices`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Nazad
      </Link>
      <PageHeader
        title={invoiceId ? `Izmjena fakture ${invoice.data?.number ?? ''}` : 'Nova faktura'}
        description={invoiceId ? undefined : 'Broj fakture se dodjeljuje automatski pri čuvanju.'}
      />
      <InvoiceForm
        key={invoiceId ?? 'new'}
        company={company}
        products={products.data}
        clients={clients.data}
        initial={initialValues(company, invoice.data)}
        isEdit={Boolean(invoiceId)}
        isSubmitting={create.isPending || update.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default InvoiceEditorPage
