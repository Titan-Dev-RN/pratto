"use client";

import { useState } from "react";
import { usePedidos, useAtualizarStatus, useImprimir } from "@/lib/api/queries/orders";
import { Pedido, OrderStatus } from "@/types/domain";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { formatBRL, formatarTempo } from "@/lib/utils";
import { useOrders } from "@/lib/hooks/useOrders";
import { toast } from "@/components/ui/Toast";
import { apiErrorMessage } from "@/lib/api/client";

type Filtro = "todos" | "pendente" | "em_preparo" | "pronto";

const filtros: { key: Filtro; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "pendente", label: "Novos" },
  { key: "em_preparo", label: "Em preparo" },
  { key: "pronto", label: "Prontos" },
];

const proximoStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  pendente: "confirmado",
  confirmado: "em_preparo",
  em_preparo: "pronto",
  pronto: "entregue",
};

const acaoLabel: Partial<Record<OrderStatus, string>> = {
  pendente: "Confirmar",
  confirmado: "Iniciar preparo",
  em_preparo: "Marcar pronto",
  pronto: "Entregar",
};

const acaoCor: Partial<Record<OrderStatus, string>> = {
  pendente: "bg-amber-500 text-white hover:bg-amber-600",
  confirmado: "bg-team-500 text-white hover:bg-team-600",
  em_preparo: "border-2 border-green-500 text-green-600 hover:bg-green-50",
  pronto: "bg-green-500 text-white hover:bg-green-600",
};

export default function PedidosPage() {
  const [filtroAtivo, setFiltroAtivo] = useState<Filtro>("todos");
  const [pedidoAberto, setPedidoAberto] = useState<Pedido | null>(null);

  const { data, isLoading } = usePedidos();
  const atualizarStatus = useAtualizarStatus();

  const { isConnected } = useOrders({
    onNovoPedido: () => toast.info("Novo pedido!", "Verifique a fila."),
  });

  const pedidos = data?.data ?? [];

  const filtrados = pedidos.filter((p) => {
    if (filtroAtivo === "todos") return !["entregue", "cancelado"].includes(p.status);
    return p.status === filtroAtivo;
  });

  function contarFiltro(key: Filtro) {
    if (key === "todos") return pedidos.filter((p) => !["entregue", "cancelado"].includes(p.status)).length;
    return pedidos.filter((p) => p.status === key).length;
  }

  function avancarStatus(pedido: Pedido) {
    const proximo = proximoStatus[pedido.status];
    if (!proximo) return;
    atualizarStatus.mutate(
      { id: pedido.id, status: proximo },
      {
        onSuccess: () => toast.success("Status atualizado!"),
        onError: (err) => toast.error("Não foi possível atualizar", apiErrorMessage(err)),
      }
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-5">
      {/* Indicador de conexão */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isConnected() ? "bg-green-500 animate-pulse" : "bg-neutral-300"}`} />
        <span className="text-xs text-neutral-500">
          {isConnected() ? "Tempo real ativo" : "Reconectando..."}
        </span>
      </div>

      {/* Tabs de filtro */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
        {filtros.map((f) => {
          const count = contarFiltro(f.key);
          return (
            <button
              key={f.key}
              onClick={() => setFiltroAtivo(f.key)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                filtroAtivo === f.key
                  ? "bg-team-500 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {f.label}
              {count > 0 && (
                <span
                  className={`text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold ${
                    filtroAtivo === f.key ? "bg-team-400 text-white" : "bg-neutral-300 text-neutral-600"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-neutral-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="font-medium text-sm">Nenhum pedido na fila</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtrados.map((pedido) => (
            <KDSCard
              key={pedido.id}
              pedido={pedido}
              onAvancar={() => avancarStatus(pedido)}
              onDetalhes={() => setPedidoAberto(pedido)}
            />
          ))}
        </div>
      )}

      {pedidoAberto && (
        <PedidoModal
          pedido={pedidoAberto}
          onFechar={() => setPedidoAberto(null)}
          onAvancar={() => {
            avancarStatus(pedidoAberto);
            setPedidoAberto(null);
          }}
        />
      )}
    </div>
  );
}

function KDSCard({
  pedido,
  onAvancar,
  onDetalhes,
}: {
  pedido: Pedido;
  onAvancar: () => void;
  onDetalhes: () => void;
}) {
  const acao = acaoLabel[pedido.status];
  const cor = acaoCor[pedido.status] ?? "bg-team-500 text-white";
  const urgente = pedido.status === "pendente";

  return (
    <div
      className={`bg-white rounded-2xl border-2 p-4 shadow-sm ${urgente ? "border-amber-300" : "border-neutral-100"}`}
    >
      {/* Cabeçalho do card */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-neutral-900 text-base">#{pedido.numero}</span>
          {pedido.mesa_numero ? (
            <span className="text-xs bg-team-100 text-team-700 font-semibold px-2 py-0.5 rounded-full">
              Mesa {pedido.mesa_numero}
            </span>
          ) : (
            <span className="text-xs bg-neutral-100 text-neutral-600 font-semibold px-2 py-0.5 rounded-full">
              Balcão
            </span>
          )}
          {urgente && (
            <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">
              Novo
            </span>
          )}
        </div>
        <span className="text-xs text-neutral-400 flex-shrink-0">{formatarTempo(pedido.criado_em)}</span>
      </div>

      {/* Itens */}
      <ul className="flex flex-col gap-1 mb-4">
        {pedido.itens.map((item) => (
          <li key={item.id} className="text-sm text-neutral-700 flex items-baseline gap-1">
            <span className="font-semibold text-team-600 flex-shrink-0">{item.quantidade}×</span>
            <span>{item.produto_nome}</span>
          </li>
        ))}
      </ul>

      {/* Ações */}
      <div className="flex gap-2">
        {acao && (
          <button
            onClick={onAvancar}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${cor}`}
          >
            {acao}
          </button>
        )}
        <button
          onClick={onDetalhes}
          className="px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors flex-shrink-0"
        >
          ···
        </button>
      </div>
    </div>
  );
}

function PedidoModal({ pedido, onFechar, onAvancar }: { pedido: Pedido; onFechar: () => void; onAvancar: () => void }) {
  const proximo = proximoStatus[pedido.status];
  const acao = acaoLabel[pedido.status];
  const imprimir = useImprimir();

  async function handleImprimir() {
    try {
      await imprimir.mutateAsync({ pedido_id: pedido.id });
      toast.success("Enviado para impressão!");
    } catch (err) {
      toast.error("Não foi possível imprimir", apiErrorMessage(err));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onFechar}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <div
        className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-neutral-100">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-neutral-900 text-lg">Pedido #{pedido.numero}</h2>
            <span className="text-xs text-neutral-400">{formatarTempo(pedido.criado_em)}</span>
          </div>
          {pedido.mesa_numero && (
            <p className="text-sm text-neutral-500 mt-0.5">Mesa {pedido.mesa_numero}</p>
          )}
        </div>

        <div className="overflow-y-auto flex-1 p-5">
          <ul className="flex flex-col gap-3">
            {pedido.itens.map((item) => (
              <li key={item.id} className="flex justify-between">
                <div>
                  <span className="text-sm font-semibold text-team-600">{item.quantidade}×</span>
                  <span className="text-sm text-neutral-900 ml-1">{item.produto_nome}</span>
                </div>
                <span className="text-sm font-medium text-neutral-600">{formatBRL(item.preco_total)}</span>
              </li>
            ))}
          </ul>
          {pedido.observacao && (
            <p className="mt-4 text-sm text-neutral-500 bg-neutral-50 rounded-xl p-3">📝 {pedido.observacao}</p>
          )}
          <div className="border-t border-neutral-100 mt-4 pt-4 flex justify-between font-bold text-neutral-900">
            <span>Total</span>
            <span>{formatBRL(pedido.total)}</span>
          </div>
        </div>

        <div className="p-4 flex flex-col gap-2 border-t border-neutral-100">
          {proximo && acao && (
            <Button theme="team" fullWidth onClick={onAvancar}>{acao}</Button>
          )}
          <Button theme="team" variant="secondary" fullWidth loading={imprimir.isPending} onClick={handleImprimir}>
            Imprimir comanda
          </Button>
          <button onClick={onFechar} className="text-sm text-neutral-400 hover:text-neutral-600 py-2">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
