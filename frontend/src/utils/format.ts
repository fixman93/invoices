const moneyFormat = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const numberFormat = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 3 })

export const formatMoney = (value: number, currency?: string) =>
  currency ? `${moneyFormat.format(value)} ${currency}` : moneyFormat.format(value)

export const formatNumber = (value: number) => numberFormat.format(value)

export const formatDate = (value: string | null | undefined) => {
  if (!value) return '—'
  const d = new Date(value)
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}.`
}

/** `YYYY-MM-DD` for <input type="date">, in local time. */
export const toDateInput = (value: string | Date | null | undefined) => {
  if (!value) return ''
  const d = new Date(value)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const addDays = (dateInput: string, days: number) => {
  const d = new Date(`${dateInput}T00:00:00`)
  d.setDate(d.getDate() + days)
  return toDateInput(d)
}
