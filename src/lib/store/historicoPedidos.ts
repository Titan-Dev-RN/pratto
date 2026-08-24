"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/* Não existe endpoint de "listar pedidos do cliente" na API (só dá pra
   consultar UM pedido de delivery se você já souber o código de
   rastreio — GET /api/public/orders/:codigo). Sem conta de cliente de
   verdade, a única forma de "lembrar" quais pedidos são da pessoa é
   guardar os códigos aqui, neste aparelho, assim que o pedido é criado.
   O pedido em si e o status mostrado depois são 100% reais — só a lista
   de "quais códigos são meus" é local. */
export interface PedidoHistoricoItem {
  codigoRastreio: string;
  total: number;
  criadoEm: string;
}

interface HistoricoPedidosState {
  pedidos: PedidoHistoricoItem[];
  adicionar: (pedido: PedidoHistoricoItem) => void;
}

export const useHistoricoPedidosStore = create<HistoricoPedidosState>()(
  persist(
    (set) => ({
      pedidos: [],
      adicionar: (pedido) => set((s) => ({ pedidos: [pedido, ...s.pedidos] })),
    }),
    { name: "pratto-historico-pedidos" }
  )
);
