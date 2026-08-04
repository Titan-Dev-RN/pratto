import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch, apiPost } from "@/lib/api/client";
import { ApiResponse, AtualizarStatusPayload, CriarPedidoPayload, ImprimirPayload, ImprimirResponse } from "@/types/api";
import { Pedido } from "@/types/domain";

export function usePedidos() {
  return useQuery({
    queryKey: ["pedidos"],
    queryFn: () => apiGet<ApiResponse<Pedido[]>>("/cliente/pedidos", true),
    refetchInterval: 30_000,
  });
}

export function usePedido(id: string, enabled = true) {
  return useQuery({
    queryKey: ["pedido", id],
    queryFn: () => apiGet<ApiResponse<Pedido>>(`/cliente/pedidos/${id}`, true),
    enabled: enabled && !!id,
    refetchInterval: 5_000,
  });
}

/* Rastreio público do pedido (cliente final, sem login) */
export function usePedidoPublico(id: string) {
  return useQuery({
    queryKey: ["pedido-publico", id],
    queryFn: () => apiGet<ApiResponse<Pedido>>(`/publico/pedidos/${id}`),
    refetchInterval: 5_000,
  });
}

/* Cliente final faz o pedido (mesa via QR ou delivery) */
export function useCriarPedido(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CriarPedidoPayload) =>
      apiPost<ApiResponse<Pedido>>(`/publico/restaurantes/${slug}/pedidos`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pedidos"] });
      qc.invalidateQueries({ queryKey: ["mesas"] });
    },
  });
}

/* Equipe lança um pedido manualmente (ex: balcão) */
export function useCriarPedidoEquipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CriarPedidoPayload) =>
      apiPost<ApiResponse<Pedido>>("/cliente/pedidos", payload, true),
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
      apiPatch<ApiResponse<Pedido>>(`/cliente/pedidos/${id}/status`, { status } as AtualizarStatusPayload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["pedido", id] });
      qc.invalidateQueries({ queryKey: ["pedidos"] });
      qc.invalidateQueries({ queryKey: ["mesas"] });
    },
  });
}

export function useImprimir() {
  return useMutation({
    mutationFn: (payload: ImprimirPayload) =>
      apiPost<ImprimirResponse>("/cliente/impressao", payload, true),
  });
}
