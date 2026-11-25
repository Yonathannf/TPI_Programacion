import { Link, useNavigate } from 'react-router-dom'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Card } from '../../../shared/ui/Card'
import { formatearPrecio } from '../../../shared/utils/formato'
import { useCartStore } from '../../../store/cartStore'
import { FormularioCheckout } from '../components/FormularioCheckout'
import { useCrearPedido } from '../hooks/useCrearPedido'
import type { PedidoCreate } from '../types/pedido'

export function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const vaciar = useCartStore((s) => s.vaciar)
  const crear = useCrearPedido()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="No hay nada para confirmar"
        descripcion="Tu carrito está vacío."
        accion={
          <Link to="/" className="font-medium text-brand-600 hover:underline">
            Ir al catálogo
          </Link>
        }
      />
    )
  }

  const confirmar = async (datos: PedidoCreate) => {
    await crear.mutateAsync(datos)
    vaciar()
    navigate('/mis-pedidos')
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Confirmar pedido</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <FormularioCheckout
            items={items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad }))}
            enviando={crear.isPending}
            onConfirmar={confirmar}
          />
        </Card>
        <Card className="h-fit p-6">
          <h2 className="mb-3 text-lg font-semibold">Tu pedido</h2>
          <ul className="space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.producto_id} className="flex justify-between gap-2">
                <span>
                  {i.cantidad} × {i.nombre}
                </span>
                <span>{formatearPrecio(i.precio_unitario * i.cantidad)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex justify-between border-t border-stone-200 pt-3 text-lg font-bold">
            <span>Total</span>
            <span>{formatearPrecio(total)}</span>
          </p>
        </Card>
      </div>
    </div>
  )
}
