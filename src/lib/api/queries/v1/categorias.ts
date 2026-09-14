import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiDelete, apiGet, apiPost, apiPut, ensureArray } from "@/lib/api/client";
import { V1AtualizarCategoriaPayload, V1CriarCategoriaPayload } from "@/types/api";
import { Categoria } from "@/types/domain";

/* Superfície V1 — CRUD /api/v1/cliente/categorias +
   GET /api/v1/publico/restaurantes/:slug/categorias.

   ⚠️ NÃO CONFIRMADO AO VIVO. A `/api/*` não tem conceito de categoria —
   este módulo é 100% novo. O corpo pode precisar de envelope
   (`{ categoria: {...} }`), como acontece em /api/commands/:id/items na
   superfície antiga. Ajustar ao rodar se der 400 "param is missing". */

const KEY = ["v1", "categorias"];

export function useCategorias() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => ensureArray<Categoria>(await apiGet<unknown>("/v1/cliente/categorias"), "categorias"),
    staleTime: 60_000,
  });
}

export function useCategoriasPublicas(slug: string) {
  return useQuery({
    queryKey: ["v1", "publico", "categorias", slug],
    queryFn: async () =>
      ensureArray<Categoria>(
        await apiGet<unknown>(`/v1/publico/restaurantes/${slug}/categorias`, false),
        "categorias públicas",
      ),
    enabled: !!slug,
    staleTime: 60_000,
  });
}

export function useCriarCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: V1CriarCategoriaPayload) => apiPost<Categoria>("/v1/cliente/categorias", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useAtualizarCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: V1AtualizarCategoriaPayload }) =>
      apiPut<Categoria>(`/v1/cliente/categorias/${id}`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useExcluirCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete<void>(`/v1/cliente/categorias/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
