import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiDelete, apiGet, apiPost, toNumber } from "@/lib/api/client";
import { AbrirComandaPayload, AdicionarItemComandaPayload } from "@/types/api";
import { Comanda, ItemComanda, Mesa } from "@/types/domain";
import { useMesas } from "@/lib/api/queries/mesas";

function normalizarComanda(raw: Comanda): Comanda {
  return {
    ...raw,
    total: toNumber(raw.total),
    /* DELETE /commands/:id/items/:id é soft delete (confirmado ao vivo:
       o item continua existindo, só muda pra status "cancelado") — sem
       filtrar aqui, cada tela que soma total ou lista itens teria que
       lembrar de ignorar item cancelado, e uma delas (o cálculo local
       de FecharContaModal) já não lembrava, cobrando um item removido. */
    item_comandas: raw.item_comandas?.filter((i) => i.status !== "cancelado").map(normalizarItem),
  };
}

function normalizarItem(raw: ItemComanda): ItemComanda {
  return { ...raw, preco_unitario: toNumber(raw.preco_unitario) };
}

/* POST /api/commands — abre a comanda vazia, só com mesa (`mesa_id`) e
   loja (`loja_id`, obrigatório, não é inferido do token — confirmado ao
   vivo). Não existe campo de atendente/garçom responsável: não fica
   registrado quem abriu a comanda por aqui. Itens entram depois, um a
   um, via useAdicionarItemComanda. */
export function useAbrirComanda() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AbrirComandaPayload) => apiPost<Comanda>("/commands", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mesas"] }),
  });
}

export function useComanda(id: string | null | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["comanda", id],
    queryFn: async () => normalizarComanda(await apiGet<Comanda>(`/commands/${id}`)),
    enabled: (options?.enabled ?? true) && !!id,
    refetchInterval: 10_000,
  });
}

export function useAdicionarItemComanda() {
  const qc = useQueryClient();
  return useMutation({
    /* Corpo precisa vir envolvido em `item` — confirmado ao vivo (sem
       isso dá 400 "param is missing: item"). */
    mutationFn: ({ comandaId, payload }: { comandaId: string; payload: AdicionarItemComandaPayload }) =>
      apiPost<ItemComanda>(`/commands/${comandaId}/items`, { item: payload }),
    onSuccess: (_, { comandaId }) => {
      qc.invalidateQueries({ queryKey: ["comanda", comandaId] });
      qc.invalidateQueries({ queryKey: ["mesas"] });
      qc.invalidateQueries({ queryKey: ["kitchen-orders"] });
    },
  });
}

export function useRemoverItemComanda() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ comandaId, itemId }: { comandaId: string; itemId: string }) =>
      apiDelete<void>(`/commands/${comandaId}/items/${itemId}`),
    onSuccess: (_, { comandaId }) => {
      qc.invalidateQueries({ queryKey: ["comanda", comandaId] });
      qc.invalidateQueries({ queryKey: ["mesas"] });
      qc.invalidateQueries({ queryKey: ["kitchen-orders"] });
    },
  });
}

/* Não existe `GET /api/commands` (listar) no backend — só dá pra buscar
   uma comanda de cada vez pelo id. Pra montar uma lista de "comandas
   abertas" (garçom/caixa), atravessamos `GET /api/tables`, que já traz
   o id da comanda ativa de cada mesa (`active_command`), e buscamos o
   detalhe de cada uma em paralelo. Só cobre comandas de mesa — delivery/
   balcão ficam de fora por enquanto (fora do escopo desta etapa). */
export function useComandasAbertas() {
  const { data: mesas } = useMesas();
  const mesasComComanda = (mesas ?? []).filter((m) => !!m.active_command);

  const resultados = useQueries({
    queries: mesasComComanda.map((mesa) => ({
      queryKey: ["comanda", mesa.active_command!.id],
      queryFn: async () => normalizarComanda(await apiGet<Comanda>(`/commands/${mesa.active_command!.id}`)),
      refetchInterval: 10_000,
    })),
  });

  const comandas = resultados
    .map((r, i) => (r.data ? { comanda: r.data, mesa: mesasComComanda[i] } : null))
    .filter((v): v is { comanda: Comanda; mesa: Mesa } => v !== null);

  return {
    comandas,
    isLoading: resultados.some((r) => r.isLoading),
    isError: resultados.some((r) => r.isError),
  };
}
