import { Pencil, Plus, Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { ClientDialog } from '@/components/clients/ClientDialog'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { LoadingState } from '@/components/LoadingState'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useClientMutations, useClients } from '@/hooks/useClients'
import { useCurrentCompany } from '@/layouts/company-context'
import { getApiErrorMessage } from '@/services/api'

const ClientsPage = () => {
  const company = useCurrentCompany()
  const { data: clients, isLoading, error, refetch } = useClients(company._id)
  const { remove } = useClientMutations(company._id)

  const addButton = (
    <ClientDialog
      companyId={company._id}
      trigger={
        <Button>
          <Plus />
          Novi kupac
        </Button>
      }
    />
  )

  return (
    <div className="space-y-6">
      <PageHeader title="Kupci" description="Firme i osobe kojima izdajete fakture." actions={addButton} />

      {isLoading && <LoadingState />}
      {error && <ErrorState error={error} onRetry={() => void refetch()} />}
      {clients?.length === 0 && (
        <EmptyState icon={Users} title="Nema kupaca" description="Dodajte kupca da biste mu izdali fakturu." action={addButton} />
      )}

      {clients && clients.length > 0 && (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Naziv</TableHead>
                <TableHead>Grad</TableHead>
                <TableHead>PIB</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client._id}>
                  <TableCell className="max-w-72">
                    <p className="truncate font-medium">{client.name}</p>
                    {client.address && <p className="truncate text-xs text-muted-foreground">{client.address}</p>}
                  </TableCell>
                  <TableCell>{client.city || '—'}</TableCell>
                  <TableCell>{client.taxId || '—'}</TableCell>
                  <TableCell>{client.email || '—'}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <ClientDialog
                        companyId={company._id}
                        client={client}
                        trigger={
                          <Button size="icon-sm" variant="ghost" aria-label={`Izmijeni ${client.name}`}>
                            <Pencil />
                          </Button>
                        }
                      />
                      <ConfirmDialog
                        trigger={
                          <Button size="icon-sm" variant="ghost" aria-label={`Obriši ${client.name}`}>
                            <Trash2 />
                          </Button>
                        }
                        title="Obrisati kupca?"
                        description={`"${client.name}" neće biti dostupan za nove fakture. Postojeće fakture ostaju iste.`}
                        onConfirm={() =>
                          remove.mutate(client._id, {
                            onSuccess: () => toast.success('Kupac je obrisan'),
                            onError: (err) => toast.error(getApiErrorMessage(err)),
                          })
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

export default ClientsPage
