import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPut, toNumber } from "@/lib/api/client";
import { V1AtualizarRestaurantePayload } from "@/types/api";
import { RestauranteConfig, RestaurantePublico } from "@/types/domain";

/* Superfície V1 — GET/PUT /api/v1/cliente/restaurante e
   GET /api/v1/publico/restaurantes/:slug.

   ⚠️ NÃO CONFIRMADO AO VIVO. Derivado do arquivo Insomnia. O app até
   então não tinha nenhum endpoint de dados do restaurante (a `/api/*`
   não expõe essa entidade) — nome/logo vinham do mock. */

function normTaxa<T extends { taxa_servico?: number | null }>(raw: T): T {
  if (raw.taxa_servico == null) return raw;
  return { ...raw, taxa_servico: toNumber(raw.taxa_servico) };
}

export function useRestauranteConfig() {
  return useQuery({
    queryKey: ["v1", "restaurante"],
    queryFn: async () => normTaxa(await apiGet<RestauranteConfig>("/v1/cliente/restaurante")),
    staleTime: 60_000,
  });
}

export function useAtualizarRestaurante() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: V1AtualizarRestaurantePayload) =>
      apiPut<RestauranteConfig>("/v1/cliente/restaurante", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["v1", "restaurante"] }),
  });
}

/* Vitrine pública — sem token. */
export function useRestaurantePublico(slug: string) {
  return useQuery({
    queryKey: ["v1", "publico", "restaurante", slug],
    queryFn: async () => normTaxa(await apiGet<RestaurantePublico>(`/v1/publico/restaurantes/${slug}`, false)),
    enabled: !!slug,
    staleTime: 60_000,
  });
}
