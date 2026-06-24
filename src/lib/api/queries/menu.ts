import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";
import { Categoria, Produto, Restaurante } from "@/types/domain";

export function useRestaurante(slug: string) {
  return useQuery({
    queryKey: ["restaurante", slug],
    queryFn: () => apiGet<ApiResponse<Restaurante>>(`/restaurantes/${slug}`),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategorias(slug: string) {
  return useQuery({
    queryKey: ["categorias", slug],
    queryFn: () => apiGet<ApiResponse<Categoria[]>>(`/restaurantes/${slug}/categorias`),
    staleTime: 5 * 60 * 1000,
  });
}

export function useProdutos(slug: string, categoriaId?: string) {
  return useQuery({
    queryKey: ["produtos", slug, categoriaId],
    queryFn: () => {
      const path = categoriaId
        ? `/restaurantes/${slug}/produtos?categoria_id=${categoriaId}`
        : `/restaurantes/${slug}/produtos`;
      return apiGet<ApiResponse<Produto[]>>(path);
    },
    staleTime: 5 * 60 * 1000,
  });
}
