import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch, apiPost, toNumber } from "@/lib/api/client";
import { V1AtualizarStatusPedidoPayload, V1CriarPedidoPayload } from "@/types/api";
import { PedidoV1 } from "@/types/domain";

/* Superfície V1 — /api/v1/cliente/pedidos (listar / detalhar / criar /
   atualizar status).

   ⚠️ NÃO CONFIRMADO AO VIVO. Modelo bem diferente da `/api/*`, onde
   "pedido" não existe como recurso: lá há `commands` (mesa),
   `kitchen/orders` (fila por item) e `delivery_orders`. Aqui é um recurso
   único `pedidos` com os itens no mesmo corpo de criação.

   Status: o exemplo do Insomnia usa "entregue" — na fila da cozinha da
   `/api/*` esse valor derrubava 500. Na v1 pode ser válido (é status de
   PEDIDO, não de item). Não confirmado. */

const KEY = ["v1", "pedidos"];

function normalizar(raw: PedidoV1): PedidoV1 {
  return {
    ...raw,
    total: toNumber(raw.total),
    itens: raw.itens?.map((i) => ({ ...i, preco_unitario: toNumber(i.preco_unitario) })),
  };
}

export function usePedidosV1(params?: { status?: string; tipo?: string }) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.tipo) qs.set("tipo", params.tipo);
  const suffix = qs.toString() ? `?${qs}` : "";
  return useQuery({
    queryKey: [...KEY, params?.status ?? "todos", params?.tipo ?? "todos"],
    queryFn: async () => (await apiGet<PedidoV1[]>(`/v1/cliente/pedidos${suffix}`)).map(normalizar),
    refetchInterval: 15_000,
  });
}

export function usePedidoV1(id: string | null | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["v1", "pedido", id],
    queryFn: async () => normalizar(await apiGet<PedidoV1>(`/v1/cliente/pedidos/${id}`)),
    enabled: (options?.enabled ?? true) && !!id,
    refetchInterval: 10_000,
  });
}

export function useCriarPedidoV1() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: V1CriarPedidoPayload) => apiPost<PedidoV1>("/v1/cliente/pedidos", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ["v1", "mesas"] });
    },
  });
}

export function useAtualizarStatusPedidoV1() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: V1AtualizarStatusPedidoPayload }) =>
      apiPatch<PedidoV1>(`/v1/cliente/pedidos/${id}/status`, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ["v1", "pedido", id] });
    },
  });
}
