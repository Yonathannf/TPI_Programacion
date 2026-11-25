const moneda = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 2,
})

export function formatearPrecio(valor: number): string {
  return moneda.format(valor)
}

export function formatearFecha(iso: string): string {
  // El backend guarda UTC sin zona; se interpreta como UTC
  const fecha = new Date(iso.endsWith('Z') ? iso : `${iso}Z`)
  return fecha.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
}
