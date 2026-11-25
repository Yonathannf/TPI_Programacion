import type { AnyFieldApi } from '@tanstack/react-form'
import type { ReactNode } from 'react'

/** Convierte los errores de un campo de TanStack Form en un mensaje. */
export function mensajeError(field: AnyFieldApi): string | undefined {
  const errores = field.state.meta.errors as unknown[]
  if (!field.state.meta.isTouched || errores.length === 0) return undefined
  const primero = errores[0]
  if (typeof primero === 'string') return primero
  if (primero && typeof primero === 'object' && 'message' in primero) {
    return String((primero as { message: unknown }).message)
  }
  return 'Valor inválido'
}

interface CampoFormProps {
  field: AnyFieldApi
  label: string
  children: ReactNode
}

export function CampoForm({ field, label, children }: CampoFormProps) {
  const error = mensajeError(field)
  return (
    <div>
      <label htmlFor={field.name} className="mb-1 block text-sm font-medium text-stone-700">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
