import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/services/api'

export const ErrorState = ({ error, onRetry }: { error: unknown; onRetry?: () => void }) => (
  <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center">
    <AlertCircle className="size-6 text-destructive" />
    <p className="text-sm">{getApiErrorMessage(error)}</p>
    {onRetry && (
      <Button variant="outline" size="sm" onClick={onRetry}>
        Pokušaj ponovo
      </Button>
    )}
  </div>
)
