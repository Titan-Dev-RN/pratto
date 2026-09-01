"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
<<<<<<< HEAD
import { useCategorias, useProdutos, useRestaurante } from "@/lib/api/queries/menu";
import { Produto } from "@/types/domain";
import { useCartStore } from "@/lib/store/cart";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
=======
import { usePublicProdutos, PublicProduto } from "@/lib/api/queries/publicStorefront";
import { ProdutoLegacy as Produto } from "@/types/domain.legacy";
import { useCartStore } from "@/lib/store/cart";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59
import { formatBRL } from "@/lib/utils";

/* Demo pública ("Demo cardápio" na home) — mostra o cardápio de verdade
   do restaurante via GET /api/public/storefront/:slug/products (público,
   sem login, confirmado ao vivo). Esse endpoint não devolve categoria
   nem foto — é só nome/descrição/preço — então a listagem é uma lista
   única, sem abas de categoria (mesmo formato que o cardápio do staff,
   que também não tem mais categorias no backend real).

   Checkout (sacola/delivery) continua mock — ver INTEGRACAO_API.md — mas
   o carrinho já aceita esses produtos reais normalmente, então dá pra
   montar a sacola com preços de verdade mesmo com o envio simulado. */
function paraProdutoDoCarrinho(p: PublicProduto, ordem: number): Produto {
  return {
    id: p.id,
    nome: p.nome,
    descricao: p.descricao,
    preco: p.preco,
    ativo: true,
    ordem,
    categoria_id: "",
    restaurante_id: "",
    grupos: [],
  };
}

function nomeDoSlug(slug: string): string {
  return slug
    .split("-")
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(" ");
}

export default function MenuPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense>
      <MenuContent params={params} />
    </Suspense>
  );
}

function MenuContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const mesaId = searchParams.get("mesa");
  const modoDelivery = searchParams.get("modo") === "delivery";
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);

  const { adicionarItem, quantidadeTotal, total: getTotal, setContexto } = useCartStore();
  const { data: produtosApi, isLoading, isError, refetch } = usePublicProdutos(slug);

<<<<<<< HEAD
  const { data: restauranteData, isLoading: carregandoRestaurante } = useRestaurante(slug);
  const { data: categoriasData, isLoading: carregandoCategorias } = useCategorias(slug);
  const { data: produtosData, isLoading: carregandoProdutos } = useProdutos(slug);

  const restaurante = restauranteData?.data;
  const categorias = categoriasData?.data ?? [];
  const produtos = produtosData?.data ?? [];

  useMemo(() => setContexto(slug, mesaId ?? undefined), [slug, mesaId, setContexto]);

  const produtosFiltrados = produtos.filter(
    (p) => (!categoriaAtiva || p.categoria_id === categoriaAtiva) && p.ativo
  );

  const destaques = produtos.filter((p) => p.ativo).slice(0, 4);
  const totalSacola = getTotal();
  const qtdSacola = quantidadeTotal();

  if (carregandoRestaurante || carregandoCategorias || carregandoProdutos || !restaurante) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }
=======
  useEffect(() => setContexto(slug), [slug, setContexto]);

  const totalSacola = getTotal();
  const qtdSacola = quantidadeTotal();

  if (isLoading) return <PageLoader />;
  if (isError || !produtosApi) return <ErrorState onRetry={() => refetch()} />;

  const produtos = produtosApi.map(paraProdutoDoCarrinho);
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner */}
      <div className="relative h-48 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `repeating-linear-gradient(-45deg, #f47a56 0px, #f47a56 12px, #fbc8b0 12px, #fbc8b0 28px)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-4 py-4 text-white">
          <h1 className="text-xl font-bold leading-tight drop-shadow">{nomeDoSlug(slug)}</h1>
          <p className="text-sm opacity-90 mt-1">{produtos.length} itens no cardápio</p>
        </div>
      </div>

      {/* Barra de contexto (mesa ou volta) */}
      <div className="sticky top-0 z-30 bg-white border-b border-neutral-100 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-2.5 flex items-center justify-between">
          <Link href={`/${slug}`} className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-600 transition-colors">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Início
          </Link>
          <div className="flex items-center gap-3">
            {mesaId ? (
              <span className="text-xs bg-coral-100 text-coral-700 font-semibold px-2.5 py-1 rounded-full">
                🪑 Mesa {mesaId}
              </span>
            ) : modoDelivery ? (
              <span className="text-xs bg-coral-100 text-coral-700 font-semibold px-2.5 py-1 rounded-full">
                🛵 Delivery
              </span>
            ) : (
              <Link href={`/${slug}`} className="text-xs text-coral-500 font-medium hover:text-coral-600 transition-colors">
                Escolher mesa ou delivery
              </Link>
            )}
            <Link href={`/${slug}/pedidos`} className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors">
              🧾 Meus pedidos
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-5 pb-32">
        {produtos.length === 0 ? (
          <div className="text-center py-16 text-neutral-400">
            <p className="font-medium">Cardápio ainda sem itens publicados</p>
          </div>
        ) : (
          <div className="mb-2">
            <h2 className="font-bold text-neutral-900 text-base mb-3">Cardápio</h2>
            <div className="flex flex-col gap-3">
              {produtos.map((produto) => (
                <ProdutoCard
                  key={produto.id}
                  produto={produto}
                  onSelecionar={() => setProdutoSelecionado(produto)}
                  onAdicionar={() => adicionarItem(produto, 1)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Sacola flutuante — vai pro checkout certo conforme o contexto:
          mesa/balcão continuam simulados (sacola), delivery é real. */}
      {qtdSacola > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4">
          <div className="max-w-lg mx-auto">
            <Link href={modoDelivery ? `/${slug}/delivery` : `/${slug}/sacola${mesaId ? `?mesa=${mesaId}` : ""}`}>
              <div className="bg-coral-500 text-white rounded-2xl py-4 px-5 flex items-center justify-between font-semibold shadow-lg shadow-coral-200 active:bg-coral-600 transition-colors cursor-pointer">
                <span className="bg-coral-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {qtdSacola}
                </span>
                <span>Sacola{mesaId ? ` · Mesa ${mesaId}` : modoDelivery ? " · Delivery" : ""}</span>
                <span>{formatBRL(totalSacola)}</span>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Modal de produto */}
      {produtoSelecionado && (
        <ProdutoModal
          produto={produtoSelecionado}
          onFechar={() => setProdutoSelecionado(null)}
          onAdicionar={(p, qtd, obs) => {
            adicionarItem(p, qtd, [], obs);
            setProdutoSelecionado(null);
          }}
        />
      )}
    </div>
  );
}

function ProdutoCard({
  produto,
  onSelecionar,
  onAdicionar,
}: {
  produto: Produto;
  onSelecionar: () => void;
  onAdicionar: () => void;
}) {
  return (
    <div
      className="flex gap-3 p-3 rounded-2xl border border-neutral-100 bg-white active:bg-neutral-50 cursor-pointer shadow-sm"
      onClick={onSelecionar}
    >
      <div className="w-20 h-20 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0 text-2xl">🍽️</div>
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <h3 className="font-semibold text-neutral-900 text-sm leading-snug">{produto.nome}</h3>
          {produto.descricao && (
            <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{produto.descricao}</p>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-coral-600 text-sm">{formatBRL(produto.preco)}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onAdicionar(); }}
            className="w-7 h-7 rounded-full bg-coral-500 text-white flex items-center justify-center text-xl font-bold hover:bg-coral-600 active:bg-coral-700 transition-colors"
            aria-label={`Adicionar ${produto.nome}`}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

function ProdutoModal({
  produto,
  onFechar,
  onAdicionar,
}: {
  produto: Produto;
  onFechar: () => void;
  onAdicionar: (p: Produto, qtd: number, obs?: string) => void;
}) {
  const [quantidade, setQuantidade] = useState(1);
  const [observacao, setObservacao] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onFechar}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
      <div
        className="relative w-full max-w-lg mx-auto bg-white rounded-t-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-y-auto flex-1 p-5">
          <h2 className="text-xl font-bold text-neutral-900">{produto.nome}</h2>
          {produto.descricao && <p className="text-sm text-neutral-500 mt-1">{produto.descricao}</p>}
          <p className="text-lg font-bold text-coral-600 mt-2">{formatBRL(produto.preco)}</p>
          <div className="mt-4">
            <label className="text-sm font-medium text-neutral-700">Observações</label>
            <textarea
              className="w-full mt-1 rounded-xl border border-neutral-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-coral-400"
              rows={2}
              placeholder="Ex: sem cebola, molho à parte..."
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
            />
          </div>
        </div>
        <div className="p-4 border-t border-neutral-100 flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 bg-neutral-100 rounded-full px-2 py-1">
            <button
              className="w-7 h-7 rounded-full bg-white shadow flex items-center justify-center font-bold text-neutral-700 disabled:opacity-40"
              onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
              disabled={quantidade <= 1}
            >
              −
            </button>
            <span className="w-5 text-center font-semibold text-sm">{quantidade}</span>
            <button
              className="w-7 h-7 rounded-full bg-white shadow flex items-center justify-center font-bold text-neutral-700"
              onClick={() => setQuantidade((q) => q + 1)}
            >
              +
            </button>
          </div>
          <Button theme="coral" size="md" fullWidth onClick={() => onAdicionar(produto, quantidade, observacao || undefined)}>
            Adicionar · {formatBRL(produto.preco * quantidade)}
          </Button>
        </div>
      </div>
    </div>
  );
}
