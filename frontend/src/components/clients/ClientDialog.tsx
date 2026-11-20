import { Loader2 } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { toast } from 'sonner'
import { PartyFields } from '@/components/PartyFields'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useClientMutations } from '@/hooks/useClients'
import { getApiErrorMessage } from '@/services/api'
import type { Client, ClientInput } from '@/types/models'
import { emptyParty, pickFields } from '@/utils/forms'

const toForm = (client?: Client): ClientInput => pickFields(emptyParty, client ?? {})

interface ClientDialogProps {
  companyId: string
  client?: Client
  trigger: ReactNode
  onSaved?: (client: Client) => void
}

export const ClientDialog = ({ companyId, client, trigger, onSaved }: ClientDialogProps) => {
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState<ClientInput>(() => toForm(client))
  const { create, update } = useClientMutations(companyId)
  const mutation = client ? update : create

  const onOpenChange = (next: boolean) => {
    if (next) setValues(toForm(client))
    setOpen(next)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const options = {
      onSuccess: (saved: Client) => {
        toast.success(client ? 'Kupac je sačuvan' : 'Kupac je dodat')
        setOpen(false)
        onSaved?.(saved)
      },
      onError: (error: unknown) => toast.error(getApiErrorMessage(error)),
    }
    if (client) update.mutate({ id: client._id, body: values }, options)
    else create.mutate(values, options)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>{client ? 'Izmijeni kupca' : 'Novi kupac'}</DialogTitle>
            <DialogDescription>Podaci kupca koji se prikazuju na fakturi.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <PartyFields idPrefix="client" value={values} onChange={(patch) => setValues((prev) => ({ ...prev, ...patch }))} />
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
