import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";
import { Mesa } from "@/types/domain";

export function useMesas() {
  return useQuery({
    queryKey: ["mesas"],
    queryFn: () => apiGet<ApiResponse<Mesa[]>>("/cliente/mesas", true),
    staleTime: 10_000,
  });
}

export function useMesa(id: string) {
  return useQuery({
    queryKey: ["mesa", id],
    queryFn: () => apiGet<ApiResponse<Mesa>>(`/cliente/mesas/${id}`, true),
  });
}

export function useAbrirMesa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiPatch<ApiResponse<Mesa>>(`/cliente/mesas/${id}/abrir`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mesas"] }),
  });
}

export function useFecharMesa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, forma_pagamento }: { id: string; forma_pagamento?: string }) =>
      apiPatch<ApiResponse<Mesa>>(`/cliente/mesas/${id}/fechar`, { forma_pagamento }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mesas"] });
      qc.invalidateQueries({ queryKey: ["pedidos"] });
    },
  });
}

export function useAtualizarStatusMesa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiPatch<ApiResponse<Mesa>>(`/cliente/mesas/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mesas"] }),
  });
}
