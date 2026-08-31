"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { mockRestaurante } from "@/lib/mock";
import { useClienteCadastroStore } from "@/lib/store/clienteCadastro";
import { useRegistrarCliente } from "@/lib/api/queries/customers";
import { extractErrorMessage } from "@/lib/api/client";
import { useMounted } from "@/lib/hooks/useMounted";
import { Button } from "@/components/ui/Button";

type Modo = "escolha" | "mesa" | "cadastro";

/* Acesso inicial do cliente: as duas entradas ("comer aqui" e "delivery")
   agora são obrigatórias antes de chegar no cardápio — sem atalho pra
   pular direto pro menu sem contexto. "Comer aqui" exige número da mesa;
   "Delivery" exige cadastro real (POST /api/public/storefront/:slug/customers
   — cria a conta do cliente e vincula os pedidos dele ao histórico). */
export default function RestaurantePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();

  const [modo, setModo] = useState<Modo>("escolha");
  const [mesa, setMesa] = useState("");
  const [erroMesa, setErroMesa] = useState("");

  const cadastro = useClienteCadastroStore();
  /* cadastro vem de localStorage (zustand persist) — só usa o valor real
     depois de montar no cliente, senão o subtítulo do botão diverge do
     HTML do servidor. */
  const mounted = useMounted();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erroCadastro, setErroCadastro] = useState("");
  const registrar = useRegistrarCliente(slug);

  const restaurante = mockRestaurante;

  function confirmarMesa() {
    const num = mesa.trim();
    if (!num || isNaN(Number(num)) || Number(num) < 1) {
      setErroMesa("Informe um número de mesa válido.");
      return;
    }
    router.push(`/${slug}/menu?mesa=${num}`);
  }

  function escolherDelivery() {
    if (cadastro.cadastrado) {
      router.push(`/${slug}/menu?modo=delivery`);
      return;
    }
    setModo("cadastro");
  }

  async function confirmarCadastro() {
    if (!nome.trim() || !telefone.trim() || !email.trim() || senha.length < 6) return;
    setErroCadastro("");
    try {
      const resposta = await registrar.mutateAsync({
        nome: nome.trim(),
        telefone: telefone.trim(),
        email: email.trim(),
        senha,
      });
      cadastro.salvar(resposta.token, resposta.customer);
      router.push(`/${slug}/menu?modo=delivery`);
    } catch (err) {
      setErroCadastro(extractErrorMessage(err));
    }
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
        {modo === "escolha" && (
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
              onClick={escolherDelivery}
              className="w-full text-left p-5 rounded-2xl border-2 border-neutral-200 bg-white hover:border-coral-300 hover:bg-coral-50 active:bg-coral-50 transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-coral-100 flex items-center justify-center flex-shrink-0 text-2xl group-hover:bg-coral-200 transition-colors">
                  🛵
                </div>
                <div>
                  <p className="font-bold text-neutral-900 text-base">Delivery</p>
                  <p className="text-sm text-neutral-500 mt-0.5">
                    {mounted && cadastro.cadastrado ? "Receba em casa · entrega grátis" : "Receba em casa · precisa de cadastro"}
                  </p>
                </div>
                <svg className="w-5 h-5 text-neutral-300 ml-auto flex-shrink-0 mt-0.5 group-hover:text-coral-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </button>

            <Link
              href={`/${slug}/pedidos`}
              className="mt-6 text-sm text-neutral-400 hover:text-neutral-600 transition-colors text-center"
            >
              Já pedi antes · Ver meus pedidos
            </Link>
          </>
        )}

        {modo === "mesa" && (
          <>
            {/* Voltar */}
            <button
              onClick={() => { setModo("escolha"); setErroMesa(""); setMesa(""); }}
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
              Olhe o número na etiqueta da sua mesa ou pergunte ao garçom. É preciso informar a mesa antes de fazer o pedido.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-neutral-700">Número da mesa</label>
              <input
                type="number"
                inputMode="numeric"
                min="1"
                placeholder="Ex: 12"
                value={mesa}
                onChange={(e) => { setMesa(e.target.value); setErroMesa(""); }}
                onKeyDown={(e) => e.key === "Enter" && confirmarMesa()}
                className={`w-full rounded-xl border-2 px-4 py-3.5 text-2xl font-bold text-center focus:outline-none transition-colors ${
                  erroMesa
                    ? "border-red-400 focus:border-red-500 text-red-700"
                    : "border-neutral-200 focus:border-coral-400 text-neutral-900"
                }`}
                autoFocus
              />
              {erroMesa && <p className="text-sm text-red-500">{erroMesa}</p>}
            </div>

            <button
              onClick={confirmarMesa}
              className="mt-6 w-full bg-coral-500 text-white rounded-2xl py-4 px-5 font-semibold text-base shadow-lg shadow-coral-200 active:bg-coral-600 transition-colors"
            >
              Ver cardápio
            </button>
          </>
        )}

        {modo === "cadastro" && (
          <>
            {/* Voltar */}
            <button
              onClick={() => setModo("escolha")}
              className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors mb-6"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Voltar
            </button>

            <div className="w-14 h-14 rounded-2xl bg-coral-100 flex items-center justify-center text-3xl mb-4">
              🛵
            </div>

            <h2 className="text-lg font-bold text-neutral-900 mb-1">Cadastro rápido</h2>
            <p className="text-sm text-neutral-500 mb-4">
              Pra pedir delivery, crie sua conta — assim você acompanha seus pedidos depois.
            </p>

            {erroCadastro && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-5">
                <span className="text-base leading-none">⚠️</span>
                <p className="text-xs text-red-700">{erroCadastro}</p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">Nome</label>
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full rounded-xl border-2 border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:border-coral-400 transition-colors"
                  autoFocus
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">Telefone</label>
                <input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full rounded-xl border-2 border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:border-coral-400 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">E-mail</label>
                <input
                  type="email"
                  placeholder="voce@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border-2 border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:border-coral-400 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">Senha</label>
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full rounded-xl border-2 border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:border-coral-400 transition-colors"
                />
              </div>
            </div>

            <Button
              theme="coral"
              size="lg"
              fullWidth
              className="mt-6"
              disabled={!nome.trim() || !telefone.trim() || !email.trim() || senha.length < 6}
              loading={registrar.isPending}
              onClick={confirmarCadastro}
            >
              Criar cadastro e continuar
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
