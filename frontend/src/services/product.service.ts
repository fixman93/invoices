import type { ApiResponse } from '@/types/api'
import type { Product, ProductInput } from '@/types/models'
import { api } from './api'

const base = (companyId: string) => `/companies/${companyId}/products`

export const productService = {
  list: async (companyId: string) => (await api.get<ApiResponse<Product[]>>(base(companyId))).data.data,
  create: async (companyId: string, body: ProductInput) =>
    (await api.post<ApiResponse<Product>>(base(companyId), body)).data.data,
  update: async (companyId: string, id: string, body: Partial<ProductInput>) =>
    (await api.patch<ApiResponse<Product>>(`${base(companyId)}/${id}`, body)).data.data,
  remove: async (companyId: string, id: string) => {
    await api.delete(`${base(companyId)}/${id}`)
  },
}
