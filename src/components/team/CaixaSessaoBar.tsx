"use client";

import { useState } from "react";
import { useSessionStore } from "@/lib/store/session";
import { useCaixaStore } from "@/lib/store/caixa";
import { FormaPagamento } from "@/types/domain";
import { Button } from "@/components/ui/Button";
import { formatBRL } from "@/lib/utils";
import { toast } from "@/components/ui/Toast";

/* Sessão de caixa (função 1 e 4 do módulo de caixa) — sem endpoint no
   backend ainda, simulado local (ver lib/store/caixa.ts). Só aparece pra
   caixa/admin, na tela de Mesas — é onde o caixa passa a maior parte do
   turno. Toda venda fica atrelada ao usuário logado, permitindo
   conferência no fechamento. */

const formasPagamento: { key: FormaPagamento; label: string }[] = [
  { key: "dinheiro", label: "Dinheiro" },
  { key: "credito", label: "Crédito" },
  { key: "debito", label: "Débito" },
  { key: "pix", label: "PIX" },
];

export function CaixaSessaoBar() {
  const { usuario } = useSessionStore();
  const { sessaoAberta, abrirSessao, fecharSessao, totalEsperadoPorForma } = useCaixaStore();
  const [modal, setModal] = useState<"abrir" | "fechar" | null>(null);

  if (!usuario) return null;
  const sessao = sessaoAberta(usuario.id);

  return (
    <>
      <div className="mb-4 flex items-center justify-between bg-white rounded-xl border border-neutral-200 px-4 py-2.5">
        {sessao ? (
          <>
            <div>
              <p className="text-xs font-semibold text-green-700">🟢 Caixa aberto</p>
              <p className="text-xs text-neutral-400">
                Fundo {formatBRL(sessao.fundo_troco)} · {sessao.vendas.filter((v) => !v.cancelada).length} vendas
              </p>
            </div>
            <button
              onClick={() => setModal("fechar")}
              className="text-xs font-semibold text-team-600 hover:text-team-700"
            >
              Fechar caixa
            </button>
          </>
        ) : (
          <>
            <div>
              <p className="text-xs font-semibold text-neutral-600">🔴 Caixa fechado</p>
              <p className="text-xs text-neutral-400">Abra o caixa pra começar a receber pagamentos.</p>
            </div>
            <Button theme="team" size="sm" onClick={() => setModal("abrir")}>
              Abrir caixa
            </Button>
          </>
        )}
      </div>

      {modal === "abrir" && (
        <AbrirCaixaModal
          onConfirmar={(fundo) => {
            abrirSessao(usuario.id, usuario.nome, fundo);
            toast.success("Caixa aberto!", `Fundo de troco: ${formatBRL(fundo)}`);
            setModal(null);
          }}
          onFechar={() => setModal(null)}
        />
      )}

      {modal === "fechar" && sessao && (
        <FecharCaixaModal
          esperado={totalEsperadoPorForma(usuario.id)}
          onConfirmar={(contagem) => {
            fecharSessao(usuario.id, contagem);
            toast.success("Caixa fechado!", "Relatório de fechamento disponível no histórico.");
            setModal(null);
          }}
          onFechar={() => setModal(null)}
        />
      )}
    </>
  );
}

function AbrirCaixaModal({ onConfirmar, onFechar }: { onConfirmar: (fundo: number) => void; onFechar: () => void }) {
  const [fundo, setFundo] = useState("");
  const valor = parseFloat(fundo.replace(",", ".")) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onFechar}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <div className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-neutral-900 mb-1">Abrir caixa</h2>
        <p className="text-sm text-neutral-500 mb-5">Informe o fundo de troco inicial (dinheiro físico no caixa).</p>
        <div className="relative mb-5">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm font-medium">R$</span>
          <input
            type="text"
            inputMode="decimal"
            autoFocus
            placeholder="0,00"
            value={fundo}
            onChange={(e) => setFundo(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-team-500"
          />
        </div>
        <Button theme="team" fullWidth size="lg" disabled={valor <= 0} onClick={() => onConfirmar(valor)}>
          Abrir caixa
        </Button>
        <button onClick={onFechar} className="w-full mt-2 text-sm text-neutral-400 hover:text-neutral-600 py-1.5 text-center">
          Cancelar
        </button>
      </div>
    </div>
  );
}

function FecharCaixaModal({
  esperado,
  onConfirmar,
  onFechar,
}: {
  esperado: Partial<Record<FormaPagamento, number>>;
  onConfirmar: (contagem: Partial<Record<FormaPagamento, number>>) => void;
  onFechar: () => void;
}) {
  const [contagem, setContagem] = useState<Partial<Record<FormaPagamento, string>>>({});

  const diferenca = (forma: FormaPagamento) => {
    const contado = parseFloat((contagem[forma] ?? "").replace(",", ".")) || 0;
    return contado - (esperado[forma] ?? 0);
  };

  function confirmar() {
    const contagemNum: Partial<Record<FormaPagamento, number>> = {};
    for (const forma of formasPagamento) {
      contagemNum[forma.key] = parseFloat((contagem[forma.key] ?? "").replace(",", ".")) || 0;
    }
    onConfirmar(contagemNum);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onFechar}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <div
        className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-neutral-900 mb-1">Fechar caixa</h2>
        <p className="text-sm text-neutral-500 mb-5">
          Informe o valor contado fisicamente em cada forma (só faz sentido conferir dinheiro de verdade).
        </p>

        <div className="flex flex-col gap-3 mb-5">
          {formasPagamento.map((f) => {
            const esperadoValor = esperado[f.key] ?? 0;
            const diff = diferenca(f.key);
            return (
              <div key={f.key}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-neutral-700">{f.label}</label>
                  <span className="text-xs text-neutral-400">esperado {formatBRL(esperadoValor)}</span>
                </div>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={contagem[f.key] ?? ""}
                  onChange={(e) => setContagem((c) => ({ ...c, [f.key]: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-team-500"
                />
                {contagem[f.key] && diff !== 0 && (
                  <p className={`text-xs mt-1 ${diff > 0 ? "text-blue-600" : "text-red-500"}`}>
                    {diff > 0 ? `Sobra de ${formatBRL(diff)}` : `Quebra de ${formatBRL(Math.abs(diff))}`}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <Button theme="team" fullWidth size="lg" onClick={confirmar}>
          Confirmar fechamento
        </Button>
        <button onClick={onFechar} className="w-full mt-2 text-sm text-neutral-400 hover:text-neutral-600 py-1.5 text-center">
          Cancelar
        </button>
      </div>
    </div>
  );
}
