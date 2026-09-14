"use client";

import { useSessionStore } from "@/lib/store/session";
import { useMounted } from "@/lib/hooks/useMounted";
import { useDashboardV1 } from "@/lib/api/queries/v1/dashboard";
import { PageLoader } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { formatBRL } from "@/lib/utils";

/* Painel do staff — migrado pra GET /api/v1/cliente/dashboard, que deve
   devolver os KPIs prontos (antes o app montava tudo no cliente a partir
   de /api/reports/sales + /api/tables + /api/kitchen/orders).

   ⚠️ V1 NÃO CONFIRMADA AO VIVO e SEM EXEMPLO DE SHAPE no Insomnia — os
   nomes de campo em DashboardData (types/domain.ts) são chute. A tela
   renderiza só o que vier preenchido; campo ausente some silenciosamente
   em vez de quebrar. Se o backend usar outros nomes, ajuste lá. */
export default function DashboardPage() {
  const { usuario } = useSessionStore();
  const mounted = useMounted();

  const { data, isLoading, isError, refetch } = useDashboardV1();

  if (isLoading) return <PageLoader />;
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />;

  const vendas7 = data.vendas_7_dias ?? [];
  const maxSemana = Math.max(1, ...vendas7.map((d) => d.total));
  const totalSemana = vendas7.reduce((a, d) => a + d.total, 0);
  const maisVendidos = data.mais_vendidos ?? [];

  const hojeFormatado = new Date().toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const inicial = ((mounted ? usuario?.nome : undefined) ?? "A").charAt(0).toUpperCase();

  return (
    <div className="max-w-lg mx-auto px-4 py-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Painel</h1>
          <p className="text-sm text-neutral-400 mt-0.5">{hojeFormatado}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-team-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {inicial}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {data.faturamento_hoje != null && (
          <KpiCard label="Faturamento hoje" value={formatBRL(data.faturamento_hoje)} delta="hoje" bg="bg-team-50" border="border-team-100" textColor="text-team-700" />
        )}
        {data.pedidos_hoje != null && (
          <KpiCard label="Pedidos hoje" value={String(data.pedidos_hoje)} delta="lançados hoje" bg="bg-green-50" border="border-green-100" textColor="text-green-700" />
        )}
        {data.ticket_medio != null && (
          <KpiCard label="Ticket médio" value={formatBRL(data.ticket_medio)} delta="por pedido" bg="bg-amber-50" border="border-amber-100" textColor="text-amber-700" />
        )}
        {data.mesas_abertas != null && (
          <KpiCard label="Mesas em aberto" value={String(data.mesas_abertas)} delta="agora" bg="bg-blue-50" border="border-blue-100" textColor="text-blue-700" />
        )}
      </div>

      {vendas7.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-neutral-100 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-neutral-800 text-sm">Vendas · 7 dias</h2>
            <span className="text-xs text-neutral-400">{formatBRL(totalSemana)} no total</span>
          </div>
          <div className="relative flex items-end gap-1.5" style={{ height: 112 }}>
            {vendas7.map(({ data: dia, total }, i) => {
              const barPx = Math.max((total / maxSemana) * 96, total > 0 ? 4 : 0);
              const isHoje = i === vendas7.length - 1;
              return (
                <div key={dia} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t-lg transition-all ${isHoje ? "bg-team-500" : "bg-team-300"}`}
                    style={{ height: `${barPx}px` }}
                    title={formatBRL(total)}
                  />
                  <span className={`text-xs ${isHoje ? "text-team-600 font-semibold" : "text-neutral-400"}`}>
                    {new Date(dia).toLocaleDateString("pt-BR", { weekday: "short" })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {maisVendidos.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-sm">
          <h2 className="font-semibold text-neutral-800 text-sm mb-4">Mais vendidos</h2>
          <ul className="flex flex-col divide-y divide-neutral-50">
            {maisVendidos.slice(0, 5).map((p) => (
              <li key={p.produto_id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{p.nome}</p>
                  <p className="text-xs text-neutral-400">{p.quantidade} vendidos</p>
                </div>
                <span className="text-sm font-semibold text-team-600">{formatBRL(p.total)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
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
