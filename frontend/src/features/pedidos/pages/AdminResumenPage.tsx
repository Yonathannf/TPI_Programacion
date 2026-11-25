import { EstadoError } from '../../../shared/components/EstadoError'
import { Skeleton } from '../../../shared/components/Skeleton'
import { formatearPrecio } from '../../../shared/utils/formato'
import { TarjetaResumen } from '../components/TarjetaResumen'
import { useResumenPedidos } from '../hooks/useResumenPedidos'

export function AdminResumenPage() {
  const { data, isPending, isError, error, refetch } = useResumenPedidos()

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Resumen del negocio</h1>
      {isPending ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : isError ? (
        <EstadoError error={error} onReintentar={() => void refetch()} />
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <TarjetaResumen titulo="Pendientes" valor={data.pendientes} acento="text-amber-600" />
          <TarjetaResumen titulo="En preparación" valor={data.en_preparacion} acento="text-blue-600" />
          <TarjetaResumen titulo="Entregados" valor={data.entregados} acento="text-green-600" />
          <TarjetaResumen titulo="Cancelados" valor={data.cancelados} acento="text-red-600" />
          <TarjetaResumen titulo="Pedidos de hoy" valor={data.pedidos_hoy} />
          <TarjetaResumen
            titulo="Ingresos (entregados)"
            valor={formatearPrecio(data.ingresos_entregados)}
            acento="text-brand-600"
          />
        </div>
      )}
    </div>
  )
}
