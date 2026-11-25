import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { CampoForm } from '../../../shared/ui/CampoForm'
import { Input } from '../../../shared/ui/Input'
import { useAuthStore } from '../../../store/authStore'
import { registrarUsuario } from '../api/auth'

const REGEX_EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export function RegisterPage() {
  const usuario = useAuthStore((s) => s.usuario)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const registro = useMutation({ mutationFn: registrarUsuario })

  const form = useForm({
    defaultValues: { username: '', full_name: '', email: '', password: '', confirmar: '' },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        await registro.mutateAsync({
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
          password: value.password,
        })
        await login(value.username.trim(), value.password)
        navigate('/', { replace: true })
      } catch (e) {
        setError(handleApiError(e))
      }
    },
  })

  if (usuario) return <Navigate to="/" replace />

  return (
    <Card className="mx-auto mt-8 max-w-md p-6">
      <h1 className="mb-1 text-2xl font-bold">Crear cuenta</h1>
      <p className="mb-6 text-sm text-stone-500">Registrate para hacer tus pedidos.</p>
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
          validators={{
            onChange: ({ value }) =>
              value.trim().length >= 3 ? undefined : 'Mínimo 3 caracteres',
          }}
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
          name="full_name"
          validators={{
            onChange: ({ value }) => (value.trim() ? undefined : 'Ingresá tu nombre completo'),
          }}
        >
          {(field) => (
            <CampoForm field={field} label="Nombre completo">
              <Input
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                autoComplete="name"
              />
            </CampoForm>
          )}
        </form.Field>
        <form.Field
          name="email"
          validators={{
            onChange: ({ value }) => (REGEX_EMAIL.test(value.trim()) ? undefined : 'Email inválido'),
          }}
        >
          {(field) => (
            <CampoForm field={field} label="Email">
              <Input
                id={field.name}
                type="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                autoComplete="email"
              />
            </CampoForm>
          )}
        </form.Field>
        <form.Field
          name="password"
          validators={{
            onChange: ({ value }) => (value.length >= 8 ? undefined : 'Mínimo 8 caracteres'),
          }}
        >
          {(field) => (
            <CampoForm field={field} label="Contraseña">
              <Input
                id={field.name}
                type="password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                autoComplete="new-password"
              />
            </CampoForm>
          )}
        </form.Field>
        <form.Field
          name="confirmar"
          validators={{
            onChangeListenTo: ['password'],
            onChange: ({ value, fieldApi }) =>
              value === fieldApi.form.getFieldValue('password')
                ? undefined
                : 'Las contraseñas no coinciden',
          }}
        >
          {(field) => (
            <CampoForm field={field} label="Repetir contraseña">
              <Input
                id={field.name}
                type="password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                autoComplete="new-password"
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
              {enviando ? 'Creando cuenta…' : 'Registrarme'}
            </Button>
          )}
        </form.Subscribe>
      </form>
      <p className="mt-4 text-center text-sm text-stone-600">
        ¿Ya tenés cuenta?{' '}
        <Link to="/login" className="font-medium text-brand-600 hover:underline">
          Ingresá
        </Link>
      </p>
    </Card>
  )
}
