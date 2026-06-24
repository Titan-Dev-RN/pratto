"use client";

import { useRef, useState } from "react";
import { Mesa, Pedido } from "@/types/domain";
import { Button } from "@/components/ui/Button";
import { formatBRL, formatarHora } from "@/lib/utils";
import { toast } from "@/components/ui/Toast";

type Pagamento = "dinheiro" | "credito" | "debito" | "pix";

const pagamentos: { key: Pagamento; label: string; icon: string }[] = [
  { key: "dinheiro", label: "Dinheiro", icon: "💵" },
  { key: "credito", label: "Crédito", icon: "💳" },
  { key: "debito", label: "Débito", icon: "💳" },
  { key: "pix", label: "PIX", icon: "⚡" },
];

interface Props {
  mesa: Mesa;
  pedido: Pedido;
  restauranteNome: string;
  onFechar: () => void;
  onContaFechada: (mesaId: string) => void;
}

type Step = "pagamento" | "cupom";

export function FecharContaModal({ mesa, pedido, restauranteNome, onFechar, onContaFechada }: Props) {
  const [step, setStep] = useState<Step>("pagamento");
  const [formaPagamento, setFormaPagamento] = useState<Pagamento | null>(null);
  const [valorRecebido, setValorRecebido] = useState("");
  const [loading, setLoading] = useState(false);
  const cupomRef = useRef<HTMLDivElement>(null);

  const total = pedido.total;
  const troco =
    formaPagamento === "dinheiro" && valorRecebido
      ? Math.max(0, parseFloat(valorRecebido.replace(",", ".")) - total)
      : null;

  async function confirmarFechamento() {
    if (!formaPagamento) return;
    setLoading(true);
    try {
      /* Em produção: apiPost("/pedidos/id/fechar", { forma_pagamento }) */
      await new Promise((r) => setTimeout(r, 700));
      setStep("cupom");
    } catch {
      toast.error("Erro ao fechar conta", "Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function imprimirCupom() {
    /* Em produção: POST /impressao com pedido_id → back aciona impressora térmica */
    toast.success("Enviado para impressão!", "Cupom impresso com sucesso.");
    onContaFechada(mesa.id);
  }

  function fecharSemImprimir() {
    onContaFechada(mesa.id);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onFechar}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
      <div
        className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Step: Pagamento ─── */}
        {step === "pagamento" && (
          <>
            <div className="p-5 border-b border-neutral-100">
              <h2 className="font-bold text-neutral-900 text-lg">Fechar conta</h2>
              <p className="text-sm text-neutral-500">Mesa {mesa.numero} · Pedido #{pedido.numero}</p>
            </div>

            <div className="overflow-y-auto flex-1 p-5 flex flex-col gap-5">
              {/* Itens */}
              <div>
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
                  Itens consumidos
                </p>
                <ul className="flex flex-col gap-2">
                  {pedido.itens.map((item) => (
                    <li key={item.id} className="flex justify-between text-sm">
                      <span className="text-neutral-700">
                        <span className="font-semibold text-team-600">{item.quantidade}×</span>{" "}
                        {item.produto_nome}
                      </span>
                      <span className="font-medium text-neutral-800">{formatBRL(item.preco_total)}</span>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-neutral-100 mt-3 pt-3 flex justify-between font-bold text-neutral-900 text-base">
                  <span>Total</span>
                  <span>{formatBRL(total)}</span>
                </div>
              </div>

              {/* Forma de pagamento */}
              <div>
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
                  Forma de pagamento
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {pagamentos.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => setFormaPagamento(p.key)}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-semibold transition-colors ${
                        formaPagamento === p.key
                          ? "border-team-500 bg-team-50 text-team-700"
                          : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                      }`}
                    >
                      <span>{p.icon}</span>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Campo de troco (só para dinheiro) */}
              {formaPagamento === "dinheiro" && (
                <div>
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">
                    Valor recebido
                  </p>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm font-medium">
                      R$
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="0,00"
                      value={valorRecebido}
                      onChange={(e) => setValorRecebido(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-team-500"
                    />
                  </div>
                  {troco !== null && troco > 0 && (
                    <div className="mt-2 p-3 bg-green-50 rounded-xl flex justify-between text-sm font-semibold text-green-700">
                      <span>Troco</span>
                      <span>{formatBRL(troco)}</span>
                    </div>
                  )}
                  {troco !== null && troco < 0 && (
                    <p className="text-xs text-red-500 mt-1">
                      Valor insuficiente — faltam {formatBRL(Math.abs(troco))}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-neutral-100 flex flex-col gap-2">
              <Button
                theme="team"
                fullWidth
                size="lg"
                loading={loading}
                disabled={
                  !formaPagamento ||
                  (formaPagamento === "dinheiro" && troco !== null && troco < 0)
                }
                onClick={confirmarFechamento}
              >
                Confirmar · {formatBRL(total)}
              </Button>
              <button onClick={onFechar} className="text-sm text-neutral-400 hover:text-neutral-600 py-1.5 text-center">
                Cancelar
              </button>
            </div>
          </>
        )}

        {/* ─── Step: Cupom ─── */}
        {step === "cupom" && (
          <>
            <div className="p-5 border-b border-neutral-100 text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl mx-auto mb-2">
                ✓
              </div>
              <h2 className="font-bold text-neutral-900">Conta fechada!</h2>
              <p className="text-sm text-neutral-500">Mesa {mesa.numero}</p>
            </div>

            {/* Cupom */}
            <div className="overflow-y-auto flex-1 p-5">
              <div
                ref={cupomRef}
                className="font-mono text-xs bg-neutral-50 border border-dashed border-neutral-300 rounded-xl p-4"
              >
                <div className="text-center mb-3">
                  <p className="font-bold text-sm">{restauranteNome.toUpperCase()}</p>
                  <p className="text-neutral-500">────────────────</p>
                  <p>Mesa {mesa.numero} · Pedido #{pedido.numero}</p>
                  <p>{formatarHora(new Date().toISOString())}</p>
                  <p className="text-neutral-500">────────────────</p>
                </div>

                {pedido.itens.map((item) => (
                  <div key={item.id} className="flex justify-between mb-1">
                    <span>
                      {item.quantidade}x {item.produto_nome.substring(0, 18)}
                    </span>
                    <span>{formatBRL(item.preco_total)}</span>
                  </div>
                ))}

                <p className="text-neutral-500 my-2">────────────────</p>

                <div className="flex justify-between font-bold text-sm">
                  <span>TOTAL</span>
                  <span>{formatBRL(total)}</span>
                </div>

                <div className="flex justify-between mt-1 text-neutral-600">
                  <span>{pagamentos.find((p) => p.key === formaPagamento)?.label}</span>
                  <span>{formatBRL(total)}</span>
                </div>

                {troco !== null && troco > 0 && (
                  <div className="flex justify-between mt-1 text-green-700 font-semibold">
                    <span>TROCO</span>
                    <span>{formatBRL(troco)}</span>
                  </div>
                )}

                <p className="text-neutral-500 mt-2">────────────────</p>
                <p className="text-center text-neutral-400 mt-2">Obrigado pela preferência!</p>
                <p className="text-center text-neutral-300">Pratto · pratto.com.br</p>
              </div>
            </div>

            <div className="p-4 border-t border-neutral-100 flex flex-col gap-2">
              <Button theme="team" fullWidth onClick={imprimirCupom}>
                🖨️ Imprimir cupom
              </Button>
              <Button theme="team" variant="secondary" fullWidth onClick={fecharSemImprimir}>
                Fechar sem imprimir
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
