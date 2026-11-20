import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const NotFoundPage = () => (
  <section className="space-y-4 py-16 text-center">
    <h1 className="font-heading text-3xl font-bold">404 – Stranica nije pronađena</h1>
    <Button asChild>
      <Link to="/companies">Na početnu</Link>
    </Button>
  </section>
)

export default NotFoundPage
