import { useQuery } from "@tanstack/react-query";
import { apiGet, toNumber } from "@/lib/api/client";

/* GET /api/public/storefront/:slug/products — vitrine pública real,
   confirmada ao vivo, sem autenticação. Só retorna produtos com
   `exibir_na_vitrine: true` (o backend já filtra) e vem enxuto: sem
   categoria, sem foto, sem "ativo" — é só o que aparece pro cliente. */
export interface PublicProduto {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
}

function normalizar(raw: PublicProduto): PublicProduto {
  return { ...raw, preco: toNumber(raw.preco) };
}

export function usePublicProdutos(slug: string) {
  return useQuery({
    queryKey: ["public-produtos", slug],
    queryFn: async () => (await apiGet<PublicProduto[]>(`/public/storefront/${slug}/products`, false)).map(normalizar),
    enabled: !!slug,
    staleTime: 60_000,
  });
}
