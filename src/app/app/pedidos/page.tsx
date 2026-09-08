"use client";

import { useState } from "react";
import { usePedidosV1, useAtualizarStatusPedidoV1 } from "@/lib/api/queries/v1/pedidos";
import { useEnviarImpressao } from "@/lib/api/queries/v1/impressao";
import { useSessionStore } from "@/lib/store/session";
import { useEntregaLocalStore } from "@/lib/store/entregaLocal";
import { useOrders } from "@/lib/hooks/useOrders";
import { useMounted } from "@/lib/hooks/useMounted";
import { PedidoV1 } from "@/types/domain";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { formatBRL, formatarTempo } from "@/lib/utils";
import { toast } from "@/components/ui/Toast";

/* Migrado pra superfície V1 — GET /api/v1/cliente/pedidos e
   PATCH /api/v1/cliente/pedidos/:id/status. Na v1 o "pedido" é o recurso
   inteiro (com `itens[]` embutidos), não a fila por item da
   /api/kitchen/orders. Cada card do KDS agora é um pedido.

   ⚠️ V1 NÃO CONFIRMADA AO VIVO. O enum de status é chute
   (pendente/em_andamento/pronto — mesmo da fila antiga); o exemplo do
   Insomnia de PATCH status usa "entregue". Ajuste conforme o backend. */

export default function PedidosPage() {
  const { hasRole } = useSessionStore();
  const mounted = useMounted();

  useOrders({ onNovoPedido: () => toast.info("Novo pedido!", "Verifique a fila.") });

  if (!mounted) return <PageLoader />;

  if (hasRole("cozinha")) return <CozinhaKDS />;
  return <GarcomPedidos />;
}

/* ─────────────────────────── Cozinha ───────────────────────────── */

type FiltroCozinha = "pendente" | "em_andamento" | "pronto";

const PAGINA_TAMANHO = 6;

const proximoStatusCozinha: Record<"pendente" | "em_andamento", "em_andamento" | "pronto"> = {
  pendente: "em_andamento",
  em_andamento: "pronto",
};

const acaoLabelCozinha: Record<"pendente" | "em_andamento", string> = {
  pendente: "Iniciar preparo →",
  em_andamento: "Marcar pronto →",
};

const colunaEstilo: Record<FiltroCozinha, { titulo: string; header: string; botao: string; acento: string }> = {
  pendente: { titulo: "Novos", header: "bg-amber-500", botao: "bg-amber-500 hover:bg-amber-600", acento: "border-amber-200" },
  em_andamento: { titulo: "Em preparo", header: "bg-blue-500", botao: "bg-blue-500 hover:bg-blue-600", acento: "border-blue-200" },
  pronto: { titulo: "Prontos", header: "bg-green-600", botao: "", acento: "border-green-200" },
};

function CozinhaKDS() {
  const colunas: FiltroCozinha[] = ["pendente", "em_andamento", "pronto"];
  const novos = usePedidosV1({ status: "pendente" });
  const emPreparo = usePedidosV1({ status: "em_andamento" });
  const prontos = usePedidosV1({ status: "pronto" });
  const atualizarStatus = useAtualizarStatusPedidoV1();

  const [pagina, setPagina] = useState<Record<FiltroCozinha, number>>({ pendente: 0, em_andamento: 0, pronto: 0 });

  const resultados = { pendente: novos, em_andamento: emPreparo, pronto: prontos };

  if (novos.isLoading || emPreparo.isLoading || prontos.isLoading) return <PageLoader />;
  if (novos.isError || emPreparo.isError || prontos.isError) {
    return <ErrorState onRetry={() => { novos.refetch(); emPreparo.refetch(); prontos.refetch(); }} />;
  }

  function avancar(pedidoId: string, atual: "pendente" | "em_andamento") {
    atualizarStatus.mutate(
      { id: pedidoId, payload: { status: proximoStatusCozinha[atual] } },
      { onError: () => toast.error("Erro ao atualizar status", "Tente novamente.") }
    );
  }

  return (
    <div className="px-4 py-5">
      <h1 className="text-xl font-bold text-neutral-900 mb-4">Pedidos da cozinha</h1>
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible">
        {colunas.map((status) => {
          const pedidos = resultados[status].data ?? [];
          const estilo = colunaEstilo[status];
          const totalPaginas = Math.max(1, Math.ceil(pedidos.length / PAGINA_TAMANHO));
          const paginaAtual = Math.min(pagina[status], totalPaginas - 1);
          const visiveis = pedidos.slice(paginaAtual * PAGINA_TAMANHO, paginaAtual * PAGINA_TAMANHO + PAGINA_TAMANHO);

          return (
            <div
              key={status}
              className="flex-shrink-0 w-[85vw] sm:w-80 md:w-auto snap-start flex flex-col bg-neutral-100 rounded-2xl overflow-hidden max-h-[calc(100vh-11rem)]"
            >
              <div className={`${estilo.header} text-white px-4 py-3 flex items-center justify-between flex-shrink-0`}>
                <h2 className="font-bold text-sm">{estilo.titulo}</h2>
                <span className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center text-xs font-bold">
                  {pedidos.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
                {pedidos.length === 0 ? (
                  <p className="text-sm text-neutral-400 text-center py-10">Nenhum pedido aqui</p>
                ) : (
                  visiveis.map((pedido) => (
                    <div key={pedido.id} className={`bg-white rounded-2xl border-2 ${estilo.acento} p-4 shadow-sm`}>
                      <div className="flex items-center justify-between mb-3">
                        {pedido.tipo === "mesa" ? (
                          <span className="text-xs bg-team-100 text-team-700 font-semibold px-2 py-0.5 rounded-full">
                            🪑 Mesa {pedido.mesa_id ?? ""}
                          </span>
                        ) : (
                          <span className="text-xs bg-neutral-100 text-neutral-500 font-semibold px-2 py-0.5 rounded-full">
                            {pedido.tipo}
                          </span>
                        )}
                        {pedido.created_at && (
                          <span className="text-xs text-neutral-400">⏱ {formatarTempo(pedido.created_at)}</span>
                        )}
                      </div>
                      <ul className="flex flex-col gap-1 mb-3">
                        {(pedido.itens ?? []).map((item) => (
                          <li key={item.id} className="text-sm text-neutral-700 flex items-baseline gap-1">
                            <span className="font-semibold text-team-600 flex-shrink-0">{item.quantidade}×</span>
                            <span>{item.produto?.nome ?? "Produto"}</span>
                            {item.observacao && <span className="text-xs text-neutral-400">({item.observacao})</span>}
                          </li>
                        ))}
                      </ul>
                      {status !== "pronto" && (
                        <button
                          onClick={() => avancar(pedido.id, status)}
                          disabled={atualizarStatus.isPending}
                          className={`w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 transition-colors ${estilo.botao}`}
                        >
                          {acaoLabelCozinha[status]}
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              {totalPaginas > 1 && (
                <div className="flex items-center justify-between px-3 py-2.5 bg-white border-t border-neutral-200 flex-shrink-0">
                  <button
                    onClick={() => setPagina((p) => ({ ...p, [status]: Math.max(0, paginaAtual - 1) }))}
                    disabled={paginaAtual === 0}
                    className="w-7 h-7 rounded-full bg-neutral-100 text-neutral-600 disabled:opacity-30 flex items-center justify-center font-bold text-sm"
                    aria-label="Página anterior"
                  >
                    ‹
                  </button>
                  <span className="text-xs text-neutral-500 font-medium">
                    Página {paginaAtual + 1} de {totalPaginas}
                  </span>
                  <button
                    onClick={() => setPagina((p) => ({ ...p, [status]: Math.min(totalPaginas - 1, paginaAtual + 1) }))}
                    disabled={paginaAtual >= totalPaginas - 1}
                    className="w-7 h-7 rounded-full bg-neutral-100 text-neutral-600 disabled:opacity-30 flex items-center justify-center font-bold text-sm"
                    aria-label="Próxima página"
                  >
                    ›
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ────────────────────── Garçom / Caixa / Admin ────────────────────── */

function GarcomPedidos() {
  const { data: pedidos, isLoading, isError, refetch } = usePedidosV1({ tipo: "mesa" });
  const { entregues, marcarEntregue } = useEntregaLocalStore();
  const enviarImpressao = useEnviarImpressao();

  if (isLoading) return <PageLoader />;
  if (isError || !pedidos) return <ErrorState onRetry={() => refetch()} />;

  /* Só os que ainda estão em andamento (não entregues/fechados). */
  const abertos = pedidos.filter((p) => p.status !== "entregue" && p.status !== "cancelado" && p.status !== "fechado");

  return (
    <div className="max-w-lg mx-auto px-4 py-5">
      <h1 className="text-xl font-bold text-neutral-900 mb-4">Pedidos em aberto</h1>

      {abertos.length === 0 ? (
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
          {abertos.map((pedido) => (
            <PedidoCard
              key={pedido.id}
              pedido={pedido}
              entregue={!!entregues[pedido.id]}
              imprimindo={enviarImpressao.isPending}
              onEntregar={() => marcarEntregue(pedido.id)}
              onImprimir={() =>
                enviarImpressao.mutate(
                  { pedido_id: pedido.id },
                  {
                    onSuccess: () => toast.success("Enviado para impressão"),
                    onError: () => toast.error("Erro ao imprimir", "Tente novamente."),
                  }
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PedidoCard({
  pedido,
  entregue,
  imprimindo,
  onEntregar,
  onImprimir,
}: {
  pedido: PedidoV1;
  entregue: boolean;
  imprimindo: boolean;
  onEntregar: () => void;
  onImprimir: () => void;
}) {
  const itens = pedido.itens ?? [];
  const todosProntos = pedido.status === "pronto";

  return (
    <div
      className={`bg-white rounded-2xl border-2 p-4 shadow-sm ${
        todosProntos && !entregue ? "border-green-300" : "border-neutral-100"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-bold text-neutral-900 text-base">
          {pedido.tipo === "mesa" ? `Mesa ${pedido.mesa_id ?? ""}` : pedido.tipo}
        </span>
        <span className="text-sm text-neutral-500">{formatBRL(pedido.total)}</span>
      </div>
      <ul className="flex flex-col gap-1.5 mb-3">
        {itens.map((item) => (
          <li key={item.id} className="flex items-center justify-between text-sm">
            <span className="text-neutral-700">
              <span className="font-semibold text-team-600">{item.quantidade}×</span>{" "}
              {item.produto?.nome ?? "Produto"}
            </span>
            {item.status && (
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  item.status === "pronto"
                    ? "bg-green-100 text-green-700"
                    : item.status === "em_andamento"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-amber-100 text-amber-700"
                }`}
              >
                {item.status === "pronto" ? "Pronto" : item.status === "em_andamento" ? "Em preparo" : "Novo"}
              </span>
            )}
          </li>
        ))}
      </ul>

      {todosProntos && !entregue && (
        <div className="bg-green-50 text-green-700 text-sm font-semibold rounded-xl px-3 py-2 mb-3 text-center">
          🟢 Pronto — leve pra mesa
        </div>
      )}

      <div className="flex gap-2">
        {todosProntos && !entregue && (
          <Button theme="team" fullWidth size="sm" onClick={onEntregar}>
            Marcar entregue
          </Button>
        )}
        <Button
          theme="team"
          variant="secondary"
          fullWidth={!(todosProntos && !entregue)}
          size="sm"
          loading={imprimindo}
          onClick={onImprimir}
        >
          🖨️ Imprimir
        </Button>
      </div>
    </div>
  );
}
