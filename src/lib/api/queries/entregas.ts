import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch, toNumber } from "@/lib/api/client";
import { AtualizarStatusDeliveryPayload } from "@/types/api";
import { Comanda } from "@/types/domain";

/* GET /api/delivery_orders — pelos campos da comanda (nome_cliente,
   telefone_cliente, endereco_entrega, codigo_rastreio), tudo indica que
   é a mesma entidade `commands` filtrada por tipo=delivery, não um
   recurso à parte. Sem dado real ainda pra confirmar 100% do shape (a
   loja de teste não tem nenhum pedido delivery). */
function normalizar(raw: Comanda): Comanda {
  return { ...raw, total: toNumber(raw.total) };
}

export function useEntregas() {
  return useQuery({
    queryKey: ["entregas"],
    queryFn: async () => (await apiGet<Comanda[]>("/delivery_orders")).map(normalizar),
    refetchInterval: 30_000,
  });
}

export function useAtualizarStatusEntrega() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AtualizarStatusDeliveryPayload }) =>
      apiPatch<Comanda>(`/delivery_orders/${id}/status`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["entregas"] }),
  });
}
