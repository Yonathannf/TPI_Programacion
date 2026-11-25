import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { CampoForm } from '../../../shared/ui/CampoForm'
import { Input } from '../../../shared/ui/Input'
import { useAuthStore } from '../../../store/authStore'

export function LoginPage() {
  const usuario = useAuthStore((s) => s.usuario)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)

  const destino = (location.state as { from?: string } | null)?.from ?? '/'

  const form = useForm({
    defaultValues: { username: '', password: '' },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        await login(value.username.trim(), value.password)
        navigate(destino, { replace: true })
      } catch (e) {
        setError(handleApiError(e))
      }
    },
  })

  if (usuario) return <Navigate to="/" replace />

  return (
    <Card className="mx-auto mt-8 max-w-md p-6">
      <h1 className="mb-1 text-2xl font-bold">Ingresar</h1>
      <p className="mb-6 text-sm text-stone-500">Accedé con tu usuario y contraseña.</p>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <form.Field
          name="username"
          validators={{ onChange: ({ value }) => (value.trim() ? undefined : 'Ingresá tu usuario') }}
        >
          {(field) => (
            <CampoForm field={field} label="Usuario">
              <Input
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                autoComplete="username"
              />
            </CampoForm>
          )}
        </form.Field>
        <form.Field
          name="password"
          validators={{ onChange: ({ value }) => (value ? undefined : 'Ingresá tu contraseña') }}
        >
          {(field) => (
            <CampoForm field={field} label="Contraseña">
              <Input
                id={field.name}
                type="password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                autoComplete="current-password"
              />
            </CampoForm>
          )}
        </form.Field>
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(enviando) => (
            <Button type="submit" className="w-full" disabled={enviando}>
              {enviando ? 'Ingresando…' : 'Ingresar'}
            </Button>
          )}
        </form.Subscribe>
      </form>
      <p className="mt-4 text-center text-sm text-stone-600">
        ¿No tenés cuenta?{' '}
        <Link to="/register" className="font-medium text-brand-600 hover:underline">
          Registrate
        </Link>
      </p>
    </Card>
  )
}
