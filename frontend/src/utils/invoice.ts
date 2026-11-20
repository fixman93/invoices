// Mirrors backend/src/utils/money.ts so the editor shows exactly what the server will store.

export const round2 = (value: number): number => {
  const sign = value < 0 ? -1 : 1
  return (sign * Math.round((Math.abs(value) + Number.EPSILON) * 100)) / 100
}

export const calculateLine = (quantity: number, unitPrice: number, vatRate: number) => {
  const netAmount = round2(quantity * unitPrice)
  const vatAmount = round2((netAmount * vatRate) / 100)
  return { netAmount, vatAmount, totalAmount: round2(netAmount + vatAmount) }
}

export const vatBreakdown = (items: { vatRate: number; netAmount: number; vatAmount: number }[]) => {
  const groups = new Map<number, { rate: number; base: number; vat: number }>()
  for (const item of items) {
    const group = groups.get(item.vatRate) ?? { rate: item.vatRate, base: 0, vat: 0 }
    group.base = round2(group.base + item.netAmount)
    group.vat = round2(group.vat + item.vatAmount)
    groups.set(item.vatRate, group)
  }
  return [...groups.values()].sort((a, b) => b.rate - a.rate)
}

export const STATUS_LABELS = {
  unpaid: 'Neplaćena',
  paid: 'Plaćena',
  cancelled: 'Stornirana',
} as const
