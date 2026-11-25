import { Link, useNavigate } from 'react-router-dom'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { formatearPrecio } from '../../../shared/utils/formato'
import { useAuthStore } from '../../../store/authStore'
import { useCartStore } from '../../../store/cartStore'

export function CarritoPage() {
  const items = useCartStore((s) => s.items)
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad)
  const quitar = useCartStore((s) => s.quitar)
  const vaciar = useCartStore((s) => s.vaciar)
  const total = useCartStore((s) => s.total())
  const usuario = useAuthStore((s) => s.usuario)
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="🛒 Tu carrito está vacío"
        descripcion="Agregá productos desde el catálogo."
        accion={
          <Link to="/" className="font-medium text-brand-600 hover:underline">
            Ir al catálogo
          </Link>
        }
      />
    )
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Tu carrito</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {items.map((item) => (
            <Card key={item.producto_id} className="flex items-center gap-4 p-4">
              {item.imagen_url ? (
                <img src={item.imagen_url} alt="" className="h-16 w-16 rounded-lg object-cover" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-stone-100 text-2xl">
                  🍽️
                </div>
              )}
              <div className="flex-1">
                <p className="font-semibold">{item.nombre}</p>
                <p className="text-sm text-stone-500">{formatearPrecio(item.precio_unitario)} c/u</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  tamano="sm"
                  variante="secundario"
                  aria-label={`Quitar una unidad de ${item.nombre}`}
                  onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
                >
                  −
                </Button>
                <span className="w-6 text-center text-sm font-semibold">{item.cantidad}</span>
                <Button
                  tamano="sm"
                  variante="secundario"
                  aria-label={`Agregar una unidad de ${item.nombre}`}
                  onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                >
                  +
                </Button>
              </div>
              <p className="w-28 text-right font-semibold">
                {formatearPrecio(item.precio_unitario * item.cantidad)}
              </p>
              <Button variante="fantasma" tamano="sm" onClick={() => quitar(item.producto_id)}>
                Quitar
              </Button>
            </Card>
          ))}
        </div>
        <Card className="h-fit p-6">
          <h2 className="mb-4 text-lg font-semibold">Resumen</h2>
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatearPrecio(total)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-stone-200 pt-3 text-lg font-bold">
            <span>Total</span>
            <span>{formatearPrecio(total)}</span>
          </div>
          <Button
            className="mt-6 w-full"
            onClick={() => navigate(usuario ? '/checkout' : '/login', { state: { from: '/checkout' } })}
          >
            {usuario ? 'Continuar al checkout' : 'Ingresá para continuar'}
          </Button>
          <Button variante="fantasma" className="mt-2 w-full" onClick={vaciar}>
            Vaciar carrito
          </Button>
        </Card>
      </div>
    </div>
  )
}
