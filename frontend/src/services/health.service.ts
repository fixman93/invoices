import type { ApiResponse } from '@/types/api'
import { api } from './api'

export const getHealth = async (): Promise<ApiResponse> => {
  const { data } = await api.get<ApiResponse>('/health')
  return data
}
