import { ApiError } from "@/types/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("pratto_token");
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let err: ApiError;
    try {
      err = await res.json();
    } catch {
      err = { error: "Erro", message: res.statusText, status: res.status };
    }
    throw err;
  }
  return res.json() as Promise<T>;
}

export async function apiGet<T>(path: string, authed = false): Promise<T> {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (authed) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE_URL}${path}`, { headers });
  return handleResponse<T>(res);
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
  return handleResponse<T>(res);
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
  return handleResponse<T>(res);
}

export async function apiDelete<T>(path: string, authed = true): Promise<T> {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  const token = getToken();
  if (authed && token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, { method: "DELETE", headers });
  return handleResponse<T>(res);
}

export { BASE_URL };
