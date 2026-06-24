"use client";

import { create } from "zustand";
import { Produto } from "@/types/domain";

export interface ItemComanda {
  produto: Produto;
  quantidade: number;
  observacao?: string;
  preco_total: number;
}

interface ComandaState {
  mesa_id: string | null;
  mesa_numero: number | null;
  itens: ItemComanda[];
  setMesa: (id: string, numero: number) => void;
  adicionarItem: (produto: Produto, quantidade?: number, observacao?: string) => void;
  removerItem: (index: number) => void;
  atualizarQuantidade: (index: number, quantidade: number) => void;
  limpar: () => void;
  total: () => number;
  quantidadeTotal: () => number;
}

export const useComandaStore = create<ComandaState>((set, get) => ({
  mesa_id: null,
  mesa_numero: null,
  itens: [],

  setMesa: (id, numero) => set({ mesa_id: id, mesa_numero: numero }),

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

  limpar: () => set({ itens: [], mesa_id: null, mesa_numero: null }),

  total: () => get().itens.reduce((acc, i) => acc + i.preco_total, 0),

  quantidadeTotal: () => get().itens.reduce((acc, i) => acc + i.quantidade, 0),
}));
