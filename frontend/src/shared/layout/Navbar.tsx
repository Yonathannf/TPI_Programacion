import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import { Button } from '../ui/Button'

const claseLink = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-brand-100 text-brand-700' : 'text-stone-600 hover:bg-stone-100'
  }`

export function Navbar() {
  const usuario = useAuthStore((s) => s.usuario)
  const logout = useAuthStore((s) => s.logout)
  const cantidad = useCartStore((s) => s.items.reduce((acc, i) => acc + i.cantidad, 0))
  const navigate = useNavigate()

  const cerrarSesion = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
        <NavLink to="/" className="mr-4 text-xl font-extrabold text-brand-600">
          🍔 Food Store
        </NavLink>
        <nav className="flex flex-wrap items-center gap-1">
          <NavLink to="/" end className={claseLink}>
            Catálogo
          </NavLink>
          <NavLink to="/carrito" className={claseLink}>
            Carrito{cantidad > 0 && (
              <span className="ml-1 rounded-full bg-brand-600 px-1.5 py-0.5 text-xs text-white">
                {cantidad}
              </span>
            )}
          </NavLink>
          {usuario && (
            <NavLink to="/mis-pedidos" className={claseLink}>
              Mis pedidos
            </NavLink>
          )}
          {usuario?.role === 'admin' && (
            <>
              <span className="mx-2 h-5 w-px bg-stone-300" aria-hidden />
              <NavLink to="/admin/resumen" className={claseLink}>
                Resumen
              </NavLink>
              <NavLink to="/admin/categorias" className={claseLink}>
                Categorías
              </NavLink>
              <NavLink to="/admin/productos" className={claseLink}>
                Productos
              </NavLink>
              <NavLink to="/admin/pedidos" className={claseLink}>
                Pedidos
              </NavLink>
              <NavLink to="/admin/usuarios" className={claseLink}>
                Usuarios
              </NavLink>
            </>
          )}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          {usuario ? (
            <>
              <div className="text-right text-sm leading-tight">
                <p className="font-semibold">{usuario.full_name}</p>
                <p className="text-xs uppercase text-stone-500">{usuario.role}</p>
              </div>
              <Button variante="secundario" onClick={cerrarSesion}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={claseLink}>
                Ingresar
              </NavLink>
              <NavLink
                to="/register"
                className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
              >
                Registrarme
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
