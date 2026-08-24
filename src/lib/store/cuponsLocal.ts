"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/* Cupons não existem na API usada (/api/*) — sem rota, sem entidade.
   Simulado 100% local, mesmo padrão de outras features sem endpoint
   ainda (ver INTEGRACAO_API.md). */
export interface CupomLocal {
  id: string;
  codigo: string;
  desconto: number; // percentual, 0–100
  validade: string; // YYYY-MM-DD
  ativo: boolean;
}

interface CuponsState {
  cupons: CupomLocal[];
  criar: (dados: Omit<CupomLocal, "id">) => void;
  atualizar: (id: string, dados: Partial<Omit<CupomLocal, "id">>) => void;
  excluir: (id: string) => void;
}

function uid(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const useCuponsLocalStore = create<CuponsState>()(
  persist(
    (set) => ({
      cupons: [],
      criar: (dados) => set((s) => ({ cupons: [...s.cupons, { ...dados, id: uid() }] })),
      atualizar: (id, dados) =>
        set((s) => ({ cupons: s.cupons.map((c) => (c.id === id ? { ...c, ...dados } : c)) })),
      excluir: (id) => set((s) => ({ cupons: s.cupons.filter((c) => c.id !== id) })),
    }),
    { name: "pratto-cupons-locais" }
  )
);
