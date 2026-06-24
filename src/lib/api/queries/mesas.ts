import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";
import { Mesa } from "@/types/domain";

export function useMesas(restauranteId: string) {
  return useQuery({
    queryKey: ["mesas", restauranteId],
    queryFn: () => apiGet<ApiResponse<Mesa[]>>(`/mesas?restaurante_id=${restauranteId}`, true),
    staleTime: 10_000,
  });
}

export function useMesa(id: string) {
  return useQuery({
    queryKey: ["mesa", id],
    queryFn: () => apiGet<ApiResponse<Mesa>>(`/mesas/${id}`),
  });
}

export function useAbrirMesa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiPatch<ApiResponse<Mesa>>(`/mesas/${id}/abrir`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mesas"] }),
  });
}

export function useFecharMesa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiPatch<ApiResponse<Mesa>>(`/mesas/${id}/fechar`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mesas"] });
      qc.invalidateQueries({ queryKey: ["pedidos"] });
    },
  });
}
