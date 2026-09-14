"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useRestaurante } from "@/lib/api/queries/menu";
import { Spinner } from "@/components/ui/Spinner";

type Modo = "escolha" | "mesa";

export default function RestaurantePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();

  const [modo, setModo] = useState<Modo>("escolha");
  const [mesa, setMesa] = useState("");
  const [erro, setErro] = useState("");

  const { data, isLoading } = useRestaurante(slug);
  const restaurante = data?.data;

  function confirmarMesa() {
    const num = mesa.trim();
    if (!num || isNaN(Number(num)) || Number(num) < 1) {
      setErro("Informe um número de mesa válido.");
      return;
    }
    router.push(`/${slug}/menu?mesa=${num}`);
  }

  if (isLoading || !restaurante) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero banner */}
      <div className="relative h-52 flex-shrink-0 overflow-hidden">
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
        <div className="absolute bottom-0 left-0 right-0 px-5 py-5 text-white">
          <h1 className="text-2xl font-bold leading-tight drop-shadow">{restaurante.nome}</h1>
          <div className="flex items-center gap-2 mt-1 text-sm opacity-90">
            <span>⭐ 4.5</span>
            <span>·</span>
            <span>Aberto agora</span>
            <span>·</span>
            <span>30 min</span>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col px-5 py-7 max-w-sm mx-auto w-full">
        {modo === "escolha" ? (
          <>
            <h2 className="text-lg font-bold text-neutral-900 mb-1">Como você quer pedir?</h2>
            <p className="text-sm text-neutral-500 mb-6">Escolha o tipo de atendimento</p>

            {/* Opção: Comer aqui */}
            <button
              onClick={() => setModo("mesa")}
              className="w-full text-left p-5 rounded-2xl border-2 border-neutral-200 bg-white hover:border-coral-300 hover:bg-coral-50 active:bg-coral-50 transition-colors mb-3 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-coral-100 flex items-center justify-center flex-shrink-0 text-2xl group-hover:bg-coral-200 transition-colors">
                  🪑
                </div>
                <div>
                  <p className="font-bold text-neutral-900 text-base">Comer aqui</p>
                  <p className="text-sm text-neutral-500 mt-0.5">Peça diretamente na sua mesa</p>
                </div>
                <svg className="w-5 h-5 text-neutral-300 ml-auto flex-shrink-0 mt-0.5 group-hover:text-coral-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </button>

            {/* Opção: Delivery */}
            <button
              onClick={() => router.push(`/${slug}/delivery`)}
              className="w-full text-left p-5 rounded-2xl border-2 border-neutral-200 bg-white hover:border-coral-300 hover:bg-coral-50 active:bg-coral-50 transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-coral-100 flex items-center justify-center flex-shrink-0 text-2xl group-hover:bg-coral-200 transition-colors">
                  🛵
                </div>
                <div>
                  <p className="font-bold text-neutral-900 text-base">Delivery</p>
                  <p className="text-sm text-neutral-500 mt-0.5">Receba em casa · entrega grátis</p>
                </div>
                <svg className="w-5 h-5 text-neutral-300 ml-auto flex-shrink-0 mt-0.5 group-hover:text-coral-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </button>

            {/* Link: só navegar sem contexto */}
            <button
              onClick={() => router.push(`/${slug}/menu`)}
              className="mt-6 text-sm text-neutral-400 hover:text-neutral-600 transition-colors text-center"
            >
              Só quero ver o cardápio
            </button>
          </>
        ) : (
          <>
            {/* Voltar */}
            <button
              onClick={() => { setModo("escolha"); setErro(""); setMesa(""); }}
              className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors mb-6"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Voltar
            </button>

            <div className="w-14 h-14 rounded-2xl bg-coral-100 flex items-center justify-center text-3xl mb-5">
              🪑
            </div>

            <h2 className="text-lg font-bold text-neutral-900 mb-1">Qual é a sua mesa?</h2>
            <p className="text-sm text-neutral-500 mb-6">
              Olhe o número na etiqueta da sua mesa ou pergunte ao garçom.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-neutral-700">Número da mesa</label>
              <input
                type="number"
                inputMode="numeric"
                min="1"
                placeholder="Ex: 12"
                value={mesa}
                onChange={(e) => { setMesa(e.target.value); setErro(""); }}
                onKeyDown={(e) => e.key === "Enter" && confirmarMesa()}
                className={`w-full rounded-xl border-2 px-4 py-3.5 text-2xl font-bold text-center focus:outline-none transition-colors ${
                  erro
                    ? "border-red-400 focus:border-red-500 text-red-700"
                    : "border-neutral-200 focus:border-coral-400 text-neutral-900"
                }`}
                autoFocus
              />
              {erro && <p className="text-sm text-red-500">{erro}</p>}
            </div>

            <button
              onClick={confirmarMesa}
              className="mt-6 w-full bg-coral-500 text-white rounded-2xl py-4 px-5 font-semibold text-base shadow-lg shadow-coral-200 active:bg-coral-600 transition-colors"
            >
              Ver cardápio
            </button>

            {/* Atalho: não sabe a mesa */}
            <p className="mt-4 text-xs text-neutral-400 text-center">
              Sem número?{" "}
              <button
                onClick={() => router.push(`/${slug}/menu`)}
                className="text-coral-500 font-medium hover:text-coral-600"
              >
                Peça sem identificar a mesa
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
