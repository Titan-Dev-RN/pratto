"use client";

import { create } from "zustand";
import { Produto } from "@/types/domain";

export interface ItemComanda {
  produto: Produto;
  quantidade: number;
  observacao?: string;
  preco_total: number;
}

/* Carrinho local do PDV — a mesa/comanda de destino vem por query param
   na URL (?comanda_id=...&mesa_num=...), não precisa ficar aqui. */
interface ComandaState {
  itens: ItemComanda[];
  adicionarItem: (produto: Produto, quantidade?: number, observacao?: string) => void;
  removerItem: (index: number) => void;
  atualizarQuantidade: (index: number, quantidade: number) => void;
  limpar: () => void;
  total: () => number;
  quantidadeTotal: () => number;
}

export const useComandaStore = create<ComandaState>((set, get) => ({
  itens: [],

  adicionarItem: (produto, quantidade = 1, observacao) => {
    set((s) => {
      /* Se já existe o mesmo produto sem observação, incrementa */
      const idx = !observacao
        ? s.itens.findIndex((i) => i.produto.id === produto.id && !i.observacao)
        : -1;

      if (idx >= 0) {
        const itens = s.itens.map((item, i) =>
          i === idx
            ? {
                ...item,
                quantidade: item.quantidade + quantidade,
                preco_total: item.produto.preco * (item.quantidade + quantidade),
              }
            : item
        );
        return { itens };
      }

      return {
        itens: [
          ...s.itens,
          { produto, quantidade, observacao, preco_total: produto.preco * quantidade },
        ],
      };
    });
  },

  removerItem: (index) =>
    set((s) => ({ itens: s.itens.filter((_, i) => i !== index) })),

  atualizarQuantidade: (index, quantidade) =>
    set((s) => ({
      itens: s.itens.map((item, i) =>
        i === index
          ? { ...item, quantidade, preco_total: item.produto.preco * quantidade }
          : item
      ),
    })),

  limpar: () => set({ itens: [] }),

  total: () => get().itens.reduce((acc, i) => acc + i.preco_total, 0),

  quantidadeTotal: () => get().itens.reduce((acc, i) => acc + i.quantidade, 0),
}));
