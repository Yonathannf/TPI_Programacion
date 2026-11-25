import { useState } from 'react'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Paginacion } from '../../../shared/components/Paginacion'
import { SkeletonTarjetas } from '../../../shared/components/Skeleton'
import { useDebounce } from '../../../shared/hooks/useDebounce'
import { claseInput } from '../../../shared/ui/Input'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import { ProductoCard } from '../components/ProductoCard'
import { useProductos } from '../hooks/useProductos'

const POR_PAGINA = 8

export function CatalogoPage() {
  const [busqueda, setBusqueda] = useState('')
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined)
  const [pagina, setPagina] = useState(0)
  const search = useDebounce(busqueda.trim())

  const categorias = useCategorias()
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useProductos({
    skip: pagina * POR_PAGINA,
    limit: POR_PAGINA,
    search: search || undefined,
    categoria_id: categoriaId,
  })

  const totalPaginas = data ? Math.ceil(data.total / POR_PAGINA) : 0

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold">Menú</h1>
        <p className="text-stone-500">Elegí tus platos favoritos y armá tu pedido.</p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          placeholder="Buscar por nombre…"
          aria-label="Buscar productos"
          className={`${claseInput} sm:max-w-sm`}
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value)
            setPagina(0)
          }}
        />
        <select
          aria-label="Filtrar por categoría"
          className={`${claseInput} sm:max-w-xs`}
          value={categoriaId ?? ''}
          onChange={(e) => {
            setCategoriaId(e.target.value ? Number(e.target.value) : undefined)
            setPagina(0)
          }}
        >
          <option value="">Todas las categorías</option>
          {categorias.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      {isPending ? (
        <SkeletonTarjetas cantidad={POR_PAGINA} />
      ) : isError ? (
        <EstadoError error={error} onReintentar={() => void refetch()} />
      ) : data.items.length === 0 ? (
        <EstadoVacio
          titulo="No encontramos productos"
          descripcion="Probá con otra búsqueda o con otra categoría."
        />
      ) : (
        <div
          className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 ${
            isPlaceholderData ? 'opacity-60' : ''
          }`}
        >
          {data.items.map((p) => (
            <ProductoCard key={p.id} producto={p} />
          ))}
        </div>
      )}

      <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
    </div>
  )
}
