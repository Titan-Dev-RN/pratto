"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ClienteConta } from "@/types/domain";
import { CLIENTE_TOKEN_KEY } from "@/lib/api/client";

/* Sessão da conta de cliente (comprador do delivery) — separada da sessão
   de staff (lib/store/session.ts). Substitui o cadastro fake de
   lib/store/clienteCadastro.ts agora que existe /api/public/storefront/
   :slug/customers.

   ⚠️ Endpoints não confirmados ao vivo (ver queries/customers.ts). O
   token fica em `pratto_cliente_token` (chave própria), lido por
   clienteApiGet/clienteApiPost em lib/api/client.ts. */
interface ClienteSessaoState {
  token: string | null;
  cliente: ClienteConta | null;
  setSessao: (token: string, cliente: ClienteConta) => void;
  atualizarCliente: (cliente: ClienteConta) => void;
  limparSessao: () => void;
  isAuthed: () => boolean;
}

export const useClienteSessaoStore = create<ClienteSessaoState>()(
  persist(
    (set, get) => ({
      token: null,
      cliente: null,

      setSessao: (token, cliente) => {
        if (typeof window !== "undefined") localStorage.setItem(CLIENTE_TOKEN_KEY, token);
        set({ token, cliente });
      },

      atualizarCliente: (cliente) => set({ cliente }),

      limparSessao: () => {
        if (typeof window !== "undefined") localStorage.removeItem(CLIENTE_TOKEN_KEY);
        set({ token: null, cliente: null });
      },

      isAuthed: () => !!get().token,
    }),
    { name: "pratto-cliente-sessao" }
  )
);
