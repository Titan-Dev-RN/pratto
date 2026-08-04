import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";
import { Categoria, Produto, Restaurante } from "@/types/domain";

/* ─── Vitrine pública (cliente final, sem login) ─── */

export function useRestaurante(slug: string) {
  return useQuery({
    queryKey: ["restaurante", slug],
    queryFn: () => apiGet<ApiResponse<Restaurante>>(`/publico/restaurantes/${slug}`),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategorias(slug: string) {
  return useQuery({
    queryKey: ["categorias", slug],
    queryFn: () => apiGet<ApiResponse<Categoria[]>>(`/publico/restaurantes/${slug}/categorias`),
    staleTime: 5 * 60 * 1000,
  });
}

export function useProdutos(slug: string, categoriaId?: string) {
  return useQuery({
    queryKey: ["produtos", slug, categoriaId],
    queryFn: () => {
      const path = categoriaId
        ? `/publico/restaurantes/${slug}/produtos?categoria_id=${categoriaId}`
        : `/publico/restaurantes/${slug}/produtos`;
      return apiGet<ApiResponse<Produto[]>>(path);
    },
    staleTime: 5 * 60 * 1000,
  });
}

/* ─── Gestão do cardápio (equipe, autenticado) ─── */

export function useCategoriasAdmin() {
  return useQuery({
    queryKey: ["categorias-admin"],
    queryFn: () => apiGet<ApiResponse<Categoria[]>>("/cliente/categorias", true),
  });
}

export function useProdutosAdmin() {
  return useQuery({
    queryKey: ["produtos-admin"],
    queryFn: () => apiGet<ApiResponse<Produto[]>>("/cliente/produtos", true),
  });
}

export function useSalvarCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      dados,
    }: {
      id?: string;
      dados: { nome: string; descricao?: string; ordem?: number; ativa?: boolean };
    }) =>
      id
        ? apiPatch<ApiResponse<Categoria>>(`/cliente/categorias/${id}`, dados)
        : apiPost<ApiResponse<Categoria>>("/cliente/categorias", dados, true),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categorias-admin"] }),
  });
}

export function useExcluirCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/cliente/categorias/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categorias-admin"] }),
  });
}

export function useSalvarProduto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dados }: { id?: string; dados: Omit<Produto, "id" | "restaurante_id"> }) =>
      id
        ? apiPatch<ApiResponse<Produto>>(`/cliente/produtos/${id}`, dados)
        : apiPost<ApiResponse<Produto>>("/cliente/produtos", dados, true),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["produtos-admin"] }),
  });
}

export function useExcluirProduto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/cliente/produtos/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["produtos-admin"] }),
  });
}
