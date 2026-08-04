import { ApiError } from "@/types/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("pratto_token");
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

/* A API às vezes responde { error }, às vezes { errors: [...] } (validação).
   Normaliza tudo para o shape único que o front consome. */
async function handleResponse<T>(res: Response, authed: boolean): Promise<T> {
  if (!res.ok) {
    let body: Record<string, unknown> = {};
    try {
      body = await res.json();
    } catch {
      /* resposta não é JSON (ex: 500 sem handler, proxy fora do ar) */
    }

    const mensagem =
      (typeof body.error === "string" && body.error) ||
      (Array.isArray(body.errors) && body.errors.join(", ")) ||
      res.statusText ||
      "Erro inesperado. Tente novamente.";

    if (res.status === 401 && authed) {
      void tratarSessaoExpirada();
    }

    const err: ApiError = { error: mensagem, message: mensagem, status: res.status };
    throw err;
  }
  return res.json() as Promise<T>;
}

/* Extrai uma mensagem exibível de qualquer erro capturado num catch. */
export function apiErrorMessage(err: unknown, fallback = "Tente novamente."): string {
  if (err && typeof err === "object" && "message" in err && typeof (err as ApiError).message === "string") {
    return (err as ApiError).message;
  }
  return fallback;
}

export async function apiGet<T>(path: string, authed = false): Promise<T> {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (authed) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE_URL}${path}`, { headers });
  return handleResponse<T>(res, authed);
}

export async function apiPost<T>(path: string, body: unknown, authed = false): Promise<T> {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (authed) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res, authed);
}

export async function apiPatch<T>(path: string, body: unknown, authed = true): Promise<T> {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  const token = getToken();
  if (authed && token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res, authed);
}

export async function apiDelete<T>(path: string, authed = true): Promise<T> {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  const token = getToken();
  if (authed && token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, { method: "DELETE", headers });
  return handleResponse<T>(res, authed);
}

export { BASE_URL };
