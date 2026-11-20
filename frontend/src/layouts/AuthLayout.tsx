import { FileText } from 'lucide-react'
import { Outlet } from 'react-router-dom'

const AuthLayout = () => (
  <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/40 p-4">
    <div className="flex items-center gap-2 font-heading text-lg font-semibold">
      <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <FileText className="size-4" />
      </div>
      Fakture
    </div>
    <div className="w-full max-w-sm">
      <Outlet />
    </div>
  </div>
)

export default AuthLayout
