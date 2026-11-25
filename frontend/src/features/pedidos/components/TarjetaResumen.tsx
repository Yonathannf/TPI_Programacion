import { Card } from '../../../shared/ui/Card'

interface TarjetaResumenProps {
  titulo: string
  valor: string | number
  acento?: string
}

export function TarjetaResumen({ titulo, valor, acento = 'text-stone-800' }: TarjetaResumenProps) {
  return (
    <Card className="p-5">
      <p className="text-sm text-stone-500">{titulo}</p>
      <p className={`mt-2 text-3xl font-extrabold ${acento}`}>{valor}</p>
    </Card>
  )
}
