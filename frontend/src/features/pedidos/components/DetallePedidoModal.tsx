import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Modal } from '../../../shared/ui/Modal'
import { formatearFecha, formatearPrecio } from '../../../shared/utils/formato'
import type { Pedido } from '../types/pedido'

interface DetallePedidoModalProps {
  pedido: Pedido | null
  onCerrar: () => void
}

export function DetallePedidoModal({ pedido, onCerrar }: DetallePedidoModalProps) {
  return (
    <Modal abierto={pedido !== null} titulo={`Pedido #${pedido?.id ?? ''}`} onCerrar={onCerrar}>
      {pedido && (
        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <BadgeEstado estado={pedido.estado} />
            <span className="text-stone-500">{formatearFecha(pedido.created_at)}</span>
          </div>
          <dl className="grid grid-cols-3 gap-y-1">
            <dt className="text-stone-500">Dirección</dt>
            <dd className="col-span-2">{pedido.direccion_entrega}</dd>
            <dt className="text-stone-500">Forma de pago</dt>
            <dd className="col-span-2">{pedido.forma_pago}</dd>
            {pedido.notas && (
              <>
                <dt className="text-stone-500">Notas</dt>
                <dd className="col-span-2">{pedido.notas}</dd>
              </>
            )}
          </dl>
          <table className="w-full text-left">
            <thead className="border-b border-stone-200 text-xs uppercase text-stone-500">
              <tr>
                <th className="py-2">Producto</th>
                <th className="py-2 text-right">Cant.</th>
                <th className="py-2 text-right">Precio</th>
                <th className="py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {pedido.items.map((item) => (
                <tr key={item.producto_id}>
                  <td className="py-2">{item.nombre_producto}</td>
                  <td className="py-2 text-right">{item.cantidad}</td>
                  <td className="py-2 text-right">{formatearPrecio(item.precio_unitario)}</td>
                  <td className="py-2 text-right">{formatearPrecio(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-right text-base font-bold">Total: {formatearPrecio(pedido.total)}</p>
        </div>
      )}
    </Modal>
  )
}
