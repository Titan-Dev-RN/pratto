"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mockMesas, mockPedidos, mockRestaurante } from "@/lib/mock";
import { Mesa, Pedido, TableStatus } from "@/types/domain";
import { TableStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FecharContaModal } from "@/components/team/FecharContaModal";
import { toast } from "@/components/ui/Toast";

const statusColors: Record<TableStatus, string> = {
  livre: "bg-green-50 border-green-200 hover:bg-green-100",
  ocupada: "bg-amber-50 border-amber-200 hover:bg-amber-100",
  conta_pedida: "bg-red-50 border-red-200 hover:bg-red-100",
  reservada: "bg-blue-50 border-blue-200 hover:bg-blue-100",
};

const statusTexto: Record<TableStatus, string> = {
  livre: "text-green-700",
  ocupada: "text-amber-700",
  conta_pedida: "text-red-700",
  reservada: "text-blue-700",
};

export default function MesasPage() {
  const [mesas, setMesas] = useState(mockMesas);
  const [mesaSelecionada, setMesaSelecionada] = useState<Mesa | null>(null);
  const [fecharContaMesa, setFecharContaMesa] = useState<Mesa | null>(null);

  const livres = mesas.filter((m) => m.status === "livre").length;
  const ocupadas = mesas.filter((m) => m.status === "ocupada").length;
  const contaPedida = mesas.filter((m) => m.status === "conta_pedida").length;

  function atualizarStatus(id: string, status: TableStatus) {
    setMesas((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
  }

  function onContaFechada(mesaId: string) {
    atualizarStatus(mesaId, "livre");
    setFecharContaMesa(null);
    toast.success("Mesa liberada!", "A mesa está livre para novos clientes.");
  }

  /* Pedido em aberto da mesa selecionada (mock) */
  const pedidoDaMesa = fecharContaMesa
    ? (mockPedidos.find((p) => p.mesa_id === fecharContaMesa.id) ?? mockPedidos[0])
    : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-5">
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
        <div className="bg-red-50 rounded-xl p-3 text-center border border-red-100">
          <p className="text-2xl font-bold text-red-700">{contaPedida}</p>
          <p className="text-xs text-red-600 mt-0.5">Conta pedida</p>
        </div>
      </div>

      {/* Grid de mesas */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {mesas.map((mesa) => (
          <button
            key={mesa.id}
            onClick={() => setMesaSelecionada(mesa)}
            className={`relative p-4 rounded-2xl border-2 text-left transition-all active:scale-95 ${statusColors[mesa.status]}`}
          >
            <p className={`text-2xl font-bold ${statusTexto[mesa.status]}`}>
              {mesa.numero}
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">{mesa.capacidade} lug.</p>
            <div className="mt-2">
              <TableStatusBadge status={mesa.status} />
            </div>
          </button>
        ))}
      </div>

      {/* Modal de mesa */}
      {mesaSelecionada && (
        <MesaModal
          mesa={mesaSelecionada}
          onFechar={() => setMesaSelecionada(null)}
          onAbrirMesa={(m) => {
            atualizarStatus(m.id, "ocupada");
            setMesaSelecionada(null);
            toast.success(`Mesa ${m.numero} aberta!`);
          }}
          onPedirConta={(m) => {
            atualizarStatus(m.id, "conta_pedida");
            setMesaSelecionada(null);
            toast.info(`Conta solicitada — Mesa ${m.numero}`);
          }}
          onFecharConta={(m) => {
            setMesaSelecionada(null);
            setFecharContaMesa(m);
          }}
        />
      )}

      {/* Modal fechar conta */}
      {fecharContaMesa && pedidoDaMesa && (
        <FecharContaModal
          mesa={fecharContaMesa}
          pedido={pedidoDaMesa}
          restauranteNome={mockRestaurante.nome}
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
  onFechar,
  onAbrirMesa,
  onPedirConta,
  onFecharConta,
}: {
  mesa: Mesa;
  onFechar: () => void;
  onAbrirMesa: (m: Mesa) => void;
  onPedirConta: (m: Mesa) => void;
  onFecharConta: (m: Mesa) => void;
}) {
  const router = useRouter();

  function irParaNovoPedido() {
    router.push(`/app/pedidos/novo?mesa_id=${mesa.id}&mesa_num=${mesa.numero}`);
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
        <p className="text-sm text-neutral-400 mb-5">{mesa.capacidade} lugares</p>

        <div className="flex flex-col gap-2.5">
          {/* Mesa livre */}
          {mesa.status === "livre" && (
            <Button theme="team" fullWidth size="lg" onClick={() => onAbrirMesa(mesa)}>
              Abrir mesa
            </Button>
          )}

          {/* Mesa ocupada */}
          {mesa.status === "ocupada" && (
            <>
              <Button theme="team" fullWidth onClick={irParaNovoPedido}>
                + Novo pedido
              </Button>
              <Button theme="team" variant="secondary" fullWidth onClick={irParaNovoPedido}>
                Ver pedidos da mesa
              </Button>
              <Button theme="team" variant="danger" fullWidth onClick={() => onPedirConta(mesa)}>
                Solicitar conta
              </Button>
            </>
          )}

          {/* Conta pedida */}
          {mesa.status === "conta_pedida" && (
            <>
              <div className="bg-red-50 rounded-xl p-3 text-center text-sm text-red-700 font-medium mb-1">
                ⚠️ Cliente aguardando fechamento
              </div>
              <Button theme="team" fullWidth size="lg" onClick={() => onFecharConta(mesa)}>
                Fechar conta
              </Button>
              <Button theme="team" variant="secondary" fullWidth onClick={irParaNovoPedido}>
                Ver itens
              </Button>
            </>
          )}

          {/* Mesa reservada */}
          {mesa.status === "reservada" && (
            <Button theme="team" fullWidth onClick={() => onAbrirMesa(mesa)}>
              Confirmar chegada
            </Button>
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
