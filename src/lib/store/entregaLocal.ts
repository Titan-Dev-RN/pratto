"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/* "Entregue" não é um status que o backend aceita pro item da cozinha
   (confirmado ao vivo — só pendente/em_andamento/pronto existem). É só
   controle visual do garçom, sem efeito nenhum na mesa/comanda (garçom
   #6: entregar a comida não pode liberar a mesa — só o fechamento de
   conta faz isso, e esse fluxo nem chama isso aqui). */
interface EntregaLocalState {
  entregues: Record<string, true>;
  marcarEntregue: (comandaId: string) => void;
}

export const useEntregaLocalStore = create<EntregaLocalState>()(
  persist(
    (set) => ({
      entregues: {},
      marcarEntregue: (comandaId) => set((s) => ({ entregues: { ...s.entregues, [comandaId]: true } })),
    }),
    { name: "pratto-entregas-locais" }
  )
);
