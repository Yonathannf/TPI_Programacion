import { useMutation, useQueryClient } from '@tanstack/react-query'
import { crearPedido } from '../api/pedidos'
import type { PedidoCreate } from '../types/pedido'

export function useCrearPedido() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (datos: PedidoCreate) => crearPedido(datos),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['pedidos'] })
      // El stock cambió al crear el pedido
      void qc.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}
