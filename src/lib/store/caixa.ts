"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FormaPagamento, PagamentoRegistrado, SessaoCaixa, VendaRegistrada } from "@/types/domain";

/* Módulo de caixa — sem endpoint no backend ainda (sessão, fundo de
   troco, split de pagamento, rateio); simulado 100% no front, persistido
   em localStorage, desenhado pra plugar numa API real depois sem mudar
   as telas. Ver INTEGRACAO_API.md. Cada operador tem sua própria sessão
   (identificada por usuario_id), pra permitir conferência por usuário no
   fechamento (função 1 do módulo de caixa). */

function uid(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface CaixaState {
  sessoes: SessaoCaixa[];
  abrirSessao: (usuarioId: string, usuarioNome: string, fundoTroco: number) => void;
  sessaoAberta: (usuarioId: string) => SessaoCaixa | null;
  registrarVenda: (usuarioId: string, venda: Omit<VendaRegistrada, "id" | "registrada_em">) => VendaRegistrada | null;
  cancelarVenda: (usuarioId: string, vendaId: string) => void;
  fecharSessao: (usuarioId: string, contagemFinal: Partial<Record<FormaPagamento, number>>) => void;
  totalEsperadoPorForma: (usuarioId: string) => Partial<Record<FormaPagamento, number>>;
}

export const useCaixaStore = create<CaixaState>()(
  persist(
    (set, get) => ({
      sessoes: [],

      abrirSessao: (usuarioId, usuarioNome, fundoTroco) => {
        if (get().sessaoAberta(usuarioId)) return;
        set((s) => ({
          sessoes: [
            ...s.sessoes,
            {
              id: uid(),
              usuario_id: usuarioId,
              usuario_nome: usuarioNome,
              fundo_troco: fundoTroco,
              aberta_em: new Date().toISOString(),
              vendas: [],
            },
          ],
        }));
      },

      sessaoAberta: (usuarioId) =>
        get().sessoes.find((s) => s.usuario_id === usuarioId && !s.fechada_em) ?? null,

      registrarVenda: (usuarioId, venda) => {
        const sessao = get().sessaoAberta(usuarioId);
        if (!sessao) return null;
        const registrada: VendaRegistrada = {
          ...venda,
          id: uid(),
          registrada_em: new Date().toISOString(),
        };
        set((s) => ({
          sessoes: s.sessoes.map((sess) =>
            sess.id === sessao.id ? { ...sess, vendas: [...sess.vendas, registrada] } : sess
          ),
        }));
        return registrada;
      },

      cancelarVenda: (usuarioId, vendaId) => {
        const sessao = get().sessaoAberta(usuarioId);
        if (!sessao) return;
        set((s) => ({
          sessoes: s.sessoes.map((sess) =>
            sess.id === sessao.id
              ? { ...sess, vendas: sess.vendas.map((v) => (v.id === vendaId ? { ...v, cancelada: true } : v)) }
              : sess
          ),
        }));
      },

      fecharSessao: (usuarioId, contagemFinal) => {
        const sessao = get().sessaoAberta(usuarioId);
        if (!sessao) return;
        set((s) => ({
          sessoes: s.sessoes.map((sess) =>
            sess.id === sessao.id
              ? { ...sess, fechada_em: new Date().toISOString(), contagem_final: contagemFinal }
              : sess
          ),
        }));
      },

      totalEsperadoPorForma: (usuarioId) => {
        const sessao = get().sessaoAberta(usuarioId);
        if (!sessao) return {};
        const totais: Partial<Record<FormaPagamento, number>> = { dinheiro: sessao.fundo_troco };
        for (const venda of sessao.vendas) {
          if (venda.cancelada) continue;
          for (const pagamento of venda.pagamentos as PagamentoRegistrado[]) {
            if (pagamento.recusado) continue;
            totais[pagamento.forma] = (totais[pagamento.forma] ?? 0) + pagamento.valor;
          }
        }
        return totais;
      },
    }),
    { name: "pratto-caixa" }
  )
);
