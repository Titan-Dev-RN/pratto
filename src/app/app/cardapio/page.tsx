"use client";

import { useState } from "react";
import Image from "next/image";
import {
<<<<<<< HEAD
  useCategoriasAdmin,
  useProdutosAdmin,
  useSalvarCategoria,
  useExcluirCategoria,
  useSalvarProduto,
  useExcluirProduto,
} from "@/lib/api/queries/menu";
import { Categoria, Produto } from "@/types/domain";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
=======
  useProdutos,
  useProduto,
  useCriarProduto,
  useAtualizarProduto,
  useExcluirProduto,
} from "@/lib/api/queries/menu";
import { Produto } from "@/types/domain";
import { extractErrorMessage } from "@/lib/api/client";
import { CriarProdutoPayload } from "@/types/api";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59
import { formatBRL } from "@/lib/utils";
import { ProdutoFormModal } from "@/components/team/ProdutoFormModal";
import { toast } from "@/components/ui/Toast";
import { apiErrorMessage } from "@/lib/api/client";

export default function CardapioAdminPage() {
  const { data: produtos, isLoading, isError, refetch } = useProdutos();
  const criarProduto = useCriarProduto();
  const atualizarProduto = useAtualizarProduto();
  const excluirProduto = useExcluirProduto();

<<<<<<< HEAD
  const { data: categoriasData, isLoading: carregandoCategorias } = useCategoriasAdmin();
  const { data: produtosData, isLoading: carregandoProdutos } = useProdutosAdmin();

  const categorias = categoriasData?.data ?? [];
  const produtos = produtosData?.data ?? [];

  const salvarCategoriaMutation = useSalvarCategoria();
  const excluirCategoriaMutation = useExcluirCategoria();
  const salvarProdutoMutation = useSalvarProduto();
  const excluirProdutoMutation = useExcluirProduto();

  /* Filtro de categoria na aba produtos */
  const [categoriaFiltro, setCategoriaFiltro] = useState<string | null>(null);

  /* Modais */
  const [modalCategoria, setModalCategoria] = useState<Categoria | null | "novo">(null);
  const [modalProduto, setModalProduto] = useState<Produto | null | "novo">(null);

  /* ──────────────────────────────────────
     Handlers de categoria
  ─────────────────────────────────────── */
  async function salvarCategoria(dados: { nome: string; descricao: string }) {
    try {
      const editando = modalCategoria !== "novo" ? modalCategoria : null;
      await salvarCategoriaMutation.mutateAsync({ id: editando?.id, dados });
      toast.success(editando ? "Categoria atualizada!" : "Categoria criada!");
      setModalCategoria(null);
    } catch (err) {
      toast.error("Erro ao salvar categoria", apiErrorMessage(err));
    }
  }

  async function excluirCategoria() {
    if (!modalCategoria || modalCategoria === "novo") return;
    try {
      await excluirCategoriaMutation.mutateAsync(modalCategoria.id);
      toast.success("Categoria excluída.");
      setModalCategoria(null);
    } catch (err) {
      toast.error("Erro ao excluir categoria", apiErrorMessage(err));
    }
  }

  function toggleCategoria(categoria: Categoria) {
    salvarCategoriaMutation.mutate({
      id: categoria.id,
      dados: { nome: categoria.nome, descricao: categoria.descricao ?? "", ativa: !categoria.ativa },
    });
  }

  /* ──────────────────────────────────────
     Handlers de produto
  ─────────────────────────────────────── */
  async function salvarProduto(dados: Omit<Produto, "id" | "restaurante_id">) {
    try {
      const editando = modalProduto !== "novo" ? modalProduto : null;
      await salvarProdutoMutation.mutateAsync({ id: editando?.id, dados });
      toast.success(editando ? "Produto atualizado!" : "Produto criado!");
      setModalProduto(null);
    } catch (err) {
      toast.error("Erro ao salvar produto", apiErrorMessage(err));
    }
  }

  async function excluirProduto() {
    if (!modalProduto || modalProduto === "novo") return;
    try {
      await excluirProdutoMutation.mutateAsync(modalProduto.id);
      toast.success("Produto excluído.");
      setModalProduto(null);
    } catch (err) {
      toast.error("Erro ao excluir produto", apiErrorMessage(err));
    }
  }

  function toggleProduto(produto: Produto) {
    salvarProdutoMutation.mutate({
      id: produto.id,
      dados: { ...produto, ativo: !produto.ativo },
    });
  }

  function reordenarProdutos(reordenados: Produto[]) {
    reordenados.forEach((produto, i) => {
      if (produto.ordem !== i + 1) {
        salvarProdutoMutation.mutate({ id: produto.id, dados: { ...produto, ordem: i + 1 } });
      }
    });
  }

  function reordenarCategorias(reordenadas: Categoria[]) {
    reordenadas.forEach((categoria, i) => {
      if (categoria.ordem !== i + 1) {
        salvarCategoriaMutation.mutate({
          id: categoria.id,
          dados: { nome: categoria.nome, descricao: categoria.descricao ?? "", ordem: i + 1 },
        });
      }
    });
=======
  const [modalProduto, setModalProduto] = useState<Produto | null | "novo">(null);

  /* Busca o produto de novo por id ao abrir a edição — dado mais fresco
     que o da lista (staleTime 60s), cai pro item da lista enquanto
     carrega pra não piscar formulário vazio. */
  const editandoId = modalProduto && modalProduto !== "novo" ? modalProduto.id : "";
  const { data: produtoFresco } = useProduto(editandoId, { enabled: !!editandoId });
  const produtoParaEditar = modalProduto !== "novo" ? (produtoFresco ?? modalProduto) : null;

  if (isLoading) return <PageLoader />;
  if (isError || !produtos) return <ErrorState onRetry={() => refetch()} />;

  function salvarProduto(dados: CriarProdutoPayload) {
    if (modalProduto === "novo") {
      criarProduto.mutate(dados, {
        onSuccess: () => {
          toast.success("Produto criado!");
          setModalProduto(null);
        },
        onError: (err) => toast.error("Erro ao criar produto", extractErrorMessage(err)),
      });
    } else if (modalProduto) {
      atualizarProduto.mutate(
        { id: modalProduto.id, payload: dados },
        {
          onSuccess: () => {
            toast.success("Produto atualizado!");
            setModalProduto(null);
          },
          onError: (err) => toast.error("Erro ao atualizar produto", extractErrorMessage(err)),
        }
      );
    }
  }

  function excluirProdutoAtual() {
    if (!modalProduto || modalProduto === "novo") return;
    excluirProduto.mutate(modalProduto.id, {
      onSuccess: () => {
        toast.success("Produto excluído.");
        setModalProduto(null);
      },
      onError: (err) => toast.error("Erro ao excluir produto", extractErrorMessage(err)),
    });
  }

  function toggleProduto(produto: Produto) {
    atualizarProduto.mutate(
      { id: produto.id, payload: { active: !produto.ativo } },
      { onError: () => toast.error("Erro ao atualizar produto", "Tente novamente.") }
    );
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59
  }

  const salvando = criarProduto.isPending || atualizarProduto.isPending;

  if (carregandoCategorias || carregandoProdutos) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-neutral-900">Cardápio ({produtos.length})</h1>
        <Button theme="team" size="sm" onClick={() => setModalProduto("novo")}>
          + Produto
        </Button>
      </div>

      {produtos.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <p className="text-4xl mb-3">🍽️</p>
          <p className="font-medium text-sm">Nenhum produto ainda</p>
          <Button
            theme="team"
            variant="secondary"
            size="sm"
            className="mt-4"
            onClick={() => setModalProduto("novo")}
          >
<<<<<<< HEAD
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
              onReorder={reordenarProdutos}
              renderItem={(produto, isDragging) => (
                <ProdutoRow
                  produto={produto}
                  categoria={categorias.find((c) => c.id === produto.categoria_id)}
                  isDragging={isDragging}
                  onEditar={() => setModalProduto(produto)}
                  onToggle={() => toggleProduto(produto)}
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
              onReorder={reordenarCategorias}
              renderItem={(categoria, isDragging) => (
                <CategoriaRow
                  categoria={categoria}
                  produtosCount={
                    produtos.filter((p) => p.categoria_id === categoria.id).length
                  }
                  isDragging={isDragging}
                  onEditar={() => setModalCategoria(categoria)}
                  onToggle={() => toggleCategoria(categoria)}
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
=======
            Adicionar produto
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {produtos.map((produto) => (
            <ProdutoRow
              key={produto.id}
              produto={produto}
              onEditar={() => setModalProduto(produto)}
              onToggle={() => toggleProduto(produto)}
            />
          ))}
        </div>
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59
      )}

      {/* Modal */}
      {modalProduto !== null && (
        <ProdutoFormModal
          key={modalProduto === "novo" ? "novo" : modalProduto.id}
          produto={produtoParaEditar}
          onSalvar={salvarProduto}
          onFechar={() => setModalProduto(null)}
          onExcluir={modalProduto !== "novo" ? excluirProdutoAtual : undefined}
          salvando={salvando}
        />
      )}
    </div>
  );
}

function ProdutoRow({
  produto,
  onEditar,
  onToggle,
}: {
  produto: Produto;
  onEditar: () => void;
  onToggle: () => void;
}) {
  return (
    <div
      className={`flex gap-3 bg-white rounded-2xl border p-3 shadow-sm border-neutral-100 ${!produto.ativo ? "opacity-60" : ""}`}
    >
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
