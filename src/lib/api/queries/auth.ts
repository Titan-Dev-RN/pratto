import { useMutation } from "@tanstack/react-query";
<<<<<<< HEAD
import { apiPost } from "@/lib/api/client";
import { AuthResponse, LoginPayload } from "@/types/api";

export function useLogin() {
  return useMutation({
    mutationFn: (payload: LoginPayload) =>
      apiPost<AuthResponse>("/cliente/autenticacao/login", payload),
=======
import { apiPostAbsolute } from "@/lib/api/client";
import { AuthResponse, LoginPayload } from "@/types/api";

/* Único login do app inteiro — fica fora de /api (é /api/v1/cliente/
   autenticacao/login, superfície antiga, mas é a única que existe). */
export function useLogin() {
  return useMutation({
    mutationFn: (payload: LoginPayload) =>
      apiPostAbsolute<AuthResponse>("/api/v1/cliente/autenticacao/login", payload),
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59
  });
}
