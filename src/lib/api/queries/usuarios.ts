import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch, apiPost } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";
import { Usuario } from "@/types/domain";

export function useUsuarios() {
  return useQuery({
    queryKey: ["usuarios"],
    queryFn: () => apiGet<ApiResponse<Usuario[]>>("/cliente/usuarios", true),
  });
}

export function useCriarUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dados: { nome: string; email: string; senha: string; perfil: string }) =>
      apiPost<ApiResponse<Usuario>>("/cliente/usuarios", dados, true),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["usuarios"] }),
  });
}

export function useAtualizarUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dados }: { id: string; dados: Partial<{ nome: string; email: string; perfil: string; ativo: boolean }> }) =>
      apiPatch<ApiResponse<Usuario>>(`/cliente/usuarios/${id}`, dados),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["usuarios"] }),
  });
}
