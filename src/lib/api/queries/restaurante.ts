import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";
import { Restaurante } from "@/types/domain";

export function useRestauranteAdmin() {
  return useQuery({
    queryKey: ["restaurante-admin"],
    queryFn: () => apiGet<ApiResponse<Restaurante>>("/cliente/restaurante", true),
  });
}

export function useAtualizarRestaurante() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dados: Partial<Omit<Restaurante, "id" | "slug">>) =>
      apiPatch<ApiResponse<Restaurante>>("/cliente/restaurante", dados),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["restaurante-admin"] }),
  });
}
