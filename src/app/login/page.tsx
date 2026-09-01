"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSessionStore } from "@/lib/store/session";
import { useLogin } from "@/lib/api/queries/auth";
<<<<<<< HEAD
import { apiErrorMessage } from "@/lib/api/client";
import { toast } from "@/components/ui/Toast";
import { UserRole } from "@/types/domain";

const destinoPorRole: Record<string, string> = {
  admin: "/app/dashboard",
  superadmin: "/app/dashboard",
  caixa: "/app/pedidos",
  garcom: "/app/pedidos",
  cozinha: "/app/pedidos",
};
=======
import { extractErrorMessage } from "@/lib/api/client";
import { toast } from "@/components/ui/Toast";
import { UserRole } from "@/types/domain";

function destinoPorRole(role: UserRole): string {
  if (role === "admin") return "/app/dashboard";
  if (role === "cozinha") return "/app/pedidos";
  if (role === "entregador") return "/app/entregas";
  return "/app/pedidos";
}
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59

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

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const { setSession } = useSessionStore();
<<<<<<< HEAD
  const login = useLogin();
=======
  const loginMutation = useLogin();
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !senha) return;

    try {
<<<<<<< HEAD
      const { token, usuario } = await login.mutateAsync({ email, senha });
=======
      const { token, usuario } = await loginMutation.mutateAsync({ email, senha });
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59

      setSession(token, {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
<<<<<<< HEAD
        role: usuario.role as UserRole,
=======
        role: usuario.role,
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59
        restaurante_id: usuario.restaurante_id,
      });

      document.cookie = `pratto_token=${token}; path=/; max-age=86400`;
      document.cookie = `pratto_role=${usuario.role}; path=/; max-age=86400`;

<<<<<<< HEAD
      router.push(redirect ?? destinoPorRole[usuario.role] ?? "/app/pedidos");
    } catch (err) {
      toast.error("Não foi possível entrar", apiErrorMessage(err, "Verifique e-mail e senha."));
=======
      router.push(redirect ?? destinoPorRole(usuario.role));
    } catch (err) {
      toast.error("Login inválido", extractErrorMessage(err));
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59
    }
  }

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

        <form onSubmit={handleLogin} className="bg-white rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
<<<<<<< HEAD
          <div className="bg-team-50 border border-team-100 rounded-xl px-4 py-3 text-xs text-team-700">
            <p className="font-semibold mb-0.5">Acesso da equipe</p>
            <p className="text-team-500">
              Demo: <span className="font-mono font-medium">admin@tacos.com</span> /{" "}
              <span className="font-mono font-medium">pratto123</span>
            </p>
          </div>

=======
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700">E-mail</label>
            <input
              type="email"
              placeholder="voce@restaurante.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
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
<<<<<<< HEAD
            disabled={login.isPending}
            className="mt-1 w-full bg-team-500 text-white rounded-xl py-3.5 font-semibold text-base hover:bg-team-600 active:bg-team-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {login.isPending && (
=======
            disabled={loginMutation.isPending}
            className="mt-1 w-full bg-team-500 text-white rounded-xl py-3.5 font-semibold text-base hover:bg-team-600 active:bg-team-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loginMutation.isPending && (
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59
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
