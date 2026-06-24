"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useCartStore } from "@/lib/store/cart";
import { formatBRL } from "@/lib/utils";
import { toast } from "@/components/ui/Toast";
import { mockRestaurante } from "@/lib/mock";

type MetodoPagamento = "pix" | "cartao" | "dinheiro";

const metodos: { key: MetodoPagamento; label: string }[] = [
  { key: "pix", label: "Pix" },
  { key: "cartao", label: "Cartão" },
  { key: "dinheiro", label: "Dinheiro" },
];

export default function SacolaPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense>
      <SacolaContent params={params} />
    </Suspense>
  );
}

function SacolaContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const mesaId = searchParams.get("mesa");

  const [loading, setLoading] = useState(false);
  const [pagamento, setPagamento] = useState<MetodoPagamento>("pix");
  const [pedidoConfirmado, setPedidoConfirmado] = useState<{ id: string; numero: string } | null>(null);

  const { itens, total: getTotal, removerItem, atualizarQuantidade, limparSacola } = useCartStore();
  const totalSacola = getTotal();

  async function enviarPedido() {
    if (!itens.length) return;
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      const numero = String(Math.floor(Math.random() * 900) + 100);
      const id = `ped-${Date.now()}`;
      limparSacola();
      setPedidoConfirmado({ id, numero });
    } catch {
      toast.error("Erro ao enviar pedido", "Tente novamente.", {
        label: "Tentar novamente",
        onClick: enviarPedido,
      });
    } finally {
      setLoading(false);
    }
  }

  /* ─── Confirmação ─── */
  if (pedidoConfirmado) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center gap-6">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl">✓</div>
        <div>
          <p className="text-2xl font-bold text-neutral-900">Pedido #{pedidoConfirmado.numero}</p>
          <p className="text-neutral-500 mt-2 text-sm">
            {mesaId ? `Pedido enviado para a cozinha. Mesa ${mesaId}.` : "Seu pedido foi recebido!"}
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link href={`/${slug}/pedido/${pedidoConfirmado.id}`}>
            <button className="w-full bg-coral-500 text-white rounded-2xl py-4 px-5 font-semibold text-base shadow-lg shadow-coral-200 active:bg-coral-600 transition-colors">
              Acompanhar pedido
            </button>
          </Link>
          <Link href={`/${slug}/menu${mesaId ? `?mesa=${mesaId}` : ""}`}>
            <button className="w-full bg-coral-50 text-coral-700 rounded-2xl py-3 px-5 font-semibold text-sm active:bg-coral-100 transition-colors">
              Pedir mais
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-100 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <Link
          href={`/${slug}/menu${mesaId ? `?mesa=${mesaId}` : ""}`}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
        >
          <svg className="w-5 h-5 text-neutral-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-neutral-900 text-base leading-tight">Sua sacola</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            {mockRestaurante.nome}{mesaId ? ` · Mesa ${mesaId}` : ""}
          </p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 pb-36">
        {itens.length === 0 ? (
          <div className="text-center py-20 text-neutral-400">
            <p className="text-5xl mb-4">🛒</p>
            <p className="font-medium">Sacola vazia</p>
            <Link href={`/${slug}/menu${mesaId ? `?mesa=${mesaId}` : ""}`}>
              <button className="mt-5 bg-coral-50 text-coral-700 rounded-xl px-5 py-2.5 text-sm font-semibold active:bg-coral-100 transition-colors">
                Ir ao cardápio
              </button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Itens */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <ul className="flex flex-col divide-y divide-neutral-50">
                {itens.map((item, i) => (
                  <li key={i} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-neutral-900">{item.produto.nome}</p>
                        {item.observacao && (
                          <p className="text-xs text-neutral-400 mt-0.5 italic">{item.observacao}</p>
                        )}
                        <p className="text-sm font-bold text-coral-600 mt-0.5">{formatBRL(item.preco_total)}</p>
                      </div>
                      {/* Controle de quantidade */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-neutral-700 text-sm hover:bg-neutral-200 transition-colors"
                          onClick={() =>
                            item.quantidade > 1 ? atualizarQuantidade(i, item.quantidade - 1) : removerItem(i)
                          }
                        >
                          {item.quantidade > 1 ? "−" : "×"}
                        </button>
                        <span className="w-5 text-center font-semibold text-sm">{item.quantidade}</span>
                        <button
                          className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-neutral-700 text-sm hover:bg-neutral-200 transition-colors"
                          onClick={() => atualizarQuantidade(i, item.quantidade + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Adicionar mais */}
              <Link
                href={`/${slug}/menu${mesaId ? `?mesa=${mesaId}` : ""}`}
                className="flex items-center gap-1.5 mt-4 pt-4 border-t border-neutral-100 text-sm font-semibold text-coral-500 hover:text-coral-600 transition-colors"
              >
                <span className="text-lg leading-none">+</span>
                <span>Adicionar mais itens</span>
              </Link>
            </div>

            {/* Resumo */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between text-sm text-neutral-600 mb-2">
                <span>Subtotal</span>
                <span className="font-medium">{formatBRL(totalSacola)}</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-600 mb-3">
                <span>{mesaId ? "Serviço na mesa" : "Taxa de entrega"}</span>
                <span className="text-green-600 font-semibold">Grátis</span>
              </div>
              <div className="border-t border-neutral-100 pt-3 flex justify-between font-bold text-neutral-900 text-base">
                <span>Total</span>
                <span>{formatBRL(totalSacola)}</span>
              </div>

              {/* Método de pagamento */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-neutral-100">
                {metodos.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setPagamento(m.key)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${
                      pagamento === m.key
                        ? "border-coral-500 text-coral-600 bg-coral-50"
                        : "border-neutral-200 text-neutral-500 hover:border-neutral-300"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* CTA flutuante */}
      {itens.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-neutral-50 via-neutral-50 to-transparent pointer-events-none">
          <div className="max-w-lg mx-auto pointer-events-auto">
            <button
              onClick={enviarPedido}
              disabled={loading}
              className="w-full bg-coral-500 text-white rounded-2xl py-4 px-5 font-semibold text-base shadow-lg shadow-coral-200 active:bg-coral-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              Enviar pedido · {formatBRL(totalSacola)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
