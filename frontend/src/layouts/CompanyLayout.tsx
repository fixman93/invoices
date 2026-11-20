import { Building2, ChevronLeft } from 'lucide-react'
import { Link, NavLink, Outlet, useParams } from 'react-router-dom'
import { ErrorState } from '@/components/ErrorState'
import { LoadingState } from '@/components/LoadingState'
import { useCompany } from '@/hooks/useCompanies'
import { cn } from '@/utils/cn'
import type { CompanyOutletContext } from './company-context'

const TABS = [
  { to: 'invoices', label: 'Fakture' },
  { to: 'products', label: 'Proizvodi' },
  { to: 'clients', label: 'Kupci' },
  { to: 'settings', label: 'Podešavanja' },
]

const CompanyLayout = () => {
  const { companyId = '' } = useParams()
  const { data: company, isLoading, error, refetch } = useCompany(companyId)

  if (isLoading) return <LoadingState />
  if (error || !company) return <ErrorState error={error ?? new Error('Firma nije pronađena')} onRetry={() => void refetch()} />

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Link to="/companies" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-4" />
          Sve firme
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/40">
            {company.logo ? (
              <img src={company.logo.url} alt="" className="max-h-full max-w-full object-contain p-1" />
            ) : (
              <Building2 className="size-5 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <h1 className="truncate font-heading text-2xl font-semibold tracking-tight">{company.name}</h1>
            <p className="text-sm text-muted-foreground">
              PDV {company.vatRate}% · {company.currency}
              {company.taxId && ` · PIB ${company.taxId}`}
            </p>
          </div>
        </div>
      </div>

      <nav className="-mx-4 overflow-x-auto border-b px-4">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                cn(
                  '-mb-px border-b-2 px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors',
                  isActive ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground',
                )
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <Outlet context={{ company } satisfies CompanyOutletContext} />
    </div>
  )
}

export default CompanyLayout
