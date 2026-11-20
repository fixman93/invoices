import { Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { FormField } from '@/components/FormField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getApiErrorMessage } from '@/services/api'
import { useAuth } from '@/store/auth-context'

const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await login(email, password)
      const from = (location.state as { from?: string } | null)?.from
      navigate(from ?? '/companies', { replace: true })
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <form onSubmit={(e) => void handleSubmit(e)}>
        <CardHeader>
          <CardTitle className="text-xl">Prijava</CardTitle>
          <CardDescription>Unesite email i lozinku vašeg naloga.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 py-6">
          <FormField id="email" label="Email">
            <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormField>
          <FormField id="password" label="Lozinka">
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormField>
        </CardContent>
        <CardFooter className="flex-col gap-3">
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="animate-spin" />}
            Prijavi se
          </Button>
          <p className="text-sm text-muted-foreground">
            Nemate nalog?{' '}
            <Link to="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
              Registrujte se
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}

export default LoginPage
