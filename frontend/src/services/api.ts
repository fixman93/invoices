import axios, { AxiosError } from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 15_000,
})

/** Extracts a human-readable message from any error thrown by the API client. */
export const getApiErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string } | undefined
    return data?.message ?? error.message
  }
  return error instanceof Error ? error.message : 'Unexpected error'
}
