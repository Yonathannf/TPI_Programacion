import type { ButtonHTMLAttributes } from 'react'

type Variante = 'primario' | 'secundario' | 'peligro' | 'fantasma'
type Tamano = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  tamano?: Tamano
}

const variantes: Record<Variante, string> = {
  primario: 'bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-600/50',
  secundario:
    'bg-white text-stone-700 border border-stone-300 hover:bg-stone-100 disabled:text-stone-400',
  peligro: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-600/50',
  fantasma: 'text-stone-600 hover:bg-stone-200 disabled:text-stone-400',
}

const tamanos: Record<Tamano, string> = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
}

export function Button({
  variante = 'primario',
  tamano = 'md',
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-1 rounded-lg font-medium transition-colors disabled:cursor-not-allowed ${variantes[variante]} ${tamanos[tamano]} ${className}`}
      {...props}
    />
  )
}
