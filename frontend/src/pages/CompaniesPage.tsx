import { Building2, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { LoadingState } from '@/components/LoadingState'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useCompanies } from '@/hooks/useCompanies'

const CompaniesPage = () => {
  const { data: companies, isLoading, error, refetch } = useCompanies()

  const newButton = (
    <Button asChild>
      <Link to="/companies/new">
        <Plus />
        Nova firma
      </Link>
    </Button>
  )

  return (
    <div className="space-y-6">
      <PageHeader title="Moje firme" description="Izaberite firmu za koju pravite fakture." actions={newButton} />

      {isLoading && <LoadingState />}
      {error && <ErrorState error={error} onRetry={() => void refetch()} />}

      {companies?.length === 0 && (
        <EmptyState
          icon={Building2}
          title="Još nemate nijednu firmu"
          description="Dodajte firmu, podesite PDV, logo i pečate, pa počnite da pravite fakture."
          action={newButton}
        />
      )}

      {companies && companies.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <Link key={company._id} to={`/companies/${company._id}`} className="group rounded-xl focus-visible:outline-none">
              <Card className="h-full transition-shadow group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring">
                <CardHeader className="flex flex-row items-center gap-3">
                  <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/40">
                    {company.logo ? (
                      <img src={company.logo.url} alt="" className="max-h-full max-w-full object-contain p-1" />
                    ) : (
                      <Building2 className="size-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <CardTitle className="truncate">{company.name}</CardTitle>
                    <CardDescription className="truncate">
                      {[company.city, `PDV ${company.vatRate}%`, company.currency].filter(Boolean).join(' · ')}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default CompaniesPage
