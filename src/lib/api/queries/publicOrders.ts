import { useQueries, useQuery } from "@tanstack/react-query";
import { apiGet, toNumber } from "@/lib/api/client";
import { PedidoPublico } from "@/types/domain";

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

/* "Meus pedidos" (fallback deslogado) — busca vários códigos de uma vez
   (guardados localmente em lib/store/historicoPedidos.ts, já que não há
   endpoint de listar pedidos sem conta de cliente). Cada um é uma
   consulta real, só a lista de "quais códigos consultar" é local. */
export function usePedidosPublicos(codigos: string[]) {
  const resultados = useQueries({
    queries: codigos.map((codigo) => ({
      queryKey: ["pedido-publico", codigo],
      queryFn: async () => normalizar(await apiGet<PedidoPublico>(`/public/orders/${codigo}`, false)),
      refetchInterval: 15_000,
    })),
  });

  return {
    pedidos: resultados.map((r, i) => ({ codigo: codigos[i], data: r.data, isLoading: r.isLoading, isError: r.isError })),
    isLoading: resultados.some((r) => r.isLoading),
  };
}
