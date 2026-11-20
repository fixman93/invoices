import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { companyService } from '@/services/company.service'
import type { Company, CompanyInput } from '@/types/models'

export const companyKeys = {
  all: ['companies'] as const,
  detail: (id: string) => ['companies', id] as const,
}

export const useCompanies = () => useQuery({ queryKey: companyKeys.all, queryFn: companyService.list })

export const useCompany = (id: string) =>
  useQuery({ queryKey: companyKeys.detail(id), queryFn: () => companyService.get(id), enabled: Boolean(id) })

/** Keeps the list and detail caches in sync after any change that returns the updated company. */
const useSyncCompany = () => {
  const queryClient = useQueryClient()
  return (company: Company) => {
    queryClient.setQueryData(companyKeys.detail(company._id), company)
    void queryClient.invalidateQueries({ queryKey: companyKeys.all, exact: true })
  }
}

export const useCreateCompany = () => {
  const sync = useSyncCompany()
  return useMutation({ mutationFn: companyService.create, onSuccess: sync })
}

export const useUpdateCompany = (id: string) => {
  const sync = useSyncCompany()
  return useMutation({ mutationFn: (body: Partial<CompanyInput>) => companyService.update(id, body), onSuccess: sync })
}

export const useDeleteCompany = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: companyService.remove,
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: companyKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: companyKeys.all, exact: true })
    },
  })
}

export const useCompanyImages = (id: string) => {
  const sync = useSyncCompany()
  return {
    uploadLogo: useMutation({ mutationFn: (file: File) => companyService.uploadLogo(id, file), onSuccess: sync }),
    deleteLogo: useMutation({ mutationFn: () => companyService.deleteLogo(id), onSuccess: sync }),
    addStamp: useMutation({
      mutationFn: ({ file, name }: { file: File; name: string }) => companyService.addStamp(id, file, name),
      onSuccess: sync,
    }),
    deleteStamp: useMutation({ mutationFn: (stampId: string) => companyService.deleteStamp(id, stampId), onSuccess: sync }),
  }
}
