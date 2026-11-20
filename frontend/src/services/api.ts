import axios, { AxiosError } from 'axios'

// No default Content-Type: axios sets JSON for objects and multipart for FormData automatically.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  withCredentials: true,
  timeout: 30_000,
})

/** Extracts a human-readable message from any error thrown by the API client. */
export const getApiErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string } | undefined
    if (data?.message) return data.message
    if (!error.response) return 'Server nije dostupan'
    return error.message
  }
  return error instanceof Error ? error.message : 'Neočekivana greška'
}

export const isUnauthorized = (error: unknown): boolean =>
  error instanceof AxiosError && error.response?.status === 401
