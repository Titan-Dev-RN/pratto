import { useMutation, useQuery } from "@tanstack/react-query";
import { apiGet, apiPost, toNumber } from "@/lib/api/client";
import { V1CriarPedidoPublicoPayload } from "@/types/api";
import { PedidoV1 } from "@/types/domain";

/* Superfície V1 — vitrine pública:
   - POST /api/v1/publico/restaurantes/:slug/pedidos  (criar pedido)
   - GET  /api/v1/publico/pedidos/:id                 (detalhar/rastrear)

   Restaurante/categorias/produtos públicos ficam em queries/v1/
   restaurante.ts e queries/v1/{categorias,produtos}.ts.

   ⚠️ NÃO CONFIRMADO AO VIVO. Diferente do checkout público da `/api/*`
   (`/api/public/storefront/:slug/orders`, confirmado, só delivery,
   resposta `{ codigo_rastreio, total }`): aqui aceita qualquer `tipo` e
   o rastreio é por `id` numérico, não por código. Sem exemplo de
   resposta no Insomnia — assume o shape de PedidoV1. */

export function useCriarPedidoPublicoV1(slug: string) {
  return useMutation({
    mutationFn: (payload: V1CriarPedidoPublicoPayload) =>
      apiPost<PedidoV1>(`/v1/publico/restaurantes/${slug}/pedidos`, payload, false),
  });
}

function normalizar(raw: PedidoV1): PedidoV1 {
  return {
    ...raw,
    total: toNumber(raw.total),
    itens: raw.itens?.map((i) => ({ ...i, preco_unitario: toNumber(i.preco_unitario) })),
  };
}

export function usePedidoPublicoV1(id: string | null) {
  return useQuery({
    queryKey: ["v1", "publico", "pedido", id],
    queryFn: async () => normalizar(await apiGet<PedidoV1>(`/v1/publico/pedidos/${id}`, false)),
    enabled: !!id,
    refetchInterval: 15_000,
  });
}
