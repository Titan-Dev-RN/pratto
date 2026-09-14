import type { ApiError } from "@/types/api";

/* Backend real: Rails "API_atendimento", superfície `/api/*` (sem
   versionamento, nomes em inglês) — confirmada ao vivo em 2026-08-24
   contra http://85.209.92.60:5000. Existe uma segunda superfície no mesmo
   app (`/api/v1/cliente/*`, nomes em português) que NÃO é a usada — mesmo
   banco, contrato diferente. Ver INTEGRACAO_API.md.

   URL relativa (mesma origem do app) e não a URL do backend direto: todo
   fetch daqui roda no navegador, e em produção o app é HTTPS enquanto o
   backend ainda é HTTP puro — fetch HTTPS→HTTP é bloqueado pelo browser
   como "mixed content". `/api/*` cai em src/app/api/[...path]/route.ts,
   que roda no servidor e repassa pro backend real (ver esse arquivo). */
const BASE_URL = "/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("pratto_token");
}

/* Dois formatos de erro coexistem (ver types/api.ts): `{errors: [...]}`
   limpo, ou a página de debug do Rails em JSON quando é um erro de
   framework não tratado pelo controller (parâmetro faltando, enum
   inválido). Tenta extrair uma mensagem legível dos dois. */
export function extractErrorMessage(err: unknown): string {
  if (err && typeof err === "object") {
    const e = err as Record<string, unknown>;
    if (Array.isArray(e.errors)) return (e.errors as string[]).join(" · ");
    if (typeof e.erro === "string") return e.erro;
    if (typeof e.exception === "string") {
      /* "#<ArgumentError: 'x' is not a valid status>" → só a mensagem */
      const match = e.exception.match(/:\s*(.+?)>?$/);
      if (match) return match[1].replace(/>$/, "");
    }
    if (typeof e.error === "string") return e.error;
  }
  return "Erro inesperado. Tente novamente.";
}

/* Extrai uma mensagem exibível de qualquer erro capturado num catch. */
export function apiErrorMessage(err: unknown, fallback = "Tente novamente."): string {
  if (err && typeof err === "object" && "message" in err && typeof (err as ApiError & { message?: string }).message === "string") {
    return (err as ApiError & { message: string }).message;
  }
  return fallback;
}

/* Sessão expirada/token inválido: limpa a sessão local e manda pro login.
   Import dinâmico evita ciclo de módulos com o session store. */
async function tratarSessaoExpirada() {
  if (typeof window === "undefined") return;
  const { useSessionStore } = await import("@/lib/store/session");
  useSessionStore.getState().clearSession();
  document.cookie = "pratto_token=; path=/; max-age=0";
  document.cookie = "pratto_role=; path=/; max-age=0";
  if (!window.location.pathname.startsWith("/login")) {
    window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
  }
}

async function handleResponse<T>(res: Response, authed: boolean): Promise<T> {
  if (res.status === 204) return undefined as T;

  const isJson = res.headers.get("content-type")?.includes("application/json");
  let body: unknown = null;
  if (isJson) {
    try {
      body = await res.json();
    } catch {
      body = null;
    }
  }

  if (!res.ok) {
    if (res.status === 401 && authed) {
      void tratarSessaoExpirada();
    }
    throw body ?? { erro: res.statusText || "Erro inesperado" };
  }

  return body as T;
}

function authHeaders(authed: boolean): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (authed) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function apiGet<T>(path: string, authed = true): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { headers: authHeaders(authed) });
  return handleResponse<T>(res, authed);
}

export async function apiPost<T>(path: string, body: unknown, authed = true): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: authHeaders(authed),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res, authed);
}

export async function apiPatch<T>(path: string, body: unknown, authed = true): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PATCH",
    headers: authHeaders(authed),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res, authed);
}

/* A superfície V1 documenta os updates como PUT (a `/api/*` usa PATCH). O
   Rails costuma rotear os dois pro mesmo #update, mas mantemos o verbo do
   contrato. ⚠️ V1 não confirmada ao vivo. */
export async function apiPut<T>(path: string, body: unknown, authed = true): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PUT",
    headers: authHeaders(authed),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res, authed);
}

export async function apiDelete<T>(path: string, authed = true): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { method: "DELETE", headers: authHeaders(authed) });
  return handleResponse<T>(res, authed);
}

/* O único login do app fica fora do prefixo de recurso (é
   /api/v1/cliente/autenticacao/login, não .../api/<recurso>) — por isso
   recebe o path já completo em vez de usar BASE_URL. Ainda assim é
   relativo pelo mesmo motivo: cai no proxy de src/app/api/[...path]/. */
export async function apiPostAbsolute<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res, false);
}

/* Decimais do Rails vêm como string na maioria das respostas (preco,
   preco_unitario, total) pra evitar arredondamento de float — normaliza
   pra number logo na borda da API. */
export function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return typeof value === "number" ? value : parseFloat(value) || 0;
}

/* ─────────────────────────── Conta de cliente ──────────────────────────
   O comprador do delivery tem uma sessão PRÓPRIA, separada da de staff:
   token guardado numa chave diferente (`pratto_cliente_token`) e nunca
   misturado com `pratto_token`. Um aparelho pode ter os dois ao mesmo
   tempo (staff logado no painel + cliente logado na vitrine).
   ⚠️ Endpoints não confirmados ao vivo — ver queries/customers.ts. */
export const CLIENTE_TOKEN_KEY = "pratto_cliente_token";

function getClienteToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CLIENTE_TOKEN_KEY);
}

function clienteHeaders(): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  const token = getClienteToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

/* `authed=false`: o parâmetro só controla o efeito colateral de
   tratarSessaoExpirada() (logout de STAFF) em handleResponse — um 401
   nessas rotas é o token do CLIENTE expirando, não o de staff. */
export async function clienteApiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { headers: clienteHeaders() });
  return handleResponse<T>(res, false);
}

export async function clienteApiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: clienteHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res, false);
}

export { BASE_URL };
