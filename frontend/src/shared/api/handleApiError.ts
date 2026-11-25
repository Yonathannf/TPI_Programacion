import { isAxiosError } from 'axios'

interface ErrorDetalle422 {
  loc?: (string | number)[]
  msg?: string
}

/** Convierte el `detail` de la API en un mensaje legible para la pantalla. */
export function handleApiError(error: unknown): string {
  if (isAxiosError(error)) {
    if (!error.response) {
      return 'No se pudo conectar con el servidor. Verificá que el backend esté corriendo.'
    }
    const detail = (error.response.data as { detail?: unknown } | undefined)?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      return (detail as ErrorDetalle422[])
        .map((d) => {
          const campo = d.loc?.[d.loc.length - 1]
          return campo !== undefined ? `${String(campo)}: ${d.msg ?? ''}` : (d.msg ?? '')
        })
        .join(' · ')
    }
    return `Error ${error.response.status}`
  }
  if (error instanceof Error) return error.message
  return 'Ocurrió un error inesperado'
}
