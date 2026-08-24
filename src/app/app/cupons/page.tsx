"use client";

import { useState } from "react";
import { useCuponsLocalStore, CupomLocal } from "@/lib/store/cuponsLocal";
import { useMounted } from "@/lib/hooks/useMounted";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { PageLoader } from "@/components/ui/Spinner";
import { toast } from "@/components/ui/Toast";

/* Cupons não existem na API usada (/api/*) — sem rota nem entidade.
   Simulado 100% local (ver lib/store/cuponsLocal.ts), plugável numa API
   real assim que o backend expuser esse recurso. Por vir de localStorage
   (zustand persist), só pode renderizar a lista de verdade depois de
   montar no cliente, senão diverge do HTML do servidor. */
export default function CuponsAdminPage() {
  const { cupons, criar, atualizar, excluir } = useCuponsLocalStore();
  const [modalCupom, setModalCupom] = useState<CupomLocal | null | "novo">(null);
  const mounted = useMounted();

  if (!mounted) return <PageLoader />;

  function salvarCupom(dados: Omit<CupomLocal, "id">) {
    if (modalCupom === "novo") {
      criar(dados);
      toast.success("Cupom criado!");
    } else if (modalCupom) {
      atualizar(modalCupom.id, dados);
      toast.success("Cupom atualizado!");
    }
    setModalCupom(null);
  }

  function excluirCupomAtual() {
    if (!modalCupom || modalCupom === "novo") return;
    excluir(modalCupom.id);
    toast.success("Cupom excluído.");
    setModalCupom(null);
  }

  function toggleCupom(cupom: CupomLocal) {
    atualizar(cupom.id, { ativo: !cupom.ativo });
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-5">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-bold text-neutral-900">Cupons ({cupons.length})</h1>
        <Button theme="team" size="sm" onClick={() => setModalCupom("novo")}>
          + Cupom
        </Button>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 mb-5">
        <p className="text-xs text-amber-700">
          ⚠️ Sem endpoint de cupons no backend ainda — esta tela é só uma simulação local.
        </p>
      </div>

      {cupons.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <p className="text-4xl mb-3">🎟️</p>
          <p className="font-medium text-sm">Nenhum cupom ainda</p>
          <Button theme="team" variant="secondary" size="sm" className="mt-4" onClick={() => setModalCupom("novo")}>
            Criar cupom
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {cupons.map((cupom) => (
            <CupomRow key={cupom.id} cupom={cupom} onEditar={() => setModalCupom(cupom)} onToggle={() => toggleCupom(cupom)} />
          ))}
        </div>
      )}

      {modalCupom !== null && (
        <CupomFormModal
          cupom={modalCupom === "novo" ? null : modalCupom}
          onSalvar={salvarCupom}
          onFechar={() => setModalCupom(null)}
          onExcluir={modalCupom !== "novo" ? excluirCupomAtual : undefined}
        />
      )}
    </div>
  );
}

function CupomRow({ cupom, onEditar, onToggle }: { cupom: CupomLocal; onEditar: () => void; onToggle: () => void }) {
  return (
    <div className={`flex items-center gap-3 bg-white rounded-2xl border p-4 shadow-sm border-neutral-100 ${!cupom.ativo ? "opacity-60" : ""}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-mono font-bold text-sm text-neutral-900">{cupom.codigo}</p>
          <Badge variant={cupom.ativo ? "success" : "neutral"}>{cupom.ativo ? "Ativo" : "Inativo"}</Badge>
        </div>
        <p className="text-xs text-neutral-500 mt-0.5">
          {cupom.desconto}% de desconto · válido até {new Date(cupom.validade + "T00:00:00").toLocaleDateString("pt-BR")}
        </p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <button
          onClick={onToggle}
          className={`w-9 h-5 rounded-full transition-colors relative ${cupom.ativo ? "bg-green-400" : "bg-neutral-200"}`}
        >
          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${cupom.ativo ? "translate-x-4" : "translate-x-0.5"}`} />
        </button>
        <button onClick={onEditar} className="text-xs font-medium text-team-600 hover:text-team-700">
          Editar
        </button>
      </div>
    </div>
  );
}

function CupomFormModal({
  cupom,
  onSalvar,
  onFechar,
  onExcluir,
}: {
  cupom?: CupomLocal | null;
  onSalvar: (dados: Omit<CupomLocal, "id">) => void;
  onFechar: () => void;
  onExcluir?: () => void;
}) {
  const isEditing = !!cupom;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [codigo, setCodigo] = useState(cupom?.codigo ?? "");
  const [desconto, setDesconto] = useState(cupom ? String(cupom.desconto) : "");
  const [validade, setValidade] = useState(cupom?.validade ?? "");
  const [ativo, setAtivo] = useState(cupom?.ativo ?? true);

  const valido = codigo.trim() && desconto && validade;

  function handleSalvar() {
    const descontoNum = parseFloat(desconto.replace(",", "."));
    if (!codigo.trim() || isNaN(descontoNum) || !validade) return;
    onSalvar({ codigo: codigo.trim().toUpperCase(), desconto: descontoNum, validade, ativo });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onFechar}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <div className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-neutral-900 mb-5">{isEditing ? "Editar cupom" : "Novo cupom"}</h2>

        <div className="flex flex-col gap-4">
          <Input label="Código" placeholder="Ex: PROMO10" value={codigo} onChange={(e) => setCodigo(e.target.value)} theme="team" autoFocus />
          <Input label="Desconto (%)" placeholder="0" value={desconto} onChange={(e) => setDesconto(e.target.value)} inputMode="decimal" theme="team" />
          <Input label="Validade" type="date" value={validade} onChange={(e) => setValidade(e.target.value)} theme="team" />
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              className={`relative w-10 h-6 rounded-full transition-colors ${ativo ? "bg-green-500" : "bg-neutral-300"}`}
              onClick={() => setAtivo((a) => !a)}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${ativo ? "translate-x-5" : "translate-x-1"}`} />
            </div>
            <span className="text-sm text-neutral-700">{ativo ? "Ativo" : "Inativo"}</span>
          </label>
        </div>

        <div className="flex flex-col gap-2 mt-6">
          <Button theme="team" fullWidth disabled={!valido} onClick={handleSalvar}>
            {isEditing ? "Salvar alterações" : "Criar cupom"}
          </Button>

          {isEditing && onExcluir && (
            confirmDelete ? (
              <div className="flex gap-2">
                <Button theme="team" variant="danger" fullWidth onClick={onExcluir}>
                  Confirmar exclusão
                </Button>
                <Button theme="team" variant="ghost" fullWidth onClick={() => setConfirmDelete(false)}>
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button theme="team" variant="ghost" fullWidth onClick={() => setConfirmDelete(true)}>
                Excluir cupom
              </Button>
            )
          )}

          <button onClick={onFechar} className="text-sm text-neutral-400 hover:text-neutral-600 py-2 text-center">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
