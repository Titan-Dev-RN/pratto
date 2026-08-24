"use client";

import { useState } from "react";
import Image from "next/image";
import {
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
import { formatBRL } from "@/lib/utils";
import { ProdutoFormModal } from "@/components/team/ProdutoFormModal";
import { toast } from "@/components/ui/Toast";

export default function CardapioAdminPage() {
  const { data: produtos, isLoading, isError, refetch } = useProdutos();
  const criarProduto = useCriarProduto();
  const atualizarProduto = useAtualizarProduto();
  const excluirProduto = useExcluirProduto();

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
  }

  const salvando = criarProduto.isPending || atualizarProduto.isPending;

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
