"use client";

import { use, useState } from "react";
import Link from "next/link";
import { usePedidoPublico } from "@/lib/api/queries/orders";
import { useRestaurante } from "@/lib/api/queries/menu";
import { OrderStatus } from "@/types/domain";
import { formatBRL } from "@/lib/utils";
import { Spinner } from "@/components/ui/Spinner";

const steps: { status: OrderStatus; label: string; desc?: string }[] = [
  { status: "confirmado", label: "Pedido recebido" },
  { status: "em_preparo", label: "Em preparo" },
  { status: "pronto", label: "Pronto para servir" },
  { status: "entregue", label: "Finalizado" },
];

const statusOrder: OrderStatus[] = ["pendente", "confirmado", "em_preparo", "pronto", "entregue"];

const statusTitulo: Partial<Record<OrderStatus, string>> = {
  confirmado: "Preparando seu pedido",
  em_preparo: "Seu pedido está sendo preparado",
  pronto: "Pedido pronto!",
  entregue: "Pedido entregue 🎉",
};

export default function PedidoPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = use(params);
  const [mostrarItens, setMostrarItens] = useState(false);

  const { data: pedidoData, isLoading } = usePedidoPublico(id);
  const { data: restauranteData } = useRestaurante(slug);
  const pedido = pedidoData?.data;
  const restaurante = restauranteData?.data;

  if (isLoading || !pedido) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const statusIdx = statusOrder.indexOf(pedido.status);

  const titulo = statusTitulo[pedido.status] ?? "Acompanhe seu pedido";
  const eta = pedido.status === "confirmado" || pedido.status === "em_preparo"
    ? "Previsão em aproximadamente 18 min"
    : null;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header limpo */}
      <header className="bg-white border-b border-neutral-100 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <Link href={`/${slug}/menu`} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors">
          <svg className="w-5 h-5 text-neutral-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-neutral-400">Pedido #{pedido.numero}</p>
          <p className="text-sm font-medium text-neutral-700 truncate">{restaurante?.nome}</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-4">
        {/* Status principal */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h1 className="text-lg font-bold text-neutral-900">{titulo}</h1>
          {eta && <p className="text-sm text-neutral-400 mt-1">{eta}</p>}

          {/* Timeline */}
          <ol className="mt-5 relative">
            {steps.map((step, i) => {
              const stepIdx = statusOrder.indexOf(step.status);
              const done = statusIdx >= stepIdx;
              const active = statusIdx === stepIdx;
              return (
                <li key={step.status} className="flex gap-4 pb-5 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                        done
                          ? "bg-coral-500 text-white"
                          : "bg-neutral-100 text-neutral-400"
                      } ${active ? "ring-4 ring-coral-100" : ""}`}
                    >
                      {done ? (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-neutral-300" />
                      )}
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`w-0.5 flex-1 mt-1 min-h-4 transition-colors ${statusIdx > stepIdx ? "bg-coral-300" : "bg-neutral-200"}`} />
                    )}
                  </div>
                  <div className="pt-1">
                    <p className={`text-sm font-semibold ${done ? "text-neutral-900" : "text-neutral-400"}`}>
                      {step.label}
                    </p>
                    {active && (
                      <p className="text-xs text-coral-500 mt-0.5 font-medium">Em andamento</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Ações */}
        <div className="flex flex-col gap-2.5">
          <a
            href={`https://wa.me/?text=Olá, tenho uma dúvida sobre o pedido %23${pedido.numero}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-green-500 text-white rounded-2xl py-4 px-5 font-semibold text-base text-center shadow-sm active:bg-green-600 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Falar com a loja
          </a>

          <button
            onClick={() => setMostrarItens((v) => !v)}
            className="w-full bg-white text-neutral-700 rounded-2xl py-3.5 px-5 font-semibold text-sm text-center border border-neutral-200 active:bg-neutral-50 transition-colors"
          >
            {mostrarItens ? "Ocultar itens do pedido" : "Ver itens do pedido"}
          </button>
        </div>

        {/* Itens do pedido (colapsável) */}
        {mostrarItens && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <ul className="flex flex-col gap-3">
              {pedido.itens.map((item) => (
                <li key={item.id} className="flex justify-between text-sm">
                  <span className="text-neutral-700">
                    <span className="font-semibold text-coral-600">{item.quantidade}×</span>{" "}
                    {item.produto_nome}
                  </span>
                  <span className="font-medium text-neutral-900">{formatBRL(item.preco_total)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-neutral-100 mt-4 pt-4 flex justify-between font-bold text-neutral-900">
              <span>Total</span>
              <span>{formatBRL(pedido.total)}</span>
            </div>
          </div>
        )}

        {pedido.status === "entregue" && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
            <p className="text-3xl mb-2">😊</p>
            <p className="font-semibold text-green-800">Bom apetite!</p>
            <p className="text-sm text-green-600 mt-1">Obrigado por pedir no {restaurante?.nome}</p>
          </div>
        )}
      </main>
    </div>
  );
}
