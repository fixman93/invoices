import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { clientService } from '@/services/client.service'
import type { ClientInput } from '@/types/models'

const key = (companyId: string) => ['companies', companyId, 'clients'] as const

export const useClients = (companyId: string) =>
  useQuery({ queryKey: key(companyId), queryFn: () => clientService.list(companyId) })

export const useClientMutations = (companyId: string) => {
  const queryClient = useQueryClient()
  const onSuccess = () => queryClient.invalidateQueries({ queryKey: key(companyId) })
  return {
    create: useMutation({ mutationFn: (body: ClientInput) => clientService.create(companyId, body), onSuccess }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: string; body: Partial<ClientInput> }) => clientService.update(companyId, id, body),
      onSuccess,
    }),
    remove: useMutation({ mutationFn: (id: string) => clientService.remove(companyId, id), onSuccess }),
  }
}
