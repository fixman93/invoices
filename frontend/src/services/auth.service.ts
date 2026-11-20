import type { ApiResponse } from '@/types/api'
import type { User } from '@/types/models'
import { api } from './api'

export const authService = {
  me: async () => (await api.get<ApiResponse<User>>('/auth/me')).data.data,
  login: async (body: { email: string; password: string }) =>
    (await api.post<ApiResponse<User>>('/auth/login', body)).data.data,
  register: async (body: { name: string; email: string; password: string }) =>
    (await api.post<ApiResponse<User>>('/auth/register', body)).data.data,
  logout: async () => {
    await api.post('/auth/logout')
  },
}
