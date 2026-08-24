/* Backend real: Rails "API_atendimento", superfície `/api/*` (sem
   versionamento, nomes em inglês) — confirmada ao vivo em 2026-08-24
   contra http://85.209.92.60:5000. Existe uma segunda superfície no mesmo
   app (`/api/v1/cliente/*`, nomes em português) que NÃO é a usada — mesmo
   banco, contrato diferente. Ver INTEGRACAO_API.md. */
const ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const BASE_URL = `${ORIGIN}/api`;

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

async function handleResponse<T>(res: Response): Promise<T> {
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
  return handleResponse<T>(res);
}

export async function apiPost<T>(path: string, body: unknown, authed = true): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: authHeaders(authed),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function apiPatch<T>(path: string, body: unknown, authed = true): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PATCH",
    headers: authHeaders(authed),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function apiDelete<T>(path: string, authed = true): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { method: "DELETE", headers: authHeaders(authed) });
  return handleResponse<T>(res);
}

/* O único login do app fica fora de /api (é /api/v1/cliente/autenticacao/
   login) — por isso usa ORIGIN puro em vez de BASE_URL. */
export async function apiPostAbsolute<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${ORIGIN}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

/* Decimais do Rails vêm como string na maioria das respostas (preco,
   preco_unitario, total) pra evitar arredondamento de float — normaliza
   pra number logo na borda da API. */
export function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return typeof value === "number" ? value : parseFloat(value) || 0;
}

export { BASE_URL, ORIGIN };
