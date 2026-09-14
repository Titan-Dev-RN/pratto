import { useMutation, useQuery } from "@tanstack/react-query";
import { clienteApiGet, clienteApiPost, ensureArray, toNumber } from "@/lib/api/client";
import {
  ClienteAuthResponse,
  ClienteContaBruta,
  CriarClientePayload,
  LoginClientePayload,
} from "@/types/api";
import { ClienteConta, PedidoPublico } from "@/types/domain";

/* Conta de cliente (comprador do delivery) —
   /api/public/storefront/:slug/customers*  e  /api/public/storefront/:slug/me.

   ⚠️ NÃO CONFIRMADO AO VIVO. Derivado dos exemplos do Insomnia. Até
   então isto era 100% fake local (lib/store/clienteCadastro.ts +
   historicoPedidos.ts). Usa token PRÓPRIO (`pratto_cliente_token`),
   nunca o de staff — ver lib/api/client.ts (clienteApiGet/Post) e
   lib/store/clienteSessao.ts.

   Como nem o nome do campo do token (`token`/`jwt`) nem o do objeto do
   cliente (`customer`/`cliente`) estão confirmados, `lerAuth()` tolera
   as duas formas. */

function lerAuth(res: ClienteAuthResponse): { token: string; cliente: ClienteConta } | null {
  const token = res.token ?? res.jwt;
  const bruto = res.customer ?? res.cliente;
  if (!token || !bruto) return null;
  return { token, cliente: normalizarConta(bruto) };
}

function normalizarConta(raw: ClienteContaBruta): ClienteConta {
  return { id: raw.id, nome: raw.nome, email: raw.email, telefone: raw.telefone };
}

/* POST /api/public/storefront/:slug/customers — cadastro. Pode ou não já
   devolver token (alguns backends exigem login logo depois). O caller
   trata os dois casos: se `lerAuth` devolver null, faz login em seguida. */
export function useCadastrarCliente(slug: string) {
  return useMutation({
    mutationFn: async (payload: CriarClientePayload) => {
      const res = await clienteApiPost<ClienteAuthResponse>(
        `/public/storefront/${slug}/customers`,
        payload,
      );
      return lerAuth(res);
    },
  });
}

/* POST /api/public/storefront/:slug/customers/login */
export function useLoginCliente(slug: string) {
  return useMutation({
    mutationFn: async (payload: LoginClientePayload) => {
      const res = await clienteApiPost<ClienteAuthResponse>(
        `/public/storefront/${slug}/customers/login`,
        payload,
      );
      return lerAuth(res);
    },
  });
}

/* GET /api/public/storefront/:slug/me — perfil do cliente logado (Bearer
   token de cliente). */
export function useClienteMe(slug: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["cliente", "me", slug],
    queryFn: async () => normalizarConta(await clienteApiGet<ClienteContaBruta>(`/public/storefront/${slug}/me`)),
    enabled: (options?.enabled ?? true) && !!slug,
  });
}

/* GET /api/public/storefront/:slug/orders — histórico de pedidos do
   cliente logado. Substitui o hack de guardar códigos de rastreio no
   localStorage (lib/store/historicoPedidos.ts). Shape assumido: lista de
   PedidoPublico (mesmo do rastreio da `/api/*`). */
export function useMeusPedidosCliente(slug: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["cliente", "pedidos", slug],
    queryFn: async () => {
      const pedidos = ensureArray<PedidoPublico>(
        await clienteApiGet<unknown>(`/public/storefront/${slug}/orders`),
        "pedidos do cliente",
      );
      return pedidos.map((p) => ({
        ...p,
        total: toNumber(p.total),
        items: Array.isArray(p.items)
          ? p.items.map((i) => ({ ...i, preco_unitario: toNumber(i.preco_unitario) }))
          : [],
      }));
    },
    enabled: (options?.enabled ?? true) && !!slug,
    refetchInterval: 20_000,
  });
}
