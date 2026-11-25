import type { ColumnDef } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import { DataTable } from '../../../shared/components/DataTable'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { SkeletonFilas } from '../../../shared/components/Skeleton'
import { Button } from '../../../shared/ui/Button'
import { useAuthStore } from '../../../store/authStore'
import type { UserPublic } from '../../auth/types/auth'
import { useActivarUsuario, useDesactivarUsuario, useUsuarios } from '../hooks/useUsuarios'

export function AdminUsuariosPage() {
  const { data, isPending, isError, error, refetch } = useUsuarios()
  const actual = useAuthStore((s) => s.usuario)
  const activar = useActivarUsuario()
  const desactivar = useDesactivarUsuario()
  const [errorAccion, setErrorAccion] = useState<string | null>(null)

  const columnas = useMemo<ColumnDef<UserPublic>[]>(
    () => [
      { accessorKey: 'username', header: 'Usuario' },
      { accessorKey: 'full_name', header: 'Nombre' },
      { accessorKey: 'email', header: 'Email' },
      {
        accessorKey: 'role',
        header: 'Rol',
        cell: ({ row }) => (
          <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-semibold uppercase">
            {row.original.role}
          </span>
        ),
      },
      {
        accessorKey: 'disabled',
        header: 'Estado',
        cell: ({ row }) => (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              row.original.disabled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}
          >
            {row.original.disabled ? 'Desactivado' : 'Activo'}
          </span>
        ),
      },
      {
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const u = row.original
          const onError = (e: unknown) => setErrorAccion(handleApiError(e))
          return (
            <div className="flex gap-2">
              <Button
                tamano="sm"
                variante="secundario"
                disabled={!u.disabled}
                onClick={() => {
                  setErrorAccion(null)
                  activar.mutate(u.id, { onError })
                }}
              >
                Activar
              </Button>
              {u.id !== actual?.id && (
                <Button
                  tamano="sm"
                  variante="peligro"
                  disabled={u.disabled}
                  onClick={() => {
                    setErrorAccion(null)
                    desactivar.mutate(u.id, { onError })
                  }}
                >
                  Desactivar
                </Button>
              )}
            </div>
          )
        },
      },
    ],
    [actual?.id],
  )

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Usuarios</h1>
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
        <EstadoVacio titulo="No hay usuarios" />
      ) : (
        <DataTable columns={columnas} data={data} />
      )}
    </div>
  )
}
