import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiDelete, apiGet, apiPatch, apiPost, toNumber } from "@/lib/api/client";
import { AtualizarMesaPayload, CriarMesaPayload } from "@/types/api";
import { Mesa } from "@/types/domain";

<<<<<<< HEAD
export function useMesas() {
  return useQuery({
    queryKey: ["mesas"],
    queryFn: () => apiGet<ApiResponse<Mesa[]>>("/cliente/mesas", true),
=======
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
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59
    staleTime: 10_000,
    refetchInterval: 15_000,
  });
}

export function useMesa(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["mesa", id],
<<<<<<< HEAD
    queryFn: () => apiGet<ApiResponse<Mesa>>(`/cliente/mesas/${id}`, true),
=======
    queryFn: async () => normalizarMesa(await apiGet<Mesa>(`/tables/${id}`)),
    enabled: options?.enabled ?? true,
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59
  });
}

export function useCriarMesa() {
  const qc = useQueryClient();
  return useMutation({
<<<<<<< HEAD
    mutationFn: (id: string) =>
      apiPatch<ApiResponse<Mesa>>(`/cliente/mesas/${id}/abrir`, {}),
=======
    mutationFn: (payload: CriarMesaPayload) => apiPost<Mesa>("/tables", payload),
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mesas"] }),
  });
}

export function useAtualizarMesa() {
  const qc = useQueryClient();
  return useMutation({
<<<<<<< HEAD
    mutationFn: ({ id, forma_pagamento }: { id: string; forma_pagamento?: string }) =>
      apiPatch<ApiResponse<Mesa>>(`/cliente/mesas/${id}/fechar`, { forma_pagamento }),
    onSuccess: () => {
=======
    mutationFn: ({ id, payload }: { id: string; payload: AtualizarMesaPayload }) =>
      apiPatch<Mesa>(`/tables/${id}`, payload),
    onSuccess: (_, { id }) => {
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59
      qc.invalidateQueries({ queryKey: ["mesas"] });
      qc.invalidateQueries({ queryKey: ["mesa", id] });
    },
  });
}

<<<<<<< HEAD
export function useAtualizarStatusMesa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiPatch<ApiResponse<Mesa>>(`/cliente/mesas/${id}`, { status }),
=======
export function useExcluirMesa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete<void>(`/tables/${id}`),
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mesas"] }),
  });
}
