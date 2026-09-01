"use client";

import { useState } from "react";
<<<<<<< HEAD
import { usePedidos, useAtualizarStatus, useImprimir } from "@/lib/api/queries/orders";
import { useSessionStore } from "@/lib/store/session";
import { Pedido, OrderStatus } from "@/types/domain";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { formatBRL, formatarTempo } from "@/lib/utils";
=======
import { useKitchenOrders, useAtualizarStatusItemCozinha } from "@/lib/api/queries/kitchen";
import { useComandasAbertas } from "@/lib/api/queries/comandas";
import { useProdutos } from "@/lib/api/queries/menu";
import { useSessionStore } from "@/lib/store/session";
import { useEntregaLocalStore } from "@/lib/store/entregaLocal";
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59
import { useOrders } from "@/lib/hooks/useOrders";
import { useMounted } from "@/lib/hooks/useMounted";
import { ItemComanda } from "@/types/domain";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { Imprimivel, imprimir } from "@/components/ui/Imprimivel";
import { formatBRL, formatarTempo } from "@/lib/utils";
import { toast } from "@/components/ui/Toast";
import { apiErrorMessage } from "@/lib/api/client";

export default function PedidosPage() {
<<<<<<< HEAD
  const { usuario } = useSessionStore();
  const [filtroAtivo, setFiltroAtivo] = useState<Filtro>("todos");
  const [pedidoAberto, setPedidoAberto] = useState<Pedido | null>(null);

  const { data, isLoading } = usePedidos();
  const atualizarStatus = useAtualizarStatus();

  const { isConnected } = useOrders({
    restauranteId: usuario?.restaurante_id ?? "",
    onNovoPedido: () => toast.info("Novo pedido!", "Verifique a fila."),
  });

  const pedidos = data?.data ?? [];

  const filtrados = pedidos.filter((p) => {
    if (filtroAtivo === "todos") return !["entregue", "cancelado"].includes(p.status);
    return p.status === filtroAtivo;
  });
=======
  const { hasRole } = useSessionStore();
  /* O papel real só existe depois de reidratar a sessão do localStorage
     no cliente — no SSR precisamos renderizar a mesma coisa dos dois
     lados (o loader), senão a árvore inteira diverge (Cozinha vs.
     Garçom são componentes completamente diferentes). */
  const mounted = useMounted();

  useOrders({ onNovoPedido: () => toast.info("Novo pedido!", "Verifique a fila.") });

  if (!mounted) return <PageLoader />;
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59

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

<<<<<<< HEAD
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
=======
  function avancar(itemIds: string[], atual: "pendente" | "em_andamento") {
    const proximo = proximoStatusCozinha[atual];
    for (const id of itemIds) {
      atualizarStatus.mutate(
        { id, payload: { status: proximo } },
        { onError: () => toast.error("Erro ao atualizar status", "Tente novamente.") }
      );
    }
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59
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

<<<<<<< HEAD
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
=======
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
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59
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

<<<<<<< HEAD
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
=======
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
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59
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
