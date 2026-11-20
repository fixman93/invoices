import { ChevronLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { CompanyForm } from '@/components/company/CompanyForm'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { useCreateCompany } from '@/hooks/useCompanies'
import { getApiErrorMessage } from '@/services/api'

const NewCompanyPage = () => {
  const navigate = useNavigate()
  const createCompany = useCreateCompany()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/companies" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" />
        Sve firme
      </Link>
      <PageHeader title="Nova firma" description="Logo i pečate dodajete u podešavanjima nakon kreiranja firme." />
      <Card>
        <CardContent>
          <CompanyForm
            submitLabel="Kreiraj firmu"
            isSubmitting={createCompany.isPending}
            onSubmit={(values) =>
              createCompany.mutate(values, {
                onSuccess: (company) => {
                  toast.success('Firma je kreirana')
                  navigate(`/companies/${company._id}/settings`)
                },
                onError: (error) => toast.error(getApiErrorMessage(error)),
              })
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default NewCompanyPage
