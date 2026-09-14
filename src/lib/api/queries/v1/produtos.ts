import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiDelete, apiGet, apiPost, apiPut, ensureArray, toNumber } from "@/lib/api/client";
import { V1AtualizarProdutoPayload, V1CriarProdutoPayload } from "@/types/api";
import { Produto } from "@/types/domain";

/* Superfície V1 — CRUD /api/v1/cliente/produtos +
   GET /api/v1/publico/restaurantes/:slug/produtos.

   ⚠️ NÃO CONFIRMADO AO VIVO. Diferente da `/api/products` (que lê em pt e
   ESCREVE em en): aqui a escrita também é em português e inclui
   categoria_id / ordem / exibir_na_vitrine. `preco` provavelmente volta
   como string — normalizado com toNumber. */

const KEY = ["v1", "produtos"];

function normalizar(raw: Produto): Produto {
  return { ...raw, preco: toNumber(raw.preco) };
}

export function useProdutosV1() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => ensureArray<Produto>(await apiGet<unknown>("/v1/cliente/produtos"), "produtos").map(normalizar),
    staleTime: 60_000,
  });
}

export function useProdutoV1(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["v1", "produto", id],
    queryFn: async () => normalizar(await apiGet<Produto>(`/v1/cliente/produtos/${id}`)),
    enabled: (options?.enabled ?? true) && !!id,
  });
}

export function useProdutosPublicosV1(slug: string) {
  return useQuery({
    queryKey: ["v1", "publico", "produtos", slug],
    queryFn: async () =>
      ensureArray<Produto>(
        await apiGet<unknown>(`/v1/publico/restaurantes/${slug}/produtos`, false),
        "produtos públicos",
      ).map(normalizar),
    enabled: !!slug,
    staleTime: 60_000,
  });
}

export function useCriarProdutoV1() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: V1CriarProdutoPayload) => apiPost<Produto>("/v1/cliente/produtos", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useAtualizarProdutoV1() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: V1AtualizarProdutoPayload }) =>
      apiPut<Produto>(`/v1/cliente/produtos/${id}`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useExcluirProdutoV1() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete<void>(`/v1/cliente/produtos/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
