import { CircleCheck, CircleX, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useHealthCheck } from '@/hooks/useHealthCheck'

const HomePage = () => {
  const { status, message, refresh } = useHealthCheck()

  return (
    <section className="space-y-6">
      <h1 className="font-heading text-3xl font-bold tracking-tight">MERN app is ready</h1>

      <div className="flex items-center gap-3 rounded-lg border p-4">
        {status === 'loading' && <Loader2 className="size-5 animate-spin text-muted-foreground" />}
        {status === 'online' && <CircleCheck className="size-5 text-green-600" />}
        {status === 'offline' && <CircleX className="size-5 text-destructive" />}
        <div className="flex-1">
          <p className="font-medium">Backend status: {status}</p>
          {message && <p className="text-sm text-muted-foreground">{message}</p>}
        </div>
        <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={status === 'loading'}>
          <RefreshCw />
          Retry
        </Button>
      </div>
    </section>
  )
}

export default HomePage
