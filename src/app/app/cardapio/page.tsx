"use client";

import { useState } from "react";
import Image from "next/image";
import { mockCategorias, mockProdutos } from "@/lib/mock";
import { Categoria, Produto } from "@/types/domain";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatBRL } from "@/lib/utils";
import { CategoriaFormModal } from "@/components/team/CategoriaFormModal";
import { ProdutoFormModal } from "@/components/team/ProdutoFormModal";
import { DragList } from "@/components/team/DragList";
import { toast } from "@/components/ui/Toast";

type Tab = "produtos" | "categorias";

export default function CardapioAdminPage() {
  const [tab, setTab] = useState<Tab>("produtos");

  /* Estado local (em produção: TanStack Query + mutations) */
  const [categorias, setCategorias] = useState<Categoria[]>(mockCategorias);
  const [produtos, setProdutos] = useState<Produto[]>(mockProdutos);

  /* Filtro de categoria na aba produtos */
  const [categoriaFiltro, setCategoriaFiltro] = useState<string | null>(null);

  /* Modais */
  const [modalCategoria, setModalCategoria] = useState<Categoria | null | "novo">(null);
  const [modalProduto, setModalProduto] = useState<Produto | null | "novo">(null);

  /* ──────────────────────────────────────
     Handlers de categoria
  ─────────────────────────────────────── */
  function salvarCategoria(dados: { nome: string; descricao: string }) {
    if (modalCategoria === "novo") {
      const nova: Categoria = {
        id: `c${Date.now()}`,
        restaurante_id: "r1",
        ativa: true,
        ordem: categorias.length + 1,
        ...dados,
      };
      setCategorias((prev) => [...prev, nova]);
      toast.success("Categoria criada!");
    } else if (modalCategoria) {
      setCategorias((prev) =>
        prev.map((c) => (c.id === modalCategoria.id ? { ...c, ...dados } : c))
      );
      toast.success("Categoria atualizada!");
    }
    setModalCategoria(null);
  }

  function excluirCategoria() {
    if (!modalCategoria || modalCategoria === "novo") return;
    const id = modalCategoria.id;
    setCategorias((prev) => prev.filter((c) => c.id !== id));
    setProdutos((prev) => prev.filter((p) => p.categoria_id !== id));
    toast.success("Categoria excluída.");
    setModalCategoria(null);
  }

  function toggleCategoria(id: string) {
    setCategorias((prev) => prev.map((c) => (c.id === id ? { ...c, ativa: !c.ativa } : c)));
  }

  /* ──────────────────────────────────────
     Handlers de produto
  ─────────────────────────────────────── */
  function salvarProduto(dados: Omit<Produto, "id" | "restaurante_id">) {
    if (modalProduto === "novo") {
      const novo: Produto = {
        id: `p${Date.now()}`,
        restaurante_id: "r1",
        ...dados,
      };
      setProdutos((prev) => [...prev, novo]);
      toast.success("Produto criado!");
    } else if (modalProduto) {
      setProdutos((prev) =>
        prev.map((p) => (p.id === modalProduto.id ? { ...p, ...dados } : p))
      );
      toast.success("Produto atualizado!");
    }
    setModalProduto(null);
  }

  function excluirProduto() {
    if (!modalProduto || modalProduto === "novo") return;
    const id = modalProduto.id;
    setProdutos((prev) => prev.filter((p) => p.id !== id));
    toast.success("Produto excluído.");
    setModalProduto(null);
  }

  function toggleProduto(id: string) {
    setProdutos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ativo: !p.ativo } : p))
    );
  }

  /* Produtos filtrados */
  const produtosFiltrados = produtos.filter(
    (p) => !categoriaFiltro || p.categoria_id === categoriaFiltro
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-5">
      {/* Header + tabs */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-neutral-900">Cardápio</h1>
        <Button
          theme="team"
          size="sm"
          onClick={() =>
            tab === "produtos" ? setModalProduto("novo") : setModalCategoria("novo")
          }
        >
          + {tab === "produtos" ? "Produto" : "Categoria"}
        </Button>
      </div>

      <div className="flex gap-1 p-1 bg-neutral-100 rounded-xl mb-6">
        {(["produtos", "categorias"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
              tab === t
                ? "bg-white text-team-700 shadow-sm"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {t === "produtos"
              ? `Produtos (${produtos.length})`
              : `Categorias (${categorias.length})`}
          </button>
        ))}
      </div>

      {/* ─── Tab: Produtos ─── */}
      {tab === "produtos" && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
            <button
              onClick={() => setCategoriaFiltro(null)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                !categoriaFiltro ? "bg-team-500 text-white" : "bg-neutral-100 text-neutral-600"
              }`}
            >
              Todos
            </button>
            {categorias.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoriaFiltro(c.id === categoriaFiltro ? null : c.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  categoriaFiltro === c.id
                    ? "bg-team-500 text-white"
                    : "bg-neutral-100 text-neutral-600"
                }`}
              >
                {c.nome}
              </button>
            ))}
          </div>

          {produtosFiltrados.length === 0 ? (
            <div className="text-center py-16 text-neutral-400">
              <p className="text-4xl mb-3">🍽️</p>
              <p className="font-medium text-sm">Nenhum produto nesta categoria</p>
              <Button
                theme="team"
                variant="secondary"
                size="sm"
                className="mt-4"
                onClick={() => setModalProduto("novo")}
              >
                Adicionar produto
              </Button>
            </div>
          ) : (
            <DragList
              items={produtosFiltrados}
              onReorder={(reordered) =>
                setProdutos((prev) => {
                  const outros = prev.filter((p) => !reordered.some((r) => r.id === p.id));
                  return [
                    ...outros,
                    ...reordered.map((p, i) => ({ ...p, ordem: i + 1 })),
                  ];
                })
              }
              renderItem={(produto, isDragging) => (
                <ProdutoRow
                  produto={produto}
                  categoria={categorias.find((c) => c.id === produto.categoria_id)}
                  isDragging={isDragging}
                  onEditar={() => setModalProduto(produto)}
                  onToggle={() => toggleProduto(produto.id)}
                />
              )}
            />
          )}
        </>
      )}

      {/* ─── Tab: Categorias ─── */}
      {tab === "categorias" && (
        <>
          {categorias.length === 0 ? (
            <div className="text-center py-16 text-neutral-400">
              <p className="text-4xl mb-3">📂</p>
              <p className="font-medium text-sm">Nenhuma categoria ainda</p>
              <Button
                theme="team"
                variant="secondary"
                size="sm"
                className="mt-4"
                onClick={() => setModalCategoria("novo")}
              >
                Criar categoria
              </Button>
            </div>
          ) : (
            <DragList
              items={categorias}
              onReorder={(reordered) =>
                setCategorias(reordered.map((c, i) => ({ ...c, ordem: i + 1 })))
              }
              renderItem={(categoria, isDragging) => (
                <CategoriaRow
                  categoria={categoria}
                  produtosCount={
                    produtos.filter((p) => p.categoria_id === categoria.id).length
                  }
                  isDragging={isDragging}
                  onEditar={() => setModalCategoria(categoria)}
                  onToggle={() => toggleCategoria(categoria.id)}
                />
              )}
            />
          )}
        </>
      )}

      {/* Modais */}
      {modalCategoria !== null && (
        <CategoriaFormModal
          categoria={modalCategoria === "novo" ? null : modalCategoria}
          onSalvar={salvarCategoria}
          onFechar={() => setModalCategoria(null)}
          onExcluir={modalCategoria !== "novo" ? excluirCategoria : undefined}
        />
      )}

      {modalProduto !== null && (
        <ProdutoFormModal
          produto={modalProduto === "novo" ? null : modalProduto}
          categorias={categorias.filter((c) => c.ativa)}
          onSalvar={salvarProduto}
          onFechar={() => setModalProduto(null)}
          onExcluir={modalProduto !== "novo" ? excluirProduto : undefined}
        />
      )}
    </div>
  );
}

/* ──────────────────────────────────────
   Sub-componentes de linha
─────────────────────────────────────── */

function ProdutoRow({
  produto,
  categoria,
  isDragging,
  onEditar,
  onToggle,
}: {
  produto: Produto;
  categoria?: Categoria;
  isDragging: boolean;
  onEditar: () => void;
  onToggle: () => void;
}) {
  return (
    <div
      className={`flex gap-3 bg-white rounded-2xl border p-3 shadow-sm transition-shadow ${
        isDragging ? "shadow-lg border-team-300" : "border-neutral-100"
      } ${!produto.ativo ? "opacity-60" : ""}`}
    >
      <div className="flex items-center text-neutral-300 cursor-grab active:cursor-grabbing px-1 flex-shrink-0 text-lg select-none">
        ⠿
      </div>

      <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100">
        {produto.foto_url ? (
          <Image
            src={produto.foto_url}
            alt={produto.nome}
            fill
            className="object-cover"
            sizes="56px"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-xl">🍽️</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-sm text-neutral-900 truncate">{produto.nome}</p>
            {categoria && (
              <p className="text-xs text-neutral-400 mt-0.5">{categoria.nome}</p>
            )}
            <p className="text-sm font-bold text-team-600 mt-1">{formatBRL(produto.preco)}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onToggle}
              className={`w-9 h-5 rounded-full transition-colors relative ${
                produto.ativo ? "bg-green-400" : "bg-neutral-200"
              }`}
              title={produto.ativo ? "Desativar" : "Ativar"}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  produto.ativo ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </button>
            <button
              onClick={onEditar}
              className="text-xs font-medium text-team-600 hover:text-team-700 whitespace-nowrap"
            >
              Editar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoriaRow({
  categoria,
  produtosCount,
  isDragging,
  onEditar,
  onToggle,
}: {
  categoria: Categoria;
  produtosCount: number;
  isDragging: boolean;
  onEditar: () => void;
  onToggle: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 bg-white rounded-2xl border p-4 shadow-sm transition-shadow ${
        isDragging ? "shadow-lg border-team-300" : "border-neutral-100"
      } ${!categoria.ativa ? "opacity-60" : ""}`}
    >
      <div className="text-neutral-300 cursor-grab active:cursor-grabbing px-1 text-lg select-none">
        ⠿
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm text-neutral-900">{categoria.nome}</p>
          <Badge variant={categoria.ativa ? "success" : "neutral"}>
            {categoria.ativa ? "Ativa" : "Inativa"}
          </Badge>
        </div>
        {categoria.descricao && (
          <p className="text-xs text-neutral-500 mt-0.5 truncate">{categoria.descricao}</p>
        )}
        <p className="text-xs text-neutral-400 mt-0.5">
          {produtosCount} produto{produtosCount !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <button
          onClick={onToggle}
          className={`w-9 h-5 rounded-full transition-colors relative ${
            categoria.ativa ? "bg-green-400" : "bg-neutral-200"
          }`}
        >
          <div
            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
              categoria.ativa ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </button>
        <button
          onClick={onEditar}
          className="text-xs font-medium text-team-600 hover:text-team-700"
        >
          Editar
        </button>
      </div>
    </div>
  );
}
