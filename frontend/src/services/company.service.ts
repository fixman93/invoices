import type { ApiResponse } from '@/types/api'
import type { Company, CompanyInput } from '@/types/models'
import { api } from './api'

const imageForm = (file: File, name?: string) => {
  const form = new FormData()
  form.append('file', file)
  if (name) form.append('name', name)
  return form
}

export const companyService = {
  list: async () => (await api.get<ApiResponse<Company[]>>('/companies')).data.data,
  get: async (id: string) => (await api.get<ApiResponse<Company>>(`/companies/${id}`)).data.data,
  create: async (body: CompanyInput) => (await api.post<ApiResponse<Company>>('/companies', body)).data.data,
  update: async (id: string, body: Partial<CompanyInput>) =>
    (await api.patch<ApiResponse<Company>>(`/companies/${id}`, body)).data.data,
  remove: async (id: string) => {
    await api.delete(`/companies/${id}`)
  },
  uploadLogo: async (id: string, file: File) =>
    (await api.post<ApiResponse<Company>>(`/companies/${id}/logo`, imageForm(file))).data.data,
  deleteLogo: async (id: string) => (await api.delete<ApiResponse<Company>>(`/companies/${id}/logo`)).data.data,
  addStamp: async (id: string, file: File, name: string) =>
    (await api.post<ApiResponse<Company>>(`/companies/${id}/stamps`, imageForm(file, name))).data.data,
  deleteStamp: async (id: string, stampId: string) =>
    (await api.delete<ApiResponse<Company>>(`/companies/${id}/stamps/${stampId}`)).data.data,
}
