import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiDelete, apiGet, apiPatch, apiPost, toNumber } from "@/lib/api/client";
import { AtualizarMesaPayload, CriarMesaPayload } from "@/types/api";
import { Mesa } from "@/types/domain";

/* GET /api/tables — payload de leitura já vem com os nomes certos
   (numero/status/capacidade), só `active_command.total` precisa de
   normalização (Rails serializa decimal como string). */
function normalizarMesa(raw: Mesa): Mesa {
  if (!raw.active_command) return raw;
  return { ...raw, active_command: { ...raw.active_command, total: toNumber(raw.active_command.total) } };
}

export function useMesas() {
  return useQuery({
    queryKey: ["mesas"],
    queryFn: async () => (await apiGet<Mesa[]>("/tables")).map(normalizarMesa),
    staleTime: 10_000,
    refetchInterval: 15_000,
  });
}

export function useMesa(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["mesa", id],
    queryFn: async () => normalizarMesa(await apiGet<Mesa>(`/tables/${id}`)),
    enabled: options?.enabled ?? true,
  });
}

export function useCriarMesa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CriarMesaPayload) => apiPost<Mesa>("/tables", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mesas"] }),
  });
}

export function useAtualizarMesa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AtualizarMesaPayload }) =>
      apiPatch<Mesa>(`/tables/${id}`, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["mesas"] });
      qc.invalidateQueries({ queryKey: ["mesa", id] });
    },
  });
}

export function useExcluirMesa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete<void>(`/tables/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mesas"] }),
  });
}
