import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { LoadingState } from '@/components/LoadingState'
import { useAuth } from '@/store/auth-context'

export const ProtectedRoute = () => {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <LoadingState />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

export const GuestRoute = () => {
  const { user, isLoading } = useAuth()

  if (isLoading) return <LoadingState />
  if (user) return <Navigate to="/companies" replace />
  return <Outlet />
}
