import { ChevronLeft, Download, ExternalLink, Loader2, Pencil, Trash2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ErrorState } from '@/components/ErrorState'
import { InvoiceTotals } from '@/components/invoices/InvoiceTotals'
import { useDownloadPdf } from '@/components/invoices/useDownloadPdf'
import { InvoiceStatusBadge } from '@/components/InvoiceStatusBadge'
import { LoadingState } from '@/components/LoadingState'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useInvoice, useInvoiceMutations } from '@/hooks/useInvoices'
import { useCurrentCompany } from '@/layouts/company-context'
import { getApiErrorMessage } from '@/services/api'
import { INVOICE_STATUSES, type InvoiceParty, type InvoiceStatus } from '@/types/models'
import { formatDate, formatMoney, formatNumber } from '@/utils/format'
import { STATUS_LABELS } from '@/utils/invoice'

const PartyBlock = ({ title, party }: { title: string; party: InvoiceParty }) => (
  <div className="space-y-1 text-sm">
    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{title}</p>
    <p className="text-base font-semibold">{party.name}</p>
    {party.address && <p>{party.address}</p>}
    {(party.postalCode || party.city) && <p>{[party.postalCode, party.city].filter(Boolean).join(' ')}</p>}
    {party.country && <p>{party.country}</p>}
    {party.taxId && <p>PIB: {party.taxId}</p>}
    {party.registrationNumber && <p>Matični broj: {party.registrationNumber}</p>}
    {party.vatNumber && <p>PDV broj: {party.vatNumber}</p>}
  </div>
)

const InvoiceDetailPage = () => {
  const company = useCurrentCompany()
  const { invoiceId = '' } = useParams()
  const navigate = useNavigate()
  const { data: invoice, isLoading, error, refetch } = useInvoice(company._id, invoiceId)
  const { setStatus, remove } = useInvoiceMutations(company._id)
  const pdf = useDownloadPdf(company._id)

  if (isLoading) return <LoadingState />
  if (error || !invoice) return <ErrorState error={error ?? new Error('Faktura nije pronađena')} onRetry={() => void refetch()} />

  const stamps = company.stamps.filter((stamp) => invoice.stampIds.includes(stamp._id))
  const pdfPending = pdf.pendingId === invoice._id

  return (
    <div className="space-y-6">
      <Link
        to={`/companies/${company._id}/invoices`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Sve fakture
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">Faktura {invoice.number}</h2>
          <InvoiceStatusBadge status={invoice.status} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={invoice.status}
            onValueChange={(status) =>
              setStatus.mutate(
                { id: invoice._id, status: status as InvoiceStatus },
                {
                  onSuccess: () => toast.success('Status je promijenjen'),
                  onError: (err) => toast.error(getApiErrorMessage(err)),
                },
              )
            }
          >
            <SelectTrigger className="w-36" aria-label="Status fakture">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INVOICE_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" asChild>
            <Link to="edit">
              <Pencil />
              Izmijeni
            </Link>
          </Button>
          <Button variant="outline" disabled={pdfPending} onClick={() => void pdf.preview(invoice._id)}>
            <ExternalLink />
            Otvori PDF
          </Button>
          <Button disabled={pdfPending} onClick={() => void pdf.download(invoice._id)}>
            {pdfPending ? <Loader2 className="animate-spin" /> : <Download />}
            Preuzmi PDF
          </Button>
          <ConfirmDialog
            trigger={
              <Button variant="ghost" size="icon" aria-label="Obriši fakturu">
                <Trash2 />
              </Button>
            }
            title={`Obrisati fakturu ${invoice.number}?`}
            description="Faktura će biti trajno obrisana. Broj fakture se neće ponovo koristiti."
            onConfirm={() =>
              remove.mutate(invoice._id, {
                onSuccess: () => {
                  toast.success('Faktura je obrisana')
                  navigate(`/companies/${company._id}/invoices`, { replace: true })
                },
                onError: (err) => toast.error(getApiErrorMessage(err)),
              })
            }
          />
        </div>
      </div>

      <Card>
        <CardContent className="space-y-8 py-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            {company.logo ? <img src={company.logo.url} alt="Logo" className="h-16 max-w-48 object-contain" /> : <span />}
            <div className="text-right">
              <p className="font-heading text-2xl font-bold">FAKTURA</p>
              <p className="text-sm text-muted-foreground">
                Broj: <span className="font-semibold text-foreground">{invoice.number}</span>
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <PartyBlock title="Izdavalac" party={invoice.seller} />
            <PartyBlock title="Kupac" party={invoice.buyer} />
          </div>

          <dl className="grid grid-cols-2 gap-4 rounded-lg border bg-muted/40 p-4 text-sm sm:grid-cols-5">
            {[
              ['Datum izdavanja', formatDate(invoice.issueDate)],
              ['Datum prometa', formatDate(invoice.serviceDate ?? invoice.issueDate)],
              ['Rok plaćanja', formatDate(invoice.dueDate)],
              ['Mjesto izdavanja', invoice.placeOfIssue || '—'],
              ['Valuta', invoice.currency],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="font-semibold">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="overflow-x-auto rounded-lg border">
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Naziv</TableHead>
                  <TableHead>Jed.</TableHead>
                  <TableHead className="text-right">Kol.</TableHead>
                  <TableHead className="text-right">Cijena / jed.</TableHead>
                  <TableHead className="text-right">Iznos bez PDV</TableHead>
                  <TableHead className="text-right">PDV %</TableHead>
                  <TableHead className="text-right">Iznos PDV</TableHead>
                  <TableHead className="text-right">Ukupno</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item, index) => (
                  <TableRow key={item._id}>
                    <TableCell className="text-muted-foreground">{index + 1}.</TableCell>
                    <TableCell className="max-w-64 whitespace-normal">
                      <p className="font-medium">{item.name}</p>
                      {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                    </TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatNumber(item.quantity)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatMoney(item.unitPrice)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatMoney(item.netAmount)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatNumber(item.vatRate)}%</TableCell>
                    <TableCell className="text-right tabular-nums">{formatMoney(item.vatAmount)}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{formatMoney(item.totalAmount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <InvoiceTotals
            items={invoice.items}
            subtotal={invoice.subtotal}
            vatTotal={invoice.vatTotal}
            total={invoice.total}
            currency={invoice.currency}
          />

          <div className="grid gap-6 text-sm sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Podaci za plaćanje</p>
              {invoice.seller.bankAccount && (
                <p>
                  Žiro račun: {invoice.seller.bankAccount}
                  {invoice.seller.bankName && ` (${invoice.seller.bankName})`}
                </p>
              )}
              <p>Poziv na broj: {invoice.number}</p>
            </div>
            {invoice.notes && (
              <div className="space-y-1">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Napomena</p>
                <p className="whitespace-pre-line">{invoice.notes}</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-end justify-between gap-6 pt-6">
            <div className="w-48 text-center">
              {invoice.issuedBy && <p className="mb-1 truncate text-sm">{invoice.issuedBy}</p>}
              <div className="border-t pt-1 text-xs text-muted-foreground">Fakturu izdao</div>
            </div>
            <div className="flex flex-wrap justify-end gap-3">
              {stamps.map((stamp) => (
                <img key={stamp._id} src={stamp.url} alt={stamp.name} className="h-24 max-w-32 object-contain" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default InvoiceDetailPage
