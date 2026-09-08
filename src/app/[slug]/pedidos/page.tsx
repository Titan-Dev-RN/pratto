"use client";

import { use } from "react";
import Link from "next/link";
import { usePedidoLocalStore, statusSimulado } from "@/lib/store/pedidoLocal";
import { useHistoricoPedidosStore } from "@/lib/store/historicoPedidos";
import { usePedidosPublicos } from "@/lib/api/queries/publicOrders";
import { useMeusPedidosCliente } from "@/lib/api/queries/customers";
import { useClienteSessaoStore } from "@/lib/store/clienteSessao";
import { useMounted } from "@/lib/hooks/useMounted";
import { PageLoader } from "@/components/ui/Spinner";
import { formatBRL, formatarTempo } from "@/lib/utils";

/* "Meus pedidos" — agora com conta de cliente de verdade:
   - Logado: GET /api/public/storefront/:slug/orders devolve o histórico
     real (⚠️ endpoint não confirmado ao vivo).
   - Deslogado: cai no fallback antigo — códigos de rastreio guardados
     neste aparelho (historicoPedidos) + pedidos de mesa/balcão simulados
     (pedidoLocal). */

const statusLabel: Record<string, string> = {
  pendente: "Recebido",
  confirmado: "Confirmado",
  em_preparo: "Em preparo",
  pronto: "Pronto",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

const statusCor: Record<string, string> = {
  pendente: "bg-amber-100 text-amber-700",
  confirmado: "bg-amber-100 text-amber-700",
  em_preparo: "bg-blue-100 text-blue-700",
  pronto: "bg-green-100 text-green-700",
  entregue: "bg-neutral-100 text-neutral-600",
  cancelado: "bg-red-100 text-red-700",
};

interface LinhaPedido {
  id: string;
  rotulo: string;
  origem: string;
  total: number;
  status: string;
  criadoEm: string;
}

export default function MeusPedidosPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const mounted = useMounted();

  const sessao = useClienteSessaoStore();
  const logado = mounted && sessao.isAuthed();

  const pedidosLocais = usePedidoLocalStore((s) => s.pedidos);
  const historico = useHistoricoPedidosStore((s) => s.pedidos);
  const codigos = mounted && !logado ? historico.map((h) => h.codigoRastreio) : [];
  const { pedidos: reais, isLoading: carregandoLocais } = usePedidosPublicos(codigos);
  const { data: doCliente, isLoading: carregandoCliente } = useMeusPedidosCliente(slug, { enabled: !!logado });

  if (!mounted || carregandoLocais || (logado && carregandoCliente)) return <PageLoader />;

  const linhasLocais: LinhaPedido[] = logado
    ? []
    : Object.values(pedidosLocais).map((p) => ({
        id: p.id,
        rotulo: `#${p.numero}`,
        origem: p.tipo === "mesa" ? `Mesa ${p.mesa_numero ?? ""}` : "Retirada",
        total: p.total,
        status: statusSimulado(p.criado_em),
        criadoEm: p.criado_em,
      }));

  const linhasReais: LinhaPedido[] = logado
    ? (doCliente ?? []).map((p) => ({
        id: p.codigo_rastreio,
        rotulo: `#${p.codigo_rastreio}`,
        origem: "Delivery",
        total: p.total,
        status: p.status,
        criadoEm: "",
      }))
    : reais
        .filter((r): r is typeof r & { data: NonNullable<typeof r.data> } => !!r.data)
        .map((r) => ({
          id: r.codigo,
          rotulo: `#${r.codigo}`,
          origem: "Delivery",
          total: r.data.total,
          status: r.data.status,
          criadoEm: historico.find((h) => h.codigoRastreio === r.codigo)?.criadoEm ?? "",
        }));

  const todas = [...linhasLocais, ...linhasReais].sort((a, b) => (a.criadoEm < b.criadoEm ? 1 : -1));

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-100 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <Link href={`/${slug}/menu`} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors">
          <svg className="w-5 h-5 text-neutral-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="font-bold text-neutral-900 text-base">Meus pedidos</h1>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5">
        {!logado && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5">
            <span className="text-base leading-none">📱</span>
            <p className="text-xs text-amber-700">
              Sem conta conectada — lista guardada só neste aparelho. Entre na sua conta pra ver o
              histórico completo.
            </p>
          </div>
        )}

        {todas.length === 0 ? (
          <div className="text-center py-16 text-neutral-400">
            <p className="text-4xl mb-3">🧾</p>
            <p className="font-medium text-sm">Nenhum pedido ainda</p>
            <Link href={`/${slug}/menu`}>
              <button className="mt-4 bg-coral-50 text-coral-700 rounded-xl px-5 py-2.5 text-sm font-semibold active:bg-coral-100 transition-colors">
                Ir ao cardápio
              </button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {todas.map((pedido) => (
              <Link key={pedido.id} href={`/${slug}/pedido/${pedido.id}`}>
                <div className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm active:bg-neutral-50 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-neutral-900 text-sm">{pedido.rotulo}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusCor[pedido.status] ?? "bg-neutral-100 text-neutral-600"}`}>
                      {statusLabel[pedido.status] ?? pedido.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-neutral-500">
                    <span>{pedido.origem}{pedido.criadoEm ? ` · ${formatarTempo(pedido.criadoEm)} atrás` : ""}</span>
                    <span className="font-semibold text-neutral-800">{formatBRL(pedido.total)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
