import { Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { CompanyForm } from '@/components/company/CompanyForm'
import { CompanyImages } from '@/components/company/CompanyImages'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useDeleteCompany, useUpdateCompany } from '@/hooks/useCompanies'
import { useCurrentCompany } from '@/layouts/company-context'
import { getApiErrorMessage } from '@/services/api'
import { toCompanyInput } from '@/utils/forms'

const CompanySettingsPage = () => {
  const company = useCurrentCompany()
  const navigate = useNavigate()
  const updateCompany = useUpdateCompany(company._id)
  const deleteCompany = useDeleteCompany()

  return (
    <div className="space-y-6">
      <CompanyImages company={company} />

      <Card>
        <CardHeader>
          <CardTitle>Podaci o firmi</CardTitle>
          <CardDescription>Promjene važe za nove fakture. Već izdate fakture ostaju nepromijenjene.</CardDescription>
        </CardHeader>
        <CardContent>
          <CompanyForm
            key={company._id}
            initial={toCompanyInput(company)}
            submitLabel="Sačuvaj promjene"
            isSubmitting={updateCompany.isPending}
            onSubmit={(values) =>
              updateCompany.mutate(values, {
                onSuccess: () => toast.success('Podešavanja su sačuvana'),
                onError: (error) => toast.error(getApiErrorMessage(error)),
              })
            }
          />
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle>Brisanje firme</CardTitle>
          <CardDescription>Trajno briše firmu sa svim proizvodima, kupcima i fakturama.</CardDescription>
        </CardHeader>
        <CardContent>
          <ConfirmDialog
            trigger={
              <Button variant="destructive" disabled={deleteCompany.isPending}>
                <Trash2 />
                Obriši firmu
              </Button>
            }
            title={`Obrisati firmu "${company.name}"?`}
            description="Ova radnja se ne može poništiti. Biće obrisani svi proizvodi, kupci i fakture ove firme."
            confirmLabel="Obriši trajno"
            onConfirm={() =>
              deleteCompany.mutate(company._id, {
                onSuccess: () => {
                  toast.success('Firma je obrisana')
                  navigate('/companies', { replace: true })
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

export default CompanySettingsPage
