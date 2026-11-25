import axios, { isAxiosError } from 'axios'
import { useAuthStore } from '../../store/authStore'

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  withCredentials: true,
})

const RUTAS_SIN_LIMPIEZA = ['/auth/token', '/auth/me']
const CUENTA_DESACTIVADA = 'Cuenta de usuario desactivada'

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (isAxiosError(error) && error.response) {
      const { status, data } = error.response
      const url = error.config?.url ?? ''
      const detail = (data as { detail?: unknown } | undefined)?.detail
      const esSesionInvalida =
        status === 401 && !RUTAS_SIN_LIMPIEZA.some((ruta) => url.includes(ruta))
      const esCuentaDesactivada = status === 400 && detail === CUENTA_DESACTIVADA
      if (esSesionInvalida || esCuentaDesactivada) {
        // ProtectedRoute redirige a /login al quedar sin usuario
        useAuthStore.getState().limpiarSesion()
      }
    }
    return Promise.reject(error)
  },
)
