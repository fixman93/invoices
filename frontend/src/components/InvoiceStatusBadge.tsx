import { Badge } from '@/components/ui/badge'
import type { InvoiceStatus } from '@/types/models'
import { STATUS_LABELS } from '@/utils/invoice'

const VARIANTS = { unpaid: 'outline', paid: 'default', cancelled: 'destructive' } as const

export const InvoiceStatusBadge = ({ status }: { status: InvoiceStatus }) => (
  <Badge variant={VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>
)
