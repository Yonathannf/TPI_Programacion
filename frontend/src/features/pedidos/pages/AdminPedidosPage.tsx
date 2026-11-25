import type { ColumnDef } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import { DataTable } from '../../../shared/components/DataTable'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { SkeletonFilas } from '../../../shared/components/Skeleton'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Button } from '../../../shared/ui/Button'
import { claseInput } from '../../../shared/ui/Input'
import { formatearFecha, formatearPrecio } from '../../../shared/utils/formato'
import { DetallePedidoModal } from '../components/DetallePedidoModal'
import { useCambiarEstadoPedido } from '../hooks/useCambiarEstadoPedido'
import { usePedidos } from '../hooks/usePedidos'
import { ESTADOS, TRANSICIONES, type EstadoPedido, type Pedido } from '../types/pedido'

const ETIQUETA_ACCION: Record<EstadoPedido, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'Preparar',
  ENTREGADO: 'Entregar',
  CANCELADO: 'Cancelar',
}

export function AdminPedidosPage() {
  const [estado, setEstado] = useState<EstadoPedido | ''>('')
  const [detalle, setDetalle] = useState<Pedido | null>(null)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)
  const { data, isPending, isError, error, refetch } = usePedidos({
    skip: 0,
    limit: 100,
    estado: estado || undefined,
  })
  const cambiar = useCambiarEstadoPedido()

  const columnas = useMemo<ColumnDef<Pedido>[]>(
    () => [
      { accessorKey: 'id', header: '#' },
      {
        accessorKey: 'created_at',
        header: 'Fecha',
        cell: ({ row }) => formatearFecha(row.original.created_at),
      },
      { accessorKey: 'usuario_id', header: 'Usuario (id)' },
      {
        accessorKey: 'estado',
        header: 'Estado',
        cell: ({ row }) => <BadgeEstado estado={row.original.estado} />,
      },
      { accessorKey: 'forma_pago', header: 'Pago' },
      {
        accessorKey: 'total',
        header: 'Total',
        cell: ({ row }) => formatearPrecio(row.original.total),
      },
      {
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const pedido = row.original
          return (
            <div className="flex flex-wrap gap-2">
              <Button tamano="sm" variante="secundario" onClick={() => setDetalle(pedido)}>
                Detalle
              </Button>
              {TRANSICIONES[pedido.estado].map((destino) => (
                <Button
                  key={destino}
                  tamano="sm"
                  variante={destino === 'CANCELADO' ? 'peligro' : 'primario'}
                  onClick={() => {
                    if (
                      destino === 'CANCELADO' &&
                      !window.confirm(`¿Cancelar el pedido #${pedido.id}? Se restituirá el stock.`)
                    ) {
                      return
                    }
                    setErrorAccion(null)
                    cambiar.mutate(
                      { id: pedido.id, estado: destino },
                      { onError: (e) => setErrorAccion(handleApiError(e)) },
                    )
                  }}
                >
                  {ETIQUETA_ACCION[destino]}
                </Button>
              ))}
            </div>
          )
        },
      },
    ],
    [],
  )

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <select
          aria-label="Filtrar por estado"
          className={`${claseInput} max-w-xs`}
          value={estado}
          onChange={(e) => setEstado(e.target.value as EstadoPedido | '')}
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
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
        <EstadoVacio titulo="No hay pedidos para mostrar" />
      ) : (
        <DataTable columns={columnas} data={data.items} />
      )}
      <DetallePedidoModal pedido={detalle} onCerrar={() => setDetalle(null)} />
    </div>
  )
}
