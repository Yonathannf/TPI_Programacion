import { axiosInstance } from '../../../shared/api/axiosInstance'
import type { UserCreate, UserPublic } from '../types/auth'

export async function loginRequest(username: string, password: string): Promise<void> {
  const form = new URLSearchParams()
  form.set('username', username)
  form.set('password', password)
  await axiosInstance.post('/auth/token', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

export async function logoutRequest(): Promise<void> {
  await axiosInstance.post('/auth/logout')
}

export async function obtenerPerfil(): Promise<UserPublic> {
  const { data } = await axiosInstance.get<UserPublic>('/auth/me')
  return data
}

export async function registrarUsuario(datos: UserCreate): Promise<UserPublic> {
  const { data } = await axiosInstance.post<UserPublic>('/auth/register', datos)
  return data
}
