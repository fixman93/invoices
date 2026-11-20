import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { productService } from '@/services/product.service'
import type { ProductInput } from '@/types/models'

const key = (companyId: string) => ['companies', companyId, 'products'] as const

export const useProducts = (companyId: string) =>
  useQuery({ queryKey: key(companyId), queryFn: () => productService.list(companyId) })

export const useProductMutations = (companyId: string) => {
  const queryClient = useQueryClient()
  const onSuccess = () => queryClient.invalidateQueries({ queryKey: key(companyId) })
  return {
    create: useMutation({ mutationFn: (body: ProductInput) => productService.create(companyId, body), onSuccess }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: string; body: Partial<ProductInput> }) => productService.update(companyId, id, body),
      onSuccess,
    }),
    remove: useMutation({ mutationFn: (id: string) => productService.remove(companyId, id), onSuccess }),
  }
}
