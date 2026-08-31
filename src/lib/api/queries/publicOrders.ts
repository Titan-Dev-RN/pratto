import { useMutation, useQuery } from "@tanstack/react-query";
import { apiGet, apiGetCliente, apiPostCliente, toNumber } from "@/lib/api/client";
import { CriarPedidoPublicoPayload, PedidoPublicoConfirmacao } from "@/types/api";
import { PedidoPublico } from "@/types/domain";

/* POST /api/public/storefront/:slug/orders — checkout real de delivery.
   Exige cliente autenticado (token de lib/store/clienteCadastro.ts): o
   backend vincula o pedido ao cliente_id do token, é isso que forma o
   histórico em usePedidosCliente(). */
export function useCriarPedidoPublico(slug: string) {
  return useMutation({
    mutationFn: (payload: CriarPedidoPublicoPayload) =>
      apiPostCliente<PedidoPublicoConfirmacao>(`/public/storefront/${slug}/orders`, payload),
  });
}

function normalizar(raw: PedidoPublico): PedidoPublico {
  return {
    ...raw,
    total: toNumber(raw.total),
    items: raw.items.map((i) => ({ ...i, preco_unitario: toNumber(i.preco_unitario) })),
  };
}

/* GET /api/public/orders/:codigo_rastreio — rastreio real, sem login. */
export function usePedidoPublico(codigo: string | null) {
  return useQuery({
    queryKey: ["pedido-publico", codigo],
    queryFn: async () => normalizar(await apiGet<PedidoPublico>(`/public/orders/${codigo}`, false)),
    enabled: !!codigo,
    refetchInterval: 15_000,
  });
}

/* GET /api/public/storefront/:slug/orders — "Meus pedidos" de verdade,
   filtrado no backend por cliente_id (token do cliente autenticado). */
export function usePedidosCliente(slug: string, autenticado: boolean) {
  return useQuery({
    queryKey: ["pedidos-cliente", slug],
    queryFn: async () => {
      const pedidos = await apiGetCliente<PedidoPublico[]>(`/public/storefront/${slug}/orders`);
      return pedidos.map(normalizar);
    },
    enabled: autenticado,
    refetchInterval: 15_000,
  });
}
