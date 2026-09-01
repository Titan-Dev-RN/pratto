import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch, toNumber } from "@/lib/api/client";
import { AtualizarStatusItemPayload } from "@/types/api";
import { ItemComanda, ItemComandaStatus } from "@/types/domain";

function normalizar(raw: ItemComanda): ItemComanda {
  return { ...raw, preco_unitario: toNumber(raw.preco_unitario) };
}

/* GET /api/kitchen/orders — cada linha é um ITEM (não a comanda inteira),
   com `comanda_id`/`comanda.mesa_id` e `produto` embutidos. A tela da
   cozinha precisa agrupar por `comanda_id` pra virar um card de pedido. */
export function useKitchenOrders(status?: ItemComandaStatus) {
  return useQuery({
    queryKey: ["kitchen-orders", status ?? "todos"],
    queryFn: async () => {
      const qs = status ? `?status=${status}` : "";
      return (await apiGet<ItemComanda[]>(`/kitchen/orders${qs}`)).map(normalizar);
    },
    refetchInterval: 15_000,
  });
}

/* Status válidos confirmados ao vivo contra o backend: pendente,
   em_andamento, pronto. "entregue" NÃO existe pro backend (PATCH com esse
   valor derruba 500 "'entregue' is not a valid status") — entrega é
   controlada só no front (ver useComandaLocalStore). */
export function useAtualizarStatusItemCozinha() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AtualizarStatusItemPayload }) =>
      apiPatch<{ order_item: ItemComanda }>(`/kitchen/orders/${id}/status`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kitchen-orders"] }),
  });
}
