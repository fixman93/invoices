import { useOutletContext } from 'react-router-dom'
import type { Company } from '@/types/models'

export interface CompanyOutletContext {
  company: Company
}

/** The current company, provided by `CompanyLayout` to all nested company pages. */
export const useCurrentCompany = () => useOutletContext<CompanyOutletContext>().company
