"use client";

import { useSessionStore } from "@/lib/store/session";
import { useMounted } from "@/lib/hooks/useMounted";
import { useMesas } from "@/lib/api/queries/mesas";
import { useKitchenOrders } from "@/lib/api/queries/kitchen";
import { useComandasAbertas } from "@/lib/api/queries/comandas";
import { useSalesReportHoje, useSalesReportUltimos7Dias, useSalesReportPorDia } from "@/lib/api/queries/reports";
import { PageLoader } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { formatBRL, formatarTempo } from "@/lib/utils";

/* Painel do staff — antes era 100% mock (sem endpoint de dashboard/KPI
   dedicado). Agora monta os KPIs em cima de dados reais que já existem
   na API (/api/reports/sales, /api/tables, /api/kitchen/orders), mesmo
   sem um endpoint único de "dashboard". O que não dá pra derivar de
   forma honesta (ex.: ticket médio de TODOS os pedidos do dia, incluindo
   os já fechados sem registro em lugar nenhum) fica de fora em vez de
   inventado. */
export default function DashboardPage() {
  const { usuario } = useSessionStore();
  const mounted = useMounted();

  const { data: mesas, isLoading: loadingMesas, isError: erroMesas, refetch: refetchMesas } = useMesas();
  const { data: itensCozinha, isLoading: loadingCozinha, isError: erroCozinha } = useKitchenOrders();
  const { data: hoje, isLoading: loadingHoje, isError: erroHoje } = useSalesReportHoje();
  const { data: semana, isLoading: loadingSemana } = useSalesReportUltimos7Dias();
  const { dias: grafico7dias, isLoading: loadingGrafico } = useSalesReportPorDia(7);
  const { comandas: comandasAbertas, isLoading: loadingComandas } = useComandasAbertas();

  const isLoading = loadingMesas || loadingCozinha || loadingHoje || loadingSemana || loadingGrafico || loadingComandas;
  const isError = erroMesas || erroCozinha || erroHoje;

  if (isLoading) return <PageLoader />;
  if (isError || !mesas || !itensCozinha || !hoje) return <ErrorState onRetry={() => refetchMesas()} />;

  const hojeISO = new Date().toISOString().slice(0, 10);
  const itensDeHoje = itensCozinha.filter((i) => i.created_at?.slice(0, 10) === hojeISO);
  const comandasHoje = new Set(itensDeHoje.map((i) => i.comanda_id)).size;
  const ticketMedioHoje = comandasHoje > 0 ? hoje.total_revenue / comandasHoje : 0;
  const mesasAbertas = mesas.filter((m) => !!m.active_command).length;

  const maxSemana = Math.max(1, ...grafico7dias.map((d) => d.total));

  const hojeFormatado = new Date().toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const inicial = ((mounted ? usuario?.nome : undefined) ?? "A").charAt(0).toUpperCase();

  return (
    <div className="max-w-lg mx-auto px-4 py-5">
      {/* Header com avatar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Painel</h1>
          <p className="text-sm text-neutral-400 mt-0.5">{hojeFormatado}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-team-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {inicial}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <KpiCard label="Faturamento hoje" value={formatBRL(hoje.total_revenue)} delta="produtos entregues hoje" bg="bg-team-50" border="border-team-100" textColor="text-team-700" />
        <KpiCard label="Comandas hoje" value={String(comandasHoje)} delta="com item lançado hoje" bg="bg-green-50" border="border-green-100" textColor="text-green-700" />
        <KpiCard label="Ticket médio hoje" value={formatBRL(ticketMedioHoje)} delta="faturamento ÷ comandas" bg="bg-amber-50" border="border-amber-100" textColor="text-amber-700" />
        <KpiCard label="Mesas em aberto" value={String(mesasAbertas)} delta={`de ${mesas.length} mesas`} bg="bg-blue-50" border="border-blue-100" textColor="text-blue-700" />
      </div>

      {/* Gráfico 7 dias */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-100 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-neutral-800 text-sm">Vendas · 7 dias</h2>
          <span className="text-xs text-neutral-400">{formatBRL(semana?.total_revenue ?? 0)} no total</span>
        </div>
        <div className="relative flex items-end gap-1.5" style={{ height: 112 }}>
          {grafico7dias.map(({ data, total }, i) => {
            const barPx = Math.max((total / maxSemana) * 96, total > 0 ? 4 : 0);
            const isHoje = i === grafico7dias.length - 1;
            return (
              <div key={data.toISOString()} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t-lg transition-all ${isHoje ? "bg-team-500" : "bg-team-300"}`}
                  style={{ height: `${barPx}px` }}
                  title={formatBRL(total)}
                />
                <span className={`text-xs ${isHoje ? "text-team-600 font-semibold" : "text-neutral-400"}`}>
                  {data.toLocaleDateString("pt-BR", { weekday: "short" })}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comandas abertas agora */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-100 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-neutral-800 text-sm">Comandas abertas agora</h2>
          <span className="text-xs text-neutral-400">{comandasAbertas.length}</span>
        </div>
        {comandasAbertas.length === 0 ? (
          <p className="text-sm text-neutral-400 text-center py-6">Nenhuma mesa em aberto</p>
        ) : (
          <ul className="flex flex-col divide-y divide-neutral-50">
            {comandasAbertas.map(({ comanda, mesa }) => (
              <li key={comanda.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">Mesa {mesa.numero}</p>
                  <p className="text-xs text-neutral-400">aberta há {formatarTempo(comanda.created_at)}</p>
                </div>
                <span className="text-sm font-semibold text-neutral-900">{formatBRL(comanda.total)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Produtos mais vendidos (7 dias) */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-sm">
        <h2 className="font-semibold text-neutral-800 text-sm mb-4">Mais vendidos · 7 dias</h2>
        {!semana || semana.products_ranking.length === 0 ? (
          <p className="text-sm text-neutral-400 text-center py-6">Sem vendas no período</p>
        ) : (
          <ul className="flex flex-col divide-y divide-neutral-50">
            {semana.products_ranking.slice(0, 5).map((p) => (
              <li key={p.product_id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{p.product_name}</p>
                  <p className="text-xs text-neutral-400">{p.quantity_sold} vendidos</p>
                </div>
                <span className="text-sm font-semibold text-team-600">{formatBRL(p.revenue)}</span>
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
