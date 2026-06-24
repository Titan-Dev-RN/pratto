"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSessionStore } from "@/lib/store/session";
import { toast } from "@/components/ui/Toast";

type Perfil = "equipe" | "admin";

const demos: Record<Perfil, { email: string; nome: string; role: "garcom" | "admin"; destino: string }> = {
  equipe: { email: "equipe@pratto.com", nome: "João Garçom", role: "garcom", destino: "/app/pedidos" },
  admin: { email: "admin@pratto.com", nome: "Maria Administradora", role: "admin", destino: "/app/dashboard" },
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const [perfil, setPerfil] = useState<Perfil>("equipe");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const { setSession } = useSessionStore();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !senha) return;

    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 700));

      const demo = demos[perfil];
      setSession("mock-jwt-token", {
        id: "u1",
        nome: demo.nome,
        email,
        role: demo.role,
        restaurante_id: "r1",
      });

      document.cookie = `pratto_token=mock-jwt-token; path=/; max-age=86400`;
      document.cookie = `pratto_role=${demo.role}; path=/; max-age=86400`;

      router.push(redirect ?? demo.destino);
    } catch {
      toast.error("Credenciais inválidas", "Verifique e-mail e senha.");
    } finally {
      setLoading(false);
    }
  }

  const demo = demos[perfil];

  return (
    <div className="min-h-screen bg-team-900 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-team-500 items-center justify-center mb-4 shadow-lg shadow-team-900/50">
            <span className="text-white text-2xl font-bold">P</span>
          </div>
          <h1 className="text-white text-2xl font-bold">Pratto</h1>
          <p className="text-team-400 text-sm mt-1">Acesso restrito</p>
        </div>

        {/* Tabs de perfil */}
        <div className="flex p-1 bg-team-800 rounded-xl mb-5">
          {(["equipe", "admin"] as Perfil[]).map((p) => (
            <button
              key={p}
              onClick={() => setPerfil(p)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                perfil === p
                  ? "bg-white text-team-800 shadow-sm"
                  : "text-team-400 hover:text-team-200"
              }`}
            >
              {p === "equipe" ? "Equipe" : "Administrador"}
            </button>
          ))}
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
          {/* Dica de acesso demo */}
          <div className="bg-team-50 border border-team-100 rounded-xl px-4 py-3 text-xs text-team-700">
            <p className="font-semibold mb-0.5">
              {perfil === "equipe" ? "Acesso da equipe" : "Acesso administrativo"}
            </p>
            <p className="text-team-500">Use o e-mail <span className="font-mono font-medium">{demo.email}</span> e qualquer senha.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700">E-mail</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-team-400 focus:border-transparent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700">Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-team-400 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full bg-team-500 text-white rounded-xl py-3.5 font-semibold text-base hover:bg-team-600 active:bg-team-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            Entrar
          </button>
        </form>

        <p className="text-center text-team-500 text-xs mt-6">
          Pratto · Sistema para restaurantes
        </p>
      </div>
    </div>
  );
}
