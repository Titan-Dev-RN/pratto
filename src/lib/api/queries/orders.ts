import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch, apiPost } from "@/lib/api/client";
import { ApiResponse, AtualizarStatusPayload, CriarPedidoPayload, ImprimirPayload, ImprimirResponse } from "@/types/api";
import { Pedido } from "@/types/domain";

export function usePedidos(restauranteId: string) {
  return useQuery({
    queryKey: ["pedidos", restauranteId],
    queryFn: () => apiGet<ApiResponse<Pedido[]>>(`/pedidos?restaurante_id=${restauranteId}`, true),
    refetchInterval: 30_000,
  });
}

export function usePedido(id: string) {
  return useQuery({
    queryKey: ["pedido", id],
    queryFn: () => apiGet<ApiResponse<Pedido>>(`/pedidos/${id}`),
    refetchInterval: 5_000,
  });
}

export function useCriarPedido(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CriarPedidoPayload) =>
      apiPost<ApiResponse<Pedido>>(`/restaurantes/${slug}/pedidos`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pedidos"] });
      qc.invalidateQueries({ queryKey: ["mesas"] });
    },
  });
}

export function useAtualizarStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiPatch<ApiResponse<Pedido>>(`/pedidos/${id}/status`, { status } as AtualizarStatusPayload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["pedido", id] });
      qc.invalidateQueries({ queryKey: ["pedidos"] });
    },
  });
}

export function useImprimir() {
  return useMutation({
    mutationFn: (payload: ImprimirPayload) =>
      apiPost<ImprimirResponse>("/impressao", payload, true),
  });
}
