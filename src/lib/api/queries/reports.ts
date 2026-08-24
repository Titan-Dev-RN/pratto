import { useQueries, useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";
import { SalesReport } from "@/types/domain";

/* GET /api/reports/sales — confirmado ao vivo, sem paginação nem
   agrupamento por dia: só aceita um intervalo e devolve o total e o
   ranking de produtos daquele intervalo inteiro. */
function limitesDoDia(dia: Date): { data_inicial: string; data_final: string } {
  const inicio = new Date(dia);
  inicio.setUTCHours(0, 0, 0, 0);
  const fim = new Date(dia);
  fim.setUTCHours(23, 59, 59, 999);
  return { data_inicial: inicio.toISOString(), data_final: fim.toISOString() };
}

function buscarRelatorio(dataInicial: string, dataFinal: string) {
  return apiGet<SalesReport>(`/reports/sales?data_inicial=${dataInicial}&data_final=${dataFinal}`);
}

export function useSalesReport(dataInicial: string, dataFinal: string) {
  return useQuery({
    queryKey: ["reports-sales", dataInicial, dataFinal],
    queryFn: () => buscarRelatorio(dataInicial, dataFinal),
    staleTime: 60_000,
  });
}

export function useSalesReportHoje() {
  const { data_inicial, data_final } = limitesDoDia(new Date());
  return useSalesReport(data_inicial, data_final);
}

/* Últimos 7 dias, pra alimentar tanto o card quanto o ranking de
   produtos mais vendidos (janela mais representativa que só "hoje"). */
export function useSalesReportUltimos7Dias() {
  const hoje = new Date();
  const inicio = new Date(hoje);
  inicio.setUTCDate(inicio.getUTCDate() - 6);
  const { data_inicial } = limitesDoDia(inicio);
  const { data_final } = limitesDoDia(hoje);
  return useSalesReport(data_inicial, data_final);
}

/* Sem endpoint de série temporal — monta o gráfico dia a dia fazendo uma
   chamada por dia (7 chamadas em paralelo). */
export function useSalesReportPorDia(dias = 7) {
  const datas = Array.from({ length: dias }, (_, i) => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - (dias - 1 - i));
    return d;
  });

  const resultados = useQueries({
    queries: datas.map((dia) => {
      const { data_inicial, data_final } = limitesDoDia(dia);
      return {
        queryKey: ["reports-sales", data_inicial, data_final],
        queryFn: () => buscarRelatorio(data_inicial, data_final),
        staleTime: 60_000,
      };
    }),
  });

  return {
    dias: datas.map((data, i) => ({ data, total: resultados[i].data?.total_revenue ?? 0 })),
    isLoading: resultados.some((r) => r.isLoading),
    isError: resultados.some((r) => r.isError),
  };
}
