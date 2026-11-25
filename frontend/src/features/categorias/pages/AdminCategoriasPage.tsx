import { useForm } from '@tanstack/react-form'
import type { ColumnDef } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import { DataTable } from '../../../shared/components/DataTable'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { SkeletonFilas } from '../../../shared/components/Skeleton'
import { Button } from '../../../shared/ui/Button'
import { CampoForm } from '../../../shared/ui/CampoForm'
import { Input, claseInput } from '../../../shared/ui/Input'
import { Modal } from '../../../shared/ui/Modal'
import {
  useActualizarCategoria,
  useCategorias,
  useCrearCategoria,
  useEliminarCategoria,
} from '../hooks/useCategorias'
import type { Categoria } from '../types/categoria'

interface FormularioProps {
  inicial: Categoria | null
  onListo: () => void
}

function FormularioCategoria({ inicial, onListo }: FormularioProps) {
  const crear = useCrearCategoria()
  const actualizar = useActualizarCategoria()
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { nombre: inicial?.nombre ?? '', descripcion: inicial?.descripcion ?? '' },
    onSubmit: async ({ value }) => {
      setError(null)
      const datos = { nombre: value.nombre.trim(), descripcion: value.descripcion.trim() || null }
      try {
        if (inicial) await actualizar.mutateAsync({ id: inicial.id, datos })
        else await crear.mutateAsync(datos)
        onListo()
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
        name="nombre"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length
            return largo >= 2 && largo <= 100 ? undefined : 'Entre 2 y 100 caracteres'
          },
        }}
      >
        {(field) => (
          <CampoForm field={field} label="Nombre">
            <Input
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </CampoForm>
        )}
      </form.Field>
      <form.Field name="descripcion">
        {(field) => (
          <CampoForm field={field} label="Descripción">
            <textarea
              id={field.name}
              rows={3}
              className={claseInput}
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
      <div className="flex justify-end gap-2">
        <Button variante="secundario" onClick={onListo}>
          Cancelar
        </Button>
        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
          {([puede, enviando]) => (
            <Button type="submit" disabled={!puede || enviando}>
              {enviando ? 'Guardando…' : 'Guardar'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}

export function AdminCategoriasPage() {
  const { data, isPending, isError, error, refetch } = useCategorias()
  const eliminar = useEliminarCategoria()
  const [editando, setEditando] = useState<Categoria | null>(null)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)

  const abrir = (cat: Categoria | null) => {
    setEditando(cat)
    setModalAbierto(true)
  }

  const borrar = (cat: Categoria) => {
    if (!window.confirm(`¿Dar de baja la categoría "${cat.nombre}"?`)) return
    setErrorAccion(null)
    eliminar.mutate(cat.id, { onError: (e) => setErrorAccion(handleApiError(e)) })
  }

  const columnas = useMemo<ColumnDef<Categoria>[]>(
    () => [
      { accessorKey: 'id', header: 'ID' },
      { accessorKey: 'nombre', header: 'Nombre' },
      {
        accessorKey: 'descripcion',
        header: 'Descripción',
        cell: ({ row }) => row.original.descripcion ?? '—',
      },
      {
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button tamano="sm" variante="secundario" onClick={() => abrir(row.original)}>
              Editar
            </Button>
            <Button tamano="sm" variante="peligro" onClick={() => borrar(row.original)}>
              Eliminar
            </Button>
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorías</h1>
        <Button onClick={() => abrir(null)}>+ Nueva categoría</Button>
      </div>
      {errorAccion && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorAccion}
        </p>
      )}
      {isPending ? (
        <SkeletonFilas />
      ) : isError ? (
        <EstadoError error={error} onReintentar={() => void refetch()} />
      ) : data.length === 0 ? (
        <EstadoVacio titulo="Todavía no hay categorías" />
      ) : (
        <DataTable columns={columnas} data={data} />
      )}
      <Modal
        abierto={modalAbierto}
        titulo={editando ? 'Editar categoría' : 'Nueva categoría'}
        onCerrar={() => setModalAbierto(false)}
      >
        <FormularioCategoria inicial={editando} onListo={() => setModalAbierto(false)} />
      </Modal>
    </div>
  )
}
