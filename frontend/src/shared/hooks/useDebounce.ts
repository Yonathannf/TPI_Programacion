import { useEffect, useState } from 'react'

export function useDebounce<T>(valor: T, demoraMs = 350): T {
  const [debounced, setDebounced] = useState(valor)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(valor), demoraMs)
    return () => clearTimeout(id)
  }, [valor, demoraMs])
  return debounced
}
