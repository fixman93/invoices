import type { ApiResponse } from '@/types/api'
import type { Client, ClientInput } from '@/types/models'
import { api } from './api'

const base = (companyId: string) => `/companies/${companyId}/clients`

export const clientService = {
  list: async (companyId: string) => (await api.get<ApiResponse<Client[]>>(base(companyId))).data.data,
  create: async (companyId: string, body: ClientInput) =>
    (await api.post<ApiResponse<Client>>(base(companyId), body)).data.data,
  update: async (companyId: string, id: string, body: Partial<ClientInput>) =>
    (await api.patch<ApiResponse<Client>>(`${base(companyId)}/${id}`, body)).data.data,
  remove: async (companyId: string, id: string) => {
    await api.delete(`${base(companyId)}/${id}`)
  },
}
