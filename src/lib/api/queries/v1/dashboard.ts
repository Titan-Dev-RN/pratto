import { useQuery } from "@tanstack/react-query";
import { apiGet, toNumber } from "@/lib/api/client";
import { DashboardData } from "@/types/domain";

/* Superfície V1 — GET /api/v1/cliente/dashboard.

   ⚠️ NÃO CONFIRMADO AO VIVO E SEM EXEMPLO DE SHAPE no Insomnia (só a URL).
   O app hoje monta os KPIs no cliente a partir de /api/reports/sales +
   /api/tables + /api/kitchen/orders. Este endpoint deve devolver isso
   pronto; os nomes de campo em DashboardData são chute. Normaliza os
   números conhecidos e deixa o resto passar. */

function normalizar(raw: DashboardData): DashboardData {
  return {
    ...raw,
    faturamento_hoje: raw.faturamento_hoje == null ? raw.faturamento_hoje : toNumber(raw.faturamento_hoje),
    ticket_medio: raw.ticket_medio == null ? raw.ticket_medio : toNumber(raw.ticket_medio),
    vendas_7_dias: raw.vendas_7_dias?.map((d) => ({ ...d, total: toNumber(d.total) })),
    mais_vendidos: raw.mais_vendidos?.map((p) => ({ ...p, total: toNumber(p.total) })),
  };
}

export function useDashboardV1() {
  return useQuery({
    queryKey: ["v1", "dashboard"],
    queryFn: async () => normalizar(await apiGet<DashboardData>("/v1/cliente/dashboard")),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
