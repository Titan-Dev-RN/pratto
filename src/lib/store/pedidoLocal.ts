"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { OrderStatusLegacy, PedidoLegacy } from "@/types/domain.legacy";

/* Checkout do cliente final ainda é simulado (sem endpoint que aceite
   pedido sem login de staff nessa API — ver INTEGRACAO_API.md). Antes,
   sacola/delivery geravam um id aleatório (`ped-${Date.now()}`) que nunca
   batia com nenhum `mockPedidos`, então "acompanhar pedido" sempre caía
   no primeiro pedido de mentirinha da lista — todo mundo via o mesmo
   pedido errado, não o que realmente pediu.

   Agora o pedido confirmado (itens, total, forma de pagamento, endereço/
   mesa) é salvo aqui de verdade no momento da confirmação, indexado pelo
   próprio id gerado, e a tela de acompanhamento lê daqui. */
interface PedidoLocalState {
  pedidos: Record<string, PedidoLegacy>;
  salvarPedido: (pedido: PedidoLegacy) => void;
  obterPedido: (id: string) => PedidoLegacy | undefined;
}

export const usePedidoLocalStore = create<PedidoLocalState>()(
  persist(
    (set, get) => ({
      pedidos: {},
      salvarPedido: (pedido) => set((s) => ({ pedidos: { ...s.pedidos, [pedido.id]: pedido } })),
      obterPedido: (id) => get().pedidos[id],
    }),
    { name: "pratto-pedidos-locais" }
  )
);

/* Sem backend real acompanhando o pedido, o "status" é simulado a partir
   do tempo decorrido desde a criação — assim a barra de progresso avança
   de verdade enquanto a pessoa espera, em vez de ficar travada no status
   inicial pra sempre. Janela pensada pra bater com o "até 20 min" que já
   aparece na tela de confirmação. */
export function statusSimulado(criadoEm: string): OrderStatusLegacy {
  const minutos = (Date.now() - new Date(criadoEm).getTime()) / 60_000;
  if (minutos < 2) return "confirmado";
  if (minutos < 10) return "em_preparo";
  if (minutos < 18) return "pronto";
  return "entregue";
}
