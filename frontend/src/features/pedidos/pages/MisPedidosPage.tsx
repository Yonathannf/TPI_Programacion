import { useState } from 'react'
import { Link } from 'react-router-dom'
import { handleApiError } from '../../../shared/api/handleApiError'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Paginacion } from '../../../shared/components/Paginacion'
import { SkeletonFilas } from '../../../shared/components/Skeleton'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { formatearFecha, formatearPrecio } from '../../../shared/utils/formato'
import { DetallePedidoModal } from '../components/DetallePedidoModal'
import { useCancelarPedido } from '../hooks/useCancelarPedido'
import { usePedidos } from '../hooks/usePedidos'
import type { Pedido } from '../types/pedido'

const POR_PAGINA = 10

export function MisPedidosPage() {
  const [pagina, setPagina] = useState(0)
  const [detalle, setDetalle] = useState<Pedido | null>(null)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)
  const { data, isPending, isError, error, refetch } = usePedidos({
    skip: pagina * POR_PAGINA,
    limit: POR_PAGINA,
  })
  const cancelar = useCancelarPedido()

  const pedirCancelacion = (pedido: Pedido) => {
    if (!window.confirm(`¿Cancelar el pedido #${pedido.id}?`)) return
    setErrorAccion(null)
    cancelar.mutate(pedido.id, { onError: (e) => setErrorAccion(handleApiError(e)) })
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Mis pedidos</h1>
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
        <EstadoVacio
          titulo="Todavía no hiciste ningún pedido"
          accion={
            <Link to="/" className="font-medium text-brand-600 hover:underline">
              Ver el catálogo
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {data.items.map((pedido) => (
            <Card key={pedido.id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-24">
                <p className="font-semibold">Pedido #{pedido.id}</p>
                <p className="text-xs text-stone-500">{formatearFecha(pedido.created_at)}</p>
              </div>
              <BadgeEstado estado={pedido.estado} />
              <p className="flex-1 text-sm text-stone-600">
                {pedido.items.length} {pedido.items.length === 1 ? 'producto' : 'productos'} ·{' '}
                {pedido.forma_pago}
              </p>
              <p className="font-bold">{formatearPrecio(pedido.total)}</p>
              <div className="flex gap-2">
                <Button tamano="sm" variante="secundario" onClick={() => setDetalle(pedido)}>
                  Ver detalle
                </Button>
                {pedido.estado === 'PENDIENTE' && (
                  <Button
                    tamano="sm"
                    variante="peligro"
                    disabled={cancelar.isPending}
                    onClick={() => pedirCancelacion(pedido)}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
      <Paginacion
        pagina={pagina}
        totalPaginas={data ? Math.ceil(data.total / POR_PAGINA) : 0}
        onCambiar={setPagina}
      />
      <DetallePedidoModal pedido={detalle} onCerrar={() => setDetalle(null)} />
    </div>
  )
}
