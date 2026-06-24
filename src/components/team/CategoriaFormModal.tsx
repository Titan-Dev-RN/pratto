"use client";

import { useState, useEffect } from "react";
import { Categoria } from "@/types/domain";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";

interface Props {
  categoria?: Categoria | null;
  onSalvar: (dados: { nome: string; descricao: string }) => void;
  onFechar: () => void;
  onExcluir?: () => void;
}

export function CategoriaFormModal({ categoria, onSalvar, onFechar, onExcluir }: Props) {
  const [nome, setNome] = useState(categoria?.nome ?? "");
  const [descricao, setDescricao] = useState(categoria?.descricao ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setNome(categoria?.nome ?? "");
    setDescricao(categoria?.descricao ?? "");
    setConfirmDelete(false);
  }, [categoria]);

  const isEditing = !!categoria;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onFechar}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <div
        className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-neutral-900 mb-5">
          {isEditing ? "Editar categoria" : "Nova categoria"}
        </h2>

        <div className="flex flex-col gap-4">
          <Input
            label="Nome"
            placeholder="Ex: Entradas, Pratos, Bebidas..."
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            theme="team"
            autoFocus
          />
          <Textarea
            label="Descrição (opcional)"
            placeholder="Uma breve descrição para o cliente"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            theme="team"
          />
        </div>

        <div className="flex flex-col gap-2 mt-6">
          <Button
            theme="team"
            fullWidth
            disabled={!nome.trim()}
            onClick={() => onSalvar({ nome: nome.trim(), descricao: descricao.trim() })}
          >
            {isEditing ? "Salvar alterações" : "Criar categoria"}
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
                Excluir categoria
              </Button>
            )
          )}

          <button
            onClick={onFechar}
            className="text-sm text-neutral-400 hover:text-neutral-600 py-2 text-center"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
