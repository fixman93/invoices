import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const NotFoundPage = () => (
  <section className="space-y-4 text-center">
    <h1 className="font-heading text-3xl font-bold">404 – Page not found</h1>
    <Button asChild>
      <Link to="/">Go home</Link>
    </Button>
  </section>
)

export default NotFoundPage
