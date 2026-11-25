import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import { CampoForm } from '../../../shared/ui/CampoForm'
import { Input, claseInput } from '../../../shared/ui/Input'
import type { FormaPago, PedidoCreate } from '../types/pedido'

interface FormularioCheckoutProps {
  items: PedidoCreate['items']
  enviando: boolean
  onConfirmar: (datos: PedidoCreate) => Promise<void>
}

export function FormularioCheckout({ items, enviando, onConfirmar }: FormularioCheckoutProps) {
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      direccion_entrega: '',
      forma_pago: 'EFECTIVO' as FormaPago,
      notas: '',
    },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        await onConfirmar({
          items,
          forma_pago: value.forma_pago,
          direccion_entrega: value.direccion_entrega.trim(),
          notas: value.notas.trim() || null,
        })
      } catch (e) {
        setError(handleApiError(e))
      }
    },
  })

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <form.Field
        name="direccion_entrega"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length
            return largo >= 5 && largo <= 200 ? undefined : 'La dirección debe tener entre 5 y 200 caracteres'
          },
        }}
      >
        {(field) => (
          <CampoForm field={field} label="Dirección de entrega">
            <Input
              id={field.name}
              placeholder="Calle, número, localidad"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </CampoForm>
        )}
      </form.Field>
      <form.Field name="forma_pago">
        {(field) => (
          <CampoForm field={field} label="Forma de pago">
            <select
              id={field.name}
              className={claseInput}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value as FormaPago)}
            >
              <option value="EFECTIVO">Efectivo</option>
              <option value="TRANSFERENCIA">Transferencia</option>
            </select>
          </CampoForm>
        )}
      </form.Field>
      <form.Field name="notas">
        {(field) => (
          <CampoForm field={field} label="Notas (opcional)">
            <textarea
              id={field.name}
              rows={3}
              className={claseInput}
              placeholder="Ej.: sin cebolla, tocar timbre 2B"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
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
        {(submitting) => (
          <Button type="submit" className="w-full" disabled={submitting || enviando}>
            {submitting || enviando ? 'Confirmando…' : 'Confirmar pedido'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
