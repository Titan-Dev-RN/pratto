"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ClienteFinal } from "@/types/api";

/* Conta real do cliente final (delivery) — POST/GET
   /api/public/storefront/:slug/customers|me (ver lib/api/queries/customers.ts).
   O token vive também numa chave própria do localStorage
   (`pratto_cliente_token`, lida por lib/api/client.ts), no mesmo padrão de
   lib/store/session.ts pra sessão de staff — mas totalmente independente
   dela (contas diferentes, tokens diferentes). */
interface ClienteCadastroState {
  token: string | null;
  cliente: ClienteFinal | null;
  cadastrado: boolean;
  salvar: (token: string, cliente: ClienteFinal) => void;
  sair: () => void;
}

export const useClienteCadastroStore = create<ClienteCadastroState>()(
  persist(
    (set) => ({
      token: null,
      cliente: null,
      cadastrado: false,

      salvar: (token, cliente) => {
        if (typeof window !== "undefined") localStorage.setItem("pratto_cliente_token", token);
        set({ token, cliente, cadastrado: true });
      },

      sair: () => {
        if (typeof window !== "undefined") localStorage.removeItem("pratto_cliente_token");
        set({ token: null, cliente: null, cadastrado: false });
      },
    }),
    {
      name: "pratto-cliente-cadastro",
      /* v2: cadastro deixou de ser simulado (nome/telefone/email soltos) e
         virou conta real com token — formato antigo é descartado. */
      version: 2,
      migrate: () => ({ token: null, cliente: null, cadastrado: false }),
    }
  )
);
