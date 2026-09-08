"use client";

import { useState } from "react";
import { Categoria, Produto } from "@/types/domain";
import { V1CriarProdutoPayload } from "@/types/api";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";

interface Props {
  produto?: Produto | null;
  /* Categorias da superfície V1 (/api/v1/cliente/categorias). Quando
     vazio, o campo de categoria não aparece. */
  categorias?: Categoria[];
  onSalvar: (dados: V1CriarProdutoPayload) => void;
  onFechar: () => void;
  onExcluir?: () => void;
  salvando?: boolean;
}

type FormState = {
  nome: string;
  descricao: string;
  preco: string;
  imagem: string;
  ativo: boolean;
  exibirNaVitrine: boolean;
  categoriaId: string;
};

/* O componente que renderiza este modal deve passar uma `key` (ex: produto?.id ?? "novo")
   pra garantir que o formulário reinicie ao trocar de produto — sem isso, o estado
   interno não se atualiza sozinho quando a prop `produto` muda. */
export function ProdutoFormModal({ produto, categorias = [], onSalvar, onFechar, onExcluir, salvando }: Props) {
  const isEditing = !!produto;
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [form, setForm] = useState<FormState>({
    nome: produto?.nome ?? "",
    descricao: produto?.descricao ?? "",
    preco: produto ? String(produto.preco) : "",
    imagem: produto?.foto_url ?? "",
    ativo: produto?.ativo ?? true,
    exibirNaVitrine: produto?.exibir_na_vitrine ?? true,
    categoriaId: produto?.categoria_id ?? "",
  });

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function handleSalvar() {
    const preco = parseFloat(form.preco.replace(",", "."));
    if (!form.nome.trim() || isNaN(preco)) return;
    /* Payload da superfície V1 — nomes em português (a `/api/*` usava
       name/price/active). ⚠️ V1 não confirmada ao vivo. */
    onSalvar({
      nome: form.nome.trim(),
      descricao: form.descricao.trim() || undefined,
      preco,
      foto_url: form.imagem.trim() || undefined,
      ativo: form.ativo,
      exibir_na_vitrine: form.exibirNaVitrine,
      categoria_id: form.categoriaId || null,
    });
  }

  const valido = form.nome.trim() && form.preco;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onFechar}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <div
        className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900">
            {isEditing ? "Editar produto" : "Novo produto"}
          </h2>
          {/* Toggle ativo */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-sm text-neutral-500">{form.ativo ? "Ativo" : "Inativo"}</span>
            <div
              className={`relative w-10 h-6 rounded-full transition-colors ${form.ativo ? "bg-green-500" : "bg-neutral-300"}`}
              onClick={() => setForm((f) => ({ ...f, ativo: !f.ativo }))}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.ativo ? "translate-x-5" : "translate-x-1"}`}
              />
            </div>
          </label>
        </div>

        <div className="overflow-y-auto flex-1 p-5 flex flex-col gap-4">
          {/* Imagem */}
          <div>
            <label className="text-sm font-medium text-neutral-700 block mb-2">Foto do produto</label>
            <div className="relative w-full h-36 rounded-2xl bg-neutral-100 border-2 border-dashed border-neutral-300 overflow-hidden flex items-center justify-center">
              {form.imagem ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={form.imagem} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <p className="text-3xl">📷</p>
                  <p className="text-xs text-neutral-400 mt-1">Cole a URL da imagem abaixo</p>
                </div>
              )}
            </div>
            <Input
              placeholder="https://..."
              value={form.imagem}
              onChange={set("imagem")}
              theme="team"
              className="mt-2"
            />
          </div>

          <Input
            label="Nome do produto"
            placeholder="Ex: Risoto de Cogumelos"
            value={form.nome}
            onChange={set("nome")}
            theme="team"
            autoFocus={!isEditing}
          />

          <Textarea
            label="Descrição"
            placeholder="Ingredientes, modo de preparo, destaques..."
            value={form.descricao}
            onChange={set("descricao")}
            theme="team"
          />

          <Input
            label="Preço (R$)"
            placeholder="0,00"
            value={form.preco}
            onChange={set("preco")}
            inputMode="decimal"
            theme="team"
          />

          {categorias.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-neutral-700">Categoria</label>
              <select
                className="input-field"
                value={form.categoriaId}
                onChange={set("categoriaId")}
              >
                <option value="">Sem categoria</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
          )}

          <label className="flex items-center justify-between cursor-pointer select-none">
            <span className="text-sm text-neutral-700">Exibir na vitrine pública</span>
            <div
              className={`relative w-10 h-6 rounded-full transition-colors ${form.exibirNaVitrine ? "bg-green-500" : "bg-neutral-300"}`}
              onClick={() => setForm((f) => ({ ...f, exibirNaVitrine: !f.exibirNaVitrine }))}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.exibirNaVitrine ? "translate-x-5" : "translate-x-1"}`}
              />
            </div>
          </label>
        </div>

        <div className="p-4 border-t border-neutral-100 flex flex-col gap-2">
          <Button theme="team" fullWidth disabled={!valido} loading={salvando} onClick={handleSalvar}>
            {isEditing ? "Salvar alterações" : "Criar produto"}
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
                Excluir produto
              </Button>
            )
          )}

          <button onClick={onFechar} className="text-sm text-neutral-400 hover:text-neutral-600 py-1.5 text-center">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
