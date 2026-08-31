import { useMutation } from "@tanstack/react-query";
import { apiPost } from "@/lib/api/client";
import { ClienteAuthResponse, LoginClientePayload, RegistrarClientePayload } from "@/types/api";

/* Conta do cliente final (delivery) — precisa existir antes de fazer um
   pedido delivery (POST .../orders exige o token daqui) e é o que dá
   histórico de pedidos de verdade (GET .../orders filtra por cliente_id). */

export function useRegistrarCliente(slug: string) {
  return useMutation({
    mutationFn: (payload: RegistrarClientePayload) =>
      apiPost<ClienteAuthResponse>(`/public/storefront/${slug}/customers`, payload, false),
  });
}

export function useLoginCliente(slug: string) {
  return useMutation({
    mutationFn: (payload: LoginClientePayload) =>
      apiPost<ClienteAuthResponse>(`/public/storefront/${slug}/customers/login`, payload, false),
  });
}
