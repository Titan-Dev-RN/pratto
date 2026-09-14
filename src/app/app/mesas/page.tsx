"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMesasV1, useAbrirMesaV1 } from "@/lib/api/queries/v1/mesas";
import { usePedidosV1 } from "@/lib/api/queries/v1/pedidos";
import { useSessionStore } from "@/lib/store/session";
import { MesaV1, PedidoV1 } from "@/types/domain";
import { TableStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { FecharContaModal } from "@/components/team/FecharContaModal";
import { CaixaSessaoBar } from "@/components/team/CaixaSessaoBar";
import { formatBRL } from "@/lib/utils";
import { extractErrorMessage } from "@/lib/api/client";
import { toast } from "@/components/ui/Toast";

/* Migrado pra superfície V1 — GET /api/v1/cliente/mesas + PATCH
   /mesas/:id/abrir. O "pedido em aberto" da mesa é resolvido cruzando
   GET /api/v1/cliente/pedidos?tipo=mesa por `mesa_id` (a v1 não embute
   um `active_command` na mesa como a `/api/tables` fazia).

   ⚠️ V1 NÃO CONFIRMADA AO VIVO:
   - o enum de status da mesa é chute (livre / ocupada / conta_pedida /
     fechada). Qualquer coisa != "livre" é tratada como ocupada.
   - a v1 não tem endpoint pra "solicitar conta" (setar status
     intermediário) — esse botão saiu; o caixa fecha direto.
   - abrir mesa NÃO cria pedido: o pedido nasce no PDV (pedidos/novo),
     que na v1 manda POST /pedidos já com os itens. */

const CORES: Record<string, { card: string; texto: string }> = {
  livre: { card: "bg-green-50 border-green-200 hover:bg-green-100", texto: "text-green-700" },
  ocupada: { card: "bg-amber-50 border-amber-200 hover:bg-amber-100", texto: "text-amber-700" },
  conta_pedida: { card: "bg-blue-50 border-blue-200 hover:bg-blue-100", texto: "text-blue-700" },
  fechada: { card: "bg-neutral-50 border-neutral-200 hover:bg-neutral-100", texto: "text-neutral-600" },
};
const cor = (status: string) => CORES[status] ?? CORES.ocupada;

function pedidoAberto(pedidos: PedidoV1[] | undefined, mesa: MesaV1): PedidoV1 | undefined {
  return (pedidos ?? []).find(
    (p) =>
      String(p.mesa_id ?? "") === String(mesa.id) &&
      !["entregue", "fechado", "cancelado", "pago"].includes(p.status),
  );
}

export default function MesasPage() {
  const { hasRole } = useSessionStore();
  const podeFecharConta = hasRole(["caixa", "admin"]);

  const { data: mesas, isLoading, isError, refetch } = useMesasV1();
  const { data: pedidosMesa } = usePedidosV1({ tipo: "mesa" });
  const abrirMesa = useAbrirMesaV1();

  const [mesaSelecionada, setMesaSelecionada] = useState<MesaV1 | null>(null);
  const [mesaVerPedidos, setMesaVerPedidos] = useState<MesaV1 | null>(null);
  const [fecharContaMesa, setFecharContaMesa] = useState<MesaV1 | null>(null);

  if (isLoading) return <PageLoader />;
  if (isError || !mesas) return <ErrorState onRetry={() => refetch()} />;

  const livres = mesas.filter((m) => m.status === "livre").length;
  const ocupadas = mesas.filter((m) => m.status === "ocupada").length;
  const contaPedida = mesas.filter((m) => m.status === "conta_pedida").length;

  function onContaFechada() {
    setFecharContaMesa(null);
    toast.success("Conta fechada!", "A mesa está livre para novos clientes.");
  }

  function handleAbrir(mesa: MesaV1) {
    abrirMesa.mutate(mesa.id, {
      onSuccess: () => {
        toast.success(`Mesa ${mesa.numero} aberta!`);
        setMesaSelecionada(null);
      },
      onError: (err) => toast.error("Erro ao abrir mesa", extractErrorMessage(err)),
    });
  }

  function verPedidos(mesa: MesaV1) {
    if (!pedidoAberto(pedidosMesa, mesa)) {
      toast.info("Sem pedidos ainda", `A mesa ${mesa.numero} não tem nenhum pedido lançado.`);
      return;
    }
    setMesaSelecionada(null);
    setMesaVerPedidos(mesa);
  }

  const fecharPedido = fecharContaMesa ? pedidoAberto(pedidosMesa, fecharContaMesa) : undefined;

  return (
    <div className="max-w-2xl mx-auto px-4 py-5">
      {podeFecharConta && <CaixaSessaoBar />}

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

      {mesas.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <p className="text-4xl mb-3">🪑</p>
          <p className="font-medium text-sm">Nenhuma mesa cadastrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {mesas.map((mesa) => {
            const aberto = pedidoAberto(pedidosMesa, mesa);
            return (
              <button
                key={mesa.id}
                onClick={() => setMesaSelecionada(mesa)}
                className={`relative p-4 rounded-2xl border-2 text-left transition-all active:scale-95 ${cor(mesa.status).card}`}
              >
                <p className={`text-2xl font-bold ${cor(mesa.status).texto}`}>{mesa.numero}</p>
                {podeFecharConta && aberto && (
                  <p className="text-xs text-neutral-500 mt-0.5 truncate">{formatBRL(aberto.total)}</p>
                )}
                <div className="mt-2">
                  <TableStatusBadge status={mesa.status} />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {mesaSelecionada && (
        <MesaModal
          mesa={mesaSelecionada}
          pedido={pedidoAberto(pedidosMesa, mesaSelecionada)}
          podeFecharConta={podeFecharConta}
          loading={abrirMesa.isPending}
          onFechar={() => setMesaSelecionada(null)}
          onAbrirMesa={handleAbrir}
          onVerPedidos={verPedidos}
          onFecharConta={(m) => {
            setMesaSelecionada(null);
            setFecharContaMesa(m);
          }}
        />
      )}

      {mesaVerPedidos && (
        <VerPedidosModal
          mesa={mesaVerPedidos}
          pedido={pedidoAberto(pedidosMesa, mesaVerPedidos)}
          onFechar={() => setMesaVerPedidos(null)}
        />
      )}

      {fecharContaMesa && fecharPedido && (
        <FecharContaModal
          mesa={fecharContaMesa}
          pedidoId={fecharPedido.id}
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
  pedido,
  podeFecharConta,
  loading,
  onFechar,
  onAbrirMesa,
  onVerPedidos,
  onFecharConta,
}: {
  mesa: MesaV1;
  pedido: PedidoV1 | undefined;
  podeFecharConta: boolean;
  loading: boolean;
  onFechar: () => void;
  onAbrirMesa: (m: MesaV1) => void;
  onVerPedidos: (m: MesaV1) => void;
  onFecharConta: (m: MesaV1) => void;
}) {
  const router = useRouter();
  const ocupada = mesa.status !== "livre";

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
        {podeFecharConta && pedido && (
          <p className="text-sm text-neutral-500 mb-4">Conta atual: {formatBRL(pedido.total)}</p>
        )}

        <div className="flex flex-col gap-2.5 mt-4">
          {!ocupada && (
            <Button theme="team" fullWidth size="lg" loading={loading} onClick={() => onAbrirMesa(mesa)}>
              Abrir mesa
            </Button>
          )}

          {ocupada && (
            <>
              <Button
                theme="team"
                fullWidth
                onClick={() => router.push(`/app/pedidos/novo?mesa_id=${mesa.id}&mesa_num=${mesa.numero}`)}
              >
                + Novo pedido
              </Button>
              <Button theme="team" variant="secondary" fullWidth onClick={() => onVerPedidos(mesa)}>
                Ver pedidos
              </Button>
              {podeFecharConta ? (
                <Button theme="team" fullWidth disabled={!pedido} onClick={() => onFecharConta(mesa)}>
                  Fechar conta
                </Button>
              ) : (
                <p className="text-sm text-neutral-400 text-center py-2">Aguardando o caixa fechar a conta.</p>
              )}
            </>
          )}
        </div>

        <button onClick={onFechar} className="mt-4 w-full text-center text-sm text-neutral-400 hover:text-neutral-600">
          Fechar
        </button>
      </div>
    </div>
  );
}

/* ─── Ver pedidos da mesa — itens do pedido V1 em aberto. A v1 não
   documenta cancelar item individual, então essa ação saiu (era
   DELETE /api/commands/:id/items/:id na superfície antiga). ─── */
function VerPedidosModal({
  mesa,
  pedido,
  onFechar,
}: {
  mesa: MesaV1;
  pedido: PedidoV1 | undefined;
  onFechar: () => void;
}) {
  const itens = pedido?.itens ?? [];

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
          {itens.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-8">Nenhum item lançado ainda.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {itens.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-sm font-semibold text-team-600">{item.quantidade}×</span>
                    <span className="text-sm text-neutral-900 ml-1">{item.produto?.nome ?? "Produto"}</span>
                    {item.observacao && <p className="text-xs text-neutral-400">{item.observacao}</p>}
                  </div>
                  <span className="text-sm text-neutral-500 flex-shrink-0">
                    {formatBRL(item.preco_unitario * item.quantidade)}
                  </span>
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
