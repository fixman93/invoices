import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, type ReactNode } from 'react'
import { api, isUnauthorized } from '@/services/api'
import { authService } from '@/services/auth.service'
import type { User } from '@/types/models'
import { AuthContext, type AuthContextValue } from './auth-context'

const ME_KEY = ['auth', 'me'] as const

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient()

  const { data: user = null, isLoading } = useQuery({
    queryKey: ME_KEY,
    queryFn: async () => {
      try {
        return await authService.me()
      } catch (error) {
        if (isUnauthorized(error)) return null
        throw error
      }
    },
    staleTime: Infinity,
    retry: false,
  })

  const setUser = useCallback(
    (next: User | null) => {
      if (!next) queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== 'auth' })
      queryClient.setQueryData(ME_KEY, next)
    },
    [queryClient],
  )

  // Session expired while using the app → drop back to the login screen.
  useEffect(() => {
    const id = api.interceptors.response.use(undefined, (error: unknown) => {
      const url = (error as { config?: { url?: string } }).config?.url ?? ''
      if (isUnauthorized(error) && !url.startsWith('/auth/')) setUser(null)
      return Promise.reject(error)
    })
    return () => api.interceptors.response.eject(id)
  }, [setUser])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      login: async (email, password) => setUser(await authService.login({ email, password })),
      register: async (name, email, password) => setUser(await authService.register({ name, email, password })),
      logout: async () => {
        try {
          await authService.logout()
        } finally {
          setUser(null)
        }
      },
    }),
    [user, isLoading, setUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
