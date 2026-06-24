import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";
import { DashboardKPI } from "@/types/domain";

export function useDashboard(restauranteId: string) {
  return useQuery({
    queryKey: ["dashboard", restauranteId],
    queryFn: () =>
      apiGet<ApiResponse<DashboardKPI>>(
        `/dashboard?restaurante_id=${restauranteId}`,
        true
      ),
    refetchInterval: 60_000,
  });
}
