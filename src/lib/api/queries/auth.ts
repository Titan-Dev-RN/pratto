import { useMutation } from "@tanstack/react-query";
import { apiPost } from "@/lib/api/client";
import { AuthResponse, LoginPayload } from "@/types/api";

export function useLogin() {
  return useMutation({
    mutationFn: (payload: LoginPayload) =>
      apiPost<AuthResponse>("/cliente/autenticacao/login", payload),
  });
}
