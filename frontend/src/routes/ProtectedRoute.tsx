import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Rol } from '../features/auth/types/auth'
import { useAuthStore } from '../store/authStore'

interface ProtectedRouteProps {
  /** Roles permitidos; si se omite, basta con tener sesión. */
  roles?: Rol[]
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const usuario = useAuthStore((s) => s.usuario)
  const cargando = useAuthStore((s) => s.cargando)
  const location = useLocation()

  if (cargando) {
    return <p className="py-20 text-center text-stone-500">Verificando sesión…</p>
  }
  if (!usuario) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (roles && !roles.includes(usuario.role)) {
    return <Navigate to="/unauthorized" replace />
  }
  return <Outlet />
}
