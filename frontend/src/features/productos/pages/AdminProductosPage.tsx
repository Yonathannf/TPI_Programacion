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
import { formatearPrecio } from '../../../shared/utils/formato'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import {
  useActualizarProducto,
  useActualizarStock,
  useCrearProducto,
  useEliminarProducto,
  useProductos,
} from '../hooks/useProductos'
import type { Producto } from '../types/producto'

function ErrorForm({ mensaje }: { mensaje: string | null }) {
  if (!mensaje) return null
  return (
    <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
      {mensaje}
    </p>
  )
}

// ── Formulario de alta y edición ──────────────────────────────────────────
function FormularioProducto({
  inicial,
  onListo,
}: {
  inicial: Producto | null
  onListo: () => void
}) {
  const crear = useCrearProducto()
  const actualizar = useActualizarProducto()
  const categorias = useCategorias()
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      nombre: inicial?.nombre ?? '',
      descripcion: inicial?.descripcion ?? '',
      precio_base: inicial?.precio_base ?? 0,
      imagen_url: inicial?.imagen_url ?? '',
      stock: inicial?.stock ?? 0,
      disponible: inicial?.disponible ?? true,
      categoria_id: inicial?.categoria_id ?? 0,
    },
    onSubmit: async ({ value }) => {
      setError(null)
      const datos = {
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        precio_base: value.precio_base,
        imagen_url: value.imagen_url.trim() || null,
        stock: value.stock,
        disponible: value.disponible,
        categoria_id: value.categoria_id,
      }
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
          onChange: ({ value }) => (value.trim() ? undefined : 'El nombre es obligatorio'),
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
              rows={2}
              className={claseInput}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </CampoForm>
        )}
      </form.Field>
      <div className="grid grid-cols-2 gap-4">
        <form.Field
          name="precio_base"
          validators={{
            onChange: ({ value }) => (value >= 0 ? undefined : 'Debe ser mayor o igual a 0'),
          }}
        >
          {(field) => (
            <CampoForm field={field} label="Precio">
              <Input
                id={field.name}
                type="number"
                min={0}
                step="0.01"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(Number(e.target.value))}
              />
            </CampoForm>
          )}
        </form.Field>
        <form.Field
          name="stock"
          validators={{
            onChange: ({ value }) =>
              Number.isInteger(value) && value >= 0 ? undefined : 'Entero mayor o igual a 0',
          }}
        >
          {(field) => (
            <CampoForm field={field} label="Stock">
              <Input
                id={field.name}
                type="number"
                min={0}
                step={1}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(Number(e.target.value))}
              />
            </CampoForm>
          )}
        </form.Field>
      </div>
      <form.Field
        name="categoria_id"
        validators={{
          onChange: ({ value }) => (value > 0 ? undefined : 'Elegí una categoría'),
        }}
      >
        {(field) => (
          <CampoForm field={field} label="Categoría">
            <select
              id={field.name}
              className={claseInput}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(Number(e.target.value))}
            >
              <option value={0}>Seleccionar…</option>
              {categorias.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </CampoForm>
        )}
      </form.Field>
      <form.Field name="imagen_url">
        {(field) => (
          <CampoForm field={field} label="URL de la imagen">
            <Input
              id={field.name}
              type="url"
              placeholder="https://…"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </CampoForm>
        )}
      </form.Field>
      <form.Field name="disponible">
        {(field) => (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={field.state.value}
              onChange={(e) => field.handleChange(e.target.checked)}
            />
            Disponible para la venta
          </label>
        )}
      </form.Field>
      <ErrorForm mensaje={error} />
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

// ── Formulario de stock y disponibilidad ──────────────────────────────────
function FormularioStock({ producto, onListo }: { producto: Producto; onListo: () => void }) {
  const actualizar = useActualizarStock()
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { stock: producto.stock, disponible: producto.disponible },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        await actualizar.mutateAsync({ id: producto.id, datos: value })
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
      <p className="text-sm text-stone-600">
        Producto: <strong>{producto.nombre}</strong>
      </p>
      <form.Field
        name="stock"
        validators={{
          onChange: ({ value }) =>
            Number.isInteger(value) && value >= 0 ? undefined : 'Entero mayor o igual a 0',
        }}
      >
        {(field) => (
          <CampoForm field={field} label="Stock">
            <Input
              id={field.name}
              type="number"
              min={0}
              step={1}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(Number(e.target.value))}
            />
          </CampoForm>
        )}
      </form.Field>
      <form.Field name="disponible">
        {(field) => (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={field.state.value}
              onChange={(e) => field.handleChange(e.target.checked)}
            />
            Disponible para la venta
          </label>
        )}
      </form.Field>
      <ErrorForm mensaje={error} />
      <div className="flex justify-end gap-2">
        <Button variante="secundario" onClick={onListo}>
          Cancelar
        </Button>
        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
          {([puede, enviando]) => (
            <Button type="submit" disabled={!puede || enviando}>
              {enviando ? 'Guardando…' : 'Actualizar'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}

// ── Página ────────────────────────────────────────────────────────────────
type ModalActivo = { tipo: 'form'; producto: Producto | null } | { tipo: 'stock'; producto: Producto }

export function AdminProductosPage() {
  const { data, isPending, isError, error, refetch } = useProductos({ skip: 0, limit: 100 })
  const eliminar = useEliminarProducto()
  const [modal, setModal] = useState<ModalActivo | null>(null)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)

  const borrar = (p: Producto) => {
    if (!window.confirm(`¿Dar de baja "${p.nombre}"?`)) return
    setErrorAccion(null)
    eliminar.mutate(p.id, { onError: (e) => setErrorAccion(handleApiError(e)) })
  }

  const columnas = useMemo<ColumnDef<Producto>[]>(
    () => [
      {
        id: 'imagen',
        header: '',
        cell: ({ row }) =>
          row.original.imagen_url ? (
            <img
              src={row.original.imagen_url}
              alt=""
              className="h-10 w-10 rounded-lg object-cover"
            />
          ) : (
            <span className="text-2xl">🍽️</span>
          ),
      },
      { accessorKey: 'nombre', header: 'Nombre' },
      {
        id: 'categoria',
        header: 'Categoría',
        cell: ({ row }) => row.original.categoria.nombre,
      },
      {
        accessorKey: 'precio_base',
        header: 'Precio',
        cell: ({ row }) => formatearPrecio(row.original.precio_base),
      },
      { accessorKey: 'stock', header: 'Stock' },
      {
        accessorKey: 'disponible',
        header: 'Disponible',
        cell: ({ row }) => (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              row.original.disponible ? 'bg-green-100 text-green-800' : 'bg-stone-200 text-stone-600'
            }`}
          >
            {row.original.disponible ? 'Sí' : 'No'}
          </span>
        ),
      },
      {
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <Button
              tamano="sm"
              variante="secundario"
              onClick={() => setModal({ tipo: 'form', producto: row.original })}
            >
              Editar
            </Button>
            <Button
              tamano="sm"
              variante="secundario"
              onClick={() => setModal({ tipo: 'stock', producto: row.original })}
            >
              Stock
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

  const cerrar = () => setModal(null)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Button onClick={() => setModal({ tipo: 'form', producto: null })}>+ Nuevo producto</Button>
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
      ) : data.items.length === 0 ? (
        <EstadoVacio titulo="Todavía no hay productos" />
      ) : (
        <DataTable columns={columnas} data={data.items} />
      )}

      <Modal
        abierto={modal?.tipo === 'form'}
        titulo={modal?.tipo === 'form' && modal.producto ? 'Editar producto' : 'Nuevo producto'}
        onCerrar={cerrar}
      >
        {modal?.tipo === 'form' && (
          <FormularioProducto key={modal.producto?.id ?? 'nuevo'} inicial={modal.producto} onListo={cerrar} />
        )}
      </Modal>
      <Modal abierto={modal?.tipo === 'stock'} titulo="Stock y disponibilidad" onCerrar={cerrar}>
        {modal?.tipo === 'stock' && (
          <FormularioStock key={modal.producto.id} producto={modal.producto} onListo={cerrar} />
        )}
      </Modal>
    </div>
  )
}
