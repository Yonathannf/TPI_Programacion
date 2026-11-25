import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { loginRequest, logoutRequest, obtenerPerfil } from '../features/auth/api/auth'
import type { SesionUsuario, UserPublic } from '../features/auth/types/auth'
import { queryClient } from '../shared/api/queryClient'

interface AuthState {
  usuario: SesionUsuario | null
  cargando: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  limpiarSesion: () => void
}

function aSesion(u: UserPublic): SesionUsuario {
  return { id: u.id, username: u.username, full_name: u.full_name, email: u.email, role: u.role }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,
      login: async (username, password) => {
        await loginRequest(username, password)
        const perfil = await obtenerPerfil()
        set({ usuario: aSesion(perfil), cargando: false })
      },
      logout: async () => {
        try {
          await logoutRequest()
        } finally {
          set({ usuario: null })
          queryClient.clear()
        }
      },
      checkSession: async () => {
        try {
          const perfil = await obtenerPerfil()
          set({ usuario: aSesion(perfil), cargando: false })
        } catch {
          set({ usuario: null, cargando: false })
        }
      },
      limpiarSesion: () => {
        set({ usuario: null })
        queryClient.clear()
      },
    }),
    {
      name: 'food-store-auth',
      // Solo se guarda el usuario; nunca el token ni el estado de carga
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
)
