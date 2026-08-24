"use client";

import { useState } from "react";
import { useKitchenOrders, useAtualizarStatusItemCozinha } from "@/lib/api/queries/kitchen";
import { useComandasAbertas } from "@/lib/api/queries/comandas";
import { useProdutos } from "@/lib/api/queries/menu";
import { useSessionStore } from "@/lib/store/session";
import { useEntregaLocalStore } from "@/lib/store/entregaLocal";
import { useOrders } from "@/lib/hooks/useOrders";
import { useMounted } from "@/lib/hooks/useMounted";
import { ItemComanda } from "@/types/domain";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { Imprimivel, imprimir } from "@/components/ui/Imprimivel";
import { formatBRL, formatarTempo } from "@/lib/utils";
import { toast } from "@/components/ui/Toast";

export default function PedidosPage() {
  const { hasRole } = useSessionStore();
  /* O papel real só existe depois de reidratar a sessão do localStorage
     no cliente — no SSR precisamos renderizar a mesma coisa dos dois
     lados (o loader), senão a árvore inteira diverge (Cozinha vs.
     Garçom são componentes completamente diferentes). */
  const mounted = useMounted();

  useOrders({ onNovoPedido: () => toast.info("Novo pedido!", "Verifique a fila.") });

  if (!mounted) return <PageLoader />;

  /* Cozinha e garçom/caixa/admin enxergam telas bem diferentes — ver
     Cozinha #2/#3/#4 e Garçom #3/#4 nos problemas relatados: a cozinha só
     avança status (sem "entregar"), o garçom só acompanha (sem "iniciar
     preparo"), e nenhum dos dois mexe em mesa aqui. */
  if (hasRole("cozinha")) return <CozinhaKDS />;
  return <GarcomPedidos />;
}

/* ─────────────────────────── Cozinha ─────────────────────────────
   Fila por item (é assim que o backend expõe — GET /api/kitchen/orders),
   agrupada por comanda pra virar um card de pedido. Kanban com as 3
   colunas simultâneas (Novos/Em preparo/Prontos) em vez de abas — cada
   uma busca seu status direto na API e pagina os cards por conta
   própria (não tem paginação no backend pra isso). */

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
  const novos = useKitchenOrders("pendente");
  const emPreparo = useKitchenOrders("em_andamento");
  const prontos = useKitchenOrders("pronto");
  const atualizarStatus = useAtualizarStatusItemCozinha();

  const [pagina, setPagina] = useState<Record<FiltroCozinha, number>>({ pendente: 0, em_andamento: 0, pronto: 0 });

  const resultados = { pendente: novos, em_andamento: emPreparo, pronto: prontos };

  if (novos.isLoading || emPreparo.isLoading || prontos.isLoading) return <PageLoader />;
  if (novos.isError || emPreparo.isError || prontos.isError) {
    return <ErrorState onRetry={() => { novos.refetch(); emPreparo.refetch(); prontos.refetch(); }} />;
  }

  function avancar(itemIds: string[], atual: "pendente" | "em_andamento") {
    const proximo = proximoStatusCozinha[atual];
    for (const id of itemIds) {
      atualizarStatus.mutate(
        { id, payload: { status: proximo } },
        { onError: () => toast.error("Erro ao atualizar status", "Tente novamente.") }
      );
    }
  }

  return (
    <div className="px-4 py-5">
      <h1 className="text-xl font-bold text-neutral-900 mb-4">Pedidos da cozinha</h1>
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible">
        {colunas.map((status) => {
          const grupos = agruparPorComanda(resultados[status].data ?? []);
          const estilo = colunaEstilo[status];
          const totalPaginas = Math.max(1, Math.ceil(grupos.length / PAGINA_TAMANHO));
          const paginaAtual = Math.min(pagina[status], totalPaginas - 1);
          const visiveis = grupos.slice(paginaAtual * PAGINA_TAMANHO, paginaAtual * PAGINA_TAMANHO + PAGINA_TAMANHO);

          return (
            <div
              key={status}
              className="flex-shrink-0 w-[85vw] sm:w-80 md:w-auto snap-start flex flex-col bg-neutral-100 rounded-2xl overflow-hidden max-h-[calc(100vh-11rem)]"
            >
              <div className={`${estilo.header} text-white px-4 py-3 flex items-center justify-between flex-shrink-0`}>
                <h2 className="font-bold text-sm">{estilo.titulo}</h2>
                <span className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center text-xs font-bold">
                  {grupos.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
                {grupos.length === 0 ? (
                  <p className="text-sm text-neutral-400 text-center py-10">Nenhum pedido aqui</p>
                ) : (
                  visiveis.map((grupo) => (
                    <div key={grupo.comandaId} className={`bg-white rounded-2xl border-2 ${estilo.acento} p-4 shadow-sm`}>
                      <div className="flex items-center justify-between mb-3">
                        {grupo.mesaId ? (
                          <span className="text-xs bg-team-100 text-team-700 font-semibold px-2 py-0.5 rounded-full">
                            🪑 Mesa
                          </span>
                        ) : (
                          <span className="text-xs bg-neutral-100 text-neutral-500 font-semibold px-2 py-0.5 rounded-full">
                            Pedido
                          </span>
                        )}
                        {grupo.criadoEm && (
                          <span className="text-xs text-neutral-400">⏱ {formatarTempo(grupo.criadoEm)}</span>
                        )}
                      </div>
                      <ul className="flex flex-col gap-1 mb-3">
                        {grupo.itens.map((item) => (
                          <li key={item.id} className="text-sm text-neutral-700 flex items-baseline gap-1">
                            <span className="font-semibold text-team-600 flex-shrink-0">{item.quantidade}×</span>
                            <span>{item.produto?.nome ?? "Produto"}</span>
                            {item.observacao && <span className="text-xs text-neutral-400">({item.observacao})</span>}
                          </li>
                        ))}
                      </ul>
                      {status !== "pronto" && (
                        <button
                          onClick={() => avancar(grupo.itens.map((i) => i.id), status)}
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

function agruparPorComanda(itens: ItemComanda[]) {
  const mapa = new Map<string, { comandaId: string; mesaId: string | null; criadoEm?: string; itens: ItemComanda[] }>();
  for (const item of itens) {
    const existente = mapa.get(item.comanda_id);
    if (existente) {
      existente.itens.push(item);
    } else {
      mapa.set(item.comanda_id, {
        comandaId: item.comanda_id,
        mesaId: item.comanda?.mesa_id ?? null,
        criadoEm: item.created_at,
        itens: [item],
      });
    }
  }
  return Array.from(mapa.values());
}

/* ────────────────────── Garçom / Caixa / Admin ──────────────────────
   Só acompanha o andamento das comandas abertas — sem "iniciar preparo"
   (Garçom #3). "Entregar" é só uma marcação local (não existe status
   "entregue" no backend) e não mexe na mesa (Garçom #6: só o fechamento
   de conta libera a mesa). */

function GarcomPedidos() {
  const { comandas, isLoading, isError } = useComandasAbertas();
  const { data: produtos } = useProdutos();
  const { entregues, marcarEntregue } = useEntregaLocalStore();
  const [comandaImprimindo, setComandaImprimindo] = useState<string | null>(null);

  const nomeProduto = (id: string) => produtos?.find((p) => p.id === id)?.nome ?? "Produto";

  if (isLoading) return <PageLoader />;
  if (isError) return <ErrorState onRetry={() => window.location.reload()} />;

  const comandaParaImprimir = comandas.find((c) => c.comanda.id === comandaImprimindo);

  return (
    <div className="max-w-lg mx-auto px-4 py-5">
      <h1 className="text-xl font-bold text-neutral-900 mb-4">Pedidos em aberto</h1>

      {comandas.length === 0 ? (
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
          {comandas.map(({ comanda, mesa }) => {
            const itens = comanda.item_comandas ?? [];
            const todosProntos = itens.length > 0 && itens.every((i) => i.status === "pronto");
            const entregue = !!entregues[comanda.id];

            return (
              <div
                key={comanda.id}
                className={`bg-white rounded-2xl border-2 p-4 shadow-sm ${
                  todosProntos && !entregue ? "border-green-300" : "border-neutral-100"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-neutral-900 text-base">Mesa {mesa.numero}</span>
                  <span className="text-sm text-neutral-500">{formatBRL(comanda.total)}</span>
                </div>
                <ul className="flex flex-col gap-1.5 mb-3">
                  {itens.map((item) => (
                    <li key={item.id} className="flex items-center justify-between text-sm">
                      <span className="text-neutral-700">
                        <span className="font-semibold text-team-600">{item.quantidade}×</span>{" "}
                        {nomeProduto(item.produto_id)}
                      </span>
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
                    </li>
                  ))}
                </ul>

                {todosProntos && !entregue && (
                  <div className="bg-green-50 text-green-700 text-sm font-semibold rounded-xl px-3 py-2 mb-3 text-center">
                    🟢 Pronto — leve pra mesa {mesa.numero}
                  </div>
                )}

                <div className="flex gap-2">
                  {todosProntos && !entregue && (
                    <Button theme="team" fullWidth size="sm" onClick={() => marcarEntregue(comanda.id)}>
                      Marcar entregue
                    </Button>
                  )}
                  <Button
                    theme="team"
                    variant="secondary"
                    fullWidth={!(todosProntos && !entregue)}
                    size="sm"
                    onClick={() => {
                      setComandaImprimindo(comanda.id);
                      setTimeout(imprimir, 50);
                    }}
                  >
                    🖨️ Imprimir
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {comandaParaImprimir && (
        <Imprimivel>
          <div className="font-mono text-xs p-4">
            <p className="font-bold">PRATTO — Mesa {comandaParaImprimir.mesa.numero}</p>
            <p>────────────────</p>
            {(comandaParaImprimir.comanda.item_comandas ?? []).map((item) => (
              <p key={item.id}>
                {item.quantidade}x {nomeProduto(item.produto_id)}
              </p>
            ))}
            <p>────────────────</p>
            <p>TOTAL {formatBRL(comandaParaImprimir.comanda.total)}</p>
          </div>
        </Imprimivel>
      )}
    </div>
  );
}
