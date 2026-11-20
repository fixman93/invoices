import { formatMoney, formatNumber } from '@/utils/format'
import { vatBreakdown } from '@/utils/invoice'

interface InvoiceTotalsProps {
  items: { vatRate: number; netAmount: number; vatAmount: number }[]
  subtotal: number
  vatTotal: number
  total: number
  currency: string
}

export const InvoiceTotals = ({ items, subtotal, vatTotal, total, currency }: InvoiceTotalsProps) => (
  <div className="ml-auto w-full max-w-sm space-y-1.5 text-sm">
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">Ukupno bez PDV-a</span>
      <span className="tabular-nums">{formatMoney(subtotal, currency)}</span>
    </div>
    {vatBreakdown(items).map((group) => (
      <div key={group.rate} className="flex justify-between gap-4">
        <span className="text-muted-foreground">
          PDV {formatNumber(group.rate)}% <span className="text-xs">(osnovica {formatMoney(group.base)})</span>
        </span>
        <span className="tabular-nums">{formatMoney(group.vat, currency)}</span>
      </div>
    ))}
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">Ukupan PDV</span>
      <span className="tabular-nums">{formatMoney(vatTotal, currency)}</span>
    </div>
    <div className="mt-2 flex justify-between gap-4 rounded-lg bg-primary px-3 py-2 font-semibold text-primary-foreground">
      <span>Ukupno za uplatu</span>
      <span className="tabular-nums">{formatMoney(total, currency)}</span>
    </div>
  </div>
)
