"use client";

import { useState, useEffect, useRef } from "react";
import { Categoria, Produto } from "@/types/domain";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";

interface Props {
  produto?: Produto | null;
  categorias: Categoria[];
  onSalvar: (dados: Omit<Produto, "id" | "restaurante_id">) => void;
  onFechar: () => void;
  onExcluir?: () => void;
}

type FormState = {
  nome: string;
  descricao: string;
  preco: string;
  categoria_id: string;
  foto_url: string;
  ativo: boolean;
};

export function ProdutoFormModal({ produto, categorias, onSalvar, onFechar, onExcluir }: Props) {
  const isEditing = !!produto;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(produto?.foto_url ?? null);

  const [form, setForm] = useState<FormState>({
    nome: produto?.nome ?? "",
    descricao: produto?.descricao ?? "",
    preco: produto ? String(produto.preco) : "",
    categoria_id: produto?.categoria_id ?? categorias[0]?.id ?? "",
    foto_url: produto?.foto_url ?? "",
    ativo: produto?.ativo ?? true,
  });

  useEffect(() => {
    setForm({
      nome: produto?.nome ?? "",
      descricao: produto?.descricao ?? "",
      preco: produto ? String(produto.preco) : "",
      categoria_id: produto?.categoria_id ?? categorias[0]?.id ?? "",
      foto_url: produto?.foto_url ?? "",
      ativo: produto?.ativo ?? true,
    });
    setPreviewUrl(produto?.foto_url ?? null);
    setConfirmDelete(false);
  }, [produto, categorias]);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    /* Em produção: upload para storage e salvar a URL real */
    setForm((f) => ({ ...f, foto_url: url }));
  }

  function handleSalvar() {
    const preco = parseFloat(form.preco.replace(",", "."));
    if (!form.nome.trim() || isNaN(preco) || !form.categoria_id) return;
    onSalvar({
      nome: form.nome.trim(),
      descricao: form.descricao.trim(),
      preco,
      categoria_id: form.categoria_id,
      foto_url: form.foto_url || undefined,
      ativo: form.ativo,
      ordem: produto?.ordem ?? 0,
      grupos: produto?.grupos ?? [],
    });
  }

  const valido = form.nome.trim() && form.preco && form.categoria_id;

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
          {/* Foto */}
          <div>
            <label className="text-sm font-medium text-neutral-700 block mb-2">Foto do produto</label>
            <div
              className="relative w-full h-36 rounded-2xl bg-neutral-100 border-2 border-dashed border-neutral-300 overflow-hidden cursor-pointer hover:border-team-400 transition-colors flex items-center justify-center"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <p className="text-3xl">📷</p>
                  <p className="text-xs text-neutral-400 mt-1">Clique para adicionar foto</p>
                </div>
              )}
              {previewUrl && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-white text-sm font-medium">Trocar foto</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFotoChange}
            />
            {previewUrl && (
              <button
                className="text-xs text-neutral-400 hover:text-red-500 mt-1"
                onClick={() => { setPreviewUrl(null); setForm((f) => ({ ...f, foto_url: "" })); }}
              >
                Remover foto
              </button>
            )}
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
            onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
            theme="team"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Preço (R$)"
              placeholder="0,00"
              value={form.preco}
              onChange={set("preco")}
              inputMode="decimal"
              theme="team"
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-neutral-700">Categoria</label>
              <select
                value={form.categoria_id}
                onChange={set("categoria_id")}
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-team-500 focus:border-team-500 transition"
              >
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-neutral-100 flex flex-col gap-2">
          <Button theme="team" fullWidth disabled={!valido} onClick={handleSalvar}>
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
