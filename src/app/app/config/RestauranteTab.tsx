"use client";

import { useState } from "react";
import { useRestauranteConfig, useAtualizarRestaurante } from "@/lib/api/queries/v1/restaurante";
import { extractErrorMessage } from "@/lib/api/client";
import { PageLoader } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";

/* Aba "Restaurante" das Configurações — GET/PUT /api/v1/cliente/restaurante.
   Voltou a existir com a migração pra v1 (a `/api/*` não tinha essa
   entidade). ⚠️ V1 não confirmada ao vivo: nomes de campo e shape da
   resposta podem divergir. */

type FormState = {
  nome: string;
  descricao: string;
  telefone: string;
  taxa_servico: string;
  cor_primaria: string;
  logo_url: string;
  chave_pix: string;
  ativo: boolean;
};

export function RestauranteTab() {
  const { data, isLoading, isError, refetch } = useRestauranteConfig();
  const atualizar = useAtualizarRestaurante();

  const [form, setForm] = useState<FormState | null>(null);

  if (isLoading) return <PageLoader />;
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />;

  const atual: FormState = form ?? {
    nome: data.nome ?? "",
    descricao: data.descricao ?? "",
    telefone: data.telefone ?? "",
    taxa_servico: data.taxa_servico != null ? String(data.taxa_servico) : "",
    cor_primaria: data.cor_primaria ?? "",
    logo_url: data.logo_url ?? "",
    chave_pix: data.chave_pix ?? "",
    ativo: data.ativo ?? true,
  };

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm({ ...atual, [k]: v });

  function salvar() {
    const taxa = atual.taxa_servico.trim() ? parseFloat(atual.taxa_servico.replace(",", ".")) : undefined;
    atualizar.mutate(
      {
        nome: atual.nome.trim() || undefined,
        descricao: atual.descricao.trim() || undefined,
        telefone: atual.telefone.trim() || undefined,
        taxa_servico: taxa != null && !isNaN(taxa) ? taxa : undefined,
        cor_primaria: atual.cor_primaria.trim() || undefined,
        logo_url: atual.logo_url.trim() || undefined,
        chave_pix: atual.chave_pix.trim() || undefined,
        ativo: atual.ativo,
      },
      {
        onSuccess: () => {
          toast.success("Restaurante atualizado!");
          setForm(null);
        },
        onError: (err) => toast.error("Erro ao salvar", extractErrorMessage(err)),
      }
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100 flex flex-col gap-3">
        <Campo label="Nome">
          <input className="input-field" value={atual.nome} onChange={(e) => set("nome", e.target.value)} />
        </Campo>
        <Campo label="Descrição">
          <input className="input-field" value={atual.descricao} onChange={(e) => set("descricao", e.target.value)} />
        </Campo>
        <Campo label="Telefone">
          <input className="input-field" value={atual.telefone} onChange={(e) => set("telefone", e.target.value)} />
        </Campo>
        <Campo label="Taxa de serviço (%)">
          <input
            className="input-field"
            inputMode="decimal"
            value={atual.taxa_servico}
            onChange={(e) => set("taxa_servico", e.target.value)}
          />
        </Campo>
        <Campo label="Cor primária">
          <input
            className="input-field"
            placeholder="#FF5722"
            value={atual.cor_primaria}
            onChange={(e) => set("cor_primaria", e.target.value)}
          />
        </Campo>
        <Campo label="Logo (URL)">
          <input className="input-field" value={atual.logo_url} onChange={(e) => set("logo_url", e.target.value)} />
        </Campo>
        <Campo label="Chave Pix">
          <input className="input-field" value={atual.chave_pix} onChange={(e) => set("chave_pix", e.target.value)} />
        </Campo>
        <label className="flex items-center justify-between cursor-pointer select-none pt-1">
          <span className="text-sm text-neutral-700">Restaurante ativo</span>
          <div
            className={`relative w-10 h-6 rounded-full transition-colors ${atual.ativo ? "bg-green-500" : "bg-neutral-300"}`}
            onClick={() => set("ativo", !atual.ativo)}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${atual.ativo ? "translate-x-5" : "translate-x-1"}`}
            />
          </div>
        </label>
      </div>

      <Button theme="team" fullWidth loading={atualizar.isPending} disabled={!form} onClick={salvar}>
        {form ? "Salvar alterações" : "Sem alterações"}
      </Button>
    </div>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-neutral-700">{label}</label>
      {children}
    </div>
  );
}
