"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useRestaurantePublico } from "@/lib/api/queries/v1/restaurante";
import { useCadastrarCliente, useLoginCliente } from "@/lib/api/queries/customers";
import { useClienteSessaoStore } from "@/lib/store/clienteSessao";
import { useMounted } from "@/lib/hooks/useMounted";
import { extractErrorMessage } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";

type Modo = "escolha" | "mesa" | "cadastro" | "login";

/* Acesso inicial do cliente. "Comer aqui" exige número da mesa.
   "Delivery" agora exige uma CONTA DE VERDADE (cadastro ou login) —
   POST /api/public/storefront/:slug/customers[/login]. Substitui o
   cadastro fake que só guardava dados no aparelho.
   ⚠️ Endpoints de conta de cliente NÃO confirmados ao vivo — ver
   lib/api/queries/customers.ts. */
export default function RestaurantePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const mounted = useMounted();

  const [modo, setModo] = useState<Modo>("escolha");
  const [mesa, setMesa] = useState("");
  const [erroMesa, setErroMesa] = useState("");

  const { data: restaurante } = useRestaurantePublico(slug);
  const sessao = useClienteSessaoStore();
  const cadastrar = useCadastrarCliente(slug);
  const login = useLoginCliente(slug);

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const logado = mounted && sessao.isAuthed();
  const nomeRestaurante = restaurante?.nome ?? nomeDoSlug(slug);

  function confirmarMesa() {
    const num = mesa.trim();
    if (!num || isNaN(Number(num)) || Number(num) < 1) {
      setErroMesa("Informe um número de mesa válido.");
      return;
    }
    router.push(`/${slug}/menu?mesa=${num}`);
  }

  function escolherDelivery() {
    if (logado) {
      router.push(`/${slug}/menu?modo=delivery`);
      return;
    }
    setModo("cadastro");
  }

  async function confirmarCadastro() {
    if (!nome.trim() || !telefone.trim() || !email.trim() || !senha.trim()) return;
    try {
      const auth = await cadastrar.mutateAsync({
        nome: nome.trim(),
        telefone: telefone.trim(),
        email: email.trim(),
        senha,
      });
      /* Alguns backends não devolvem token no cadastro — nesse caso,
         loga em seguida com as mesmas credenciais. */
      const sessaoAuth = auth ?? (await login.mutateAsync({ email: email.trim(), senha }));
      if (!sessaoAuth) throw new Error("Resposta de autenticação inesperada.");
      sessao.setSessao(sessaoAuth.token, sessaoAuth.cliente);
      router.push(`/${slug}/menu?modo=delivery`);
    } catch (err) {
      toast.error("Não foi possível criar a conta", extractErrorMessage(err));
    }
  }

  async function confirmarLogin() {
    if (!email.trim() || !senha.trim()) return;
    try {
      const auth = await login.mutateAsync({ email: email.trim(), senha });
      if (!auth) throw new Error("Resposta de autenticação inesperada.");
      sessao.setSessao(auth.token, auth.cliente);
      router.push(`/${slug}/menu?modo=delivery`);
    } catch (err) {
      toast.error("Não foi possível entrar", extractErrorMessage(err));
    }
  }

  const salvando = cadastrar.isPending || login.isPending;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="relative h-52 flex-shrink-0 overflow-hidden">
        {restaurante?.logo_url ? (
          <Image src={restaurante.logo_url} alt={nomeRestaurante} fill className="object-cover" sizes="100vw" priority />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: `repeating-linear-gradient(-45deg, #f47a56 0px, #f47a56 12px, #fbc8b0 12px, #fbc8b0 28px)` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-5 py-5 text-white">
          <h1 className="text-2xl font-bold leading-tight drop-shadow">{nomeRestaurante}</h1>
          <div className="flex items-center gap-2 mt-1 text-sm opacity-90">
            <span>⭐ 4.5</span>
            <span>·</span>
            <span>Aberto agora</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-5 py-7 max-w-sm mx-auto w-full">
        {modo === "escolha" && (
          <>
            <h2 className="text-lg font-bold text-neutral-900 mb-1">Como você quer pedir?</h2>
            <p className="text-sm text-neutral-500 mb-6">Escolha o tipo de atendimento</p>

            <button
              onClick={() => setModo("mesa")}
              className="w-full text-left p-5 rounded-2xl border-2 border-neutral-200 bg-white hover:border-coral-300 hover:bg-coral-50 transition-colors mb-3 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-coral-100 flex items-center justify-center flex-shrink-0 text-2xl">🪑</div>
                <div>
                  <p className="font-bold text-neutral-900 text-base">Comer aqui</p>
                  <p className="text-sm text-neutral-500 mt-0.5">Peça diretamente na sua mesa</p>
                </div>
              </div>
            </button>

            <button
              onClick={escolherDelivery}
              className="w-full text-left p-5 rounded-2xl border-2 border-neutral-200 bg-white hover:border-coral-300 hover:bg-coral-50 transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-coral-100 flex items-center justify-center flex-shrink-0 text-2xl">🛵</div>
                <div>
                  <p className="font-bold text-neutral-900 text-base">Delivery</p>
                  <p className="text-sm text-neutral-500 mt-0.5">
                    {logado ? `Entrar como ${sessao.cliente?.nome ?? "você"}` : "Receba em casa · precisa de conta"}
                  </p>
                </div>
              </div>
            </button>

            {!logado && (
              <button
                onClick={() => setModo("login")}
                className="mt-4 text-sm text-coral-500 hover:text-coral-600 transition-colors text-center"
              >
                Já tenho conta · Entrar
              </button>
            )}
            <Link
              href={`/${slug}/pedidos`}
              className="mt-2 text-sm text-neutral-400 hover:text-neutral-600 transition-colors text-center"
            >
              Ver meus pedidos
            </Link>
          </>
        )}

        {modo === "mesa" && (
          <>
            <button
              onClick={() => { setModo("escolha"); setErroMesa(""); setMesa(""); }}
              className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors mb-6"
            >
              ‹ Voltar
            </button>
            <div className="w-14 h-14 rounded-2xl bg-coral-100 flex items-center justify-center text-3xl mb-5">🪑</div>
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
                onChange={(e) => { setMesa(e.target.value); setErroMesa(""); }}
                onKeyDown={(e) => e.key === "Enter" && confirmarMesa()}
                className={`w-full rounded-xl border-2 px-4 py-3.5 text-2xl font-bold text-center focus:outline-none transition-colors ${
                  erroMesa ? "border-red-400 text-red-700" : "border-neutral-200 focus:border-coral-400 text-neutral-900"
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

        {(modo === "cadastro" || modo === "login") && (
          <>
            <button
              onClick={() => setModo("escolha")}
              className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors mb-6"
            >
              ‹ Voltar
            </button>
            <div className="w-14 h-14 rounded-2xl bg-coral-100 flex items-center justify-center text-3xl mb-4">🛵</div>
            <h2 className="text-lg font-bold text-neutral-900 mb-1">
              {modo === "cadastro" ? "Criar conta" : "Entrar"}
            </h2>
            <p className="text-sm text-neutral-500 mb-5">
              {modo === "cadastro"
                ? "Pra pedir delivery, crie sua conta."
                : "Acesse com o e-mail e a senha da sua conta."}
            </p>

            <div className="flex flex-col gap-3">
              {modo === "cadastro" && (
                <>
                  <Campo label="Nome">
                    <input className="w-full rounded-xl border-2 border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:border-coral-400 transition-colors" value={nome} onChange={(e) => setNome(e.target.value)} autoFocus />
                  </Campo>
                  <Campo label="Telefone">
                    <input className="w-full rounded-xl border-2 border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:border-coral-400 transition-colors" type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
                  </Campo>
                </>
              )}
              <Campo label="E-mail">
                <input className="w-full rounded-xl border-2 border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:border-coral-400 transition-colors" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus={modo === "login"} />
              </Campo>
              <Campo label="Senha">
                <input className="w-full rounded-xl border-2 border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:border-coral-400 transition-colors" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
              </Campo>
            </div>

            <Button
              theme="coral"
              size="lg"
              fullWidth
              className="mt-6"
              loading={salvando}
              disabled={
                modo === "cadastro"
                  ? !nome.trim() || !telefone.trim() || !email.trim() || !senha.trim()
                  : !email.trim() || !senha.trim()
              }
              onClick={modo === "cadastro" ? confirmarCadastro : confirmarLogin}
            >
              {modo === "cadastro" ? "Criar conta e continuar" : "Entrar"}
            </Button>

            <button
              onClick={() => setModo(modo === "cadastro" ? "login" : "cadastro")}
              className="mt-4 text-sm text-coral-500 hover:text-coral-600 transition-colors text-center"
            >
              {modo === "cadastro" ? "Já tenho conta · Entrar" : "Não tenho conta · Criar"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-neutral-700">{label}</label>
      {children}
    </div>
  );
}

function nomeDoSlug(slug: string): string {
  return slug
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}
