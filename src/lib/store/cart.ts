"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
/* Carrinho do cliente — só usado pelo fluxo público, que continua mock
   (checkout do cliente pausado, ver Fase 7 do plano de integração). */
import { ItemSacolaLegacy as ItemSacola, ProdutoLegacy as Produto, VariacaoLegacy as Variacao } from "@/types/domain.legacy";

interface CartState {
  slug: string | null;
  mesa_id: string | null;
  itens: ItemSacola[];
  setContexto: (slug: string, mesa_id?: string) => void;
  adicionarItem: (produto: Produto, quantidade: number, variacoes?: Variacao[], observacao?: string) => void;
  removerItem: (index: number) => void;
  atualizarQuantidade: (index: number, quantidade: number) => void;
  limparSacola: () => void;
  total: () => number;
  quantidadeTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      slug: null,
      mesa_id: null,
      itens: [],

      setContexto: (slug, mesa_id) => set({ slug, mesa_id }),

      adicionarItem: (produto, quantidade, variacoes = [], observacao) => {
        const preco_adicional = variacoes.reduce((acc, v) => acc + v.preco_adicional, 0);
        const preco_total = (produto.preco + preco_adicional) * quantidade;
        set((s) => ({
          itens: [
            ...s.itens,
            { produto, quantidade, variacoes_selecionadas: variacoes, observacao, preco_total },
          ],
        }));
      },

      removerItem: (index) =>
        set((s) => ({ itens: s.itens.filter((_, i) => i !== index) })),

      atualizarQuantidade: (index, quantidade) =>
        set((s) => ({
          itens: s.itens.map((item, i) => {
            if (i !== index) return item;
            const preco_adicional = item.variacoes_selecionadas.reduce(
              (acc, v) => acc + v.preco_adicional,
              0
            );
            return {
              ...item,
              quantidade,
              preco_total: (item.produto.preco + preco_adicional) * quantidade,
            };
          }),
        })),

      limparSacola: () => set({ itens: [] }),

      total: () => get().itens.reduce((acc, item) => acc + item.preco_total, 0),

      quantidadeTotal: () =>
        get().itens.reduce((acc, item) => acc + item.quantidade, 0),
    }),
    { name: "pratto-sacola" }
  )
);
