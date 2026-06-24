"use client";

import { use, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { mockCategorias, mockProdutos, mockRestaurante } from "@/lib/mock";
import { Produto } from "@/types/domain";
import { useCartStore } from "@/lib/store/cart";
import { Button } from "@/components/ui/Button";
import { formatBRL } from "@/lib/utils";

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
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);

  const { adicionarItem, quantidadeTotal, total: getTotal, setContexto } = useCartStore();

  const restaurante = mockRestaurante;
  const categorias = mockCategorias;
  const produtos = mockProdutos;

  useMemo(() => setContexto(slug), [slug, setContexto]);

  const produtosFiltrados = produtos.filter(
    (p) => (!categoriaAtiva || p.categoria_id === categoriaAtiva) && p.ativo
  );

  const destaques = produtos.filter((p) => p.ativo).slice(0, 4);
  const totalSacola = getTotal();
  const qtdSacola = quantidadeTotal();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner */}
      <div className="relative h-48 overflow-hidden">
        {restaurante.logo_url ? (
          <Image src={restaurante.logo_url} alt={restaurante.nome} fill className="object-cover" sizes="100vw" priority />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `repeating-linear-gradient(-45deg, #f47a56 0px, #f47a56 12px, #fbc8b0 12px, #fbc8b0 28px)`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-4 py-4 text-white">
          <h1 className="text-xl font-bold leading-tight drop-shadow">{restaurante.nome}</h1>
          <div className="flex items-center gap-2 mt-1 text-sm opacity-90">
            <span>⭐ 4.5</span>
            <span>·</span>
            <span>30 min · entrega grátis</span>
          </div>
        </div>
      </div>

      {/* Category tabs + contexto */}
      <div className="sticky top-0 z-30 bg-white border-b border-neutral-100 shadow-sm">
        {/* Barra de contexto (mesa ou volta) */}
        <div className="max-w-lg mx-auto px-4 pt-2.5 pb-0 flex items-center justify-between">
          <Link href={`/${slug}`} className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-600 transition-colors">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Início
          </Link>
          {mesaId ? (
            <span className="text-xs bg-coral-100 text-coral-700 font-semibold px-2.5 py-1 rounded-full">
              🪑 Mesa {mesaId}
            </span>
          ) : (
            <Link href={`/${slug}`} className="text-xs text-coral-500 font-medium hover:text-coral-600 transition-colors">
              Escolher mesa
            </Link>
          )}
        </div>
        <div className="max-w-lg mx-auto overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 px-4 py-3 w-max">
            <button
              onClick={() => setCategoriaAtiva(null)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                !categoriaAtiva ? "bg-coral-500 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              Destaques
            </button>
            {categorias.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoriaAtiva(cat.id === categoriaAtiva ? null : cat.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                  categoriaAtiva === cat.id ? "bg-coral-500 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {cat.nome}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-5 pb-32">
        {!categoriaAtiva ? (
          <>
            {/* Seção destaques */}
            <div className="mb-7">
              <h2 className="font-bold text-neutral-900 text-base mb-3">Destaques da casa 🔥</h2>
              <div className="grid grid-cols-2 gap-3">
                {destaques.map((produto) => (
                  <FeaturedCard
                    key={produto.id}
                    produto={produto}
                    onSelecionar={() => setProdutoSelecionado(produto)}
                    onAdicionar={() => adicionarItem(produto, 1)}
                  />
                ))}
              </div>
            </div>

            {/* Seções por categoria */}
            {categorias.map((cat) => {
              const items = produtos.filter((p) => p.categoria_id === cat.id && p.ativo);
              if (!items.length) return null;
              return (
                <div key={cat.id} className="mb-7">
                  <h2 className="font-bold text-neutral-900 text-base mb-3">{cat.nome}</h2>
                  <div className="flex flex-col gap-3">
                    {items.map((produto) => (
                      <ProdutoCard
                        key={produto.id}
                        produto={produto}
                        onSelecionar={() => setProdutoSelecionado(produto)}
                        onAdicionar={() => adicionarItem(produto, 1)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        ) : produtosFiltrados.length === 0 ? (
          <div className="text-center py-16 text-neutral-400">
            <p className="font-medium">Nenhum produto nesta categoria</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {produtosFiltrados.map((produto) => (
              <ProdutoCard
                key={produto.id}
                produto={produto}
                onSelecionar={() => setProdutoSelecionado(produto)}
                onAdicionar={() => adicionarItem(produto, 1)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Sacola flutuante */}
      {qtdSacola > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4">
          <div className="max-w-lg mx-auto">
            <Link href={`/${slug}/sacola${mesaId ? `?mesa=${mesaId}` : ""}`}>
              <div className="bg-coral-500 text-white rounded-2xl py-4 px-5 flex items-center justify-between font-semibold shadow-lg shadow-coral-200 active:bg-coral-600 transition-colors cursor-pointer">
                <span className="bg-coral-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {qtdSacola}
                </span>
                <span>Sacola{mesaId ? ` · Mesa ${mesaId}` : ""}</span>
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

function FeaturedCard({
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
      className="rounded-2xl border border-neutral-100 bg-white overflow-hidden cursor-pointer active:opacity-90 shadow-sm"
      onClick={onSelecionar}
    >
      {produto.foto_url ? (
        <div className="relative w-full aspect-square bg-neutral-100">
          <Image src={produto.foto_url} alt={produto.nome} fill className="object-cover" sizes="(max-width: 512px) 50vw, 256px" />
        </div>
      ) : (
        <div className="w-full aspect-square bg-coral-50 flex items-center justify-center text-4xl">🍽️</div>
      )}
      <div className="p-3">
        <h3 className="font-semibold text-neutral-900 text-sm leading-snug line-clamp-1">{produto.nome}</h3>
        {produto.descricao && (
          <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">{produto.descricao}</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-coral-600 text-sm">{formatBRL(produto.preco)}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onAdicionar(); }}
            className="w-7 h-7 rounded-full bg-coral-500 text-white flex items-center justify-center text-lg font-bold hover:bg-coral-600 active:bg-coral-700 transition-colors"
            aria-label={`Adicionar ${produto.nome}`}
          >
            +
          </button>
        </div>
      </div>
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
      {produto.foto_url ? (
        <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100">
          <Image src={produto.foto_url} alt={produto.nome} fill className="object-cover" sizes="80px" />
        </div>
      ) : (
        <div className="w-20 h-20 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0 text-2xl">🍽️</div>
      )}
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
        {produto.foto_url && (
          <div className="relative h-48 bg-neutral-100 flex-shrink-0">
            <Image src={produto.foto_url} alt={produto.nome} fill className="object-cover" sizes="100vw" />
          </div>
        )}
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
