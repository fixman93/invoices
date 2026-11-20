import { Loader2 } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { toast } from 'sonner'
import { FormField } from '@/components/FormField'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useProductMutations } from '@/hooks/useProducts'
import { getApiErrorMessage } from '@/services/api'
import type { Company, Product, ProductInput } from '@/types/models'

interface FormValues {
  name: string
  description: string
  code: string
  unit: string
  price: string
  vatRate: string
}

const toForm = (product?: Product): FormValues => ({
  name: product?.name ?? '',
  description: product?.description ?? '',
  code: product?.code ?? '',
  unit: product?.unit ?? 'kom',
  price: product ? String(product.price) : '',
  vatRate: product?.vatRate == null ? '' : String(product.vatRate),
})

interface ProductDialogProps {
  company: Company
  product?: Product
  trigger: ReactNode
}

export const ProductDialog = ({ company, product, trigger }: ProductDialogProps) => {
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState<FormValues>(() => toForm(product))
  const { create, update } = useProductMutations(company._id)
  const mutation = product ? update : create

  const patch = (next: Partial<FormValues>) => setValues((prev) => ({ ...prev, ...next }))

  const onOpenChange = (next: boolean) => {
    if (next) setValues(toForm(product))
    setOpen(next)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const body: ProductInput = {
      name: values.name.trim(),
      description: values.description.trim(),
      code: values.code.trim(),
      unit: values.unit.trim() || 'kom',
      price: Number(values.price),
      vatRate: values.vatRate === '' ? null : Number(values.vatRate),
    }
    const options = {
      onSuccess: () => {
        toast.success(product ? 'Proizvod je sačuvan' : 'Proizvod je dodat')
        setOpen(false)
      },
      onError: (error: unknown) => toast.error(getApiErrorMessage(error)),
    }
    if (product) update.mutate({ id: product._id, body }, options)
    else create.mutate(body, options)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>{product ? 'Izmijeni proizvod' : 'Novi proizvod'}</DialogTitle>
            <DialogDescription>Cijena se unosi bez PDV-a.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="product-name" label="Naziv *" className="sm:col-span-2">
              <Input id="product-name" required maxLength={200} value={values.name} onChange={(e) => patch({ name: e.target.value })} />
            </FormField>
            <FormField id="product-description" label="Opis" className="sm:col-span-2">
              <Textarea
                id="product-description"
                rows={2}
                maxLength={1000}
                value={values.description}
                onChange={(e) => patch({ description: e.target.value })}
              />
            </FormField>
            <FormField id="product-price" label={`Cijena bez PDV-a (${company.currency}) *`}>
              <Input
                id="product-price"
                type="number"
                min={0}
                step="0.01"
                required
                value={values.price}
                onChange={(e) => patch({ price: e.target.value })}
              />
            </FormField>
            <FormField id="product-unit" label="Jedinica mjere">
              <Input id="product-unit" maxLength={20} placeholder="kom, h, kg…" value={values.unit} onChange={(e) => patch({ unit: e.target.value })} />
            </FormField>
            <FormField id="product-vatRate" label="PDV (%)" hint={`Prazno = stopa firme (${company.vatRate}%).`}>
              <Input
                id="product-vatRate"
                type="number"
                min={0}
                max={100}
                step="0.01"
                placeholder={String(company.vatRate)}
                value={values.vatRate}
                onChange={(e) => patch({ vatRate: e.target.value })}
              />
            </FormField>
            <FormField id="product-code" label="Šifra">
              <Input id="product-code" maxLength={50} value={values.code} onChange={(e) => patch({ code: e.target.value })} />
            </FormField>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="animate-spin" />}
              Sačuvaj
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
