"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
<<<<<<< HEAD
import { useCategoriasAdmin, useProdutosAdmin } from "@/lib/api/queries/menu";
import { useCriarPedidoEquipe } from "@/lib/api/queries/orders";
import { Produto } from "@/types/domain";
import { useComandaStore } from "@/lib/store/comanda";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
=======
import { useProdutos } from "@/lib/api/queries/menu";
import { useAdicionarItemComanda } from "@/lib/api/queries/comandas";
import { Produto } from "@/types/domain";
import { useComandaStore } from "@/lib/store/comanda";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59
import { formatBRL } from "@/lib/utils";
import { toast } from "@/components/ui/Toast";
import { apiErrorMessage } from "@/lib/api/client";

export default function NovoPedidoPage() {
  return (
    <Suspense>
      <NovoPedidoContent />
    </Suspense>
  );
}

function NovoPedidoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const comandaId = searchParams.get("comanda_id") ?? "";
  const mesaNumero = Number(searchParams.get("mesa_num") ?? 0);

  const [busca, setBusca] = useState("");
  const [produtoModal, setProdutoModal] = useState<Produto | null>(null);
  const [comandaAberta, setComandaAberta] = useState(false);
<<<<<<< HEAD
=======
  const [enviando, setEnviando] = useState(false);
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59

  const { data: produtos, isLoading, isError, refetch } = useProdutos();
  const adicionarItemApi = useAdicionarItemComanda();

  const { itens, adicionarItem, removerItem, atualizarQuantidade, total: getTotal, quantidadeTotal, limpar } =
    useComandaStore();

<<<<<<< HEAD
  const { data: categoriasData, isLoading: carregandoCategorias } = useCategoriasAdmin();
  const { data: produtosData, isLoading: carregandoProdutos } = useProdutosAdmin();
  const criarPedido = useCriarPedidoEquipe();

  const categorias = categoriasData?.data ?? [];
  const produtos = produtosData?.data ?? [];
=======
  if (isLoading) return <PageLoader />;
  if (isError || !produtos) return <ErrorState onRetry={() => refetch()} />;
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59

  const produtosFiltrados = produtos.filter((p) => {
    const matchBusca =
      !busca ||
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (p.descricao ?? "").toLowerCase().includes(busca.toLowerCase());
    return p.ativo && matchBusca;
  });

  const total = getTotal();
  const qtd = quantidadeTotal();

  async function enviarPedido() {
<<<<<<< HEAD
    if (!itens.length) return;
    try {
      await criarPedido.mutateAsync({
        mesa_id: mesaId || undefined,
        tipo: mesaId ? "mesa" : "balcao",
        itens: itens.map((item) => ({
          produto_id: item.produto.id,
          quantidade: item.quantidade,
          observacao: item.observacao,
        })),
      });
      toast.success("Pedido enviado!", `Mesa ${mesaNumero} — ${itens.length} item(s) para o balcão.`);
      limpar();
      router.push("/app/mesas");
    } catch (err) {
      toast.error("Erro ao enviar pedido", apiErrorMessage(err, "Verifique a conexão e tente novamente."));
=======
    if (!itens.length || !comandaId) return;
    setEnviando(true);
    try {
      for (const item of itens) {
        await adicionarItemApi.mutateAsync({
          comandaId,
          payload: { produto_id: item.produto.id, quantidade: item.quantidade, observacao: item.observacao },
        });
      }
      toast.success("Pedido enviado!", `Mesa ${mesaNumero} — ${itens.length} item(s) para a cozinha.`);
      limpar();
      router.push("/app/mesas");
    } catch {
      toast.error("Erro ao enviar pedido", "Verifique a conexão e tente novamente.");
    } finally {
      setEnviando(false);
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59
    }
  }

  const loading = criarPedido.isPending;

  if (carregandoCategorias || carregandoProdutos) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-neutral-50 overflow-hidden">
      {/* Header */}
      <header className="bg-team-800 text-white px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => router.back()} className="text-team-300 hover:text-white text-lg">
          ←
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-team-300">Novo pedido</p>
          <p className="font-bold text-sm">{mesaNumero ? `Mesa ${mesaNumero}` : "Comanda"}</p>
        </div>
        {/* Botão da comanda */}
        <button
          onClick={() => setComandaAberta(true)}
          className="relative flex items-center gap-2 bg-team-600 hover:bg-team-500 rounded-xl px-3 py-2 transition-colors"
        >
          <span className="text-sm">🧾</span>
          <span className="text-sm font-semibold">{qtd > 0 ? `${qtd} itens` : "Comanda"}</span>
          {qtd > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-coral-500 text-white text-xs font-bold flex items-center justify-center">
              {qtd}
            </span>
          )}
        </button>
      </header>

      {/* Busca */}
      <div className="px-4 py-3 bg-white border-b border-neutral-100 flex-shrink-0">
        <input
          type="search"
          placeholder="Buscar produto..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-team-400"
        />
      </div>

      {/* Lista de produtos — scrollável */}
      <div className="flex-1 overflow-y-auto px-4 py-3 pb-24">
        {produtosFiltrados.length === 0 ? (
          <div className="text-center py-12 text-neutral-400">
            <p className="text-3xl mb-2">🔍</p>
            <p className="text-sm">Nenhum produto encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {produtosFiltrados.map((produto) => {
              const qtdNoCarrinho = itens
                .filter((i) => i.produto.id === produto.id)
                .reduce((a, i) => a + i.quantidade, 0);
              return (
                <PDVProdutoCard
                  key={produto.id}
                  produto={produto}
                  qtdNoCarrinho={qtdNoCarrinho}
                  onAdicionar={() => adicionarItem(produto)}
                  onDetalhe={() => setProdutoModal(produto)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* CTA enviar — sobrepõe a tela assim que um item é selecionado
          (Garçom #5), fixo na base independente do scroll da lista. */}
      {qtd > 0 && !comandaAberta && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-white border-t border-neutral-100 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
          <Button theme="team" size="lg" fullWidth loading={enviando} onClick={enviarPedido}>
            Enviar para cozinha · {formatBRL(total)}
          </Button>
        </div>
      )}

      {/* Modal de produto (quantidade + observação) */}
      {produtoModal && (
        <ProdutoObservacaoModal
          produto={produtoModal}
          onAdicionar={(p, qtd, obs) => {
            adicionarItem(p, qtd, obs);
            setProdutoModal(null);
          }}
          onFechar={() => setProdutoModal(null)}
        />
      )}

      {/* Drawer da comanda */}
      {comandaAberta && (
        <ComandaDrawer
          itens={itens}
          total={total}
          mesaNumero={mesaNumero}
          loading={enviando}
          onAtualizarQtd={atualizarQuantidade}
          onRemover={removerItem}
          onEnviar={enviarPedido}
          onFechar={() => setComandaAberta(false)}
        />
      )}
    </div>
  );
}

/* ─── Card de produto no PDV ─── */
function PDVProdutoCard({
  produto,
  qtdNoCarrinho,
  onAdicionar,
  onDetalhe,
}: {
  produto: Produto;
  qtdNoCarrinho: number;
  onAdicionar: () => void;
  onDetalhe: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-neutral-100 p-3 flex items-center gap-3 shadow-sm">
      <div
        className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-100 cursor-pointer"
        onClick={onDetalhe}
      >
        {produto.foto_url ? (
          <Image src={produto.foto_url} alt={produto.nome} fill className="object-cover" sizes="48px" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-lg">🍽️</span>
        )}
      </div>
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onDetalhe}>
        <p className="font-semibold text-sm text-neutral-900 truncate">{produto.nome}</p>
        <p className="text-sm font-bold text-team-600">{formatBRL(produto.preco)}</p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {qtdNoCarrinho > 0 && (
          <span className="text-xs font-bold text-team-600 bg-team-50 rounded-full w-5 h-5 flex items-center justify-center">
            {qtdNoCarrinho}
          </span>
        )}
        <button
          onClick={onAdicionar}
          className="w-8 h-8 rounded-full bg-team-500 text-white flex items-center justify-center text-lg font-bold hover:bg-team-600 active:bg-team-700 transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}

/* ─── Modal de produto (quantidade + observação) ─── */
function ProdutoObservacaoModal({
  produto,
  onAdicionar,
  onFechar,
}: {
  produto: Produto;
  onAdicionar: (p: Produto, qtd: number, observacao?: string) => void;
  onFechar: () => void;
}) {
  const [quantidade, setQuantidade] = useState(1);
  const [observacao, setObservacao] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onFechar}>
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
      <div
        className="relative w-full max-w-lg mx-auto bg-white rounded-t-3xl p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-bold text-neutral-900 mb-1">{produto.nome}</h3>
        <p className="text-team-600 font-bold mb-4">{formatBRL(produto.preco)}</p>

        <input
          type="text"
          placeholder="Observação (ex: sem cebola)"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          className="w-full mb-4 rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-team-400"
        />

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-neutral-100 rounded-full px-2 py-1">
            <button
              className="w-7 h-7 rounded-full bg-white shadow flex items-center justify-center font-bold disabled:opacity-40"
              onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
              disabled={quantidade <= 1}
            >
              −
            </button>
            <span className="w-5 text-center font-semibold text-sm">{quantidade}</span>
            <button
              className="w-7 h-7 rounded-full bg-white shadow flex items-center justify-center font-bold"
              onClick={() => setQuantidade((q) => q + 1)}
            >
              +
            </button>
          </div>
          <Button theme="team" fullWidth onClick={() => onAdicionar(produto, quantidade, observacao || undefined)}>
            Adicionar · {formatBRL(produto.preco * quantidade)}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Drawer da comanda ─── */
function ComandaDrawer({
  itens,
  total,
  mesaNumero,
  loading,
  onAtualizarQtd,
  onRemover,
  onEnviar,
  onFechar,
}: {
  itens: import("@/lib/store/comanda").ItemComanda[];
  total: number;
  mesaNumero: number;
  loading: boolean;
  onAtualizarQtd: (i: number, q: number) => void;
  onRemover: (i: number) => void;
  onEnviar: () => void;
  onFechar: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onFechar}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <div
        className="relative w-full max-w-lg mx-auto bg-white rounded-t-3xl shadow-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-neutral-900">Comanda</h2>
            {mesaNumero > 0 && <p className="text-xs text-neutral-500">Mesa {mesaNumero}</p>}
          </div>
          <button onClick={onFechar} className="text-neutral-400 hover:text-neutral-600 text-xl leading-none">
            ×
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4">
          {itens.length === 0 ? (
            <div className="text-center py-8 text-neutral-400">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-sm">Comanda vazia</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {itens.map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-neutral-100 rounded-full px-1.5 py-1 flex-shrink-0">
                    <button
                      className="w-6 h-6 rounded-full bg-white shadow flex items-center justify-center text-xs font-bold"
                      onClick={() => (item.quantidade > 1 ? onAtualizarQtd(i, item.quantidade - 1) : onRemover(i))}
                    >
                      {item.quantidade > 1 ? "−" : "🗑"}
                    </button>
                    <span className="w-4 text-center text-sm font-semibold">{item.quantidade}</span>
                    <button
                      className="w-6 h-6 rounded-full bg-white shadow flex items-center justify-center text-xs font-bold"
                      onClick={() => onAtualizarQtd(i, item.quantidade + 1)}
                    >
                      +
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">{item.produto.nome}</p>
                    {item.observacao && <p className="text-xs text-neutral-400 truncate">{item.observacao}</p>}
                  </div>
                  <span className="text-sm font-semibold text-neutral-800 flex-shrink-0">
                    {formatBRL(item.preco_total)}
                  </span>
                </li>
              ))}
              <li className="border-t border-neutral-100 pt-3 flex justify-between font-bold text-neutral-900">
                <span>Total</span>
                <span>{formatBRL(total)}</span>
              </li>
            </ul>
          )}
        </div>

        {itens.length > 0 && (
          <div className="p-4 border-t border-neutral-100">
            <Button theme="team" fullWidth size="lg" loading={loading} onClick={onEnviar}>
              Enviar para cozinha · {formatBRL(total)}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
