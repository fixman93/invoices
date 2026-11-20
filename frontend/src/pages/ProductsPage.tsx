import { Package, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { LoadingState } from '@/components/LoadingState'
import { PageHeader } from '@/components/PageHeader'
import { ProductDialog } from '@/components/products/ProductDialog'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useProductMutations, useProducts } from '@/hooks/useProducts'
import { useCurrentCompany } from '@/layouts/company-context'
import { getApiErrorMessage } from '@/services/api'
import { formatMoney, formatNumber } from '@/utils/format'
import { calculateLine } from '@/utils/invoice'

const ProductsPage = () => {
  const company = useCurrentCompany()
  const { data: products, isLoading, error, refetch } = useProducts(company._id)
  const { remove } = useProductMutations(company._id)

  const addButton = (
    <ProductDialog
      company={company}
      trigger={
        <Button>
          <Plus />
          Novi proizvod
        </Button>
      }
    />
  )

  return (
    <div className="space-y-6">
      <PageHeader title="Proizvodi i usluge" description="Cijene su bez PDV-a." actions={addButton} />

      {isLoading && <LoadingState />}
      {error && <ErrorState error={error} onRetry={() => void refetch()} />}
      {products?.length === 0 && (
        <EmptyState icon={Package} title="Nema proizvoda" description="Dodajte proizvode ili usluge koje prodajete." action={addButton} />
      )}

      {products && products.length > 0 && (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Naziv</TableHead>
                <TableHead>Jed.</TableHead>
                <TableHead className="text-right">Cijena bez PDV</TableHead>
                <TableHead className="text-right">PDV</TableHead>
                <TableHead className="text-right">Cijena sa PDV</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const vatRate = product.vatRate ?? company.vatRate
                const { totalAmount } = calculateLine(1, product.price, vatRate)
                return (
                  <TableRow key={product._id}>
                    <TableCell className="max-w-72">
                      <p className="truncate font-medium">{product.name}</p>
                      {product.description && <p className="truncate text-xs text-muted-foreground">{product.description}</p>}
                    </TableCell>
                    <TableCell>{product.unit}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatMoney(product.price, company.currency)}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNumber(vatRate)}%
                      {product.vatRate === null && <span className="text-muted-foreground"> (firma)</span>}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatMoney(totalAmount, company.currency)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <ProductDialog
                          company={company}
                          product={product}
                          trigger={
                            <Button size="icon-sm" variant="ghost" aria-label={`Izmijeni ${product.name}`}>
                              <Pencil />
                            </Button>
                          }
                        />
                        <ConfirmDialog
                          trigger={
                            <Button size="icon-sm" variant="ghost" aria-label={`Obriši ${product.name}`}>
                              <Trash2 />
                            </Button>
                          }
                          title="Obrisati proizvod?"
                          description={`"${product.name}" neće biti dostupan za nove fakture. Postojeće fakture ostaju iste.`}
                          onConfirm={() =>
                            remove.mutate(product._id, {
                              onSuccess: () => toast.success('Proizvod je obrisan'),
                              onError: (err) => toast.error(getApiErrorMessage(err)),
                            })
                          }
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

export default ProductsPage
