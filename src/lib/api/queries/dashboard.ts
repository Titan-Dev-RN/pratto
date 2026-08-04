import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";
import { DashboardKPI } from "@/types/domain";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => apiGet<ApiResponse<DashboardKPI>>("/cliente/dashboard", true),
    refetchInterval: 60_000,
  });
}
