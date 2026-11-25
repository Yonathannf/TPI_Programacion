import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cambiarEstadoPedido } from '../api/pedidos'
import type { EstadoPedido } from '../types/pedido'

export function useCambiarEstadoPedido() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) =>
      cambiarEstadoPedido(id, estado),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['pedidos'] })
      // Cancelar restituye stock
      void qc.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}
