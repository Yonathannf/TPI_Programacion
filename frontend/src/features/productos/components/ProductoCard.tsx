import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { formatearPrecio } from '../../../shared/utils/formato'
import { useCartStore } from '../../../store/cartStore'
import type { Producto } from '../types/producto'

export function ProductoCard({ producto }: { producto: Producto }) {
  const agregar = useCartStore((s) => s.agregar)
  const enCarrito = useCartStore(
    (s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0,
  )
  const sinStock = !producto.disponible || producto.stock <= 0
  const alLimite = enCarrito >= producto.stock

  return (
    <Card className="flex flex-col overflow-hidden">
      {producto.imagen_url ? (
        <img
          src={producto.imagen_url}
          alt={producto.nombre}
          loading="lazy"
          className="h-40 w-full object-cover"
        />
      ) : (
        <div className="flex h-40 items-center justify-center bg-stone-100 text-4xl">🍽️</div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs font-medium uppercase text-brand-600">
          {producto.categoria.nombre}
        </span>
        <h3 className="mt-1 font-semibold">{producto.nombre}</h3>
        {producto.descripcion && (
          <p className="mt-1 line-clamp-2 text-sm text-stone-500">{producto.descripcion}</p>
        )}
        <div className="mt-auto pt-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-lg font-bold">{formatearPrecio(producto.precio_base)}</span>
            <span className={`text-xs ${sinStock ? 'text-red-600' : 'text-stone-500'}`}>
              {sinStock ? 'Sin stock' : `Stock: ${producto.stock}`}
            </span>
          </div>
          <Button
            className="w-full"
            disabled={sinStock || alLimite}
            onClick={() =>
              agregar({
                producto_id: producto.id,
                nombre: producto.nombre,
                precio_unitario: producto.precio_base,
                imagen_url: producto.imagen_url,
              })
            }
          >
            {sinStock ? 'No disponible' : alLimite ? 'Máximo en carrito' : 'Agregar al carrito'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
