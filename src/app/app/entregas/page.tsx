"use client";

import { useState } from "react";
import { useEntregas, useAtualizarStatusEntrega } from "@/lib/api/queries/entregas";
import { Comanda } from "@/types/domain";
import { EntregaStatusBadge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { formatBRL } from "@/lib/utils";
import { toast } from "@/components/ui/Toast";

/* Status real da comanda (o mesmo enum de sempre, PATCH em
   /api/delivery_orders/:id/status usando `status_delivery`) — confirmado
   ao vivo: pendente/confirmado/em_preparo/pronto/entregue/cancelado.
   "saiu_para_entrega" do exemplo do Insomnia não existe (500 "not a
   valid status") — não tem estado dedicado de "em trânsito", então o
   fluxo do entregador vira só "pronto" → "entregue". */

type Filtro = "todas" | "pendente" | "pronto";

const filtros: { key: Filtro; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "pendente", label: "Pendentes" },
  { key: "pronto", label: "Prontas p/ entrega" },
];

const proximoStatus: Record<string, string> = {
  pendente: "pronto",
  confirmado: "pronto",
  em_preparo: "pronto",
  pronto: "entregue",
};

const acaoLabel: Record<string, string> = {
  pendente: "Marcar pronta p/ entrega",
  confirmado: "Marcar pronta p/ entrega",
  em_preparo: "Marcar pronta p/ entrega",
  pronto: "Marcar entregue",
};

function formatarEndereco(entrega: Comanda): string | null {
  const e = entrega.endereco_entrega;
  if (!e) return null;
  const linha1 = [e.logradouro, e.numero].filter(Boolean).join(", ");
  const linha2 = [e.complemento, e.bairro, e.cidade].filter(Boolean).join(" · ");
  return [linha1, linha2].filter(Boolean).join(" — ") || null;
}

export default function EntregasPage() {
  const [filtroAtivo, setFiltroAtivo] = useState<Filtro>("todas");
  const { data: entregas, isLoading, isError, refetch } = useEntregas();
  const atualizarStatus = useAtualizarStatusEntrega();

  if (isLoading) return <PageLoader />;
  if (isError || !entregas) return <ErrorState onRetry={() => refetch()} />;

  const filtradas = entregas.filter((e) => {
    if (filtroAtivo === "todas") return e.status !== "entregue" && e.status !== "cancelado";
    return e.status === filtroAtivo;
  });

  function avancarStatus(entrega: Comanda) {
    const proximo = proximoStatus[entrega.status];
    if (!proximo) return;
    atualizarStatus.mutate(
      { id: entrega.id, payload: { status_delivery: proximo } },
      {
        onSuccess: () => toast.success("Status atualizado!"),
        onError: () => toast.error("Erro ao atualizar entrega", "Tente novamente."),
      }
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-5">
      <h1 className="text-xl font-bold text-neutral-900 mb-4">Minhas entregas</h1>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
        {filtros.map((f) => (
          <button
            key={f.key}
            onClick={() => setFiltroAtivo(f.key)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              filtroAtivo === f.key ? "bg-team-500 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtradas.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <p className="text-4xl mb-3">🛵</p>
          <p className="font-medium text-sm">Nenhuma entrega por aqui</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtradas.map((entrega) => (
            <EntregaCard
              key={entrega.id}
              entrega={entrega}
              loading={atualizarStatus.isPending}
              onAvancar={() => avancarStatus(entrega)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EntregaCard({ entrega, loading, onAvancar }: { entrega: Comanda; loading: boolean; onAvancar: () => void }) {
  const acao = acaoLabel[entrega.status];
  const endereco = formatarEndereco(entrega);

  return (
    <div className="bg-white rounded-2xl border-2 border-neutral-100 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-neutral-900">{entrega.nome_cliente ?? "Cliente"}</span>
        <EntregaStatusBadge status={entrega.status} />
      </div>
      {endereco && <p className="text-sm text-neutral-500">{endereco}</p>}
      <p className="text-xs text-neutral-400 mt-0.5">
        {entrega.telefone_cliente} · Pedido #{entrega.numero ?? entrega.id.slice(0, 8)}
      </p>
      <p className="text-sm font-semibold text-team-600 mt-2">{formatBRL(entrega.total)}</p>

      {acao && (
        <button
          onClick={onAvancar}
          disabled={loading}
          className="w-full mt-3 py-2.5 rounded-xl text-sm font-semibold bg-team-500 text-white hover:bg-team-600 transition-colors disabled:opacity-60"
        >
          {acao}
        </button>
      )}
    </div>
  );
}
