"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMesas, useAtualizarMesa } from "@/lib/api/queries/mesas";
import { useAbrirComanda, useComanda, useRemoverItemComanda } from "@/lib/api/queries/comandas";
import { useProdutos } from "@/lib/api/queries/menu";
import { useSessionStore } from "@/lib/store/session";
import { Mesa } from "@/types/domain";
import { TableStatusBadge, ItemComandaStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { FecharContaModal } from "@/components/team/FecharContaModal";
import { CaixaSessaoBar } from "@/components/team/CaixaSessaoBar";
import { formatBRL } from "@/lib/utils";
import { extractErrorMessage } from "@/lib/api/client";
import { toast } from "@/components/ui/Toast";

const statusColors: Record<Mesa["status"], string> = {
  livre: "bg-green-50 border-green-200 hover:bg-green-100",
  ocupada: "bg-amber-50 border-amber-200 hover:bg-amber-100",
  conta_pedida: "bg-blue-50 border-blue-200 hover:bg-blue-100",
};

const statusTexto: Record<Mesa["status"], string> = {
  livre: "text-green-700",
  ocupada: "text-amber-700",
  conta_pedida: "text-blue-700",
};

export default function MesasPage() {
  const { usuario, hasRole } = useSessionStore();
  const podeFecharConta = hasRole(["caixa", "admin"]);

  const { data: mesas, isLoading, isError, refetch } = useMesas();
  const atualizarMesa = useAtualizarMesa();
  const abrirComanda = useAbrirComanda();

  const [mesaSelecionada, setMesaSelecionada] = useState<Mesa | null>(null);
  const [mesaVerPedidos, setMesaVerPedidos] = useState<Mesa | null>(null);
  const [fecharContaMesa, setFecharContaMesa] = useState<Mesa | null>(null);

  if (isLoading) return <PageLoader />;
  if (isError || !mesas) return <ErrorState onRetry={() => refetch()} />;

  const livres = mesas.filter((m) => m.status === "livre").length;
  const ocupadas = mesas.filter((m) => m.status === "ocupada").length;
  const contaPedida = mesas.filter((m) => m.status === "conta_pedida").length;

  function onContaFechada() {
    setFecharContaMesa(null);
    toast.success("Conta fechada!", "A mesa está livre para novos clientes.");
  }

  async function abrirMesa(mesa: Mesa) {
    if (!usuario?.restaurante_id) {
      toast.error("Erro ao abrir mesa", "Sessão sem loja associada — faça login de novo.");
      return;
    }
    try {
      /* Criar a comanda não muda o status da mesa sozinho (confirmado ao
         vivo) — por isso o PATCH explícito antes. `mesa_id`/`loja_id` são
         os nomes reais aceitos pelo POST /api/commands: o exemplo antigo
         (table_id/attendant_id) dava 422 mesmo com ids válidos. */
      await atualizarMesa.mutateAsync({ id: mesa.id, payload: { status: "ocupada" } });
      await abrirComanda.mutateAsync({ mesa_id: mesa.id, loja_id: usuario.restaurante_id });
      toast.success(`Mesa ${mesa.numero} aberta!`);
      setMesaSelecionada(null);
    } catch (err) {
      toast.error("Erro ao abrir mesa", extractErrorMessage(err));
    }
  }

  function solicitarConta(mesa: Mesa) {
    atualizarMesa.mutate(
      { id: mesa.id, payload: { status: "conta_pedida" } },
      {
        onSuccess: () => {
          toast.info("Conta solicitada", `Mesa ${mesa.numero} aguardando o caixa.`);
          setMesaSelecionada(null);
        },
        onError: () => toast.error("Erro ao solicitar conta", "Tente novamente."),
      }
    );
  }

  function verPedidos(mesa: Mesa) {
    if (!mesa.active_command) {
      toast.info("Sem pedidos ainda", `A mesa ${mesa.numero} não tem nenhum pedido lançado.`);
      return;
    }
    setMesaSelecionada(null);
    setMesaVerPedidos(mesa);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-5">
      {podeFecharConta && <CaixaSessaoBar />}

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
          <p className="text-2xl font-bold text-green-700">{livres}</p>
          <p className="text-xs text-green-600 mt-0.5">Livres</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-100">
          <p className="text-2xl font-bold text-amber-700">{ocupadas}</p>
          <p className="text-xs text-amber-600 mt-0.5">Ocupadas</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
          <p className="text-2xl font-bold text-blue-700">{contaPedida}</p>
          <p className="text-xs text-blue-600 mt-0.5">Conta pedida</p>
        </div>
      </div>

      {/* Grid de mesas */}
      {mesas.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <p className="text-4xl mb-3">🪑</p>
          <p className="font-medium text-sm">Nenhuma mesa cadastrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {mesas.map((mesa) => (
            <button
              key={mesa.id}
              onClick={() => setMesaSelecionada(mesa)}
              className={`relative p-4 rounded-2xl border-2 text-left transition-all active:scale-95 ${statusColors[mesa.status]}`}
            >
              <p className={`text-2xl font-bold ${statusTexto[mesa.status]}`}>{mesa.numero}</p>
              {/* Caixa problema #2: ver valor da conta assim que clica na mesa —
                  já dá pra mostrar aqui mesmo, sem chamada extra. */}
              {podeFecharConta && mesa.active_command && (
                <p className="text-xs text-neutral-500 mt-0.5 truncate">{formatBRL(mesa.active_command.total)}</p>
              )}
              <div className="mt-2">
                <TableStatusBadge status={mesa.status} />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Modal de mesa */}
      {mesaSelecionada && (
        <MesaModal
          mesa={mesaSelecionada}
          podeFecharConta={podeFecharConta}
          loading={atualizarMesa.isPending || abrirComanda.isPending}
          onFechar={() => setMesaSelecionada(null)}
          onAbrirMesa={abrirMesa}
          onSolicitarConta={solicitarConta}
          onVerPedidos={verPedidos}
          onFecharConta={(m) => {
            setMesaSelecionada(null);
            setFecharContaMesa(m);
          }}
        />
      )}

      {/* Modal ver pedidos (garçom #2) */}
      {mesaVerPedidos && (
        <VerPedidosModal mesa={mesaVerPedidos} onFechar={() => setMesaVerPedidos(null)} />
      )}

      {/* Modal fechar conta (caixa) */}
      {fecharContaMesa && fecharContaMesa.active_command && (
        <FecharContaModal
          mesa={fecharContaMesa}
          comandaId={fecharContaMesa.active_command.id}
          onFechar={() => setFecharContaMesa(null)}
          onContaFechada={onContaFechada}
        />
      )}
    </div>
  );
}

/* ─── Modal de ações da mesa ─── */
function MesaModal({
  mesa,
  podeFecharConta,
  loading,
  onFechar,
  onAbrirMesa,
  onSolicitarConta,
  onVerPedidos,
  onFecharConta,
}: {
  mesa: Mesa;
  podeFecharConta: boolean;
  loading: boolean;
  onFechar: () => void;
  onAbrirMesa: (m: Mesa) => void;
  onSolicitarConta: (m: Mesa) => void;
  onVerPedidos: (m: Mesa) => void;
  onFecharConta: (m: Mesa) => void;
}) {
  const router = useRouter();

  function irParaNovoPedido() {
    if (!mesa.active_command) return;
    router.push(`/app/pedidos/novo?comanda_id=${mesa.active_command.id}&mesa_num=${mesa.numero}`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onFechar}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <div
        className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-neutral-900">Mesa {mesa.numero}</h2>
          <TableStatusBadge status={mesa.status} />
        </div>
        {podeFecharConta && mesa.active_command && (
          <p className="text-sm text-neutral-500 mb-4">Conta atual: {formatBRL(mesa.active_command.total)}</p>
        )}

        <div className="flex flex-col gap-2.5 mt-4">
          {mesa.status === "livre" && (
            <Button theme="team" fullWidth size="lg" loading={loading} onClick={() => onAbrirMesa(mesa)}>
              Abrir mesa
            </Button>
          )}

          {mesa.status !== "livre" && (
            <>
              {mesa.status === "ocupada" && (
                <Button theme="team" fullWidth onClick={irParaNovoPedido}>
                  + Novo pedido
                </Button>
              )}
              <Button theme="team" variant="secondary" fullWidth onClick={() => onVerPedidos(mesa)}>
                Ver pedidos
              </Button>
              {mesa.status === "ocupada" && (
                <Button theme="team" variant="ghost" fullWidth onClick={() => onSolicitarConta(mesa)}>
                  Solicitar conta
                </Button>
              )}
              {mesa.status === "conta_pedida" && (
                podeFecharConta ? (
                  <Button theme="team" fullWidth onClick={() => onFecharConta(mesa)}>
                    Fechar conta
                  </Button>
                ) : (
                  <p className="text-sm text-neutral-400 text-center py-2">Aguardando o caixa fechar a conta.</p>
                )
              )}
            </>
          )}
        </div>

        <button
          onClick={onFechar}
          className="mt-4 w-full text-center text-sm text-neutral-400 hover:text-neutral-600"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}

/* ─── Ver pedidos da mesa (garçom #2) — mostra os itens de verdade,
   não redireciona pra "novo pedido" ─── */
function VerPedidosModal({ mesa, onFechar }: { mesa: Mesa; onFechar: () => void }) {
  const comandaId = mesa.active_command?.id;
  const { data: comanda, isLoading } = useComanda(comandaId);
  const { data: produtos } = useProdutos();
  const removerItem = useRemoverItemComanda();
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);
  const nomeProduto = (id: string) => produtos?.find((p) => p.id === id)?.nome ?? "Produto";

  function cancelarItem(itemId: string) {
    if (!comandaId) return;
    removerItem.mutate(
      { comandaId, itemId },
      {
        onSuccess: () => {
          toast.success("Item cancelado.");
          setConfirmandoId(null);
        },
        onError: (err) => toast.error("Erro ao cancelar item", extractErrorMessage(err)),
      }
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onFechar}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <div
        className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-neutral-100">
          <h2 className="font-bold text-neutral-900 text-lg">Pedidos da mesa {mesa.numero}</h2>
        </div>
        <div className="overflow-y-auto flex-1 p-5">
          {isLoading ? (
            <PageLoader />
          ) : !comanda?.item_comandas?.length ? (
            <p className="text-sm text-neutral-400 text-center py-8">Nenhum item lançado ainda.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {comanda.item_comandas.map((item) => (
                <li key={item.id} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-sm font-semibold text-team-600">{item.quantidade}×</span>
                      <span className="text-sm text-neutral-900 ml-1">{nomeProduto(item.produto_id)}</span>
                      {item.observacao && <p className="text-xs text-neutral-400">{item.observacao}</p>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <ItemComandaStatusBadge status={item.status} />
                      <button
                        onClick={() => setConfirmandoId(item.id)}
                        className="text-neutral-300 hover:text-red-500 transition-colors"
                        aria-label={`Cancelar ${nomeProduto(item.produto_id)}`}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m3 0-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {confirmandoId === item.id && (
                    <div className="flex items-center justify-between gap-2 bg-red-50 rounded-lg px-3 py-2">
                      <span className="text-xs text-red-600">Cancelar este item da conta?</span>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => setConfirmandoId(null)}
                          className="text-xs font-medium text-neutral-500 hover:text-neutral-700"
                        >
                          Voltar
                        </button>
                        <button
                          onClick={() => cancelarItem(item.id)}
                          disabled={removerItem.isPending}
                          className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-60"
                        >
                          Confirmar
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="p-4 border-t border-neutral-100">
          <button onClick={onFechar} className="w-full text-sm text-neutral-400 hover:text-neutral-600 py-2 text-center">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
