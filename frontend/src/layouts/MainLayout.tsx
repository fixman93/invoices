import { Outlet } from 'react-router-dom'

const MainLayout = () => (
  <div className="flex min-h-svh flex-col bg-background text-foreground">
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-5xl items-center px-4 font-heading font-semibold">
        Invoices
      </div>
    </header>
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <Outlet />
    </main>
  </div>
)

export default MainLayout
