import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
}

export const PageHeader = ({ title, description, actions }: PageHeaderProps) => (
  <div className="flex flex-wrap items-start justify-between gap-4">
    <div className="min-w-0 space-y-1">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">{title}</h1>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
)
