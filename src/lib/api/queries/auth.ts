import { useMutation } from "@tanstack/react-query";
import { apiPostAbsolute } from "@/lib/api/client";
import { AuthResponse, LoginPayload } from "@/types/api";

/* Único login do app inteiro — fica fora de /api (é /api/v1/cliente/
   autenticacao/login, superfície antiga, mas é a única que existe). */
export function useLogin() {
  return useMutation({
    mutationFn: (payload: LoginPayload) =>
      apiPostAbsolute<AuthResponse>("/api/v1/cliente/autenticacao/login", payload),
  });
}
