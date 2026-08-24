import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiDelete, apiGet, apiPatch, apiPost, toNumber } from "@/lib/api/client";
import { AtualizarProdutoPayload, CriarProdutoPayload } from "@/types/api";
import { Produto } from "@/types/domain";

/* GET /api/products — leitura vem em português (nome/preco/ativo), mas
   `preco` chega como string (decimal do Rails); normaliza pra number. */
function normalizarProduto(raw: Produto): Produto {
  return { ...raw, preco: toNumber(raw.preco) };
}

export function useProdutos() {
  return useQuery({
    queryKey: ["produtos"],
    queryFn: async () => (await apiGet<Produto[]>("/products")).map(normalizarProduto),
    staleTime: 60_000,
  });
}

export function useProduto(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["produto", id],
    queryFn: async () => normalizarProduto(await apiGet<Produto>(`/products/${id}`)),
    enabled: options?.enabled ?? true,
  });
}

/* Payload de escrita usa os nomes em inglês (name/price/active) — é o que
   o controller aceita, confirmado ao vivo, mesmo a leitura sendo em pt. */
export function useCriarProduto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CriarProdutoPayload) => apiPost<Produto>("/products", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["produtos"] }),
  });
}

export function useAtualizarProduto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AtualizarProdutoPayload }) =>
      apiPatch<Produto>(`/products/${id}`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["produtos"] }),
  });
}

export function useExcluirProduto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete<void>(`/products/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["produtos"] }),
  });
}
