import { Download, FileText, Loader2, Plus } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { useDownloadPdf } from '@/components/invoices/useDownloadPdf'
import { InvoiceStatusBadge } from '@/components/InvoiceStatusBadge'
import { LoadingState } from '@/components/LoadingState'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useInvoices } from '@/hooks/useInvoices'
import { useCurrentCompany } from '@/layouts/company-context'
import { formatDate, formatMoney } from '@/utils/format'

const InvoicesPage = () => {
  const company = useCurrentCompany()
  const navigate = useNavigate()
  const { data: invoices, isLoading, error, refetch } = useInvoices(company._id)
  const pdf = useDownloadPdf(company._id)

  const newButton = (
    <Button asChild>
      <Link to="new">
        <Plus />
        Nova faktura
      </Link>
    </Button>
  )

  return (
    <div className="space-y-6">
      <PageHeader title="Fakture" actions={newButton} />

      {isLoading && <LoadingState />}
      {error && <ErrorState error={error} onRetry={() => void refetch()} />}
      {invoices?.length === 0 && (
        <EmptyState
          icon={FileText}
          title="Još nema faktura"
          description="Napravite prvu fakturu od proizvoda i kupaca ove firme."
          action={newButton}
        />
      )}

      {invoices && invoices.length > 0 && (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Broj</TableHead>
                <TableHead>Kupac</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Rok plaćanja</TableHead>
                <TableHead className="text-right">Ukupno</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice._id} className="cursor-pointer" onClick={() => navigate(invoice._id)}>
                  <TableCell className="font-medium">
                    <Link to={invoice._id} onClick={(e) => e.stopPropagation()} className="hover:underline">
                      {invoice.number}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-56 truncate">{invoice.buyer.name}</TableCell>
                  <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                  <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{formatMoney(invoice.total, invoice.currency)}</TableCell>
                  <TableCell>
                    <InvoiceStatusBadge status={invoice.status} />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label={`Preuzmi PDF ${invoice.number}`}
                      disabled={pdf.pendingId === invoice._id}
                      onClick={(e) => {
                        e.stopPropagation()
                        void pdf.download(invoice._id)
                      }}
                    >
                      {pdf.pendingId === invoice._id ? <Loader2 className="animate-spin" /> : <Download />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

export default InvoicesPage
