import { Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { FormField } from '@/components/FormField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getApiErrorMessage } from '@/services/api'
import { useAuth } from '@/store/auth-context'

const RegisterPage = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState({ name: '', email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await register(values.name, values.email, values.password)
      navigate('/companies', { replace: true })
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
          <CardTitle className="text-xl">Registracija</CardTitle>
          <CardDescription>Napravite nalog i dodajte svoje firme.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 py-6">
          <FormField id="name" label="Ime i prezime">
            <Input
              id="name"
              autoComplete="name"
              required
              minLength={2}
              value={values.name}
              onChange={(e) => setValues({ ...values, name: e.target.value })}
            />
          </FormField>
          <FormField id="email" label="Email">
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={values.email}
              onChange={(e) => setValues({ ...values, email: e.target.value })}
            />
          </FormField>
          <FormField id="password" label="Lozinka" hint="Najmanje 8 karaktera.">
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={values.password}
              onChange={(e) => setValues({ ...values, password: e.target.value })}
            />
          </FormField>
        </CardContent>
        <CardFooter className="flex-col gap-3">
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="animate-spin" />}
            Napravi nalog
          </Button>
          <p className="text-sm text-muted-foreground">
            Već imate nalog?{' '}
            <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
              Prijavite se
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}

export default RegisterPage
