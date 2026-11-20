import { AlertTriangle, Loader2, Plus, Trash2, UserPlus } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ClientDialog } from '@/components/clients/ClientDialog'
import { FormField } from '@/components/FormField'
import { InvoiceTotals } from '@/components/invoices/InvoiceTotals'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import type { Client, Company, InvoiceInput, Product } from '@/types/models'
import { addDays, formatMoney, formatNumber } from '@/utils/format'
import { newLine, type InvoiceFormValues, type Line } from './invoice-form-values'
import { calculateLine, round2 } from '@/utils/invoice'

interface InvoiceFormProps {
  company: Company
  products: Product[]
  clients: Client[]
  initial: InvoiceFormValues
  isEdit: boolean
  isSubmitting: boolean
  onSubmit: (input: InvoiceInput) => void
}

export const InvoiceForm = ({ company, products, clients, initial, isEdit, isSubmitting, onSubmit }: InvoiceFormProps) => {
  const [values, setValues] = useState<InvoiceFormValues>(initial)
  const [dueTouched, setDueTouched] = useState(isEdit)
  const productMap = useMemo(() => new Map(products.map((p) => [p._id, p])), [products])

  const patch = (next: Partial<InvoiceFormValues>) => setValues((prev) => ({ ...prev, ...next }))
  const patchLine = (key: string, next: Partial<Line>) =>
    patch({ lines: values.lines.map((line) => (line.key === key ? { ...line, ...next } : line)) })

  // Live calculation – same rounding as the server.
  const rows = values.lines.map((line) => {
    const product = productMap.get(line.productId)
    const quantity = Number(line.quantity) || 0
    const unitPrice = line.lockedPrice ?? product?.price ?? 0
    const vatRate = line.lockedVatRate ?? product?.vatRate ?? company.vatRate
    return { line, product, quantity, unitPrice, vatRate, ...calculateLine(quantity, unitPrice, vatRate) }
  })
  const subtotal = round2(rows.reduce((sum, r) => sum + r.netAmount, 0))
  const vatTotal = round2(rows.reduce((sum, r) => sum + r.vatAmount, 0))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!values.clientId) {
      toast.error('Izaberite kupca')
      return
    }
    if (rows.length === 0) {
      toast.error('Dodajte bar jednu stavku')
      return
    }
    if (rows.some((r) => !r.product)) {
      toast.error('Izaberite proizvod u svakoj stavci')
      return
    }
    if (rows.some((r) => r.quantity <= 0)) {
      toast.error('Količina mora biti veća od 0')
      return
    }

    onSubmit({
      clientId: values.clientId,
      issueDate: values.issueDate,
      serviceDate: values.serviceDate || null,
      dueDate: values.dueDate || null,
      placeOfIssue: values.placeOfIssue,
      notes: values.notes,
      issuedBy: values.issuedBy,
      stampIds: values.stampIds,
      items: rows.map((r) => ({
        productId: r.line.productId,
        quantity: r.quantity,
        ...(r.line.lockedPrice !== undefined && { unitPrice: r.line.lockedPrice }),
        ...(r.line.lockedVatRate !== undefined && { vatRate: r.line.lockedVatRate }),
      })),
    })
  }

  const toggleStamp = (id: string, checked: boolean) =>
    patch({ stampIds: checked ? [...values.stampIds, id] : values.stampIds.filter((s) => s !== id) })

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Kupac i datumi</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField id="invoice-client" label="Kupac *" className="sm:col-span-2 lg:col-span-3">
            <div className="flex gap-2">
              <Select value={values.clientId} onValueChange={(clientId) => patch({ clientId })}>
                <SelectTrigger id="invoice-client" className="w-full">
                  <SelectValue placeholder={clients.length ? 'Izaberite kupca' : 'Nema kupaca – dodajte novog'} />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client._id} value={client._id}>
                      {client.name}
                      {client.city && <span className="text-muted-foreground"> · {client.city}</span>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ClientDialog
                companyId={company._id}
                onSaved={(client) => patch({ clientId: client._id })}
                trigger={
                  <Button type="button" variant="outline" className="shrink-0">
                    <UserPlus />
                    Novi kupac
                  </Button>
                }
              />
            </div>
          </FormField>

          <FormField id="invoice-issueDate" label="Datum izdavanja *">
            <Input
              id="invoice-issueDate"
              type="date"
              required
              value={values.issueDate}
              onChange={(e) => {
                const issueDate = e.target.value
                patch(dueTouched || !issueDate ? { issueDate } : { issueDate, dueDate: addDays(issueDate, company.paymentTermDays) })
              }}
            />
          </FormField>
          <FormField id="invoice-serviceDate" label="Datum prometa">
            <Input id="invoice-serviceDate" type="date" value={values.serviceDate} onChange={(e) => patch({ serviceDate: e.target.value })} />
          </FormField>
          <FormField id="invoice-dueDate" label="Rok plaćanja">
            <Input
              id="invoice-dueDate"
              type="date"
              value={values.dueDate}
              onChange={(e) => {
                setDueTouched(true)
                patch({ dueDate: e.target.value })
              }}
            />
          </FormField>
          <FormField id="invoice-place" label="Mjesto izdavanja">
            <Input id="invoice-place" maxLength={100} value={values.placeOfIssue} onChange={(e) => patch({ placeOfIssue: e.target.value })} />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stavke</CardTitle>
          <CardDescription>
            Cijene su bez PDV-a, u valuti {company.currency}. Iznosi se računaju automatski.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {products.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-6 text-center text-sm">
              <p className="text-muted-foreground">Ova firma još nema proizvoda.</p>
              <Button asChild variant="outline" size="sm">
                <Link to={`/companies/${company._id}/products`}>Dodaj proizvode</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border">
                <Table className="min-w-[860px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30%]">Proizvod</TableHead>
                      <TableHead className="w-24">Količina</TableHead>
                      <TableHead className="text-right">Cijena / jed.</TableHead>
                      <TableHead className="text-right">Iznos bez PDV</TableHead>
                      <TableHead className="text-right">PDV %</TableHead>
                      <TableHead className="text-right">Iznos PDV</TableHead>
                      <TableHead className="text-right">Ukupno</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map(({ line, product, unitPrice, vatRate, netAmount, vatAmount, totalAmount }) => (
                      <TableRow key={line.key}>
                        <TableCell>
                          <Select
                            value={product ? line.productId : ''}
                            onValueChange={(productId) =>
                              patchLine(line.key, { productId, lockedPrice: undefined, lockedVatRate: undefined, storedName: undefined })
                            }
                          >
                            <SelectTrigger className="w-full" aria-label="Proizvod">
                              <SelectValue placeholder={line.storedName ? `${line.storedName} (obrisan)` : 'Izaberite proizvod'} />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((p) => (
                                <SelectItem key={p._id} value={p._id}>
                                  {p.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {!product && line.storedName && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                              <AlertTriangle className="size-3" /> Proizvod je obrisan – izaberite zamjenu
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Input
                              type="number"
                              min="0.001"
                              step="any"
                              aria-label="Količina"
                              className="w-20"
                              value={line.quantity}
                              onChange={(e) => patchLine(line.key, { quantity: e.target.value })}
                            />
                            {product && <span className="text-xs text-muted-foreground">{product.unit}</span>}
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{product ? formatMoney(unitPrice) : '—'}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatMoney(netAmount)}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatNumber(vatRate)}%</TableCell>
                        <TableCell className="text-right tabular-nums">{formatMoney(vatAmount)}</TableCell>
                        <TableCell className="text-right font-medium tabular-nums">{formatMoney(totalAmount)}</TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            aria-label="Ukloni stavku"
                            disabled={values.lines.length === 1}
                            onClick={() => patch({ lines: values.lines.filter((l) => l.key !== line.key) })}
                          >
                            <Trash2 />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => patch({ lines: [...values.lines, newLine()] })}>
                <Plus />
                Dodaj stavku
              </Button>
              <InvoiceTotals
                items={rows}
                subtotal={subtotal}
                vatTotal={vatTotal}
                total={round2(subtotal + vatTotal)}
                currency={company.currency}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Napomena, potpis i pečati</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-2">
          <div className="grid content-start gap-4">
            <FormField id="invoice-notes" label="Napomena">
              <Textarea id="invoice-notes" rows={4} maxLength={2000} value={values.notes} onChange={(e) => patch({ notes: e.target.value })} />
            </FormField>
            <FormField id="invoice-issuedBy" label="Fakturu izdao">
              <Input
                id="invoice-issuedBy"
                maxLength={100}
                placeholder="Ime i prezime"
                value={values.issuedBy}
                onChange={(e) => patch({ issuedBy: e.target.value })}
              />
            </FormField>
          </div>
          <div className="grid content-start gap-2">
            <Label>Pečati na dnu fakture</Label>
            {company.stamps.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Firma nema pečata.{' '}
                <Link to={`/companies/${company._id}/settings`} className="underline underline-offset-4">
                  Dodajte ih u podešavanjima.
                </Link>
              </p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {company.stamps.map((stamp) => {
                  const id = `stamp-${stamp._id}`
                  const checked = values.stampIds.includes(stamp._id)
                  return (
                    <label
                      key={stamp._id}
                      htmlFor={id}
                      className="flex w-32 cursor-pointer flex-col items-center gap-2 rounded-lg border p-2 has-data-[state=checked]:border-primary"
                    >
                      <img src={stamp.url} alt="" className="h-16 object-contain" />
                      <span className="flex items-center gap-1.5 text-xs">
                        <Checkbox id={id} checked={checked} onCheckedChange={(v) => toggleStamp(stamp._id, v === true)} />
                        <span className="truncate">{stamp.name}</span>
                      </span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="submit" size="lg" disabled={isSubmitting || products.length === 0}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {isEdit ? 'Sačuvaj izmjene' : 'Kreiraj fakturu'}
        </Button>
      </div>
    </form>
  )
}
