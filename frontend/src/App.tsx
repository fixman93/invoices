import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { GuestRoute, ProtectedRoute } from '@/components/RouteGuards'
import { Toaster } from '@/components/ui/sonner'
import AuthLayout from '@/layouts/AuthLayout'
import CompanyLayout from '@/layouts/CompanyLayout'
import MainLayout from '@/layouts/MainLayout'
import { isUnauthorized } from '@/services/api'
import { AuthProvider } from '@/store/AuthProvider'
import { LoadingState } from '@/components/LoadingState'

const ClientsPage = lazy(() => import('@/pages/ClientsPage'))
const CompaniesPage = lazy(() => import('@/pages/CompaniesPage'))
const CompanySettingsPage = lazy(() => import('@/pages/CompanySettingsPage'))
const InvoiceDetailPage = lazy(() => import('@/pages/InvoiceDetailPage'))
const InvoiceEditorPage = lazy(() => import('@/pages/InvoiceEditorPage'))
const InvoicesPage = lazy(() => import('@/pages/InvoicesPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const NewCompanyPage = lazy(() => import('@/pages/NewCompanyPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const ProductsPage = lazy(() => import('@/pages/ProductsPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => !isUnauthorized(error) && failureCount < 2,
    },
  },
})

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<LoadingState />}>
          <Routes>
            <Route element={<GuestRoute />}>
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route index element={<Navigate to="/companies" replace />} />
                <Route path="/companies" element={<CompaniesPage />} />
                <Route path="/companies/new" element={<NewCompanyPage />} />
                <Route path="/companies/:companyId" element={<CompanyLayout />}>
                  <Route index element={<Navigate to="invoices" replace />} />
                  <Route path="invoices" element={<InvoicesPage />} />
                  <Route path="invoices/new" element={<InvoiceEditorPage />} />
                  <Route path="invoices/:invoiceId" element={<InvoiceDetailPage />} />
                  <Route path="invoices/:invoiceId/edit" element={<InvoiceEditorPage />} />
                  <Route path="products" element={<ProductsPage />} />
                  <Route path="clients" element={<ClientsPage />} />
                  <Route path="settings" element={<CompanySettingsPage />} />
                </Route>
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
)

export default App
