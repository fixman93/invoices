import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/utils/cn'

interface FormFieldProps {
  id: string
  label: string
  hint?: string
  className?: string
  children: ReactNode
}

export const FormField = ({ id, label, hint, className, children }: FormFieldProps) => (
  <div className={cn('grid gap-1.5', className)}>
    <Label htmlFor={id}>{label}</Label>
    {children}
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
)
