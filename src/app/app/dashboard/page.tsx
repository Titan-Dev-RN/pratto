"use client";

import { useDashboard } from "@/lib/api/queries/dashboard";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { formatBRL, formatarTempo } from "@/lib/utils";
import { useSessionStore } from "@/lib/store/session";

export default function DashboardPage() {
  const { usuario } = useSessionStore();
  const { data, isLoading } = useDashboard();
  const kpis = data?.data;

  if (isLoading || !kpis) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  const maxVenda = Math.max(...kpis.grafico_7dias.map((d) => d.total));
  const meta = 2500;
  const escala = Math.max(maxVenda, meta) * 1.1;

  const hoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const inicial = (usuario?.nome ?? "A").charAt(0).toUpperCase();

  return (
    <div className="max-w-lg mx-auto px-4 py-5">
      {/* Header com avatar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Painel</h1>
          <p className="text-sm text-neutral-400 mt-0.5">{hoje}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-team-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {inicial}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <KpiCard
          label="Faturamento"
          value={formatBRL(kpis.vendas_hoje)}
          delta="+12% em relação a ontem"
          bg="bg-team-50"
          border="border-team-100"
          textColor="text-team-700"
        />
        <KpiCard
          label="Comandas"
          value={String(kpis.pedidos_hoje)}
          delta={`+5 hoje`}
          bg="bg-green-50"
          border="border-green-100"
          textColor="text-green-700"
        />
        <KpiCard
          label="Ticket médio"
          value={formatBRL(kpis.ticket_medio)}
          delta="últimos 7 dias"
          bg="bg-amber-50"
          border="border-amber-100"
          textColor="text-amber-700"
        />
        <KpiCard
          label="Em aberto"
          value={String(kpis.pedidos_em_aberto)}
          delta="comandas ativas"
          bg="bg-blue-50"
          border="border-blue-100"
          textColor="text-blue-700"
        />
      </div>

      {/* Gráfico 7 dias */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-100 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-neutral-800 text-sm">Vendas · 7 dias</h2>
          <span className="text-xs text-neutral-400">{formatBRL(meta)} meta</span>
        </div>
        {/* h fixo em px para que alturas percentuais das barras funcionem */}
        <div className="relative flex items-end gap-1.5" style={{ height: 112 }}>
          {/* Linha de meta */}
          <div
            className="absolute left-0 right-0 border-t-2 border-dashed border-teal-400 opacity-70 pointer-events-none z-10"
            style={{ bottom: `${(meta / escala) * 112}px` }}
          />
          {kpis.grafico_7dias.map((dia, i) => {
            const barPx = Math.max((dia.total / escala) * 96, 4); // 96 = área útil das barras
            const isToday = i === kpis.grafico_7dias.length - 1;
            return (
              <div key={`${dia.data}-${i}`} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t-lg transition-all ${isToday ? "bg-team-500" : "bg-team-300"}`}
                  style={{ height: `${barPx}px` }}
                  title={formatBRL(dia.total)}
                />
                <span className={`text-xs ${isToday ? "text-team-600 font-semibold" : "text-neutral-400"}`}>
                  {dia.data}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pedidos recentes */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-neutral-800 text-sm">Pedidos recentes</h2>
          <span className="text-xs text-team-500 font-medium cursor-pointer hover:text-team-700">Ver todos</span>
        </div>
        {kpis.pedidos_recentes.length === 0 ? (
          <p className="text-sm text-neutral-400 text-center py-6">Sem pedidos ainda</p>
        ) : (
          <ul className="flex flex-col divide-y divide-neutral-50">
            {kpis.pedidos_recentes.map((p) => (
              <li key={p.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    #{p.numero}
                    {p.mesa_numero ? ` · Mesa ${p.mesa_numero}` : " · Balcão"}
                  </p>
                  <p className="text-xs text-neutral-400">{formatarTempo(p.criado_em)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-semibold text-neutral-900">{formatBRL(p.total)}</span>
                  <OrderStatusBadge status={p.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  delta,
  bg,
  border,
  textColor,
}: {
  label: string;
  value: string;
  delta: string;
  bg: string;
  border: string;
  textColor: string;
}) {
  return (
    <div className={`rounded-2xl border p-4 ${bg} ${border}`}>
      <p className="text-xs text-neutral-500 font-medium mb-1">{label}</p>
      <p className={`text-xl font-bold ${textColor}`}>{value}</p>
      <p className="text-xs text-neutral-400 mt-1 leading-tight">{delta}</p>
    </div>
  );
}
