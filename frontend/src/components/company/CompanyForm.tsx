import { Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { FormField } from '@/components/FormField'
import { PartyFields } from '@/components/PartyFields'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { CURRENCIES, type CompanyInput, type Currency } from '@/types/models'
import { emptyCompany } from '@/utils/forms'

interface CompanyFormProps {
  initial?: CompanyInput
  submitLabel: string
  isSubmitting: boolean
  onSubmit: (values: CompanyInput) => void
}

export const CompanyForm = ({ initial = emptyCompany, submitLabel, isSubmitting, onSubmit }: CompanyFormProps) => {
  const [values, setValues] = useState<CompanyInput>(initial)
  const patch = (next: Partial<CompanyInput>) => setValues((prev) => ({ ...prev, ...next }))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Osnovni podaci</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <PartyFields idPrefix="company" value={values} onChange={patch} />
          <FormField id="company-website" label="Web sajt">
            <Input id="company-website" value={values.website} onChange={(e) => patch({ website: e.target.value })} />
          </FormField>
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Banka</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="company-bankName" label="Naziv banke">
            <Input id="company-bankName" value={values.bankName} onChange={(e) => patch({ bankName: e.target.value })} />
          </FormField>
          <FormField id="company-bankAccount" label="Žiro račun">
            <Input
              id="company-bankAccount"
              value={values.bankAccount}
              onChange={(e) => patch({ bankAccount: e.target.value })}
            />
          </FormField>
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Podešavanja faktura</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="company-vatRate" label="PDV (%) *" hint="Podrazumijevana stopa za proizvode bez posebne stope.">
            <Input
              id="company-vatRate"
              type="number"
              min={0}
              max={100}
              step="0.01"
              required
              value={values.vatRate}
              onChange={(e) => patch({ vatRate: e.target.valueAsNumber })}
            />
          </FormField>
          <FormField id="company-currency" label="Valuta *">
            <Select value={values.currency} onValueChange={(currency) => patch({ currency: currency as Currency })}>
              <SelectTrigger id="company-currency" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField id="company-paymentTermDays" label="Rok plaćanja (dana)">
            <Input
              id="company-paymentTermDays"
              type="number"
              min={0}
              max={365}
              value={values.paymentTermDays}
              onChange={(e) => patch({ paymentTermDays: e.target.valueAsNumber })}
            />
          </FormField>
          <FormField id="company-invoicePrefix" label="Prefiks broja fakture" hint='Npr. "F-" daje brojeve F-1/2026, F-2/2026…'>
            <Input
              id="company-invoicePrefix"
              maxLength={20}
              value={values.invoicePrefix}
              onChange={(e) => patch({ invoicePrefix: e.target.value })}
            />
          </FormField>
          <FormField id="company-issuedBy" label="Fakturu izdao" hint="Ime koje se ispisuje iznad linije za potpis. Može se promijeniti na svakoj fakturi.">
            <Input
              id="company-issuedBy"
              maxLength={100}
              placeholder="Ime i prezime"
              value={values.issuedBy}
              onChange={(e) => patch({ issuedBy: e.target.value })}
            />
          </FormField>
          <FormField id="company-invoiceNote" label="Napomena na fakturi" className="sm:col-span-2" hint="Podrazumijevani tekst na dnu svake nove fakture.">
            <Textarea
              id="company-invoiceNote"
              rows={3}
              maxLength={2000}
              value={values.invoiceNote}
              onChange={(e) => patch({ invoiceNote: e.target.value })}
            />
          </FormField>
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
